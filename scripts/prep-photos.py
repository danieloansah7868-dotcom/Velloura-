#!/usr/bin/env python3
"""Prepare raw phone/market photos into VELLOURA listing photos.

Usage:
    python3 scripts/prep-photos.py photo1.jpeg photo2.jpeg --stem fashion-olive-dotted-set
    python3 scripts/prep-photos.py dump/ --stem fashion-new-arrivals

What it does per photo:
  * centre-crops to the listing aspect (3:4 by default, --bias shifts the
    crop window up/down for mannequin shots),
  * never upscales — caps the long edge at --max-dim (default 1400),
  * saves progressive JPEG at --quality (default 82) into --out
    (default assets/products) as <stem>.jpg, <stem>-2.jpg, <stem>-3.jpg ...

The first file listed becomes the cover photo (no suffix).
"""

import argparse
import os
import sys

from PIL import Image

Image.MAX_IMAGE_PIXELS = None


def crop_to_aspect(im, aspect, bias):
    """Crop to width/height == aspect. bias 0.5 = centred, <0.5 keeps more top."""
    w, h = im.size
    target_w, target_h = aspect
    current = w / h
    if abs(current - target_w / target_h) < 0.001:
        return im
    if current > target_w / target_h:
        # too wide -> crop sides (centred)
        new_w = int(round(h * target_w / target_h))
        left = (w - new_w) // 2
        return im.crop((left, 0, left + new_w, h))
    # too tall -> crop top/bottom with bias
    new_h = int(round(w * target_h / target_w))
    extra = h - new_h
    top = int(round(extra * bias))
    return im.crop((0, top, w, top + new_h))


def prep(path, out_path, aspect, bias, max_dim, quality):
    with Image.open(path) as im:
        im = im.convert("RGB")
        im = crop_to_aspect(im, aspect, bias)
        w, h = im.size
        long_edge = max(w, h)
        if long_edge > max_dim:
            scale = max_dim / long_edge
            im = im.resize((int(round(w * scale)), int(round(h * scale))), Image.LANCZOS)
        im.save(out_path, "JPEG", quality=quality, optimize=True, progressive=True)
        return im.size


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("inputs", nargs="+", help="photo files, or one directory of photos")
    ap.add_argument("--stem", required=True, help="output name stem, e.g. fashion-olive-dotted-set")
    ap.add_argument("--out", default="assets/products")
    ap.add_argument("--aspect", default="3:4", help="width:height, default 3:4")
    ap.add_argument("--bias", type=float, default=0.5, help="vertical crop bias, 0=top 1=bottom")
    ap.add_argument("--max-dim", type=int, default=1400)
    ap.add_argument("--quality", type=int, default=82)
    args = ap.parse_args()

    paths = []
    for item in args.inputs:
        if os.path.isdir(item):
            paths.extend(sorted(
                os.path.join(item, f) for f in os.listdir(item)
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
            ))
        else:
            paths.append(item)
    if not paths:
        sys.exit("No photos found.")

    tw, th = (float(x) for x in args.aspect.split(":"))
    os.makedirs(args.out, exist_ok=True)

    print(f"{'output':<44} {'px':<12} {'KB':>6}")
    for i, path in enumerate(paths):
        suffix = "" if i == 0 else f"-{i + 1}"
        out_path = os.path.join(args.out, f"{args.stem}{suffix}.jpg")
        size = prep(path, out_path, (tw, th), args.bias, args.max_dim, args.quality)
        print(f"{os.path.basename(out_path):<44} {size[0]}x{size[1]:<7} {os.path.getsize(out_path) // 1024:>6}")


if __name__ == "__main__":
    main()
