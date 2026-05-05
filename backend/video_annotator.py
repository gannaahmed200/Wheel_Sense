from __future__ import annotations

import base64
from typing import Any

import cv2


SKELETON = [
    (5, 7),
    (7, 9),
    (6, 8),
    (8, 10),
    (5, 6),
    (5, 11),
    (6, 12),
    (11, 12),
    (11, 13),
    (13, 15),
    (12, 14),
    (14, 16),
]


COLORS = {
    "efficient": (34, 197, 94),
    "inefficient": (234, 179, 8),
    "danger": (239, 68, 68),
    "complete": (59, 130, 246),
}


def draw_pose(frame, people: list[dict[str, Any]], classification: str = "efficient"):
    color = COLORS.get(classification, COLORS["efficient"])
    for person in people:
        keypoints = person.get("keypoints", [])
        for start, end in SKELETON:
            if start < len(keypoints) and end < len(keypoints):
                a = keypoints[start]
                b = keypoints[end]
                if a.get("confidence", 0) > 0.2 and b.get("confidence", 0) > 0.2:
                    cv2.line(frame, (int(a["x"]), int(a["y"])), (int(b["x"]), int(b["y"])), color, 2, cv2.LINE_AA)
        for point in keypoints:
            confidence = float(point.get("confidence", 0))
            if confidence > 0.2:
                radius = max(2, int(3 + confidence * 4))
                cv2.circle(frame, (int(point["x"]), int(point["y"])), radius, color, -1, cv2.LINE_AA)
                cv2.circle(frame, (int(point["x"]), int(point["y"])), radius + 1, (255, 255, 255), 1, cv2.LINE_AA)
    return frame


def frame_to_base64(frame) -> str:
    ok, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
    if not ok:
        return ""
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode("ascii")
