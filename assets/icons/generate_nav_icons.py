"""
Warm Craft -- Elev v3 Dashboard Mockup Navigation Icons
Generates 7 PNG icons at 512x512 (outline style, warm brown stroke)
Rendered at 2x (1024) then downscaled with LANCZOS for clean anti-aliasing.
"""

from PIL import Image, ImageDraw
import math
import os

SIZE = 512
RENDER = SIZE * 2
RC = RENDER // 2  # render center

# Colors
BROWN = (74, 55, 40, 255)       # #4A3728 - primary stroke
ACCENT = (160, 120, 92, 255)    # #a0785c - active/accent
TRANSPARENT = (0, 0, 0, 0)

# Stroke weight at render scale (will be halved after downscale)
SW = 52  # main stroke width
SW_THIN = 36  # thinner details

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def new_canvas():
    return Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)


def finalize(img, name):
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(OUTPUT_DIR, f"nav-{name}.png")
    img.save(path, "PNG")
    print(f"  OK nav-{name}.png")
    return path


def draw_rounded_line(draw, x1, y1, x2, y2, width, fill):
    """Draw a line with round caps."""
    draw.line([(x1, y1), (x2, y2)], fill=fill, width=width)
    r = width // 2
    draw.ellipse([x1 - r, y1 - r, x1 + r, y1 + r], fill=fill)
    draw.ellipse([x2 - r, y2 - r, x2 + r, y2 + r], fill=fill)


