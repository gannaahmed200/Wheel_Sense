"""
test_stage3.py  —  Quick verification that Stage 3 kinematics are wired correctly.
Run from: Wheel_Sense/backend/
    .venv\Scripts\python.exe test_stage3.py
"""
import sys
sys.path.insert(0, ".")

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"
errors = []

# ── Test 1: Import Stage 3 modules ───────────────────────────────────────────
try:
    from kinematics import calculate_trunk_rotation, PushStrokeAnalyzer, VelocityEstimator
    from masking import build_wheelchair_mask, apply_mask
    from biomechanics import compute_frame_metrics, init_stage3_analyzers
    print(f"{PASS}  All Stage 3 imports resolved")
except Exception as e:
    print(f"{FAIL}  Import error: {e}")
    errors.append(str(e))

# ── Test 2: Trunk rotation — flat shoulders → ~0 degrees ─────────────────────
try:
    flat_kp = [{"x": 0, "y": 0, "confidence": 0.0}] * 17
    flat_kp[5] = {"x": 100, "y": 200, "confidence": 0.9}   # left shoulder
    flat_kp[6] = {"x": 300, "y": 200, "confidence": 0.9}   # right shoulder (same height)
    rot = calculate_trunk_rotation(flat_kp)
    assert rot is not None, "returned None"
    assert abs(rot) < 1.0, f"expected ~0, got {rot:.2f}"
    print(f"{PASS}  Trunk rotation flat shoulders: {rot:.2f} deg  (expected ~0)")
except AssertionError as e:
    print(f"{FAIL}  Trunk rotation flat: {e}")
    errors.append(str(e))

# ── Test 3: Trunk rotation — tilted shoulders → signed non-zero angle ─────────
try:
    tilted_kp = [{"x": 0, "y": 0, "confidence": 0.0}] * 17
    tilted_kp[5] = {"x": 100, "y": 200, "confidence": 0.9}   # left shoulder lower
    tilted_kp[6] = {"x": 300, "y": 150, "confidence": 0.9}   # right shoulder higher → clockwise
    rot2 = calculate_trunk_rotation(tilted_kp)
    assert rot2 is not None, "returned None"
    assert rot2 > 0, f"expected positive (clockwise), got {rot2:.2f}"
    print(f"{PASS}  Trunk rotation tilted: {rot2:.2f} deg  (positive = clockwise OK)")
except AssertionError as e:
    print(f"{FAIL}  Trunk rotation tilted: {e}")
    errors.append(str(e))

# ── Test 4: Push-stroke efficiency — rightward wrist motion ───────────────────
try:
    analyzer = PushStrokeAnalyzer(fps=30.0)
    kp = [{"x": 0, "y": 0, "confidence": 0.0}] * 17
    result = {"efficiency": 0.0, "push_speed": 0.0, "stroke_event": ""}
    for i in range(7):
        kp[5]  = {"x": 100, "y": 180, "confidence": 0.9}           # left shoulder
        kp[6]  = {"x": 200, "y": 180, "confidence": 0.9}           # right shoulder
        kp[10] = {"x": 200 + i * 15, "y": 185, "confidence": 0.9}  # wrist moving right
        result = analyzer.update(kp)
    eff = result["efficiency"]
    spd = result["push_speed"]
    assert 0.0 <= eff <= 1.0, f"efficiency {eff} out of range"
    assert spd > 0, "push speed should be > 0"
    print(f"{PASS}  Push efficiency: {eff:.3f}  speed: {spd:.1f} px/s")
except AssertionError as e:
    print(f"{FAIL}  Push efficiency: {e}")
    errors.append(str(e))

# ── Test 5: compute_frame_metrics returns all Stage 3 fields ─────────────────
try:
    init_stage3_analyzers(fps=30.0)
    person = {"keypoints": kp, "confidence": 0.85, "bbox": [0, 0, 640, 480]}
    metrics = compute_frame_metrics([person], fps=30.0)

    required_stage3_fields = ["trunkRotation", "pushEfficiency", "strokeEvent"]
    for field in required_stage3_fields:
        assert field in metrics, f"'{field}' missing from metrics dict"

    print(f"{PASS}  compute_frame_metrics Stage 3 fields:")
    print(f"      trunkRotation  = {metrics['trunkRotation']}")
    print(f"      pushEfficiency = {metrics['pushEfficiency']}")
    print(f"      strokeEvent    = \"{metrics['strokeEvent']}\"")
except AssertionError as e:
    print(f"{FAIL}  compute_frame_metrics: {e}")
    errors.append(str(e))

# ── Test 6: Mask builds without error ────────────────────────────────────────
try:
    import numpy as np
    dummy_frame = np.zeros((480, 640, 3), dtype="uint8")
    mask = build_wheelchair_mask(dummy_frame, kp, apply_color_mask=False)
    assert mask.shape == (480, 640), f"unexpected mask shape {mask.shape}"
    print(f"{PASS}  build_wheelchair_mask shape: {mask.shape}  (geometry only)")

    mask_color = build_wheelchair_mask(dummy_frame, kp, apply_color_mask=True)
    assert mask_color.shape == (480, 640), f"unexpected mask shape {mask_color.shape}"
    print(f"{PASS}  build_wheelchair_mask shape: {mask_color.shape}  (geometry + HSV color)")
except Exception as e:
    print(f"{FAIL}  Mask: {e}")
    errors.append(str(e))

# ── Summary ───────────────────────────────────────────────────────────────────
print()
if errors:
    print(f"\033[91m{len(errors)} test(s) FAILED:\033[0m")
    for err in errors:
        print(f"  - {err}")
    sys.exit(1)
else:
    print("\033[92mALL 6 TESTS PASSED - Stage 3 is wired correctly.\033[0m")
