#!/usr/bin/env python3
"""Build the app-screen "plates" used on the product pages.

The screenshots we have for each app are App Store marketing composites —
a headline over a device mockup, sometimes with decorative rails — not raw
screenshots. The site's design uses none of that: a plate is a flat
screenshot with a hairline rule and a mono caption, like a figure in a
manual. So this cuts the screen out of the mockup and throws the rest away.

Each app's marketing set uses a different template, so the screen rect is
found per image rather than hardcoded:

  1. The device's left and right rails are the columns holding the most
     "framelike" pixels — bright AND close to grey. Saturated colour is
     excluded, so a yellow headline never registers as frame.
  2. The vertical extent comes from the longest contiguous run in each rail
     column. Taking min/max instead would be thrown off by stray bright
     pixels elsewhere in the same column, which is what a light headline
     puts there.
  3. The iOS status bar and the home-indicator strip are trimmed
     proportionally. The fake clock differs between shots in the same set
     and is noise on a reference plate; the app's own tab bar is kept.
  4. The inset is swept until the crop's edge ring is free of frame. Too
     large an inset starts eating the app's own chrome and the edge goes
     bright again, so the sweep takes the first clean value.

Every crop is checked, and a crop that never comes clean raises rather than
writing a bad plate. Test for *framelike* rather than merely bright: CPAT's
timer screen ends in a full-width orange button that is bright but is not a
device frame, and rejecting that crop would be wrong.

Output is uniform 560x1010 WebP so the captions line up across the grid.

Usage:
    python tools/make_plates.py            # rebuild every plate
    python tools/make_plates.py cb-radio   # rebuild one app's plates
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Pillow is required:  pip install Pillow")

SITE = Path(__file__).resolve().parent.parent
PROJECTS = SITE.parent

TARGET_W = 560
PLATE_ASPECT = 1010 / 560
QUALITY = 82

# Bright enough and grey enough to be a metallic device frame.
FRAME_MIN_CHANNEL = 90

# Which shots become plates. Chosen to show what the page copy claims but
# cannot show in type — not simply the best-looking screens.
PLATE_SETS: dict[str, tuple[Path, list[tuple[str, str]]]] = {
    "hazmat-pro": (PROJECTS / "hazmat_pro", [
        ("phone1.jpg", "hazmat-pro-screen-placards.webp"),
        ("phone2.jpg", "hazmat-pro-screen-un-numbers.webp"),
        ("phone5.jpg", "hazmat-pro-screen-identify.webp"),
    ]),
    "cb-radio": (PROJECTS / "CB_Radio" / "iPhone_screenshots", [
        ("1.jpg", "cb-radio-screen-channels.webp"),
        ("4.jpg", "cb-radio-screen-10-codes.webp"),
        ("5.jpg", "cb-radio-screen-slang.webp"),
    ]),
    # 5.jpg is the running timer — striking, but over half the screen is
    # empty below the buttons, which reads as a broken image at plate size.
    # 6.jpg shows the same feature as a filled-in interval list. (7.jpg is
    # the post-session log, not timers.)
    "cpat-prep": (PROJECTS / "CPAT App", [
        ("2.jpg", "cpat-prep-screen-plan.webp"),
        ("6.jpg", "cpat-prep-screen-timers.webp"),
        ("8.jpg", "cpat-prep-screen-events.webp"),
    ]),
}


def framelike(p) -> bool:
    return min(p[0], p[1], p[2]) > FRAME_MIN_CHANNEL


def _frame_grid(img: Image.Image) -> list[list[bool]]:
    w, h = img.size
    px = img.load()
    return [[framelike(px[x, y]) for x in range(w)] for y in range(h)]


def find_frame(img: Image.Image) -> tuple[int, int, int, int]:
    """Bounding box of the device frame in a marketing composite."""
    w, h = img.size
    grid = _frame_grid(img)

    col = [sum(grid[y][x] for y in range(h)) for x in range(w)]
    half = w // 2
    left = max(range(half), key=lambda x: col[x])
    right = max(range(half, w), key=lambda x: col[x])
    if not col[left] or not col[right]:
        raise ValueError("no device rails found")

    def longest_run(x: int) -> tuple[int, int]:
        best_start = best_end = None
        best_len = cur_len = 0
        start = 0
        for y in range(h):
            if grid[y][x]:
                if not cur_len:
                    start = y
                cur_len += 1
                if cur_len > best_len:
                    best_len, best_start, best_end = cur_len, start, y
            else:
                cur_len = 0
        if best_start is None:
            raise ValueError(f"no rail run in column {x}")
        return best_start, best_end

    lt, lb = longest_run(left)
    rt, rb = longest_run(right)
    return left, min(lt, rt), right + 1, max(lb, rb) + 1


def edge_pct(img: Image.Image, rect, ring: int = 3) -> float:
    """Share of the crop's edge ring that looks like device frame."""
    x0, y0, x1, y1 = rect
    px = img.load()
    hits = tot = 0
    for i in range(ring):
        for x in range(x0, x1):
            for y in (y0 + i, y1 - 1 - i):
                tot += 1
                hits += framelike(px[x, y])
        for y in range(y0, y1):
            for x in (x0 + i, x1 - 1 - i):
                tot += 1
                hits += framelike(px[x, y])
    return 100 * hits / tot


