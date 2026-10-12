#!/usr/bin/env python3
"""Make Momo's face frames from the pose images themselves, so they line up pixel-perfectly:

  <pose>-blink.webp  eyes closed (blink)          for poses with open eyes
  <pose>-talk.webp   mouth closed in a small smile (lip-flap while Momo talks)

The eyes/mouth are found by colour (dark brown blobs, red mouth), removed with OpenCV inpainting
(the face around them is a smooth cream gradient) and redrawn as soft brown strokes.
Run after slice-mascot.py: npm run mascot   (needs Pillow, numpy, opencv-python-headless)
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

M = Path(__file__).resolve().parent.parent / "public" / "mascot"
INK = (43, 42, 63)  # BGR of Momo's dark brown (#3F2A2B)
BLINK = ["idle", "reminder", "refill", "loading", "missed"]
TALK = ["idle", "reminder", "refill"]
SS = 4  # supersampling for anti-aliased strokes


def load(pose):
    im = cv2.imread(str(M / f"{pose}.webp"), cv2.IMREAD_UNCHANGED)
    return im[..., :3].copy(), im[..., 3].copy()


def save(pose, suffix, bgr, alpha):
    rgba = np.dstack([bgr, alpha])
    Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA)).save(M / f"{pose}-{suffix}.webp", "WEBP", quality=90, method=6)
    print(f"wrote public/mascot/{pose}-{suffix}.webp")


def blobs(bgr, alpha):
    b, g, r = [bgr[..., i].astype(int) for i in range(3)]
    luma = 0.3 * r + 0.59 * g + 0.11 * b
    dark = ((luma < 95) & (alpha > 200)).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(dark, 8)
    comps = sorted((i for i in range(1, n) if st[i, 4] > 60), key=lambda i: -st[i, 4])
    return lab, st, cen, comps, (((r - g) > 45) & (luma < 175) & (alpha > 200)).astype(np.uint8)


def eyes_and_mouth(bgr, alpha):
    lab, st, cen, comps, red = blobs(bgr, alpha)
    # eyes: the two biggest dark blobs that are taller than wide, side by side
    eyes = [i for i in comps if st[i, 3] > st[i, 2] * 1.05][:2]
    eyes.sort(key=lambda i: cen[i][0])
    ey = np.mean([cen[i][1] for i in eyes])
    ex = (cen[eyes[0]][0], cen[eyes[1]][0])
    # mouth: dark blob between the eyes, just below them
    mouth = [i for i in comps if i not in eyes and ex[0] < cen[i][0] < ex[1] and ey < cen[i][1] < ey + 45]
    return lab, st, eyes, (mouth[0] if mouth else None), red


def stroke(bgr, alpha_mask, pts, width):
    """Anti-aliased brown polyline drawn into bgr (only where Momo is opaque)."""
    h, w = alpha_mask.shape
    big = np.zeros((h * SS, w * SS), np.uint8)
    cv2.polylines(big, [np.round(np.array(pts) * SS).astype(np.int32)], False, 255, int(width * SS), cv2.LINE_AA)
    cov = cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(float)[..., None] / 255
    out = bgr.astype(float) * (1 - cov) + np.array(INK, float) * cov
    return out.astype(np.uint8)


def curve(x0, x1, y, sag, n=24):
    """Quadratic arc from x0 to x1; positive sag bends downward (‿)."""
    t = np.linspace(0, 1, n)
    xs = x0 + (x1 - x0) * t
    ys = y + sag * 4 * t * (1 - t)
    return np.stack([xs, ys], 1)


def inpaint(bgr, mask, grow=4):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (grow * 2 + 1, grow * 2 + 1))
    return cv2.inpaint(bgr, cv2.dilate(mask, k), 7, cv2.INPAINT_TELEA)


def main():
    for pose in BLINK:
        bgr, a = load(pose)
        lab, st, eyes, _, _ = eyes_and_mouth(bgr, a)
        mask = np.isin(lab, eyes).astype(np.uint8) * 255
        out = inpaint(bgr, mask)
        for i in eyes:
            x, y, w, h = st[i, :4]
            # closed lid sits a little below the eye's centre, slightly wider than the eye
            out = stroke(out, a, curve(x - 2, x + w + 2, y + h * 0.58, h * 0.16), max(2.6, w * 0.13))
        save(pose, "blink", out, a)
    for pose in TALK:
        bgr, a = load(pose)
        lab, st, eyes, mouth, red = eyes_and_mouth(bgr, a)
        x, y, w, h = st[mouth, :4]
        mask = (lab == mouth).astype(np.uint8) * 255
        # include the red tongue/lips around the dark mouth blob
        box = np.zeros_like(mask)
        box[max(0, y - 4): y + h + 14, max(0, x - 3): x + w + 3] = 1
        b_, g_, r_ = [bgr[..., i].astype(int) for i in range(3)]
        pinkish = (((r_ - g_) > 22) & (a > 200)).astype(np.uint8)  # tongue and lip highlights
        mask |= ((red | pinkish) & box) * 255
        out = inpaint(bgr, mask, grow=3)
        out = stroke(out, a, curve(x + w * 0.2, x + w * 0.8, y + h * 0.3, h * 0.28), max(2.4, w * 0.075))
        save(pose, "talk", out, a)


if __name__ == "__main__":
    main()