# ============================================================
# 1. SEANCES -- Dumbbell (outline style)
# ============================================================
def icon_seances():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    cx, cy = RC, RC

    # Central bar
    bar_half = 140
    draw_rounded_line(draw, cx - bar_half, cy, cx + bar_half, cy, SW_THIN, BROWN)

    # Weight plates (rounded rectangles, outline only)
    plate_w = 80
    plate_h = 300
    plate_r = 24
    for sign in [-1, 1]:
        px = cx + sign * 200
        draw.rounded_rectangle(
            [px - plate_w // 2, cy - plate_h // 2, px + plate_w // 2, cy + plate_h // 2],
            radius=plate_r, outline=BROWN, width=SW
        )

    # End caps (smaller rounded rects)
    cap_w = 50
    cap_h = 140
    for sign in [-1, 1]:
        px = cx + sign * 320
        draw.rounded_rectangle(
            [px - cap_w // 2, cy - cap_h // 2, px + cap_w // 2, cy + cap_h // 2],
            radius=18, outline=BROWN, width=SW
        )

    # Connecting bar to end caps
    for sign in [-1, 1]:
        x1 = cx + sign * (200 + plate_w // 2)
        x2 = cx + sign * (320 - cap_w // 2)
        draw_rounded_line(draw, x1, cy, x2, cy, SW_THIN, BROWN)

    finalize(img, "seances")


# ============================================================
# 2. POIDS -- Body scale (outline)
# ============================================================
def icon_poids():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    cx, cy = RC, RC

    # Scale body - rounded square
    body = 320
    top_offset = 40
    draw.rounded_rectangle(
        [cx - body, cy - body + top_offset, cx + body, cy + body + top_offset],
        radius=90, outline=BROWN, width=SW
    )

    # Circular dial
    dial_r = 150
    dial_cy = cy - 40
    draw.ellipse(
        [cx - dial_r, dial_cy - dial_r, cx + dial_r, dial_cy + dial_r],
        outline=BROWN, width=SW
    )

    # Needle pointing to ~2 o'clock
    angle = -50
    rad = math.radians(angle)
    needle_len = 95
    nx = cx + int(needle_len * math.cos(rad))
    ny = dial_cy + int(needle_len * math.sin(rad))
    draw_rounded_line(draw, cx, dial_cy, nx, ny, SW_THIN, BROWN)

    # Tick marks on dial
    for a in range(-160, -20, 35):
        rad = math.radians(a)
        x1 = cx + int((dial_r - 15) * math.cos(rad))
        y1 = dial_cy + int((dial_r - 15) * math.sin(rad))
        x2 = cx + int((dial_r - 45) * math.cos(rad))
        y2 = dial_cy + int((dial_r - 45) * math.sin(rad))
        draw_rounded_line(draw, x1, y1, x2, y2, 14, BROWN)

    finalize(img, "poids")


# ============================================================
# 3. ACCUEIL -- House (outline)
# ============================================================
def icon_accueil():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    cx, cy = RC, RC

    # House body
    body_w = 280
    body_top = cy + 10
    body_bottom = cy + 320
    draw.rounded_rectangle(
        [cx - body_w, body_top, cx + body_w, body_bottom],
        radius=36, outline=BROWN, width=SW
    )

    # Roof
    roof_peak_y = cy - 300
    roof_base_y = body_top + 30
    roof_spread = body_w + 90

    draw_rounded_line(draw, cx, roof_peak_y, cx - roof_spread, roof_base_y, SW, BROWN)
    draw_rounded_line(draw, cx, roof_peak_y, cx + roof_spread, roof_base_y, SW, BROWN)

    # Door (rounded rect outline)
    door_w = 90
    door_h = 160
    door_top = body_bottom - door_h
    draw.rounded_rectangle(
        [cx - door_w, door_top, cx + door_w, body_bottom],
        radius=32, outline=BROWN, width=SW
    )

    finalize(img, "accueil")


# ============================================================
# 3b. ACCUEIL ACTIVE -- House (filled)
# ============================================================
def icon_accueil_active():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    cx, cy = RC, RC

    # House body - filled
    body_w = 280
    body_top = cy + 10
    body_bottom = cy + 320
    draw.rounded_rectangle(
        [cx - body_w, body_top, cx + body_w, body_bottom],
        radius=36, fill=BROWN
    )

    # Roof - filled triangle
    roof_peak_y = cy - 300
    roof_base_y = body_top + 10
    roof_spread = body_w + 90
    draw.polygon(
        [(cx, roof_peak_y - 10),
         (cx - roof_spread - 20, roof_base_y + 20),
         (cx + roof_spread + 20, roof_base_y + 20)],
        fill=BROWN
    )

    # Door cutout (cream-ish or just lighter — use transparent to punch through)
    door_w = 90
    door_h = 160
    door_top = body_bottom - door_h
    # We draw the door in a lighter shade to create contrast
    draw.rounded_rectangle(
        [cx - door_w, door_top, cx + door_w, body_bottom + 5],
        radius=32, fill=(242, 232, 213, 255)  # cream
    )

    finalize(img, "accueil-active")


# ============================================================
# 4. NUTRITION -- Fork & Knife (outline)
# ============================================================
def icon_nutrition():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    cx, cy = RC, RC

    # Fork (left side)
    fork_x = cx - 120
    fork_top = cy - 340
    fork_bottom = cy + 340

    # Fork handle
    draw_rounded_line(draw, fork_x, cy - 40, fork_x, fork_bottom, SW, BROWN)

    # Fork tines (3 prongs)
    tine_h = 200
    tine_spread = 80
    for offset in [-tine_spread, 0, tine_spread]:
        tx = fork_x + offset
        draw_rounded_line(draw, tx, fork_top, tx, fork_top + tine_h, SW_THIN, BROWN)

    # Fork cross bar connecting tines
    draw_rounded_line(
        draw,
        fork_x - tine_spread, fork_top + tine_h,
        fork_x + tine_spread, fork_top + tine_h,
        SW_THIN, BROWN
    )

    # Connect crossbar to handle via curved section
    draw_rounded_line(draw, fork_x, fork_top + tine_h, fork_x, cy - 40, SW, BROWN)

    # Knife (right side)
    knife_x = cx + 120
    knife_top = cy - 340
    knife_bottom = cy + 340

    # Knife blade (slightly wider at top, tapers) - use rounded rect
    blade_w = 50
    blade_h = 280
    draw.rounded_rectangle(
        [knife_x - blade_w, knife_top, knife_x + 15, knife_top + blade_h],
        radius=30, outline=BROWN, width=SW
    )

    # Knife handle
    draw_rounded_line(draw, knife_x - 17, knife_top + blade_h - 20, knife_x - 17, knife_bottom, SW, BROWN)

    finalize(img, "nutrition")


# ============================================================
# 5. HISTORIQUE -- Bar chart (outline)
# ============================================================
def icon_historique():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    cx, cy = RC, RC

    left = cx - 330
    bottom = cy + 330
    right = cx + 330
    top = cy - 330

    # Axes
    draw_rounded_line(draw, left, top + 60, left, bottom, SW, BROWN)
    draw_rounded_line(draw, left, bottom, right, bottom, SW, BROWN)

    # 3 bars (outline rounded rects)
    bar_w = 120
    gap = 60
    total = 3 * bar_w + 2 * gap
    start_x = left + 100

    heights = [0.40, 0.70, 0.55]
    max_h = bottom - top - 140

    for i, h_pct in enumerate(heights):
        bx = start_x + i * (bar_w + gap)
        bar_h = int(max_h * h_pct)
        bar_top = bottom - bar_h - SW // 2
        draw.rounded_rectangle(
            [bx, bar_top, bx + bar_w, bottom - SW // 2],
            radius=22, outline=BROWN, width=SW
        )

    finalize(img, "historique")


# ============================================================
# 6. SOMMEIL -- Crescent moon (outline)
# ============================================================
def icon_sommeil():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    cx, cy = RC, RC

    # Crescent moon via two overlapping circles
    # Draw outer filled circle, then erase with offset inner circle
    outer_r = 280
    inner_r = 230
    offset_x = 160
    offset_y = -80

    # Step 1: filled outer circle in BROWN
    filled = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    fd = ImageDraw.Draw(filled)
    fd.ellipse(
        [cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r],
        fill=BROWN
    )

    # Step 2: cut out inner circle (shifted upper-right)
    cut_cx = cx + offset_x
    cut_cy = cy + offset_y
    # Erase by drawing transparent — use alpha composite trick
    eraser = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    ed = ImageDraw.Draw(eraser)
    ed.ellipse(
        [cut_cx - inner_r, cut_cy - inner_r, cut_cx + inner_r, cut_cy + inner_r],
        fill=(255, 255, 255, 255)
    )

    # Use eraser as mask to clear pixels from filled
    import numpy as np
    f_arr = np.array(filled)
    e_arr = np.array(eraser)
    # Where eraser is white, set filled alpha to 0
    f_arr[:, :, 3] = np.where(e_arr[:, :, 3] > 0, 0, f_arr[:, :, 3])
    img = Image.fromarray(f_arr)

    finalize(img, "sommeil")


# ============================================================
# Generate all
# ============================================================
if __name__ == "__main__":
    print("Generating Elev v3 nav icons (Warm Craft)...")
    print(f"Output: {OUTPUT_DIR}\n")
    icon_seances()
    icon_poids()
    icon_accueil()
    icon_accueil_active()
    icon_nutrition()
    icon_historique()
    icon_sommeil()
    print("\nAll 7 icons generated successfully")
