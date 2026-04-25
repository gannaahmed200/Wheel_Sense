"""
configs/model_config.py
Builds the Detectron2 config for Keypoint R-CNN R50-FPN,
replicating WheelPose-Opt hyperparameters from Table 2 of the paper.
"""

import os
from detectron2.config import get_cfg
from detectron2 import model_zoo


# ── Training constants ────────────────────────────────────────────────────────
IMAGES_PER_BATCH    = 13        # matches paper (per GPU)
APPROX_TRAIN_IMGS   = 65_000    # ~65k images with ≥1 person in 70k dataset
EPOCHS_PHASE1       = 20        # LR = BASE_LR
EPOCHS_PHASE2       = 10        # LR = BASE_LR * 0.1
WARMUP_ITERS        = 1_000


def iters_per_epoch(n_images=APPROX_TRAIN_IMGS, batch=IMAGES_PER_BATCH):
    return max(1, n_images // batch)


def get_config(
    train_dataset: str = "wheelpose_train",
    test_dataset:  str = "wheelpose_test",
    output_dir:    str = "./outputs",
    weights:       str = None,      # None → use ImageNet pretrained (paper baseline)
) -> "CfgNode":
    """
    Returns a fully configured CfgNode ready for training or evaluation.

    Parameters
    ----------
    train_dataset : registered dataset name for training
    test_dataset  : registered dataset name for evaluation
    output_dir    : where checkpoints and logs are written
    weights       : path to a .pth file to resume from;
                    None = start from COCO ImageNet pretrained weights
    """
    cfg = get_cfg()

    # ── Base architecture: Keypoint R-CNN with ResNet-50 + FPN ───────────────
    cfg.merge_from_file(
        model_zoo.get_config_file(
            "COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml"
        )
    )

    # ── Pretrained weights ────────────────────────────────────────────────────
    if weights is None:
        # Start from COCO ImageNet pretrained — this is the paper's baseline
        cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url(
            "COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml"
        )
    else:
        cfg.MODEL.WEIGHTS = weights

    # ── Datasets ──────────────────────────────────────────────────────────────
    cfg.DATASETS.TRAIN = (train_dataset,)
    cfg.DATASETS.TEST  = (test_dataset,)

    # ── Solver (exact values from WheelPose paper) ────────────────────────────
    iters_p1 = iters_per_epoch() * EPOCHS_PHASE1
    iters_p2 = iters_per_epoch() * EPOCHS_PHASE2

    cfg.SOLVER.BASE_LR       = 0.000025
    cfg.SOLVER.MAX_ITER      = iters_p1 + iters_p2
    cfg.SOLVER.STEPS         = (iters_p1,)   # LR drop after phase 1
    cfg.SOLVER.GAMMA         = 0.1            # LR multiplied by 0.1 at step
    cfg.SOLVER.WARMUP_ITERS  = WARMUP_ITERS
    cfg.SOLVER.WARMUP_METHOD = "linear"
    cfg.SOLVER.MOMENTUM      = 0.9
    cfg.SOLVER.WEIGHT_DECAY  = 0.0001
    cfg.SOLVER.IMS_PER_BATCH = IMAGES_PER_BATCH

    # Checkpoint every epoch so we can pick best KP AP (paper method)
    cfg.SOLVER.CHECKPOINT_PERIOD = iters_per_epoch()

    # ── Model head ────────────────────────────────────────────────────────────
    cfg.MODEL.ROI_KEYPOINT_HEAD.NUM_KEYPOINTS = 17
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST     = 0.5
    cfg.MODEL.DEVICE                          = "cuda"

    # ── Output ────────────────────────────────────────────────────────────────
    cfg.OUTPUT_DIR = output_dir
    os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)

    return cfg


# ── Quick sanity print ────────────────────────────────────────────────────────
if __name__ == "__main__":
    cfg = get_config()
    total_iters = cfg.SOLVER.MAX_ITER
    lr_drop_at  = cfg.SOLVER.STEPS[0]
    print(f"Total iterations : {total_iters}")
    print(f"LR drop at iter  : {lr_drop_at}")
    print(f"Checkpoint every : {cfg.SOLVER.CHECKPOINT_PERIOD} iters")
    print(f"Pretrained from  : {cfg.MODEL.WEIGHTS}")
