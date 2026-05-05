# ============================================================
# kinematics.py  —  Stage 3 Biomechanical Metrics Engine
#
# Computes three real-time metrics from COCO-17 pose keypoints:
#   1. Trunk Rotation       — signed degrees via shoulder cross-product
#   2. Push-Stroke Efficiency — tangential ratio of wrist velocity
#   3. Chair Translational Velocity — Lucas-Kanade sparse optical flow
#
# Keypoint index reference (COCO-17, as used by YOLO11-Pose):
#   0  nose        5  left_shoulder   6  right_shoulder
#   7  left_elbow  8  right_elbow     9  left_wrist    10 right_wrist
#  11  left_hip   12  right_hip
# ============================================================

from __future__ import annotations

import cv2
import numpy as np
from collections import deque
from dataclasses import dataclass
from typing import Optional

# Minimum keypoint confidence to trust a landmark
CONFIDENCE_THRESHOLD = 0.25

# COCO-17 keypoint index map (same indices used by YOLO11-Pose)
COCO = {
    "nose":            0,
    "left_shoulder":   5,
    "right_shoulder":  6,
    "left_elbow":      7,
    "right_elbow":     8,
    "left_wrist":      9,
    "right_wrist":    10,
    "left_hip":       11,
    "right_hip":      12,
}


# ── Output dataclass ──────────────────────────────────────────────────────────

@dataclass
class KinematicsMetrics:
    """Per-frame kinematic snapshot produced by Stage 3."""

    # Signed trunk rotation in degrees.
    # Positive = clockwise (right shoulder forward); Negative = counter-clockwise.
    trunk_rotation_deg: float = 0.0

    # Push-stroke efficiency: 0.0 (radial/wasted) → 1.0 (perfectly tangential).
    push_efficiency: float = 0.0

    # Wrist resultant speed in px/s (proxy for propulsion hand speed).
    push_speed: float = 0.0

    # Chair forward velocity in px/s (or m/s when calibrated).
    chair_velocity: float = 0.0

    # Stroke phase event fired this frame: "push_start" | "push_end" | "".
    stroke_event: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# 1. TRUNK ROTATION  (cross-product method)
# ─────────────────────────────────────────────────────────────────────────────

def calculate_trunk_rotation(keypoints: list[dict]) -> Optional[float]:
    """
    Computes signed trunk rotation angle (degrees) using the 2D cross-product
    between the shoulder vector and a horizontal reference vector.

    Why cross-product?
    ------------------
    The dot-product gives only the magnitude of the angle (always positive).
    The cross-product's sign tells us the direction of rotation:
        cross_z > 0  →  clockwise   (positive angle)
        cross_z < 0  →  counter-clockwise (negative angle)

    This produces a signed, continuous signal — critical for detecting
    asymmetric propulsion patterns that lead to overuse injuries.

    Args:
        keypoints: list of dicts with keys "x", "y", "confidence"
                   (as returned by pose_engine.py / YOLO inference).

    Returns:
        Signed rotation angle in degrees, or None if either shoulder
        is below the confidence threshold.
    """
    if len(keypoints) <= max(COCO["left_shoulder"], COCO["right_shoulder"]):
        return None

    ls = keypoints[COCO["left_shoulder"]]
    rs = keypoints[COCO["right_shoulder"]]

    # Skip frame if either shoulder is occluded or low-confidence
    if ls.get("confidence", 0) < CONFIDENCE_THRESHOLD:
        return None
    if rs.get("confidence", 0) < CONFIDENCE_THRESHOLD:
        return None

    # Vector pointing from left shoulder → right shoulder (image space)
    shoulder_vec = np.array([rs["x"] - ls["x"], rs["y"] - ls["y"]], dtype=float)

    # Horizontal reference vector pointing right (+x direction)
    reference_vec = np.array([1.0, 0.0])

    # 2D cross product (scalar z-component):
    #   cross_z = dx * ref_y  -  dy * ref_x
    # In image coordinates y increases downward, so:
    #   positive cross_z → right shoulder is lower than left → clockwise rotation
    cross_z = float(
        shoulder_vec[0] * reference_vec[1] - shoulder_vec[1] * reference_vec[0]
    )
    dot = float(np.dot(shoulder_vec, reference_vec))

    # atan2 gives the correct signed angle in all four quadrants
    return float(np.degrees(np.arctan2(cross_z, dot)))


# ─────────────────────────────────────────────────────────────────────────────
# 2. PUSH-STROKE EFFICIENCY  (velocity × angle optimisation)
# ─────────────────────────────────────────────────────────────────────────────

