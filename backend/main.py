from __future__ import annotations

import asyncio
import base64
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from pose_engine import PoseEngine, save_upload_to_temp


ROOT = Path(__file__).resolve().parent.parent
MODEL_OPTIONS = {
    "fine_tuned_yolo": {
        "label": "Fine Tuned YOLO",
        "path": ROOT / "model" / "best",
    },
    "original_yolo": {
        "label": "Original YOLO",
        "path": ROOT / "yolo11n-pose.pt",
    },
}
DEFAULT_MODEL_KEY = "original_yolo"
engines: dict[str, PoseEngine] = {
    DEFAULT_MODEL_KEY: PoseEngine(MODEL_OPTIONS[DEFAULT_MODEL_KEY]["path"])
}

app = FastAPI(title="WheelSense Pose Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _parse_thresholds(raw: str | None) -> dict[str, dict[str, float]] | None:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _normalize_model_key(raw: str | None) -> str:
    key = raw or DEFAULT_MODEL_KEY
    return key if key in MODEL_OPTIONS else DEFAULT_MODEL_KEY


def _get_engine(model_key: str | None) -> tuple[str, dict[str, Any], PoseEngine]:
    normalized = _normalize_model_key(model_key)
    if normalized not in engines:
        engines[normalized] = PoseEngine(MODEL_OPTIONS[normalized]["path"])
    return normalized, MODEL_OPTIONS[normalized], engines[normalized]


def _model_statuses() -> dict[str, dict[str, Any]]:
    statuses = {}
    for key, config in MODEL_OPTIONS.items():
        engine = engines.get(key)
        statuses[key] = {
            "key": key,
            "label": config["label"],
            "loaded": bool(engine and engine.loaded),
            "status": engine.status() if engine else {
                "loaded": False,
                "device": "not loaded",
                "keypointCount": 17,
                "modelPath": str(config["path"]),
                "resolvedModelPath": None,
                "error": None,
            },
        }
    return statuses


@app.get("/api/health")
def health():
    default_engine = engines[DEFAULT_MODEL_KEY]
    return {
        "status": "ok" if default_engine.loaded else "degraded",
        "defaultModel": DEFAULT_MODEL_KEY,
        "models": _model_statuses(),
        "model": default_engine.status(),
    }


@app.post("/api/analyze-video")
async def analyze_video(
    video: UploadFile = File(...),
    frame_skip: int = Form(2),
    thresholds: str | None = Form(None),
    model_key: str | None = Form(DEFAULT_MODEL_KEY),
):
    selected_key, selected_model, engine = _get_engine(model_key)
    contents = await video.read()
    suffix = Path(video.filename or "upload.mp4").suffix or ".mp4"
    path = save_upload_to_temp(contents, suffix)
    try:
        result = engine.predict_video(path, frame_skip=frame_skip, thresholds=_parse_thresholds(thresholds))
        result["createdAt"] = datetime.now(timezone.utc).isoformat()
        result["fileName"] = video.filename
        result["modelKey"] = selected_key
        result["modelLabel"] = selected_model["label"]
        return result
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


@app.post("/api/analyze-video-stream")
async def analyze_video_stream(
    video: UploadFile = File(...),
    frame_skip: int = Form(2),
    thresholds: str | None = Form(None),
    model_key: str | None = Form(DEFAULT_MODEL_KEY),
):
    selected_key, selected_model, engine = _get_engine(model_key)
    contents = await video.read()
    suffix = Path(video.filename or "upload.mp4").suffix or ".mp4"
    path = save_upload_to_temp(contents, suffix)
    parsed_thresholds = _parse_thresholds(thresholds)

    async def events():
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            yield f"data: {json.dumps({'type': 'error', 'message': 'Could not open uploaded video'})}\n\n"
            return

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        frames: list[dict[str, Any]] = []
        previous_metrics = None
        index = 0
        try:
            while True:
                ok, frame = cap.read()
                if not ok:
                    break
                if index % max(1, frame_skip) == 0:
                    prediction = engine.predict_frame(frame, previous_metrics=previous_metrics, fps=fps / max(1, frame_skip), thresholds=parsed_thresholds)
                    previous_metrics = prediction["metrics"]
                    payload = {
                        "type": "frame",
                        "frame": {
                            "frameIndex": index,
                            "timestamp": index / fps,
                            "modelKey": selected_key,
                            "modelLabel": selected_model["label"],
                            **prediction,
                        },
                        "progress": index / max(1, total),
                    }
                    frames.append(payload["frame"])
                    yield f"data: {json.dumps(payload)}\n\n"
                    await asyncio.sleep(0)
                index += 1

            from biomechanics import aggregate_session

            result = {
                "type": "complete",
                "result": {
                    "id": os.urandom(8).hex(),
                    "sourceType": "video",
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                    "fileName": video.filename,
                    "modelKey": selected_key,
                    "modelLabel": selected_model["label"],
                    "duration": total / fps if fps else 0,
                    "fps": fps,
                    "frameSkip": frame_skip,
                    "frames": frames,
                    "aggregateMetrics": aggregate_session(frames),
                },
            }
            yield f"data: {json.dumps(result)}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
        finally:
            cap.release()
            try:
                os.remove(path)
            except OSError:
                pass

    return StreamingResponse(events(), media_type="text/event-stream")


@app.websocket("/ws/analyze")
async def websocket_analyze(websocket: WebSocket):
    await websocket.accept()
    previous_metrics = None
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            frame_data = data.get("frame", "")
            thresholds = data.get("thresholds")
            selected_key, selected_model, engine = _get_engine(data.get("modelKey"))
            if "," in frame_data:
                frame_data = frame_data.split(",", 1)[1]
            image_bytes = base64.b64decode(frame_data)
            arr = np.frombuffer(image_bytes, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                await websocket.send_json({"type": "error", "message": "Invalid image frame"})
                continue
            prediction = engine.predict_frame(frame, previous_metrics=previous_metrics, fps=15, thresholds=thresholds)
            previous_metrics = prediction["metrics"]
            await websocket.send_json({
                "type": "frame",
                "frame": {
                    "timestamp": data.get("timestamp", 0),
                    "modelKey": selected_key,
                    "modelLabel": selected_model["label"],
                    **prediction,
                },
            })
    except WebSocketDisconnect:
        return
    except Exception as exc:
        await websocket.send_json({"type": "error", "message": str(exc)})
