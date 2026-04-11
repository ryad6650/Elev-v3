"""
Warm Craft v3 -- Elev v3 Dashboard Mockup Navigation Icons
Richer colors with green accents from the app's palette.
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os
import numpy as np

SIZE = 512
RENDER = SIZE * 2
RC = RENDER // 2

# Palette
BROWN_DARK = (74, 55, 40)
BROWN_WARM = (160, 120, 92)
GOLD = (196, 168, 130)
CREAM = (242, 232, 213)
GREEN_DARK = (27, 46, 29)
GREEN_MID = (45, 74, 47)        # #2d4a2f
GREEN_ACCENT = (116, 191, 122)  # #74bf7a
GREEN_LIGHT = (140, 205, 145)
TRANSPARENT = (0, 0, 0, 0)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def new_canvas():
    return Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)


def finalize(img, name):
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(OUTPUT_DIR, f"nav-{name}.png")
    img.save(path, "PNG")
    print(f"  OK nav-{name}.png")


def make_vertical_gradient(width, height, color_top, color_bottom):
    img = Image.new("RGBA", (width, height), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return img


def make_diagonal_gradient(width, height, c1, c2):
    """Diagonal gradient top-left to bottom-right."""
    img = Image.new("RGBA", (width, height), TRANSPARENT)
    arr = np.zeros((height, width, 4), dtype=np.uint8)
    for y in range(height):
        for x in range(width):
            t = (x / max(width - 1, 1) + y / max(height - 1, 1)) / 2
            arr[y, x] = [
                int(c1[0] + (c2[0] - c1[0]) * t),
                int(c1[1] + (c2[1] - c1[1]) * t),
                int(c1[2] + (c2[2] - c1[2]) * t),
                255
            ]
    return Image.fromarray(arr)


def draw_rounded_line(draw, x1, y1, x2, y2, width, fill):
    draw.line([(x1, y1), (x2, y2)], fill=fill, width=width)
    r = width // 2
    draw.ellipse([x1 - r, y1 - r, x1 + r, y1 + r], fill=fill)
    draw.ellipse([x2 - r, y2 - r, x2 + r, y2 + r], fill=fill)


# ============================================================
# 1. SEANCES -- Dumbbell: green gradient with gold highlights
# ============================================================
def icon_seances():
    mask = Image.new("L", (RENDER, RENDER), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = RC, RC

    # Central bar
    bar_half = 150
    draw.rounded_rectangle(
        [cx - bar_half, cy - 16, cx + bar_half, cy + 16],
        radius=16, fill=255
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

    # Gradient: green accent to dark green
    gradient = make_vertical_gradient(RENDER, RENDER, GREEN_ACCENT, GREEN_DARK)
    result = new_canvas()
    result.paste(gradient, mask=mask)

    # Gold highlight shimmer on plates
    hl = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    hd = ImageDraw.Draw(hl)
    for sign in [-1, 1]:
        px = cx + sign * 200
        hd.rounded_rectangle(
            [px - plate_w // 2 + 8, cy - plate_h // 2 + 12,
             px - plate_w // 2 + 28, cy - plate_h // 2 + plate_h // 3],
            radius=10, fill=(255, 255, 255, 45)
        )
    result = Image.alpha_composite(result, hl)

    finalize(result, "seances")


# ============================================================
# 2. POIDS -- Scale: green outline with gold dial
# ============================================================
def icon_poids():
    cx, cy = RC, RC
    SW = 46

    # Body mask (outline)
    body_mask = Image.new("L", (RENDER, RENDER), 0)
    bd = ImageDraw.Draw(body_mask)
    body = 330
    top_off = 40
    bd.rounded_rectangle(
        [cx - body, cy - body + top_off, cx + body, cy + body + top_off],
        radius=85, fill=255
    )
    bd.rounded_rectangle(
        [cx - body + SW, cy - body + top_off + SW, cx + body - SW, cy + body + top_off - SW],
        radius=60, fill=0
    )

    # Body gradient: green
    body_grad = make_vertical_gradient(RENDER, RENDER, GREEN_ACCENT, GREEN_DARK)
    result = new_canvas()
    result.paste(body_grad, mask=body_mask)

    # Dial mask (filled circle with details)
    dial_mask = Image.new("L", (RENDER, RENDER), 0)
    dd = ImageDraw.Draw(dial_mask)
    dial_r = 145
    dial_cy = cy - 30
    dd.ellipse([cx - dial_r, dial_cy - dial_r, cx + dial_r, dial_cy + dial_r], fill=255)
    dial_inner = dial_r - SW + 6
    dd.ellipse([cx - dial_inner, dial_cy - dial_inner, cx + dial_inner, dial_cy + dial_inner], fill=0)

    # Needle
    angle = -50
    rad = math.radians(angle)
    nl = 85
    nx = cx + int(nl * math.cos(rad))
    ny = dial_cy + int(nl * math.sin(rad))
    dd.line([(cx, dial_cy), (nx, ny)], fill=255, width=28)
    dd.ellipse([cx - 16, dial_cy - 16, cx + 16, dial_cy + 16], fill=255)
    dd.ellipse([nx - 10, ny - 10, nx + 10, ny + 10], fill=255)

    for a in range(-160, -20, 35):
        ra = math.radians(a)
        x1 = cx + int((dial_r - 12) * math.cos(ra))
        y1 = dial_cy + int((dial_r - 12) * math.sin(ra))
        x2 = cx + int((dial_r - 38) * math.cos(ra))
        y2 = dial_cy + int((dial_r - 38) * math.sin(ra))
        dd.line([(x1, y1), (x2, y2)], fill=255, width=12)

    # Dial gradient: gold/warm
    dial_grad = make_vertical_gradient(RENDER, RENDER, GOLD, BROWN_WARM)
    dial_layer = new_canvas()
    dial_layer.paste(dial_grad, mask=dial_mask)
    result = Image.alpha_composite(result, dial_layer)

    finalize(result, "poids")


# ============================================================
# 3. ACCUEIL -- House: green/gold outline
# ============================================================
def icon_accueil():
    cx, cy = RC, RC
    SW = 46

    # Roof mask
    roof_mask = Image.new("L", (RENDER, RENDER), 0)
    rd = ImageDraw.Draw(roof_mask)
    roof_peak = cy - 300
    body_top = cy + 20
    roof_base = body_top + 40
    roof_spread = 385
    half_sw = SW // 2 + 4

    rd.polygon([
        (cx, roof_peak - half_sw),
        (cx - roof_spread - half_sw, roof_base + half_sw),
        (cx - roof_spread + half_sw, roof_base + half_sw + SW),
        (cx, roof_peak + half_sw + SW - 10),
        (cx + roof_spread - half_sw, roof_base + half_sw + SW),
        (cx + roof_spread + half_sw, roof_base + half_sw),
    ], fill=255)

    # Roof gradient: green accent
    roof_grad = make_vertical_gradient(RENDER, RENDER, GREEN_ACCENT, GREEN_MID)
    result = new_canvas()
    result.paste(roof_grad, mask=roof_mask)

    # Body mask (outline)
    body_mask = Image.new("L", (RENDER, RENDER), 0)
    bd = ImageDraw.Draw(body_mask)
    body_w = 290
    body_bottom = cy + 330
    bd.rounded_rectangle([cx - body_w, body_top, cx + body_w, body_bottom], radius=36, fill=255)
    bd.rounded_rectangle([cx - body_w + SW, body_top + SW, cx + body_w - SW, body_bottom - SW], radius=16, fill=0)

    # Door
    door_w, door_h = 85, 155
    door_top = body_bottom - door_h
    bd.rounded_rectangle([cx - door_w, door_top, cx + door_w, body_bottom + 5], radius=30, fill=255)
    bd.rounded_rectangle([cx - door_w + SW, door_top + SW, cx + door_w - SW, body_bottom + 5], radius=14, fill=0)

    # Body gradient: gold to brown
    body_grad = make_vertical_gradient(RENDER, RENDER, GOLD, BROWN_WARM)
    body_layer = new_canvas()
    body_layer.paste(body_grad, mask=body_mask)
    result = Image.alpha_composite(result, body_layer)

    finalize(result, "accueil")


# ============================================================
# 3b. ACCUEIL ACTIVE -- House filled: green gradient
# ============================================================
def icon_accueil_active():
    cx, cy = RC, RC

    mask = Image.new("L", (RENDER, RENDER), 0)
    draw = ImageDraw.Draw(mask)

    body_w = 290
    body_top = cy + 20
    body_bottom = cy + 330
    draw.rounded_rectangle([cx - body_w, body_top, cx + body_w, body_bottom], radius=36, fill=255)

    roof_peak = cy - 310
    roof_base = body_top + 15
    roof_spread = body_w + 100
    draw.polygon([(cx, roof_peak), (cx - roof_spread, roof_base), (cx + roof_spread, roof_base)], fill=255)

    gradient = make_vertical_gradient(RENDER, RENDER, GREEN_ACCENT, GREEN_DARK)
    result = new_canvas()
    result.paste(gradient, mask=mask)

    # Door cutout cream
    dl = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    dd = ImageDraw.Draw(dl)
    door_w, door_h = 80, 145
    door_top = body_bottom - door_h
    dd.rounded_rectangle([cx - door_w, door_top, cx + door_w, body_bottom + 5], radius=28, fill=(*CREAM, 255))
    result = Image.alpha_composite(result, dl)

    finalize(result, "accueil-active")


# ============================================================
# 4. NUTRITION -- Fork & Knife: green with gold knife
# ============================================================
def icon_nutrition():
    cx, cy = RC, RC

    # Fork mask
    fork_mask = Image.new("L", (RENDER, RENDER), 0)
    fd = ImageDraw.Draw(fork_mask)
    fork_x = cx - 130
    fork_top = cy - 340
    fork_bottom = cy + 340

    tine_h, tine_w = 200, 28
    for offset in [-75, 0, 75]:
        tx = fork_x + offset
        fd.rounded_rectangle([tx - tine_w // 2, fork_top, tx + tine_w // 2, fork_top + tine_h], radius=tine_w // 2, fill=255)

    fd.rounded_rectangle([fork_x - 80, fork_top + tine_h - 15, fork_x + 80, fork_top + tine_h + 25], radius=12, fill=255)
    fd.rounded_rectangle([fork_x - 22, fork_top + tine_h + 10, fork_x + 22, fork_top + tine_h + 100], radius=10, fill=255)
    fd.rounded_rectangle([fork_x - 14, fork_top + tine_h + 60, fork_x + 14, fork_bottom], radius=14, fill=255)

    # Fork gradient: green
    fork_grad = make_vertical_gradient(RENDER, RENDER, GREEN_ACCENT, GREEN_DARK)
    result = new_canvas()
    result.paste(fork_grad, mask=fork_mask)

    # Knife mask
    knife_mask = Image.new("L", (RENDER, RENDER), 0)
    kd = ImageDraw.Draw(knife_mask)
    knife_x = cx + 130
    knife_top = cy - 340
    knife_bottom = cy + 340

    blade_w, blade_h = 65, 300
    kd.rounded_rectangle([knife_x - blade_w // 2, knife_top, knife_x + blade_w // 2, knife_top + blade_h], radius=blade_w // 2, fill=255)
    kd.rounded_rectangle([knife_x - 15, knife_top + blade_h - 40, knife_x + 15, knife_bottom], radius=15, fill=255)

    # Knife gradient: gold
    knife_grad = make_vertical_gradient(RENDER, RENDER, GOLD, BROWN_WARM)
    knife_layer = new_canvas()
    knife_layer.paste(knife_grad, mask=knife_mask)
    result = Image.alpha_composite(result, knife_layer)

    # Blade highlight
    hl = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    hd = ImageDraw.Draw(hl)
    hd.rounded_rectangle(
        [knife_x - blade_w // 2 + 10, knife_top + 20,
         knife_x - blade_w // 2 + 24, knife_top + blade_h - 50],
        radius=7, fill=(255, 255, 255, 40)
    )
    result = Image.alpha_composite(result, hl)

    finalize(result, "nutrition")


# ============================================================
# 5. HISTORIQUE -- Bar chart: green & gold bars
# ============================================================
def icon_historique():
    img = new_canvas()
    cx, cy = RC, RC

    left = cx - 330
    bottom = cy + 330
    right = cx + 330
    top = cy - 330

    # Axes: subtle green
    axes = Image.new("RGBA", (RENDER, RENDER), TRANSPARENT)
    ad = ImageDraw.Draw(axes)
    axis_color = (*GREEN_MID, 160)
    draw_rounded_line(ad, left, top + 60, left, bottom, 34, axis_color)
    draw_rounded_line(ad, left, bottom, right, bottom, 34, axis_color)
    img = Image.alpha_composite(img, axes)

    bar_w = 115
    gap = 52
    start_x = left + 105
    max_h = bottom - top - 140

    configs = [
        (0.35, GOLD, BROWN_WARM),
        (0.60, GREEN_ACCENT, GREEN_MID),
        (0.48, GOLD, BROWN_WARM),
        (0.82, GREEN_ACCENT, GREEN_DARK),
    ]

    for i, (h_pct, c_top, c_bot) in enumerate(configs):
        bx = start_x + i * (bar_w + gap)
        bar_h = int(max_h * h_pct)
        bar_top = bottom - bar_h - 17

        bar_grad = make_vertical_gradient(bar_w, bar_h, c_top, c_bot)
        bar_mask = Image.new("L", (bar_w, bar_h), 0)
        ImageDraw.Draw(bar_mask).rounded_rectangle([0, 0, bar_w, bar_h], radius=22, fill=255)
        bar_grad.putalpha(bar_mask)
        img.paste(bar_grad, (bx, bar_top), bar_grad)

    finalize(img, "historique")


# ============================================================
# 6. SOMMEIL -- Crescent moon: green to gold gradient
# ============================================================
def icon_sommeil():
    cx, cy = RC, RC
    outer_r = 280
    inner_r = 230
    offset_x = 155
    offset_y = -85

    mask = Image.new("L", (RENDER, RENDER), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r], fill=255)
    md.ellipse([cx + offset_x - inner_r, cy + offset_y - inner_r,
                cx + offset_x + inner_r, cy + offset_y + inner_r], fill=0)

    gradient = make_vertical_gradient(RENDER, RENDER, GREEN_ACCENT, GREEN_DARK)
    g_arr = np.array(gradient)
    m_arr = np.array(mask)
    g_arr[:, :, 3] = m_arr
    result = Image.fromarray(g_arr)

    # Gold inner glow
    glow_mask = Image.new("L", (RENDER, RENDER), 0)
    gd = ImageDraw.Draw(glow_mask)
    gd.ellipse([cx - outer_r + 40, cy - outer_r + 40, cx + outer_r - 40, cy + outer_r - 40], fill=120)
    gd.ellipse([cx + offset_x - inner_r - 10, cy + offset_y - inner_r - 10,
                cx + offset_x + inner_r + 10, cy + offset_y + inner_r + 10], fill=0)
    glow_mask = glow_mask.filter(ImageFilter.GaussianBlur(30))

    glow = Image.new("RGBA", (RENDER, RENDER), (*GOLD, 0))
    glow_arr = np.array(glow)
    glow_arr[:, :, 3] = np.minimum(np.array(glow_mask), m_arr)
    glow = Image.fromarray(glow_arr)
    result = Image.alpha_composite(result, glow)

    finalize(result, "sommeil")


if __name__ == "__main__":
    print("Generating Elev v3 nav icons v3 (green + gold)...")
    print(f"Output: {OUTPUT_DIR}\n")
    icon_seances()
    icon_poids()
    icon_accueil()
    icon_accueil_active()
    icon_nutrition()
    icon_historique()
    icon_sommeil()
    print("\nAll 7 icons generated")