class PushStrokeAnalyzer:
    """
    Tracks the right wrist trajectory across frames and computes:

        efficiency  — how tangential the wrist velocity is relative to
                      the imaginary wheel arc centred on the shoulder.
                      Formula: |cos(θ)| = |dot(vel_unit, tangent_unit)|
                        1.0 = velocity is perfectly tangential (max propulsion)
                        0.0 = velocity is purely radial (wasted effort)

        push_speed  — resultant wrist speed in px/s.

        stroke_event — phase transition detected this frame:
                       "push_start" | "push_end" | ""

    Physics rationale
    -----------------
    Real propulsion force on the wheel rim depends on the tangential component
    of hand force. Radial force compresses the rim but doesn't rotate the wheel.
    Measuring how tangential the wrist *velocity* is gives a non-invasive proxy
    for propulsive efficiency without needing force sensors.

    Call .update(keypoints) once per frame.
    """

    # Wrist x-offset thresholds as a fraction of shoulder-to-shoulder width.
    PUSH_START_OFFSET = 0.30   # wrist 30% ahead of shoulder → push phase begins
    PUSH_END_OFFSET   = -0.20  # wrist 20% behind shoulder   → recovery phase begins

    # Minimum speed (px/s) before efficiency is considered meaningful
    MIN_SPEED_THRESHOLD = 2.0

    def __init__(self, fps: float = 30.0, history_frames: int = 5):
        """
        Args:
            fps:            Frame rate of the video source.
            history_frames: Sliding window size for velocity estimation.
        """
        self.fps = fps
        # Circular buffer of recent wrist pixel positions [x, y]
        self._history: deque = deque(maxlen=history_frames)
        # State machine for stroke phase detection
        self._phase: str = "recovery"   # "recovery" | "push"

    def reset(self) -> None:
        """Clear all history — call when switching video sources."""
        self._history.clear()
        self._phase = "recovery"

    def update(self, keypoints: list[dict]) -> dict:
        """
        Process one frame and return a metrics dict.

        Args:
            keypoints: list of dicts with "x", "y", "confidence".

        Returns:
            {"efficiency": float, "push_speed": float, "stroke_event": str}
        """
        result = {"efficiency": 0.0, "push_speed": 0.0, "stroke_event": ""}

        if len(keypoints) <= max(COCO["right_shoulder"], COCO["right_wrist"]):
            return result

        rs = keypoints[COCO["right_shoulder"]]
        rw = keypoints[COCO["right_wrist"]]

        # Both landmarks must be visible to proceed
        if rs.get("confidence", 0) < CONFIDENCE_THRESHOLD:
            return result
        if rw.get("confidence", 0) < CONFIDENCE_THRESHOLD:
            return result

        wrist_pos    = np.array([rw["x"], rw["y"]], dtype=float)
        shoulder_pos = np.array([rs["x"], rs["y"]], dtype=float)

        self._history.append(wrist_pos)

        # Need at least 3 samples for central-difference velocity
        if len(self._history) < 3:
            return result

        # ── Wrist velocity via central-difference ──────────────────────────
        # v ≈ (pos[t+1] - pos[t-1]) / (2 * dt)  →  multiply by fps/2
        v     = (self._history[-1] - self._history[-3]) * (self.fps / 2.0)
        speed = float(np.linalg.norm(v))
        result["push_speed"] = speed

        # ── Tangential efficiency ───────────────────────────────────────────
        if speed >= self.MIN_SPEED_THRESHOLD:
            radius_vec  = wrist_pos - shoulder_pos
            radius_norm = np.linalg.norm(radius_vec)

            if radius_norm > 1e-6:
                # Tangent to the arc: rotate radius 90° → [-dy, dx]
                tangent      = np.array([-radius_vec[1], radius_vec[0]])
                tangent_unit = tangent / np.linalg.norm(tangent)
                vel_unit     = v / speed

                # efficiency = |cos(θ)| between velocity and tangent
                efficiency = float(abs(np.dot(vel_unit, tangent_unit)))
                result["efficiency"] = float(np.clip(efficiency, 0.0, 1.0))

        # ── Stroke phase detection ─────────────────────────────────────────
        if len(keypoints) > COCO["left_shoulder"]:
            ls = keypoints[COCO["left_shoulder"]]
            if ls.get("confidence", 0) >= CONFIDENCE_THRESHOLD:
                shoulder_width = abs(rs["x"] - ls["x"])
                wrist_offset   = (
                    (wrist_pos[0] - shoulder_pos[0]) / max(shoulder_width, 1.0)
                )

                if self._phase == "recovery" and wrist_offset > self.PUSH_START_OFFSET:
                    self._phase = "push"
                    result["stroke_event"] = "push_start"
                elif self._phase == "push" and wrist_offset < self.PUSH_END_OFFSET:
                    self._phase = "recovery"
                    result["stroke_event"] = "push_end"

        return result


