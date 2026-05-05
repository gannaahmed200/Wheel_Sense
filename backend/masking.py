# ============================================================
# masking.py  —  Stage 3 Semantic Wheelchair Mask
#
# Builds a binary suppression mask (0 = suppress, 255 = keep)
# to zero out wheelchair spokes, chassis, and rims so they
# don't pollute optical-flow and downstream processing.
#
# Two complementary strategies combined:
#   1. Geometric mask  — bounding box below hip keypoints
#   2. HSV color mask  — targets grey/silver metallic tones and
#                        black rubber tyre pixels
# ============================================================

from __future__ import annotations

import cv2
import numpy as np

# Minimum keypoint confidence to trust a hip landmark
_HIP_CONF_MIN = 0.25

# COCO-17 hip indices (same as used by YOLO11-Pose)
_LEFT_HIP_IDX  = 11
_RIGHT_HIP_IDX = 12

# HSV range for grey/silver wheelchair frame and spokes
_HSV_GREY_LOWER = np.array([0,   0,   60],  dtype=np.uint8)
_HSV_GREY_UPPER = np.array([180, 60, 220],  dtype=np.uint8)

# HSV range for black rubber tyre
_HSV_BLACK_LOWER = np.array([0,   0,   0],  dtype=np.uint8)
_HSV_BLACK_UPPER = np.array([180, 255, 50], dtype=np.uint8)


def build_wheelchair_mask(
    frame: np.ndarray,
    keypoints: list[dict],
    hip_padding_x: int = 80,
    apply_color_mask: bool = True,
) -> np.ndarray:
    """
    Build a uint8 binary mask (0 = suppress, 255 = keep) the same H×W as frame.

    How it works
    ------------
    Step 1 — Geometric exclusion zone:
        The wheelchair body sits below the athlete's hips. We locate the
        mid-hip y-coordinate from pose keypoints and zero out a rectangle
        from that row downward, extended horizontally by hip_padding_x pixels
        to cover the wheel rims.

    Step 2 — HSV colour mask:
        Detect grey/silver (wheelchair frame/spokes) and black (tyres) pixels
        anywhere in the frame. This catches stray spokes that appear above
        the hip line when the athlete leans forward.

    Step 3 — Combine & clean:
        Union-merge both suppression regions, apply morphological closing
        to fill spoke gaps, then erode the keep-mask edge slightly.

    Args:
        frame:             H×W×3 BGR frame.
        keypoints:         List of dicts with "x", "y", "confidence" keys
                           (COCO-17 ordering from YOLO11-Pose output).
        hip_padding_x:     Extra horizontal pixels to cover wheel rims.
        apply_color_mask:  Set False for geometry-only masking (faster).

    Returns:
        mask: H×W uint8 — 255 = keep, 0 = suppress.
    """
    h, w = frame.shape[:2]

    # Start with everything kept (fully open mask)
    keep_mask = np.full((h, w), 255, dtype=np.uint8)

    # ── Step 1: Geometry-based suppression ──────────────────────────────
    if len(keypoints) > max(_LEFT_HIP_IDX, _RIGHT_HIP_IDX):
        lh = keypoints[_LEFT_HIP_IDX]
        rh = keypoints[_RIGHT_HIP_IDX]

        if (lh.get("confidence", 0) >= _HIP_CONF_MIN and
                rh.get("confidence", 0) >= _HIP_CONF_MIN):

            # Mid-hip vertical position — wheelchair chassis sits below this
            hip_y = int((lh["y"] + rh["y"]) / 2.0)

            # Horizontal extent: between hips plus padding for the wheel rims
            x_left  = max(0, int(min(lh["x"], rh["x"])) - hip_padding_x)
            x_right = min(w, int(max(lh["x"], rh["x"])) + hip_padding_x)

            # Zero out the wheelchair region below the hips
            keep_mask[hip_y:, x_left:x_right] = 0

    # ── Step 2: HSV colour-based suppression ────────────────────────────
    if apply_color_mask:
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Detect grey/silver (frame and spoke surfaces)
        grey_mask  = cv2.inRange(hsv, _HSV_GREY_LOWER, _HSV_GREY_UPPER)
        # Detect black (tyre rubber)
        black_mask = cv2.inRange(hsv, _HSV_BLACK_LOWER, _HSV_BLACK_UPPER)

        # Combine both colour suppression masks
        color_suppress = cv2.bitwise_or(grey_mask, black_mask)

        # Morphological closing: fill small gaps between spoke detections
        # A 5×5 elliptical kernel bridges typical spoke gaps (3–10 px wide)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        color_suppress = cv2.morphologyEx(color_suppress, cv2.MORPH_CLOSE, kernel)

        # Apply to the keep-mask: suppress pixels detected by colour mask
        keep_mask[color_suppress > 0] = 0

    # ── Step 3: Clean up mask boundary ──────────────────────────────────
    # Slight erosion removes bright-edge artefacts at the mask border
    border_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    keep_mask = cv2.erode(keep_mask, border_kernel, iterations=1)

    return keep_mask


def apply_mask(frame: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """
    Apply a binary keep-mask to a frame. Masked pixels (mask == 0) become black.

    Args:
        frame: H×W×3 BGR frame.
        mask:  H×W uint8 — 255 = keep, 0 = zero out.

    Returns:
        Masked frame (same shape as input).
    """
    return cv2.bitwise_and(frame, frame, mask=mask)
