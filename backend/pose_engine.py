from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import Any

import cv2

from biomechanics import COCO_NAMES, aggregate_session, compute_frame_metrics
from video_annotator import draw_pose, frame_to_base64


class PoseEngine:
    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)
        self.resolved_model_path: Path | str | None = None
        self.model = None
        self.device = "cpu"
        self.loaded = False
        self.error: str | None = None
        self.load_model()

    def _find_inference_artifact(self) -> Path | None:
        supported_suffixes = {
            ".pt",
            ".pth",
            ".onnx",
            ".engine",
            ".torchscript",
            ".mlpackage",
            ".tflite",
            ".pb",
            ".xml",
        }

        if self.model_path.is_file() and self.model_path.suffix.lower() in supported_suffixes:
            return self.model_path

        if self.model_path.name.lower().startswith("yolo") and self.model_path.suffix.lower() in supported_suffixes:
            return self.model_path

        if not self.model_path.is_dir():
            return None

        preferred_names = (
            "best.pt",
            "best.onnx",
            "best.engine",
            "best.torchscript",
            "best_repacked.pt",
        )
        search_roots = [self.model_path, self.model_path.parent]

        for root in search_roots:
            for name in preferred_names:
                candidate = root / name
                if candidate.is_file():
                    return candidate

        candidates = [
            path
            for root in search_roots
            for path in root.rglob("*")
            if path.is_file() and path.suffix.lower() in supported_suffixes
        ]
        return sorted(candidates, key=lambda path: (path.name != "best.pt", len(path.parts), str(path).lower()))[0] if candidates else None

    def load_model(self):
        try:
            from ultralytics import YOLO
            import torch

            load_path = self._find_inference_artifact()
            if load_path is None:
                self.model = None
                self.loaded = False
                self.error = (
                    f"No Ultralytics-supported inference artifact was found near {self.model_path}. "
                    "Expected model/best.pt, best.pt, .onnx, or another exported YOLO model file."
                )
                return

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model = YOLO(str(load_path), task="pose")
            self.resolved_model_path = load_path
            self.loaded = True
            self.error = None
        except Exception as exc:  # surfaced by /api/health
            self.model = None
            self.loaded = False
            self.error = str(exc)

    def status(self) -> dict[str, Any]:
        return {
            "loaded": self.loaded,
            "device": self.device,
            "keypointCount": 17,
            "modelPath": str(self.model_path),
            "resolvedModelPath": str(self.resolved_model_path) if self.resolved_model_path else None,
            "error": self.error,
        }

    def predict_frame(
        self,
        frame,
        previous_metrics: dict[str, Any] | None = None,
        fps: float = 30.0,
        thresholds: dict[str, dict[str, float]] | None = None,
    ) -> dict[str, Any]:
        if self.model is None:
            height, width = frame.shape[:2]
            metrics = compute_frame_metrics([], previous_metrics=previous_metrics, fps=fps, thresholds=thresholds)
            return {
                "people": [],
                "metrics": metrics,
                "annotatedFrame": frame_to_base64(frame),
                "width": width,
                "height": height,
                "modelError": self.error,
            }

        height, width = frame.shape[:2]
        results = self.model.predict(frame, verbose=False, device=self.device)
        people: list[dict[str, Any]] = []

        for result in results:
            keypoints_obj = getattr(result, "keypoints", None)
            if keypoints_obj is None or keypoints_obj.xy is None:
                continue
            xy = keypoints_obj.xy.cpu().numpy()
            conf = keypoints_obj.conf.cpu().numpy() if keypoints_obj.conf is not None else None
            for person_index, person_points in enumerate(xy):
                keypoints = []
                confidences = []
                for point_index, (x, y) in enumerate(person_points[:17]):
                    point_confidence = float(conf[person_index][point_index]) if conf is not None else 1.0
                    confidences.append(point_confidence)
                    keypoints.append(
                        {
                            "name": COCO_NAMES[point_index],
                            "x": float(x),
                            "y": float(y),
                            "confidence": point_confidence,
                        }
                    )
                people.append(
                    {
                        "keypoints": keypoints,
                        "confidence": sum(confidences) / max(1, len(confidences)),
                        "bbox": [0, 0, width, height],
                    }
                )

        metrics = compute_frame_metrics(people, previous_metrics=previous_metrics, fps=fps, thresholds=thresholds)
        annotated = draw_pose(frame.copy(), people, metrics["classification"])
        return {
            "people": people,
            "metrics": metrics,
            "annotatedFrame": frame_to_base64(annotated),
            "width": width,
            "height": height,
        }

    def predict_video(
        self,
        video_path: str | Path,
        frame_skip: int = 2,
        thresholds: dict[str, dict[str, float]] | None = None,
        max_frames: int | None = None,
    ) -> dict[str, Any]:
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise RuntimeError("Could not open uploaded video file.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        duration = total_frames / fps if fps else 0
        frames: list[dict[str, Any]] = []
        previous_metrics = None
        index = 0

        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if index % max(1, frame_skip) == 0:
                prediction = self.predict_frame(frame, previous_metrics=previous_metrics, fps=fps / max(1, frame_skip), thresholds=thresholds)
                previous_metrics = prediction["metrics"]
                frames.append(
                    {
                        "frameIndex": index,
                        "timestamp": index / fps,
                        **prediction,
                    }
                )
                if max_frames and len(frames) >= max_frames:
                    break
            index += 1

        cap.release()
        return {
            "id": os.urandom(8).hex(),
            "sourceType": "video",
            "createdAt": "",
            "duration": duration,
            "fps": fps,
            "frameSkip": frame_skip,
            "frames": frames,
            "aggregateMetrics": aggregate_session(frames),
        }


def save_upload_to_temp(contents: bytes, suffix: str) -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as handle:
        handle.write(contents)
    return path
