"""
Generates the illustrated placeholder images used by the seed articles.

The images are flat, layered "risograph" style scenes so the demo site looks
finished without depending on any external image host. Replace them with real
photography from the admin panel (Media library) whenever you like.

Usage:  python3 tools/generate-seed-images.py
Output: backend/uploads/seed/*.jpg
Requires: Pillow  (pip install pillow)
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1000
OUT = os.path.join(os.path.dirname(__file__), "..", "backend", "uploads", "seed")

PALETTES = {
    "indigo":   ["#E9EEF4", "#C9D6E6", "#8FA6C6", "#4A6390", "#1B2A4A", "#E2B44B"],
    "river":    ["#EAF2F1", "#BFDAD6", "#7DB3AE", "#2F7F7A", "#14403F", "#F0C35A"],
    "earth":    ["#F3EDE3", "#E5CFAE", "#C99B66", "#8C5A33", "#3E2A1D", "#2F6B4F"],
    "forest":   ["#EDF2EA", "#C9DCC0", "#8DB58A", "#3F7A4F", "#1D3B2A", "#E6A532"],
    "dusk":     ["#F6ECE8", "#EBC4BC", "#D0857B", "#9C3D3A", "#3B1E2A", "#F2C14E"],
    "slate":    ["#EEF0F3", "#CFD5DE", "#97A3B4", "#56647A", "#232B38", "#C8432F"],
}


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def grain(img, amount=10, seed=0):
    rnd = random.Random(seed)
    noise = Image.effect_noise((W, H), 40).convert("L")
    noise = noise.point(lambda v: 128 + (v - 128) * amount // 40)
    rgb = Image.merge("RGB", (noise, noise, noise))
    blended = Image.blend(img, rgb, 0.06 + rnd.random() * 0.02)
    return blended


def hills(d, pal, rnd):
    d.rectangle([0, 0, W, H], fill=hexrgb(pal[0]))
    sx, sy, r = rnd.randint(300, 1300), rnd.randint(180, 360), rnd.randint(90, 150)
    d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=hexrgb(pal[5]))
    for layer, color in enumerate(pal[1:5]):
        base = 420 + layer * 140
        amp = 90 - layer * 12
        freq = rnd.uniform(0.002, 0.005)
        phase = rnd.uniform(0, 6.28)
        pts = [(x, base + amp * math.sin(x * freq + phase) + 30 * math.sin(x * freq * 3.1 + phase)) for x in range(0, W + 20, 20)]
        d.polygon([(0, H)] + pts + [(W, H)], fill=hexrgb(color))


def water(d, pal, rnd):
    d.rectangle([0, 0, W, H], fill=hexrgb(pal[0]))
    sx, sy, r = rnd.randint(400, 1200), 300, rnd.randint(110, 170)
    d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=hexrgb(pal[5]))
    d.rectangle([0, 420, W, H], fill=hexrgb(pal[3]))
    for i in range(16):
        y = 440 + i * 36
        color = hexrgb(pal[1] if i % 3 == 0 else pal[2])
        pts = [(x, y + 8 * math.sin(x * 0.02 + i)) for x in range(0, W + 10, 10)]
        d.line(pts, fill=color, width=4 + i // 4)
    d.polygon([(0, 420), (420, 300), (720, 420)], fill=hexrgb(pal[4]))


def fields(d, pal, rnd):
    d.rectangle([0, 0, W, H], fill=hexrgb(pal[0]))
    hy = 360
    sx = rnd.randint(300, 1300)
    d.ellipse([sx - 80, 150, sx + 80, 310], fill=hexrgb(pal[5]))
    d.rectangle([0, hy, W, H], fill=hexrgb(pal[2]))
    vx = W // 2 + rnd.randint(-200, 200)
    for i in range(-14, 15):
        x = vx + i * 160
        color = hexrgb(pal[3] if i % 2 else pal[1])
        d.polygon([(vx + i * 6, hy), (vx + i * 6 + 5, hy), (x + 70, H), (x, H)], fill=color)
    for k in range(5):
        tx = rnd.randint(80, W - 80)
        d.rectangle([tx - 4, hy - 90, tx + 4, hy], fill=hexrgb(pal[4]))
        d.ellipse([tx - 45, hy - 160, tx + 45, hy - 70], fill=hexrgb(pal[4]))


def city(d, pal, rnd):
    d.rectangle([0, 0, W, H], fill=hexrgb(pal[1]))
    sx = rnd.randint(200, 1400)
    d.ellipse([sx - 120, 140, sx + 120, 380], fill=hexrgb(pal[5]))
    for row, color in enumerate([pal[2], pal[3], pal[4]]):
        x = -40
        while x < W:
            bw = rnd.randint(90, 200)
            bh = rnd.randint(220, 520) - row * 60
            top = H - bh - (2 - row) * 60
            d.rectangle([x, top, x + bw, H], fill=hexrgb(color))
            if row == 2:
                for wy in range(top + 30, H - 40, 46):
                    for wx in range(x + 18, x + bw - 18, 34):
                        if rnd.random() < 0.45:
                            d.rectangle([wx, wy, wx + 14, wy + 20], fill=hexrgb(pal[5]))
            x += bw + rnd.randint(0, 20)


def mountain(d, pal, rnd):
    d.rectangle([0, 0, W, H], fill=hexrgb(pal[0]))
    for i in range(4):
        px = rnd.randint(200, 1400)
        py = 200 + i * 110
        color = hexrgb(pal[1 + i])
        d.polygon([(px - 700, H), (px, py), (px + 700, H)], fill=color)
        d.polygon([(px - 80, py + 80), (px, py), (px + 80, py + 80), (px + 20, py + 60), (px - 30, py + 90)], fill=hexrgb(pal[0]))
    d.rectangle([0, H - 120, W, H], fill=hexrgb(pal[4]))


def weave(d, pal, rnd):
    d.rectangle([0, 0, W, H], fill=hexrgb(pal[0]))
    size = 100
    for gy in range(0, H, size):
        for gx in range(0, W, size):
            c = hexrgb(pal[rnd.choice([1, 2, 3, 4, 5])])
            shape = rnd.randint(0, 3)
            if shape == 0:
                d.rectangle([gx, gy, gx + size, gy + size], fill=c)
            elif shape == 1:
                d.ellipse([gx + 10, gy + 10, gx + size - 10, gy + size - 10], fill=c)
            elif shape == 2:
                d.polygon([(gx, gy + size), (gx + size // 2, gy), (gx + size, gy + size)], fill=c)
            else:
                d.pieslice([gx - size, gy, gx + size, gy + size * 2], 270, 360, fill=c)


SCENES = {"hills": hills, "water": water, "fields": fields, "city": city, "mountain": mountain, "weave": weave}

# filename, scene, palette
IMAGES = [
    ("postman-library", "hills", "indigo"),
    ("kutch-lake", "water", "earth"),
    ("soil-sensor", "fields", "forest"),
    ("bell-metal", "weave", "earth"),
    ("night-school", "city", "slate"),
    ("mizoram-homestay", "mountain", "forest"),
    ("eye-camp", "hills", "dusk"),
    ("seed-library", "fields", "earth"),
    ("plastic-shelter", "city", "river"),
    ("railway-app", "city", "indigo"),
    ("solar-cooperative", "fields", "dusk"),
    ("kerala-beach", "water", "river"),
    ("stepwell", "weave", "dusk"),
    ("pickle-enterprise", "hills", "forest"),
    ("mangrove", "water", "forest"),
    ("ladakh-greenhouse", "mountain", "indigo"),
    ("gallery-1", "weave", "indigo"),
    ("gallery-2", "weave", "river"),
    ("gallery-3", "mountain", "slate"),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    for i, (name, scene, pal) in enumerate(IMAGES):
        rnd = random.Random(1000 + i)
        img = Image.new("RGB", (W, H))
        d = ImageDraw.Draw(img)
        SCENES[scene](d, PALETTES[pal], rnd)
        img = img.filter(ImageFilter.GaussianBlur(0.6))
        img = grain(img, seed=i)
        path = os.path.join(OUT, f"{name}.jpg")
        img.save(path, "JPEG", quality=84, optimize=True, progressive=True)
        print("wrote", path)


if __name__ == "__main__":
    main()
