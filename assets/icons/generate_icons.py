"""
Botanical Precision — Élev v3 Navigation Icons
Generates 5 high-quality PNG icons at 512x512 (scalable down to 24px)
Palette: cream #f2e8d5, dark green #1b2e1d, accent green #74bf7a, brown #4a3728
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

SIZE = 512
PAD = 80  # generous padding for breathing room
CENTER = SIZE // 2
# We render at 2x then downscale for anti-aliasing
RENDER = SIZE * 2
R_CENTER = RENDER // 2
R_PAD = PAD * 2

# Colors
CREAM = (242, 232, 213, 255)
DARK_GREEN = (27, 46, 29, 255)
ACCENT_GREEN = (116, 191, 122, 255)
BROWN = (74, 55, 40, 255)
TRANSPARENT = (0, 0, 0, 0)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def new_canvas():
    return Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)


def finalize(img, name):
    # Downscale with high-quality resampling
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(OUTPUT_DIR, f"{name}.png")
    img.save(path, "PNG")
    print(f"  OK {name}.png ({SIZE}x{SIZE})")
    return path


def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)


# ============================================================
# 1. SÉANCES — Dumbbell icon (movement, strength, repetition)
# ============================================================
def icon_seances():
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    cx, cy = R_CENTER, R_CENTER
    stroke = 48

    # Central bar
    bar_half = 180
    draw.rounded_rectangle(
        [cx - bar_half, cy - stroke//3, cx + bar_half, cy + stroke//3],
        radius=stroke//3, fill=DARK_GREEN
    )

    # Weight plates (outer)
    plate_w = 70
    plate_h = 320
    for sign in [-1, 1]:
        px = cx + sign * (bar_half - 10)
        draw.rounded_rectangle(
            [px - plate_w//2, cy - plate_h//2, px + plate_w//2, cy + plate_h//2],
            radius=28, fill=DARK_GREEN
        )

    # Weight plates (inner, accent)
    inner_plate_w = 56
    inner_plate_h = 220
    for sign in [-1, 1]:
        px = cx + sign * (bar_half - 70)
        draw.rounded_rectangle(
            [px - inner_plate_w//2, cy - inner_plate_h//2, px + inner_plate_w//2, cy + inner_plate_h//2],
            radius=22, fill=DARK_GREEN
        )

    # End caps
    cap_w = 40
    cap_h = 100
    for sign in [-1, 1]:
        px = cx + sign * (bar_half + 50)
        draw.rounded_rectangle(
            [px - cap_w//2, cy - cap_h//2, px + cap_w//2, cy + cap_h//2],
            radius=16, fill=DARK_GREEN
        )

    finalize(img, "seances")


# ============================================================
# 2. POIDS — Scale/weight icon (gravity, balance, measurement)
# ============================================================
def icon_poids():
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    cx, cy = R_CENTER, R_CENTER
    stroke = 40

    # Body outline - rounded square scale
    body_size = 340
    draw.rounded_rectangle(
        [cx - body_size, cy - body_size + 60, cx + body_size, cy + body_size + 60],
        radius=80, fill=None, outline=DARK_GREEN, width=stroke
    )

    # Circular dial at top
    dial_r = 160
    dial_cy = cy - 60
    draw.ellipse(
        [cx - dial_r, dial_cy - dial_r, cx + dial_r, dial_cy + dial_r],
        fill=None, outline=DARK_GREEN, width=stroke
    )

    # Dial needle pointing up-right (like a scale reading)
    needle_len = 110
    angle = -45  # degrees from horizontal
    rad = math.radians(angle)
    nx = cx + int(needle_len * math.cos(rad))
    ny = dial_cy + int(needle_len * math.sin(rad))
    draw.line([cx, dial_cy, nx, ny], fill=DARK_GREEN, width=28)

    # Center dot
    dot_r = 20
    draw.ellipse(
        [cx - dot_r, dial_cy - dot_r, cx + dot_r, dial_cy + dot_r],
        fill=DARK_GREEN
    )

    # Small tick marks on dial
    for a in range(-150, -30, 30):
        rad = math.radians(a)
        x1 = cx + int((dial_r - 20) * math.cos(rad))
        y1 = dial_cy + int((dial_r - 20) * math.sin(rad))
        x2 = cx + int((dial_r - 55) * math.cos(rad))
        y2 = dial_cy + int((dial_r - 55) * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=DARK_GREEN, width=16)

    finalize(img, "poids")


# ============================================================
# 3. ACCUEIL — Home icon (shelter, center, origin)
# ============================================================
def icon_accueil():
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    cx, cy = R_CENTER, R_CENTER
    stroke = 44

    # House body
    body_w = 300
    body_h = 260
    body_top = cy + 20
    draw.rounded_rectangle(
        [cx - body_w, body_top, cx + body_w, body_top + body_h + 80],
        radius=40, fill=None, outline=DARK_GREEN, width=stroke
    )

    # Roof - triangle/chevron
    roof_peak_y = cy - 280
    roof_base_y = body_top + 40
    roof_spread = body_w + 100

    # Draw thick roof lines
    points_left = [cx, roof_peak_y, cx - roof_spread, roof_base_y]
    points_right = [cx, roof_peak_y, cx + roof_spread, roof_base_y]
    draw.line(points_left, fill=DARK_GREEN, width=stroke)
    draw.line(points_right, fill=DARK_GREEN, width=stroke)

    # Roof peak cap (round joint)
    draw.ellipse(
        [cx - stroke//2, roof_peak_y - stroke//2, cx + stroke//2, roof_peak_y + stroke//2],
        fill=DARK_GREEN
    )

    # Door
    door_w = 100
    door_h = 180
    door_top = body_top + body_h + 80 - door_h
    draw.rounded_rectangle(
        [cx - door_w, door_top, cx + door_w, body_top + body_h + 80 + stroke//2],
        radius=36, fill=None, outline=DARK_GREEN, width=stroke
    )

    finalize(img, "accueil")


# ============================================================
# 4. NUTRITION — Fork & leaf icon (nourishment, natural food)
# ============================================================
def icon_nutrition():
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    cx, cy = R_CENTER, R_CENTER
    stroke = 40

    # Apple shape - two arcs forming apple body
    apple_cx = cx
    apple_cy = cy + 40
    apple_rx = 260
    apple_ry = 300

    # Draw apple body as ellipse
    draw.ellipse(
        [apple_cx - apple_rx, apple_cy - apple_ry + 40,
         apple_cx + apple_rx, apple_cy + apple_ry],
        fill=None, outline=DARK_GREEN, width=stroke
    )

    # Indent at top (small ellipse in background color to "cut" the top)
    indent_w = 80
    indent_h = 60
    # We'll draw a small arc

    # Stem
    stem_top = apple_cy - apple_ry - 20
    draw.line(
        [cx + 20, apple_cy - apple_ry + 80, cx + 20, stem_top],
        fill=DARK_GREEN, width=28
    )

    # Leaf
    leaf_points = [
        (cx + 20, stem_top + 30),
        (cx + 120, stem_top - 60),
        (cx + 200, stem_top - 50),
        (cx + 160, stem_top + 10),
        (cx + 20, stem_top + 30),
    ]
    draw.polygon(leaf_points, fill=DARK_GREEN)

    # Leaf vein
    draw.line(
        [cx + 30, stem_top + 20, cx + 150, stem_top - 35],
        fill=TRANSPARENT, width=12
    )

    finalize(img, "nutrition")


# ============================================================
# 5. HISTORIQUE — Chart/graph icon (time, accumulation, pattern)
# ============================================================
def icon_historique():
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    cx, cy = R_CENTER, R_CENTER
    stroke = 40

    # Base area
    left = cx - 320
    right = cx + 320
    top = cy - 300
    bottom = cy + 300

    # Y-axis
    draw.line([left, top, left, bottom], fill=DARK_GREEN, width=stroke)
    # X-axis
    draw.line([left, bottom, right, bottom], fill=DARK_GREEN, width=stroke)

    # Round corner at origin
    draw.ellipse(
        [left - stroke//2, bottom - stroke//2, left + stroke//2, bottom + stroke//2],
        fill=DARK_GREEN
    )

    # Bar chart - 4 bars with varying heights
    bar_w = 90
    gap = 40
    total_bars_w = 4 * bar_w + 3 * gap
    start_x = left + 80

    heights = [0.35, 0.55, 0.45, 0.8]  # proportions
    max_h = bottom - top - 80

    for i, h_pct in enumerate(heights):
        bx = start_x + i * (bar_w + gap)
        bar_h = int(max_h * h_pct)
        bar_top = bottom - bar_h
        draw.rounded_rectangle(
            [bx, bar_top, bx + bar_w, bottom - stroke//2],
            radius=20, fill=DARK_GREEN
        )

    # Trend line overlay (subtle accent)
    trend_points = []
    for i, h_pct in enumerate(heights):
        bx = start_x + i * (bar_w + gap) + bar_w // 2
        bar_h = int(max_h * h_pct)
        bar_top = bottom - bar_h
        trend_points.append((bx, bar_top - 30))

    # Draw trend line segments
    for i in range(len(trend_points) - 1):
        draw.line(
            [trend_points[i], trend_points[i + 1]],
            fill=ACCENT_GREEN, width=24
        )

    # Dots on trend line
    for px, py in trend_points:
        draw.ellipse(
            [px - 20, py - 20, px + 20, py + 20],
            fill=ACCENT_GREEN
        )

    finalize(img, "historique")


# ============================================================
# Generate all
# ============================================================
if __name__ == "__main__":
    print("Generating Elev v3 navigation icons...")
    print(f"Output: {OUTPUT_DIR}\n")
    icon_seances()
    icon_poids()
    icon_accueil()
    icon_nutrition()
    icon_historique()
    print("\nAll 5 icons generated successfully")
