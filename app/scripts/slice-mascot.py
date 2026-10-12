#!/usr/bin/env python3
"""Slice Momo's pose sheet (assets-src/momo-sheet.png, transparent PNG) into one WebP per state.

Every pose keeps the sheet's scale (no resampling) and is bottom-aligned on the same square canvas,
so Momo never changes size or jumps when the state changes. Run: npm run mascot  (needs Pillow)
"""
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "momo-sheet.png"
OUT = ROOT / "public" / "mascot"

# Sheet order, reading left→right, top→bottom. None = pose on the sheet that the app doesn't use
# (the squint pose doesn't line up with idle closely enough to fake a blink).
ORDER = ["idle", None, "reminder", "happy", "missed", "sleeping", "refill", "loading", "success", "icon"]
CANVAS = 440  # square; poses are ≤410×310 px on the sheet
GROUND = 14  # px between the lowest pixel and the canvas bottom


def components(alpha: Image.Image, step: int = 4, min_cells: int = 200):
    w, h = alpha.size
    px = alpha.load()
    gw, gh = w // step, h // step
    on = [[px[x * step, y * step] > 8 for x in range(gw)] for y in range(gh)]
    seen = [[False] * gw for _ in range(gh)]
    boxes = []
    for y in range(gh):
        for x in range(gw):
            if not on[y][x] or seen[y][x]:
                continue
            q, xs, ys = deque([(y, x)]), [], []
            seen[y][x] = True
            while q:
                cy, cx = q.popleft()
                xs.append(cx)
                ys.append(cy)
                for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                    if 0 <= ny < gh and 0 <= nx < gw and on[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        q.append((ny, nx))
            if len(xs) >= min_cells:
                pad = step
                boxes.append((max(0, min(xs) * step - pad), max(0, min(ys) * step - pad), min(w, (max(xs) + 1) * step + pad), min(h, (max(ys) + 1) * step + pad)))
    # rows first (by vertical centre band), then left→right
    boxes.sort(key=lambda b: (round(((b[1] + b[3]) / 2) / 300), b[0]))
    return boxes


def keep_largest(img: Image.Image) -> Image.Image:
    """Drop slivers of neighbouring poses that fall inside this pose's box."""
    a = img.getchannel("A")
    w, h = a.size
    px = a.load()
    lab = [[0] * w for _ in range(h)]
    sizes = {}
    n = 0
    for y in range(h):
        for x in range(w):
            if px[x, y] > 8 and not lab[y][x]:
                n += 1
                q = deque([(y, x)])
                lab[y][x] = n
                cnt = 0
                while q:
                    cy, cx = q.popleft()
                    cnt += 1
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and px[nx, ny] > 8 and not lab[ny][nx]:
                            lab[ny][nx] = n
                            q.append((ny, nx))
                sizes[n] = cnt
    big = max(sizes, key=sizes.get)
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for y in range(h):
        row = lab[y]
        for x in range(w):
            if row[x] == big:
                mp[x, y] = 255
    # keep the soft edge (alpha ≤ 8) next to the kept shape
    from PIL import ImageFilter
    mask = mask.filter(ImageFilter.MaxFilter(5))
    out = img.copy()
    out.putalpha(Image.composite(a, Image.new("L", (w, h), 0), mask))
    return out


def main():
    sheet = Image.open(SRC).convert("RGBA")
    boxes = components(sheet.getchannel("A"))
    assert len(boxes) == len(ORDER), f"expected {len(ORDER)} poses, found {len(boxes)}"
    OUT.mkdir(parents=True, exist_ok=True)
    for name, box in zip(ORDER, boxes):
        if name is None:
            continue
        part = keep_largest(sheet.crop(box))
        # tight bbox on real alpha, then drop the sheet's leftover colour in fully transparent pixels
        part = part.crop(part.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
        clean = Image.new("RGBA", part.size, (255, 255, 255, 0))
        clean.paste(part, (0, 0), part.getchannel("A").point(lambda v: 255 if v > 0 else 0))
        w, h = clean.size
        canvas = Image.new("RGBA", (CANVAS, CANVAS), (255, 255, 255, 0))
        canvas.alpha_composite(clean, ((CANVAS - w) // 2, CANVAS - GROUND - h))
        canvas.save(OUT / f"{name}.webp", "WEBP", quality=90, method=6)
        print(f"wrote public/mascot/{name}.webp  ({w}×{h})")
    # Face crop for avatars (from idle): the head sits in the upper-middle of the canvas.
    idle = Image.open(OUT / "idle.webp")
    bb = idle.getchannel("A").getbbox()
    side = int((bb[2] - bb[0]) * 0.62)
    cx = (bb[0] + bb[2]) // 2
    top = bb[1] + 4
    idle.crop((cx - side // 2, top, cx + side // 2, top + side)).resize((256, 256), Image.LANCZOS).save(OUT / "avatar.webp", "WEBP", quality=90, method=6)
    print("wrote public/mascot/avatar.webp")


if __name__ == "__main__":
    main()
