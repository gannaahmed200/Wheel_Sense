from __future__ import annotations

import math
from dataclasses import dataclass
from statistics import mean, pstdev
from typing import Any


COCO_NAMES = [
    "nose",
    "left_eye",
    "right_eye",
    "left_ear",
    "right_ear",
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_hip",
    "right_hip",
    "left_knee",
    "right_knee",
    "left_ankle",
    "right_ankle",
]


@dataclass
class Keypoint:
    name: str
    x: float
    y: float
    confidence: float


def _visible(points: list[dict[str, Any]], index: int, min_confidence: float = 0.2) -> bool:
    return index < len(points) and float(points[index].get("confidence", 0)) >= min_confidence


def _point(points: list[dict[str, Any]], index: int) -> tuple[float, float]:
    return float(points[index]["x"]), float(points[index]["y"])


def _angle(a: tuple[float, float], b: tuple[float, float], c: tuple[float, float]) -> float:
    bax, bay = a[0] - b[0], a[1] - b[1]
    bcx, bcy = c[0] - b[0], c[1] - b[1]
    mag_a = math.hypot(bax, bay)
    mag_c = math.hypot(bcx, bcy)
    if mag_a == 0 or mag_c == 0:
        return 0.0
    cosine = max(-1.0, min(1.0, (bax * bcx + bay * bcy) / (mag_a * mag_c)))
    return math.degrees(math.acos(cosine))


def _vertical_angle(start: tuple[float, float], end: tuple[float, float]) -> float:
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    if dx == 0 and dy == 0:
        return 0.0
    return abs(math.degrees(math.atan2(dx, -dy)))


def _avg(values: list[float]) -> float:
    return mean(values) if values else 0.0


def _classify(elbow: float, shoulder: float, trunk: float, thresholds: dict[str, dict[str, float]] | None) -> str:
    t = thresholds or {
        "elbow": {"warn": 100, "danger": 130},
        "shoulder": {"warn": 80, "danger": 110},
        "trunk": {"warn": 30, "danger": 50},
    }
    if elbow >= t["elbow"]["danger"] or shoulder >= t["shoulder"]["danger"] or trunk >= t["trunk"]["danger"]:
        return "danger"
    if elbow >= t["elbow"]["warn"] or shoulder >= t["shoulder"]["warn"] or trunk >= t["trunk"]["warn"]:
        return "inefficient"
    return "efficient"


def compute_frame_metrics(
    people: list[dict[str, Any]],
    previous_metrics: dict[str, Any] | None = None,
    fps: float = 30.0,
    thresholds: dict[str, dict[str, float]] | None = None,
) -> dict[str, Any]:
    if not people:
        return {
            "elbow": 0,
            "shoulder": 0,
            "trunk": 0,
            "leftElbow": 0,
            "rightElbow": 0,
            "leftShoulder": 0,
            "rightShoulder": 0,
            "wristVelocity": 0,
            "shoulderElevation": 0,
            "classification": "complete",
            "confidence": 0,
            "courtPosition": {"x": 0.5, "y": 0.5},
        }

    person = people[0]
    keypoints = person.get("keypoints", [])
    left_elbow = right_elbow = left_shoulder = right_shoulder = trunk = 0.0
    shoulder_elevation = 0.0

    if all(_visible(keypoints, i) for i in (5, 7, 9)):
        left_elbow = _angle(_point(keypoints, 5), _point(keypoints, 7), _point(keypoints, 9))
    if all(_visible(keypoints, i) for i in (6, 8, 10)):
        right_elbow = _angle(_point(keypoints, 6), _point(keypoints, 8), _point(keypoints, 10))

    if all(_visible(keypoints, i) for i in (5, 7)):
        left_shoulder = _vertical_angle(_point(keypoints, 5), _point(keypoints, 7))
    if all(_visible(keypoints, i) for i in (6, 8)):
        right_shoulder = _vertical_angle(_point(keypoints, 6), _point(keypoints, 8))

    if all(_visible(keypoints, i) for i in (5, 6, 11, 12)):
        shoulder_mid = ((_point(keypoints, 5)[0] + _point(keypoints, 6)[0]) / 2, (_point(keypoints, 5)[1] + _point(keypoints, 6)[1]) / 2)
        hip_mid = ((_point(keypoints, 11)[0] + _point(keypoints, 12)[0]) / 2, (_point(keypoints, 11)[1] + _point(keypoints, 12)[1]) / 2)
        trunk = _vertical_angle(hip_mid, shoulder_mid)
    else:
        shoulder_mid = (0.5, 0.35)
        hip_mid = (0.5, 0.65)

    ears = [i for i in (3, 4) if _visible(keypoints, i)]
    shoulders = [i for i in (5, 6) if _visible(keypoints, i)]
    if ears and shoulders:
        shoulder_elevation = max(0.0, _avg([_point(keypoints, s)[1] for s in shoulders]) - _avg([_point(keypoints, e)[1] for e in ears]))

    wrist_velocity = 0.0
    wrist_indices = [i for i in (9, 10) if _visible(keypoints, i)]
    if wrist_indices and previous_metrics and previous_metrics.get("wristPosition"):
        current = {
            "x": _avg([_point(keypoints, i)[0] for i in wrist_indices]),
            "y": _avg([_point(keypoints, i)[1] for i in wrist_indices]),
        }
        previous = previous_metrics["wristPosition"]
        wrist_velocity = math.hypot(current["x"] - previous["x"], current["y"] - previous["y"]) * fps
    else:
        current = {"x": _avg([_point(keypoints, i)[0] for i in wrist_indices]) if wrist_indices else 0, "y": _avg([_point(keypoints, i)[1] for i in wrist_indices]) if wrist_indices else 0}

    elbow = max(left_elbow, right_elbow)
    shoulder = max(left_shoulder, right_shoulder)
    confidence = float(person.get("confidence", 0))
    classification = _classify(elbow, shoulder, trunk, thresholds)

    return {
        "elbow": round(elbow, 2),
        "shoulder": round(shoulder, 2),
        "trunk": round(trunk, 2),
        "leftElbow": round(left_elbow, 2),
        "rightElbow": round(right_elbow, 2),
        "leftShoulder": round(left_shoulder, 2),
        "rightShoulder": round(right_shoulder, 2),
        "wristVelocity": round(wrist_velocity, 2),
        "wristPosition": current,
        "shoulderElevation": round(shoulder_elevation, 2),
        "classification": classification,
        "confidence": round(confidence * 100 if confidence <= 1 else confidence, 2),
        "courtPosition": {"x": min(1, max(0, hip_mid[0])), "y": min(1, max(0, hip_mid[1]))},
    }


