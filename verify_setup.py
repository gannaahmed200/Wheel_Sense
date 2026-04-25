"""
verify_setup.py
Run this first after cloning. Checks that all dependencies and data paths
are in order before you attempt training.

Usage: python verify_setup.py
"""

import sys
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

print("=" * 60)
print("WheelPose Setup Verification")
print("=" * 60)

errors   = []
warnings = []

# ── 1. Python version ─────────────────────────────────────────────────────
v = sys.version_info
if v.major < 3 or (v.major == 3 and v.minor < 9):
    errors.append(f"Python ≥ 3.9 required. Found {v.major}.{v.minor}")
else:
    print(f"[OK] Python {v.major}.{v.minor}")

# ── 2. PyTorch + CUDA ─────────────────────────────────────────────────────
try:
    import torch
    cuda_ok = torch.cuda.is_available()
    status  = "OK" if cuda_ok else "WARNING"
    print(f"[{status}] PyTorch {torch.__version__}  |  CUDA: {cuda_ok}")
    if not cuda_ok:
        warnings.append("CUDA not available — training will be very slow on CPU.")
except ImportError:
    errors.append("PyTorch not installed. Run: pip install torch torchvision")

# ── 3. Detectron2 ─────────────────────────────────────────────────────────
try:
    import detectron2
    print(f"[OK] Detectron2 {detectron2.__version__}")
except ImportError:
    errors.append(
        "Detectron2 not installed.\n"
        "  Run: pip install 'git+https://github.com/facebookresearch/detectron2.git'"
    )

# ── 4. Other packages ─────────────────────────────────────────────────────
packages = ["cv2", "mediapipe", "pycocotools", "numpy", "matplotlib", "tqdm"]
for pkg in packages:
    try:
        __import__(pkg)
        print(f"[OK] {pkg}")
    except ImportError:
        errors.append(f"{pkg} not installed. Run: pip install {pkg.replace('cv2','opencv-python')}")

# ── 5. Data presence ──────────────────────────────────────────────────────
real_imgs = os.path.join(ROOT, "data", "real_world", "images")
real_ann  = os.path.join(ROOT, "data", "real_world", "annotations.json")
syn_imgs  = os.path.join(ROOT, "data", "synthetic", "images")
syn_ann   = os.path.join(ROOT, "data", "synthetic", "annotations.json")

if os.path.isdir(real_imgs) and len(os.listdir(real_imgs)) > 0:
    print(f"[OK] Real-world images found ({len(os.listdir(real_imgs))} files)")
else:
    warnings.append(
        "Real-world images not found at data/real_world/images/\n"
        "  Download from: https://github.com/hilab-open-source/wheelpose"
    )

if os.path.isfile(real_ann):
    print(f"[OK] Real-world annotations.json found")
else:
    warnings.append("Real-world annotations.json not found at data/real_world/")

if os.path.isdir(syn_imgs) and len(os.listdir(syn_imgs)) > 0:
    print(f"[OK] Synthetic images found ({len(os.listdir(syn_imgs))} files)")
else:
    warnings.append(
        "[PLACEHOLDER] Synthetic training data not yet present.\n"
        "  This is expected until Stage 1 delivers the Unity-generated dataset.\n"
        "  You can still run: python scripts/train.py --baseline-only"
    )

if os.path.isfile(syn_ann):
    print(f"[OK] Synthetic annotations.json found")
else:
    warnings.append(
        "[PLACEHOLDER] Synthetic annotations.json not yet present. "
        "Waiting on Stage 1."
    )

# ── 6. Dataset registration test ──────────────────────────────────────────
try:
    sys.path.insert(0, ROOT)
    from configs.register_datasets import register_all
    register_all()
    print("[OK] Dataset registration script runs")
except Exception as e:
    errors.append(f"register_datasets.py failed: {e}")

# ── Summary ───────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
if warnings:
    print("WARNINGS:")
    for w in warnings:
        print(f"  ⚠  {w}")

if errors:
    print("\nERRORS (must fix before training):")
    for e in errors:
        print(f"  ✗  {e}")
    sys.exit(1)
else:
    print("\n✓ All critical checks passed.")
    if warnings:
        print("  Address warnings above when ready to train.")
    print("\nNext steps:")
    print("  1. python scripts/train.py --baseline-only    ← no data needed")
    print("  2. [Wait for Stage 1 synthetic data]")
    print("  3. python scripts/train.py                    ← full fine-tuning")
    print("  4. python scripts/evaluate.py --weights outputs/wheelpose_opt/model_final.pth")
    print("  5. python scripts/extract_keypoints.py --video <path> --weights <path>")
