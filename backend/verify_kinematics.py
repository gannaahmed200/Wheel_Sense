"""
verify_kinematics.py
Runs the YOLO model on the test video, prints the actual detected keypoint
coordinates and the kinematics numbers computed from them — so you can
visually confirm the math is correct.

Run from: Wheel_Sense/backend/
    .venv\Scripts\python.exe verify_kinematics.py
"""
import sys
import os
sys.path.insert(0, ".")

import cv2
import numpy as np

# ── Load YOLO model ───────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(ROOT, "yolo11n-pose.pt")

print(f"Loading model: {MODEL_PATH}")
from ultralytics import YOLO
model = YOLO(MODEL_PATH, task="pose")

# ── Load Stage 3 modules ──────────────────────────────────────────────────────
from kinematics import calculate_trunk_rotation, PushStrokeAnalyzer
from biomechanics import init_stage3_analyzers

VIDEO_PATH = os.path.join(ROOT, "test_video",
    "A challenge.. A dunking challenge! \U0001f3c0  #shorts #wheelchairbasketball.mp4")

print(f"Video: {VIDEO_PATH}")
print("="*65)

# COCO-17 joint names in order
JOINT_NAMES = [
    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
    "left_shoulder", "right_shoulder",
    "left_elbow",    "right_elbow",
    "left_wrist",    "right_wrist",
    "left_hip",      "right_hip",
    "left_knee",     "right_knee",
    "left_ankle",    "right_ankle",
]

# ── Setup ─────────────────────────────────────────────────────────────────────
cap = cv2.VideoCapture(VIDEO_PATH)
fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
init_stage3_analyzers(fps=fps)
stroke_analyzer = PushStrokeAnalyzer(fps=fps)

frame_idx = 0
SAMPLE_EVERY = 15       # print every 15 frames so output isn't too long
MAX_FRAMES   = 5        # stop after 5 printed samples

printed = 0
while printed < MAX_FRAMES:
    ok, bgr = cap.read()
    if not ok:
        break

    frame_idx += 1
    if frame_idx % SAMPLE_EVERY != 0:
        continue

    # ── YOLO inference ────────────────────────────────────────────────────────
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    results = model.predict(bgr, verbose=False)

    if not results or results[0].keypoints is None:
        print(f"\n[Frame {frame_idx:4d}]  No person detected — skipping")
        continue

    kp_data = results[0].keypoints.data
    if kp_data is None or len(kp_data) == 0:
        continue

    # Use first detected person
    raw = kp_data[0].cpu().numpy()   # shape [17, 3]  → x, y, conf

    # Convert to list-of-dicts (same format as biomechanics.py expects)
    keypoints = [
        {"name": JOINT_NAMES[i], "x": float(raw[i][0]),
         "y": float(raw[i][1]), "confidence": float(raw[i][2])}
        for i in range(17)
    ]

    # ── Print detected keypoints ──────────────────────────────────────────────
    print(f"\n{'='*65}")
    print(f"  FRAME {frame_idx}  (every {SAMPLE_EVERY} frames printed)")
    print(f"{'='*65}")
    print(f"  {'Joint':<18}  {'X':>7}  {'Y':>7}  {'Conf':>6}")
    print(f"  {'-'*46}")

    important = [
        "left_shoulder", "right_shoulder",
        "left_elbow",    "right_elbow",
        "left_wrist",    "right_wrist",
        "left_hip",      "right_hip",
    ]
    for kp in keypoints:
        if kp["name"] in important:
            vis = "OK " if kp["confidence"] >= 0.25 else "LOW"
            print(f"  {kp['name']:<18}  {kp['x']:>7.1f}  {kp['y']:>7.1f}  "
                  f"{kp['confidence']:>5.2f}  {vis}")

    # ── Stage 3 calculations ──────────────────────────────────────────────────
    trunk_rot = calculate_trunk_rotation(keypoints)
    stroke    = stroke_analyzer.update(keypoints)

    print(f"\n  --- Stage 3 Kinematics ---")
    if trunk_rot is not None:
        direction = "clockwise" if trunk_rot > 0 else "counter-clockwise"
        print(f"  Trunk Rotation   : {trunk_rot:+.2f} deg  ({direction})")
    else:
        print(f"  Trunk Rotation   : N/A (shoulder keypoints not confident enough)")

    print(f"  Push Efficiency  : {stroke['efficiency']:.3f}  (0=radial, 1=tangential)")
    print(f"  Wrist Speed      : {stroke['push_speed']:.1f} px/s")
    print(f"  Stroke Event     : '{stroke['stroke_event']}' (empty between events)")

    printed += 1

cap.release()
print(f"\n{'='*65}")
print(f"  Done. Sampled {printed} frames from the test video.")
print(f"{'='*65}")