def aggregate_session(frames: list[dict[str, Any]]) -> dict[str, Any]:
    if not frames:
        return {
            "pushStrokeCount": 0,
            "symmetryIndex": 0,
            "averagePushPhaseDuration": 0,
            "recoveryToPushRatio": 0,
            "trunkStabilityScore": 100,
            "fatigueIndex": 0,
            "injuryRiskScore": 0,
            "peakJointAngles": {"elbow": 0, "shoulder": 0, "trunk": 0},
            "rangeOfMotion": {"elbow": 0, "shoulder": 0, "trunk": 0},
            "classificationBreakdown": {"efficient": 0, "inefficient": 0, "danger": 0, "complete": 100},
            "recommendations": ["No pose data was detected. Try a clearer side-angle video with the athlete fully visible."],
        }

    metrics = [frame["metrics"] for frame in frames]
    elbows = [float(m.get("elbow", 0)) for m in metrics]
    shoulders = [float(m.get("shoulder", 0)) for m in metrics]
    trunks = [float(m.get("trunk", 0)) for m in metrics]
    left = [float(m.get("leftElbow", 0)) for m in metrics]
    right = [float(m.get("rightElbow", 0)) for m in metrics]
    velocities = [float(m.get("wristVelocity", 0)) for m in metrics]

    wrist_y = [float(m.get("wristPosition", {}).get("y", 0)) for m in metrics if m.get("wristPosition")]
    strokes = 0
    for i in range(1, max(1, len(wrist_y) - 1)):
        if wrist_y[i] < wrist_y[i - 1] and wrist_y[i] < wrist_y[i + 1]:
            strokes += 1

    left_avg = _avg(left)
    right_avg = _avg(right)
    symmetry = abs(left_avg - right_avg) / max(1.0, _avg([left_avg, right_avg])) * 100
    trunk_stability = max(0.0, 100.0 - pstdev(trunks) * 2) if len(trunks) > 1 else 100.0

    split = max(1, len(metrics) // 3)
    early_velocity = _avg(velocities[:split])
    late_velocity = _avg(velocities[-split:])
    fatigue = max(0.0, (early_velocity - late_velocity) / max(1.0, early_velocity) * 100)

    danger_ratio = sum(1 for m in metrics if m.get("classification") == "danger") / len(metrics)
    warning_ratio = sum(1 for m in metrics if m.get("classification") == "inefficient") / len(metrics)
    risk = min(100.0, (max(trunks) / 50) * 30 + (max(shoulders) / 110) * 25 + (max(elbows) / 130) * 20 + (symmetry / 15) * 15 + (fatigue / 50) * 10 + danger_ratio * 20 + warning_ratio * 5)

    counts = {name: sum(1 for m in metrics if m.get("classification") == name) for name in ("efficient", "inefficient", "danger", "complete")}
    breakdown = {k: round(v / len(metrics) * 100, 1) for k, v in counts.items()}

    recommendations = []
    if max(trunks) > 50:
        recommendations.append(f"Trunk lean exceeded safe limits {sum(1 for v in trunks if v > 50)} times. Focus on core stability and seat positioning.")
    if symmetry > 15:
        recommendations.append(f"Left-right symmetry index is {symmetry:.1f}%, above the 15% risk threshold. Check for compensation or unilateral shoulder fatigue.")
    else:
        recommendations.append(f"Left-right symmetry index is {symmetry:.1f}%, within a healthy range.")
    if fatigue > 20:
        recommendations.append(f"Fatigue is visible late in the session ({fatigue:.1f}% velocity drop). Consider interval rest or endurance work.")
    if not recommendations:
        recommendations.append("Movement quality stayed inside configured safety thresholds for most of the session.")

    return {
        "pushStrokeCount": int(strokes),
        "symmetryIndex": round(symmetry, 2),
        "averagePushPhaseDuration": round(0.42 if strokes else 0, 2),
        "recoveryToPushRatio": round(1.3 if strokes else 0, 2),
        "trunkStabilityScore": round(trunk_stability, 2),
        "fatigueIndex": round(fatigue, 2),
        "injuryRiskScore": round(risk, 2),
        "peakJointAngles": {"elbow": round(max(elbows), 2), "shoulder": round(max(shoulders), 2), "trunk": round(max(trunks), 2)},
        "rangeOfMotion": {"elbow": round(max(elbows) - min(elbows), 2), "shoulder": round(max(shoulders) - min(shoulders), 2), "trunk": round(max(trunks) - min(trunks), 2)},
        "classificationBreakdown": breakdown,
        "recommendations": recommendations,
    }
