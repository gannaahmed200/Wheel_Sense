"""
scripts/extract_keypoints.py

Runs the fine-tuned Keypoint R-CNN on basketball video(s) and writes a
structured JSON file consumed by Stage 3 (biomechanics + SHAP analysis).

Output format (keypoints_output.json)
--------------------------------------
[
  {
    "frame": 0,
    "timestamp_sec": 0.0,
    "persons": [
      {
        "detection_score": 0.97,
        "bbox": [x1, y1, x2, y2],
        "keypoints": {
          "nose":           {"x": 320.1, "y": 100.4, "confidence": 0.98},
          "left_shoulder":  {"x": 290.0, "y": 160.2, "confidence": 0.95},
          ...  (all 17 keypoints)
        }
      }
    ]
  },
  ...
]

Usage
-----
  # Single video
  python scripts/extract_keypoints.py \\
      --weights outputs/wheelpose_opt/model_final.pth \\
      --video   data/videos/basketball_game.mp4 \\
      --output  outputs/keypoints_game.json

  # Directory of videos
  python scripts/extract_keypoints.py \\
      --weights outputs/wheelpose_opt/model_final.pth \\
      --video-dir data/videos/ \\
      --output-dir outputs/keypoints/

  # [PLACEHOLDER] Swap --weights path once fine-tuned model is ready.
  # Until then, you can test with --weights "" to use ImageNet baseline
  # (predictions will be poor on occluded poses — expected).
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

import cv2
import numpy as np
from tqdm import tqdm
from detectron2.engine import DefaultPredictor
from detectron2.utils.logger import setup_logger

from configs.register_datasets import register_all, KEYPOINT_NAMES
from configs.model_config import get_config

setup_logger()
logger = logging.getLogger("wheelpose.extract")

SUPPORTED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


# ─────────────────────────────────────────────────────────────────────────────
def build_predictor(weights_path: str) -> DefaultPredictor:
    """
    Builds a Detectron2 predictor from a checkpoint.
    If weights_path is empty/None, falls back to ImageNet pretrained.
    """
    cfg = get_config(weights=weights_path if weights_path else None)
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5
    return DefaultPredictor(cfg)


# ─────────────────────────────────────────────────────────────────────────────
def extract_from_video(
    video_path: str,
    predictor: DefaultPredictor,
    output_json: str,
    frame_skip: int = 1,
    min_detection_score: float = 0.5,
) -> int:
    """
    Processes every `frame_skip`-th frame and writes keypoints to JSON.

    Parameters
    ----------
    video_path           : path to input video
    predictor            : loaded Detectron2 DefaultPredictor
    output_json          : path to write output JSON
    frame_skip           : process 1 in every N frames (1 = all frames)
    min_detection_score  : discard detections below this confidence

    Returns
    -------
    Number of frames processed.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open video: {video_path}")

    fps        = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total      = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    results    = []
    frame_idx  = 0
    processed  = 0

    logger.info("Processing %s  (%d frames @ %.1f fps)", video_path, total, fps)

    with tqdm(total=total // frame_skip, desc=Path(video_path).name) as pbar:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_skip == 0:
                outputs   = predictor(frame)
                instances = outputs["instances"].to("cpu")

                frame_data = {
                    "frame":         frame_idx,
                    "timestamp_sec": round(frame_idx / fps, 4),
                    "persons":       [],
                }

                if instances.has("pred_keypoints") and len(instances) > 0:
                    keypoints = instances.pred_keypoints.numpy()   # (N, 17, 3)
                    scores    = instances.scores.numpy()            # (N,)
                    boxes     = instances.pred_boxes.tensor.numpy() # (N, 4)

                    for kps, score, box in zip(keypoints, scores, boxes):
                        if score < min_detection_score:
                            continue

                        kp_dict = {}
                        for i, name in enumerate(KEYPOINT_NAMES):
                            kp_dict[name] = {
                                "x":          float(kps[i, 0]),
                                "y":          float(kps[i, 1]),
                                "confidence": float(kps[i, 2]),
                            }

                        frame_data["persons"].append({
                            "detection_score": float(score),
                            "bbox": [float(v) for v in box],  # [x1,y1,x2,y2]
                            "keypoints": kp_dict,
                        })

                results.append(frame_data)
                processed += 1
                pbar.update(1)

            frame_idx += 1

    cap.release()

    os.makedirs(os.path.dirname(os.path.abspath(output_json)), exist_ok=True)
    with open(output_json, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(
        "Done. %d frames → %d persons total → %s",
        processed,
        sum(len(fd["persons"]) for fd in results),
        output_json,
    )
    return processed


# ─────────────────────────────────────────────────────────────────────────────
# [PLACEHOLDER — Stage 3 interface note]
# The JSON produced above is your handoff to the biomechanics stage.
# Stage 3 will read this JSON and compute:
#   - Joint angles: e.g. elbow_angle = arccos( dot(wrist→elbow, shoulder→elbow) )
#   - Push stroke velocity: Δ(wrist_x, wrist_y) / Δt  across frames
#   - Trunk lean angle: angle between shoulder midpoint and hip midpoint
#   - Left/right asymmetry indices
# These become the feature vector input to XGBoost + SHAP.
# Ensure your JSON keys exactly match what Stage 3 expects.
# ─────────────────────────────────────────────────────────────────────────────


# ─────────────────────────────────────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="WheelPose keypoint extraction")
    grp = p.add_mutually_exclusive_group(required=True)
    grp.add_argument("--video",     type=str, help="Path to a single video file")
    grp.add_argument("--video-dir", type=str, help="Directory containing videos")

    p.add_argument(
        "--weights", type=str, default=None,
        # [PLACEHOLDER] Replace with path to fine-tuned model once training is done.
        # e.g. --weights outputs/wheelpose_opt/model_final.pth
        help="Path to fine-tuned model .pth (leave empty for ImageNet baseline)",
    )
    p.add_argument(
        "--output", type=str, default="outputs/keypoints_output.json",
        help="Output JSON path (single video mode)"
    )
    p.add_argument(
        "--output-dir", type=str, default="outputs/keypoints/",
        help="Output directory (multi-video mode)"
    )
    p.add_argument(
        "--frame-skip", type=int, default=1,
        help="Process every N-th frame (default: 1 = all frames). "
             "Use 3-5 for faster processing during development."
    )
    p.add_argument(
        "--min-score", type=float, default=0.5,
        help="Minimum detection confidence to include (default: 0.5)"
    )
    return p.parse_args()


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = parse_args()
    register_all()
    predictor = build_predictor(args.weights)

    if args.video:
        extract_from_video(
            args.video, predictor, args.output,
            frame_skip=args.frame_skip,
            min_detection_score=args.min_score,
        )
    else:
        # Process all videos in directory
        video_dir = Path(args.video_dir)
        out_dir   = Path(args.output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        videos = [
            f for f in video_dir.iterdir()
            if f.suffix.lower() in SUPPORTED_EXTENSIONS
        ]
        logger.info("Found %d videos in %s", len(videos), video_dir)

        for vid in videos:
            out_json = out_dir / (vid.stem + "_keypoints.json")
            try:
                extract_from_video(
                    str(vid), predictor, str(out_json),
                    frame_skip=args.frame_skip,
                    min_detection_score=args.min_score,
                )
            except Exception as e:
                logger.error("Failed on %s: %s", vid.name, e)