# ─────────────────────────────────────────────────────────────────────────────
# 3. TRANSLATIONAL VELOCITY  (Lucas-Kanade sparse optical flow)
# ─────────────────────────────────────────────────────────────────────────────

class VelocityEstimator:
    """
    Estimates the wheelchair's forward speed from consecutive grayscale frames
    using Lucas-Kanade sparse optical flow.

    Why sparse optical flow?
    ------------------------
    Dense flow is too expensive for real-time CPU use. Sparse LK flow tracks a
    small set of strong Shi-Tomasi corner features efficiently. The median
    displacement across all tracked points is a robust estimate that rejects
    outlier features (e.g. moving arms that leaked through the semantic mask).

    Pass the semantically-masked frame so wheelchair spokes/chassis are already
    zeroed out before tracking begins.

    Call .update(gray_frame) once per frame.
    """

    _LK_PARAMS = dict(
        winSize=(21, 21),
        maxLevel=3,
        criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01),
    )
    _FEATURE_PARAMS = dict(
        maxCorners=80,
        qualityLevel=0.15,
        minDistance=8,
        blockSize=7,
    )
    _REDETECT_INTERVAL = 10   # re-detect features every N frames to prevent drift

    def __init__(self, fps: float = 30.0, pixels_per_meter: Optional[float] = None):
        """
        Args:
            fps:               Video frame rate.
            pixels_per_meter:  Optional calibration factor.
                               Divide wheel diameter in pixels by real diameter
                               (~0.60 m for a standard wheelchair).
                               When set, output is in m/s; otherwise px/s.
        """
        self.fps = fps
        self.pixels_per_meter = pixels_per_meter
        self._prev_gray: Optional[np.ndarray] = None
        self._prev_pts:  Optional[np.ndarray] = None
        self._frame_count: int = 0

    def reset(self) -> None:
        """Clear all state — call when switching video sources."""
        self._prev_gray = None
        self._prev_pts  = None
        self._frame_count = 0

    def update(self, gray_frame: np.ndarray) -> float:
        """
        Args:
            gray_frame: H×W uint8 grayscale image (semantically masked).

        Returns:
            Velocity in px/s (or m/s if pixels_per_meter was provided).
            Returns 0.0 on the first frame or when tracking fails.
        """
        self._frame_count += 1

        # First frame — bootstrap state, nothing to compare yet
        if self._prev_gray is None:
            self._prev_gray = gray_frame.copy()
            self._prev_pts  = cv2.goodFeaturesToTrack(gray_frame, **self._FEATURE_PARAMS)
            return 0.0

        # Periodic re-detection prevents feature drift over time
        needs_redetect = (
            self._prev_pts is None
            or len(self._prev_pts) < 5
            or self._frame_count % self._REDETECT_INTERVAL == 0
        )
        if needs_redetect:
            self._prev_pts  = cv2.goodFeaturesToTrack(self._prev_gray, **self._FEATURE_PARAMS)
            self._prev_gray = gray_frame.copy()
            return 0.0

        # ── Lucas-Kanade optical flow ───────────────────────────────────────
        next_pts, status, _ = cv2.calcOpticalFlowPyrLK(
            self._prev_gray, gray_frame, self._prev_pts, None, **self._LK_PARAMS
        )

        if next_pts is None or status is None:
            self._prev_gray = gray_frame.copy()
            return 0.0

        good_prev = self._prev_pts[status.ravel() == 1]
        good_next = next_pts[status.ravel() == 1]

        if len(good_prev) < 3:
            self._prev_gray = gray_frame.copy()
            self._prev_pts  = cv2.goodFeaturesToTrack(gray_frame, **self._FEATURE_PARAMS)
            return 0.0

        # Median displacement is robust against outlier points on moving limbs
        displacements  = np.linalg.norm(good_next - good_prev, axis=1)
        mean_disp_px   = float(np.median(displacements))
        velocity_px_s  = mean_disp_px * self.fps

        # Update state for next frame
        self._prev_gray = gray_frame.copy()
        self._prev_pts  = good_next.reshape(-1, 1, 2)

        if self.pixels_per_meter and self.pixels_per_meter > 0:
            return velocity_px_s / self.pixels_per_meter
        return velocity_px_s