def screen_rect(img: Image.Image, clean: float = 1.0, max_inset: int = 60):
    x0, y0, x1, y1 = find_frame(img)
    height = y1 - y0
    # The rail run already starts below the true screen top by roughly the
    # corner radius, so these are small: enough to clear the status bar's
    # clock and the home indicator, no more.
    y0 += round(height * 0.032)
    y1 -= round(height * 0.030)

    for inset in range(0, max_inset, 2):
        rect = (x0 + inset, y0 + inset, x1 - inset, y1 - inset)
        if rect[2] - rect[0] < 200:
            break
        pct = edge_pct(img, rect)
        if pct < clean:
            return rect, inset, pct
    raise ValueError("no frame-free crop found — check the source template")


def round_corners(img: Image.Image, radius: int = 8) -> Image.Image:
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, img.size[0] - 1, img.size[1] - 1), radius=radius, fill=255
    )
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def make_plate(src_path: Path, dest_path: Path) -> float:
    src = Image.open(src_path).convert("RGB")
    rect, inset, pct = screen_rect(src)

    # Trim the odd few pixels symmetrically rather than scaling to fit, so
    # nothing is stretched and both the header and the tab bar survive.
    x0, y0, x1, y1 = rect
    want_h = round((x1 - x0) * PLATE_ASPECT)
    delta = (y1 - y0) - want_h
    if delta > 0:
        y0 += delta // 2
        y1 -= delta - delta // 2
    elif delta < 0:
        room = min(-delta // 2, y0, src.size[1] - y1)
        y0 -= room
        y1 += -delta - room

    shot = src.crop((x0, y0, x1, y1))
    w, h = shot.size
    scaled = shot.resize((TARGET_W, round(h * TARGET_W / w)), Image.LANCZOS)
    scaled = round_corners(scaled)
    scaled.save(dest_path, "WEBP", quality=QUALITY, method=6)

    kb = dest_path.stat().st_size / 1024
    print(f"  {src_path.name:<10} -> {dest_path.name:<38} "
          f"inset {inset:2d}  edge {pct:4.2f}%  "
          f"{scaled.size[0]}x{scaled.size[1]}  {kb:.0f} KB")
    return kb


def main(argv: list[str]) -> int:
    wanted = argv or list(PLATE_SETS)
    unknown = [a for a in wanted if a not in PLATE_SETS]
    if unknown:
        print(f"unknown app(s): {', '.join(unknown)}")
        print(f"known: {', '.join(PLATE_SETS)}")
        return 2

    grand = 0.0
    for app in wanted:
        folder, plates = PLATE_SETS[app]
        print(f"\n{app}  ({folder})")
        if not folder.is_dir():
            print(f"  source folder missing — skipped")
            continue
        sizes, total = set(), 0.0
        for src_name, out_name in plates:
            total += make_plate(folder / src_name, SITE / out_name)
            sizes.add(Image.open(SITE / out_name).size)
        note = "uniform" if len(sizes) == 1 else f"MIXED ASPECTS {sorted(sizes)}"
        print(f"  {total:.0f} KB for {len(plates)} plates — {note}")
        grand += total

    print(f"\ntotal: {grand:.0f} KB")
    print("Remember: python indexnow.py --sitemap after deploying.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
