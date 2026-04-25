"""
scripts/train.py
Fine-tunes Keypoint R-CNN on WheelPose data.

Usage
-----
  # Full training (requires synthetic data from Stage 1)
  python scripts/train.py

  # Baseline only — evaluates ImageNet pretrained on real test set,
  # no synthetic data needed.  Useful before Stage 1 finishes.
  python scripts/train.py --baseline-only

  # Resume from a checkpoint
  python scripts/train.py --resume --weights outputs/model_0005000.pth
"""

import os
import sys
import argparse
import logging

# ── Make sure project root is on PYTHONPATH ───────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from detectron2.engine import DefaultTrainer, default_argument_parser, launch
from detectron2.evaluation import COCOEvaluator
from detectron2.data import build_detection_train_loader
from detectron2.utils.logger import setup_logger

from configs.register_datasets import register_all
from configs.model_config import get_config

setup_logger()
logger = logging.getLogger("wheelpose.train")


# ─────────────────────────────────────────────────────────────────────────────
class WheelPoseTrainer(DefaultTrainer):
    """
    Extends DefaultTrainer with COCO evaluation after each checkpoint.
    Mirrors the paper's strategy: checkpoint every epoch, report best KP AP.
    """

    @classmethod
    def build_evaluator(cls, cfg, dataset_name, output_folder=None):
        if output_folder is None:
            output_folder = os.path.join(cfg.OUTPUT_DIR, "eval", dataset_name)
        os.makedirs(output_folder, exist_ok=True)
        return COCOEvaluator(
            dataset_name,
            tasks={"bbox", "keypoints"},
            distributed=False,
            output_dir=output_folder,
        )


# ─────────────────────────────────────────────────────────────────────────────
def run_baseline_eval():
    """
    Evaluates the raw ImageNet-pretrained model on the real test set.
    Reproduces the paper's baseline (BB mAP ~35.19, KP mAP ~63.11).
    No synthetic data required.
    """
    from detectron2.engine import DefaultPredictor
    from detectron2.evaluation import inference_on_dataset
    from detectron2.data import build_detection_test_loader

    logger.info("Running baseline evaluation (no fine-tuning) ...")
    cfg = get_config(output_dir="./outputs/baseline_eval")

    evaluator  = WheelPoseTrainer.build_evaluator(cfg, "wheelpose_test")
    val_loader = build_detection_test_loader(cfg, "wheelpose_test")
    predictor  = DefaultPredictor(cfg)

    results = inference_on_dataset(predictor.model, val_loader, evaluator)
    logger.info("Baseline results: %s", results)
    return results


# ─────────────────────────────────────────────────────────────────────────────
def run_training(weights=None, resume=False):
    """
    Fine-tunes on wheelpose_train (synthetic data).

    [PLACEHOLDER] wheelpose_train must be present.
    When Stage 1 delivers the synthetic dataset:
      1. Put images in   data/synthetic/images/
      2. Put annotations in data/synthetic/annotations.json
      3. Re-run this script without --baseline-only
    """
    logger.info("Starting WheelPose fine-tuning ...")

    cfg = get_config(
        train_dataset="wheelpose_train",
        test_dataset="wheelpose_test",
        output_dir="./outputs/wheelpose_opt",
        weights=weights,
    )

    trainer = WheelPoseTrainer(cfg)
    trainer.resume_or_load(resume=resume)
    trainer.train()

    logger.info(
        "Training complete. Checkpoints saved to: %s\n"
        "Pick the epoch with the best KP AP from outputs/wheelpose_opt/eval/",
        cfg.OUTPUT_DIR,
    )


# ─────────────────────────────────────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="WheelPose training script")
    p.add_argument(
        "--baseline-only",
        action="store_true",
        help="Only evaluate ImageNet pretrained model — no training",
    )
    p.add_argument(
        "--resume",
        action="store_true",
        help="Resume training from latest checkpoint in output dir",
    )
    p.add_argument(
        "--weights",
        type=str,
        default=None,
        help="Path to a .pth checkpoint to start from",
    )
    return p.parse_args()


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = parse_args()
    register_all()

    if args.baseline_only:
        run_baseline_eval()
    else:
        run_training(weights=args.weights, resume=args.resume)
