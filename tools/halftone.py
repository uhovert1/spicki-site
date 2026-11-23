#!/usr/bin/env python3
"""Печатный «комиксный» растр для анимации галереи new.spickibg.com:
бумага + красные точки (45°) + чёрные точки в тенях (15°).  python3 tools/halftone.py in.webp out.webp"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

PAPER = np.array([244, 238, 227], float); RED = np.array([212, 17, 31], float); INK = np.array([20, 13, 14], float)


def screen(L, cell, ang, gain, bias):
    h, w = L.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    a = np.deg2rad(ang); u = xx * np.cos(a) + yy * np.sin(a); v = -xx * np.sin(a) + yy * np.cos(a)
    cu = (np.floor(u / cell) + .5) * cell; cv = (np.floor(v / cell) + .5) * cell
    d = np.hypot(u - cu, v - cv)
    # тон берём в центре ячейки
    cx = np.clip((cu * np.cos(a) - cv * np.sin(a)).round().astype(int), 0, w - 1)
    cy = np.clip((cu * np.sin(a) + cv * np.cos(a)).round().astype(int), 0, h - 1)
    dark = np.clip((1 - L[cy, cx]) * gain - bias, 0, 1)
    r = cell * 0.72 * np.sqrt(dark)
    return np.clip(r - d + .5, 0, 1)  # мягкий край точки


def main(src, dst, width=440):
    im = Image.open(src).convert("RGB")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    g0 = im.convert("L")
    # фото ночные и тёмные: выравниваем гистограмму и поднимаем тени, иначе растр получается почти чёрным
    g = Image.blend(ImageOps.autocontrast(g0, cutoff=1), ImageOps.equalize(g0), .6).filter(ImageFilter.GaussianBlur(.8))
    L = (np.asarray(g, float) / 255) ** .75
    red = screen(L, 5.2, 45, 1.25, .05)
    ink = screen(L, 5.2, 15, 1.7, .78)
    out = PAPER * (1 - red[..., None]) + RED * red[..., None]
    out = out * (1 - ink[..., None]) + INK * ink[..., None]
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst, "WEBP", quality=62, method=6)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
