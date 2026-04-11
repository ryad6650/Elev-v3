"""
Warm Craft v2 -- Elev v3 Dashboard Mockup Navigation Icons
Colorful, gradient-filled, premium feel matching the mockup's warm palette.
Rendered at 2x then downscaled with LANCZOS.
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os

SIZE = 512
RENDER = SIZE * 2
RC = RENDER // 2

# Warm palette from the mockup
BROWN_DARK = (74, 55, 40)        # #4A3728
BROWN_WARM = (160, 120, 92)      # #a0785c
GOLD = (196, 168, 130)           # #c4a882
CREAM = (242, 232, 213)          # #F2E8D5
GREEN_DARK = (27, 46, 29)        # #1B2E1D
GREEN_ACCENT = (116, 191, 122)   # #74bf7a
TRANSPARENT = (0, 0, 0, 0)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def new_canvas():
    return Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)


def finalize(img, name):
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(OUTPUT_DIR, f"nav-{name}.png")
    img.save(path, "PNG")
    print(f"  OK nav-{name}.png")
    return path


def make_gradient_circle(size, color_top, color_bottom):
    """Create a circular gradient from top to bottom."""
    img = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    # Apply circular mask
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size, size], fill=255)
    img.putalpha(mask)
    return img


def make_vertical_gradient(width, height, color_top, color_bottom):
    """Create a rectangular vertical gradient."""
    img = Image.new("RGBA", (width, height), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return img


def apply_shape_mask(gradient_img, mask_img):
    """Apply a shape mask to a gradient image."""
    result = gradient_img.copy()
    result.putalpha(mask_img.split()[0] if mask_img.mode == 'L' else mask_img.getchannel('A'))
    return result


def draw_rounded_line(draw, x1, y1, x2, y2, width, fill):
    draw.line([(x1, y1), (x2, y2)], fill=fill, width=width)
    r = width // 2
    draw.ellipse([x1 - r, y1 - r, x1 + r, y1 + r], fill=fill)
    draw.ellipse([x2 - r, y2 - r, x2 + r, y2 + r], fill=fill)


# ============================================================
# 1. SEANCES -- Dumbbell with warm gradient fill
# ============================================================
def icon_seances():
    # Create shape mask
    mask = Image.new("L", (RENDER, RENDER), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = RC, RC
    SW = 48

    # Central bar
    bar_half = 150
    draw.rounded_rectangle(
        [cx - bar_half, cy - SW // 3, cx + bar_half, cy + SW // 3],
        radius=SW // 3, fill=255
    )

    # Weight plates
    plate_w, plate_h = 85, 320
    for sign in [-1, 1]:
        px = cx + sign * 200
        draw.rounded_rectangle(
            [px - plate_w // 2, cy - plate_h // 2, px + plate_w // 2, cy + plate_h // 2],
            radius=26, fill=255
        )

    # End caps
    cap_w, cap_h = 52, 150
    for sign in [-1, 1]:
        px = cx + sign * 320
        draw.rounded_rectangle(
            [px - cap_w // 2, cy - cap_h // 2, px + cap_w // 2, cy + cap_h // 2],
            radius=18, fill=255
        )

    # Create gradient
    gradient = make_vertical_gradient(RENDER, RENDER, BROWN_WARM, BROWN_DARK)
    result = new_canvas()
    result.paste(gradient, mask=mask)

    # Add subtle highlight on top plates
    highlight = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    hd = ImageDraw.Draw(highlight)
    for sign in [-1, 1]:
        px = cx + sign * 200
        hd.rounded_rectangle(
            [px - plate_w // 2 + 8, cy - plate_h // 2 + 8,
             px - plate_w // 2 + 30, cy - plate_h // 2 + plate_h // 3],
            radius=12, fill=(255, 255, 255, 35)
        )
    result = Image.alpha_composite(result, highlight)

    finalize(result, "seances")


# ============================================================
# 2. POIDS -- Scale with gradient and dial detail
# ============================================================
def icon_poids():
    mask = Image.new("L", (RENDER, RENDER), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = RC, RC
    SW = 46

    # Scale body
    body = 330
    top_off = 40
    draw.rounded_rectangle(
        [cx - body, cy - body + top_off, cx + body, cy + body + top_off],
        radius=85, fill=255
    )

    # Cut out interior (to make it outline-ish but thick)
    inner = body - SW
    draw.rounded_rectangle(
        [cx - inner, cy - inner + top_off, cx + inner, cy + inner + top_off],
        radius=60, fill=0
    )

    # Dial circle (filled)
    dial_r = 145
    dial_cy = cy - 30
    draw.ellipse(
        [cx - dial_r, dial_cy - dial_r, cx + dial_r, dial_cy + dial_r],
        fill=255
    )

    # Cut out dial interior
    dial_inner = dial_r - SW + 6
    draw.ellipse(
        [cx - dial_inner, dial_cy - dial_inner, cx + dial_inner, dial_cy + dial_inner],
        fill=0
    )

    # Needle
    angle = -50
    rad = math.radians(angle)
    needle_len = 85
    nx = cx + int(needle_len * math.cos(rad))
    ny = dial_cy + int(needle_len * math.sin(rad))
    draw.line([(cx, dial_cy), (nx, ny)], fill=255, width=28)
    draw.ellipse([cx - 16, dial_cy - 16, cx + 16, dial_cy + 16], fill=255)
    draw.ellipse([nx - 10, ny - 10, nx + 10, ny + 10], fill=255)

    # Tick marks
    for a in range(-160, -20, 35):
        rad_a = math.radians(a)
        x1 = cx + int((dial_r - 12) * math.cos(rad_a))
        y1 = dial_cy + int((dial_r - 12) * math.sin(rad_a))
        x2 = cx + int((dial_r - 38) * math.cos(rad_a))
        y2 = dial_cy + int((dial_r - 38) * math.sin(rad_a))
        draw.line([(x1, y1), (x2, y2)], fill=255, width=12)

    # Gradient: gold top to brown bottom
    gradient = make_vertical_gradient(RENDER, RENDER, GOLD, BROWN_WARM)
    result = new_canvas()
    result.paste(gradient, mask=mask)

    finalize(result, "poids")


# ============================================================
# 3. ACCUEIL -- House with warm gradient
# ============================================================
def icon_accueil():
    mask = Image.new("L", (RENDER, RENDER), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = RC, RC
    SW = 46

    # House body (outline)
    body_w = 290
    body_top = cy + 20
    body_bottom = cy + 330
    draw.rounded_rectangle(
        [cx - body_w, body_top, cx + body_w, body_bottom],
        radius=36, fill=255
    )
    draw.rounded_rectangle(
        [cx - body_w + SW, body_top + SW, cx + body_w - SW, body_bottom - SW],
        radius=16, fill=0
    )

    # Roof (thick chevron)
    roof_peak = cy - 300
    roof_base = body_top + 40
    roof_spread = body_w + 95

    # Draw roof as thick polygon
    half_sw = SW // 2 + 4
    # Outer roof
    draw.polygon([
        (cx, roof_peak - half_sw),
        (cx - roof_spread - half_sw, roof_base + half_sw),
        (cx - roof_spread + half_sw, roof_base + half_sw + SW),
        (cx, roof_peak + half_sw + SW - 10),
        (cx + roof_spread - half_sw, roof_base + half_sw + SW),
        (cx + roof_spread + half_sw, roof_base + half_sw),
    ], fill=255)

    # Door
    door_w = 85
    door_h = 155
    door_top = body_bottom - door_h
    draw.rounded_rectangle(
        [cx - door_w, door_top, cx + door_w, body_bottom + 5],
        radius=30, fill=255
    )
    draw.rounded_rectangle(
        [cx - door_w + SW, door_top + SW, cx + door_w - SW, body_bottom + 5],
        radius=14, fill=0
    )

    # Gradient
    gradient = make_vertical_gradient(RENDER, RENDER, GOLD, BROWN_DARK)
    result = new_canvas()
    result.paste(gradient, mask=mask)

    finalize(result, "accueil")


# ============================================================
# 3b. ACCUEIL ACTIVE -- House filled with rich gradient
# ============================================================
def icon_accueil_active():
    mask = Image.new("L", (RENDER, RENDER), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = RC, RC

    # House body filled
    body_w = 290
    body_top = cy + 20
    body_bottom = cy + 330
    draw.rounded_rectangle(
        [cx - body_w, body_top, cx + body_w, body_bottom],
        radius=36, fill=255
    )

    # Roof filled
    roof_peak = cy - 310
    roof_base = body_top + 15
    roof_spread = body_w + 100
    draw.polygon([
        (cx, roof_peak),
        (cx - roof_spread, roof_base),
        (cx + roof_spread, roof_base),
    ], fill=255)

    # Gradient: dark green to brown (rich active state)
    gradient = make_vertical_gradient(RENDER, RENDER, GREEN_DARK, BROWN_DARK)
    result = new_canvas()
    result.paste(gradient, mask=mask)

    # Door cutout in cream
    door_layer = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    dd = ImageDraw.Draw(door_layer)
    door_w = 80
    door_h = 145
    door_top = body_bottom - door_h
    dd.rounded_rectangle(
        [cx - door_w, door_top, cx + door_w, body_bottom + 5],
        radius=28, fill=(*CREAM, 255)
    )
    result = Image.alpha_composite(result, door_layer)

    finalize(result, "accueil-active")


# ============================================================
# 4. NUTRITION -- Fork & Knife with gradient
# ============================================================
def icon_nutrition():
    mask = Image.new("L", (RENDER, RENDER), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = RC, RC
    SW = 42

    # Fork (left)
    fork_x = cx - 130
    fork_top = cy - 340
    fork_bottom = cy + 340

    # Tines
    tine_h = 200
    tine_w = 28
    for offset in [-75, 0, 75]:
        tx = fork_x + offset
        draw.rounded_rectangle(
            [tx - tine_w // 2, fork_top, tx + tine_w // 2, fork_top + tine_h],
            radius=tine_w // 2, fill=255
        )

    # Fork crossbar
    draw.rounded_rectangle(
        [fork_x - 75 - 5, fork_top + tine_h - 15,
         fork_x + 75 + 5, fork_top + tine_h + 25],
        radius=12, fill=255
    )

    # Fork neck (tapers)
    draw.rounded_rectangle(
        [fork_x - 22, fork_top + tine_h + 10, fork_x + 22, fork_top + tine_h + 100],
        radius=10, fill=255
    )

    # Fork handle
    handle_w = 28
    draw.rounded_rectangle(
        [fork_x - handle_w // 2, fork_top + tine_h + 60,
         fork_x + handle_w // 2, fork_bottom],
        radius=handle_w // 2, fill=255
    )

    # Knife (right)
    knife_x = cx + 130
    knife_top = cy - 340
    knife_bottom = cy + 340

    # Blade
    blade_w = 65
    blade_h = 300
    draw.rounded_rectangle(
        [knife_x - blade_w // 2, knife_top,
         knife_x + blade_w // 2, knife_top + blade_h],
        radius=blade_w // 2, fill=255
    )

    # Knife handle
    khandle_w = 30
    draw.rounded_rectangle(
        [knife_x - khandle_w // 2, knife_top + blade_h - 40,
         knife_x + khandle_w // 2, knife_bottom],
        radius=khandle_w // 2, fill=255
    )

    # Gradient: warm gold to rich brown
    gradient = make_vertical_gradient(RENDER, RENDER, GOLD, BROWN_WARM)
    result = new_canvas()
    result.paste(gradient, mask=mask)

    # Subtle blade highlight
    hl = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    hd = ImageDraw.Draw(hl)
    hd.rounded_rectangle(
        [knife_x - blade_w // 2 + 10, knife_top + 15,
         knife_x - blade_w // 2 + 25, knife_top + blade_h - 40],
        radius=8, fill=(255, 255, 255, 30)
    )
    result = Image.alpha_composite(result, hl)

    finalize(result, "nutrition")


# ============================================================
# 5. HISTORIQUE -- Bar chart with gradient bars
# ============================================================
def icon_historique():
    img = new_canvas()
    cx, cy = RC, RC

    left = cx - 330
    bottom = cy + 330
    right = cx + 330
    top = cy - 330

    # Axes in muted brown
    axes_layer = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    ad = ImageDraw.Draw(axes_layer)
    axis_color = (*BROWN_WARM, 180)
    SW_AXIS = 36
    draw_rounded_line(ad, left, top + 60, left, bottom, SW_AXIS, axis_color)
    draw_rounded_line(ad, left, bottom, right, bottom, SW_AXIS, axis_color)
    img = Image.alpha_composite(img, axes_layer)

    # Bars with individual gradients
    bar_w = 120
    gap = 55
    start_x = left + 110

    heights = [0.38, 0.68, 0.52, 0.85]
    max_h = bottom - top - 140
    bar_colors = [
        (GOLD, BROWN_WARM),             # bar 1: gold
        (BROWN_WARM, BROWN_DARK),       # bar 2: brown
        (GOLD, BROWN_WARM),             # bar 3: gold
        (GREEN_DARK, BROWN_DARK),       # bar 4: dark (tallest)
    ]

    for i, (h_pct, (c_top, c_bot)) in enumerate(zip(heights, bar_colors)):
        bx = start_x + i * (bar_w + gap)
        bar_h = int(max_h * h_pct)
        bar_top = bottom - bar_h - SW_AXIS // 2

        # Create bar gradient
        bar_grad = make_vertical_gradient(bar_w, bar_h, c_top, c_bot)

        # Create bar mask (rounded rect)
        bar_mask = Image.new("L", (bar_w, bar_h), 0)
        ImageDraw.Draw(bar_mask).rounded_rectangle(
            [0, 0, bar_w, bar_h], radius=22, fill=255
        )
        bar_grad.putalpha(bar_mask)

        img.paste(bar_grad, (bx, bar_top), bar_grad)

    finalize(img, "historique")


# ============================================================
# 6. SOMMEIL -- Crescent moon with gradient
# ============================================================
def icon_sommeil():
    import numpy as np

    # Create crescent shape mask
    outer_r = 280
    inner_r = 230
    offset_x = 155
    offset_y = -85
    cx, cy = RC, RC

    mask = Image.new("L", (RENDER, RENDER), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r], fill=255)
    md.ellipse([cx + offset_x - inner_r, cy + offset_y - inner_r,
                cx + offset_x + inner_r, cy + offset_y + inner_r], fill=0)

    # Gradient: gold at top-left to dark brown at bottom-right (diagonal feel via vertical)
    gradient = make_vertical_gradient(RENDER, RENDER, GOLD, BROWN_DARK)
    result = new_canvas()

    m_arr = np.array(mask)
    g_arr = np.array(gradient)
    g_arr[:, :, 3] = m_arr
    result = Image.fromarray(g_arr)

    finalize(result, "sommeil")


# ============================================================
if __name__ == "__main__":
    print("Generating Elev v3 nav icons v2 (Warm Craft - colorful)...")
    print(f"Output: {OUTPUT_DIR}\n")
    icon_seances()
    icon_poids()
    icon_accueil()
    icon_accueil_active()
    icon_nutrition()
    icon_historique()
    icon_sommeil()
    print("\nAll 7 icons generated successfully")
