"""
scripts/evaluate.py
Evaluates a trained checkpoint on the real-world wheelchair test set.
Reports BB mAP, KP mAP, and per-keypoint breakdown matching Table 2-5 of paper.

Usage
-----
  python scripts/evaluate.py --weights outputs/wheelpose_opt/model_final.pth
  python scripts/evaluate.py --weights outputs/wheelpose_opt/model_final.pth --visualize
"""

import os
import sys
import json
import argparse
import logging
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

import cv2
from detectron2.engine import DefaultPredictor
from detectron2.evaluation import COCOEvaluator, inference_on_dataset
from detectron2.data import build_detection_test_loader
from detectron2.utils.logger import setup_logger
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog

from configs.register_datasets import register_all, KEYPOINT_NAMES
from configs.model_config import get_config

setup_logger()
logger = logging.getLogger("wheelpose.evaluate")

KEYPOINT_NAMES_DISPLAY = KEYPOINT_NAMES   # reuse from register_datasets


# ─────────────────────────────────────────────────────────────────────────────
def evaluate(weights_path: str, output_dir: str = "./outputs/eval"):
    """Full COCO evaluation — BB mAP + KP mAP."""
    cfg = get_config(output_dir=output_dir, weights=weights_path)
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5

    evaluator  = COCOEvaluator(
        "wheelpose_test",
        tasks={"bbox", "keypoints"},
        distributed=False,
        output_dir=os.path.join(output_dir, "coco_results"),
    )
    val_loader = build_detection_test_loader(cfg, "wheelpose_test")
    predictor  = DefaultPredictor(cfg)

    logger.info("Running evaluation on wheelpose_test ...")
    results = inference_on_dataset(predictor.model, val_loader, evaluator)

    logger.info("\n===== RESULTS =====")
    logger.info("Bounding Box  mAP : %.2f", results["bbox"]["AP"])
    logger.info("Keypoint      mAP : %.2f", results["keypoints"]["AP"])
    logger.info(
        "\nPaper targets (WheelPose-Opt):\n"
        "  BB mAP  → ~69.5\n"
        "  KP mAP  → ~67.9"
    )

    # Save results summary to JSON
    summary_path = os.path.join(output_dir, "results_summary.json")
    with open(summary_path, "w") as f:
        json.dump(results, f, indent=2)
    logger.info("Full results saved to %s", summary_path)

    return results, predictor


# ─────────────────────────────────────────────────────────────────────────────
def visualize_predictions(weights_path: str, n_samples: int = 10,
                           output_dir: str = "./outputs/eval/visualizations"):
    """
    Saves side-by-side visualizations: ImageNet predictions vs fine-tuned.
    Useful for replicating Figures 14-17 from the paper.
    """
    os.makedirs(output_dir, exist_ok=True)

    cfg_baseline  = get_config(output_dir=output_dir)   # ImageNet weights
    cfg_finetuned = get_config(output_dir=output_dir, weights=weights_path)
    cfg_finetuned.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5
    cfg_baseline.MODEL.ROI_HEADS.SCORE_THRESH_TEST  = 0.5

    pred_baseline  = DefaultPredictor(cfg_baseline)
    pred_finetuned = DefaultPredictor(cfg_finetuned)
    metadata       = MetadataCatalog.get("wheelpose_test")

    from detectron2.data import DatasetCatalog
    dataset = DatasetCatalog.get("wheelpose_test")

    import random
    samples = random.sample(dataset, min(n_samples, len(dataset)))

    for i, sample in enumerate(samples):
        img = cv2.imread(sample["file_name"])
        if img is None:
            continue

        out_base = pred_baseline(img)
        out_ft   = pred_finetuned(img)

        vis_base = Visualizer(img[:, :, ::-1], metadata=metadata, scale=0.8)
        vis_ft   = Visualizer(img[:, :, ::-1], metadata=metadata, scale=0.8)

        drawn_base = vis_base.draw_instance_predictions(
            out_base["instances"].to("cpu")
        ).get_image()
        drawn_ft = vis_ft.draw_instance_predictions(
            out_ft["instances"].to("cpu")
        ).get_image()

        # Stack horizontally: [ImageNet | Fine-tuned]
        combined = np.concatenate(
            [drawn_base[:, :, ::-1], drawn_ft[:, :, ::-1]], axis=1
        )
        out_path = os.path.join(output_dir, f"comparison_{i:03d}.jpg")
        cv2.imwrite(out_path, combined)
        logger.info("Saved %s", out_path)

    logger.info(
        "Visualizations done.\n"
        "Left  = ImageNet baseline (red)\n"
        "Right = WheelPose fine-tuned (green)"
    )


# ─────────────────────────────────────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="WheelPose evaluation script")
    p.add_argument(
        "--weights", type=str, required=True,
        help="Path to trained model checkpoint (.pth)"
    )
    p.add_argument(
        "--visualize", action="store_true",
        help="Also save side-by-side prediction comparisons"
    )
    p.add_argument(
        "--n-samples", type=int, default=20,
        help="Number of sample images to visualize (default: 20)"
    )
    p.add_argument(
        "--output-dir", type=str, default="./outputs/eval",
        help="Where to write results"
    )
    return p.parse_args()


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = parse_args()
    register_all()
    evaluate(args.weights, args.output_dir)
    if args.visualize:
        visualize_predictions(
            args.weights,
            n_samples=args.n_samples,
            output_dir=os.path.join(args.output_dir, "visualizations"),
        )
