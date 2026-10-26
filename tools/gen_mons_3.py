"""Cracky monsters, batch 3: LEMON DRONE, WAR DRONE, SHEET, GREY, THE BEHOLDEN.
Front 56x56, back 64x64, 2 idle frames each. Writes cracky/mons_3.js. Light upper-left, dark coloured outlines."""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

def outline_except(g, c, skip=''):
    H, W = len(g), len(g[0]); src = copy(g)
    for y in range(H):
        for x in range(W):
            if src[y][x] != '.': continue
            if any(0 <= x + dx < W and 0 <= y + dy < H and src[y + dy][x + dx] not in ('.',) + tuple(skip)
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                g[y][x] = c

def line(g, x0, y0, x1, y1, c):
    n = max(abs(x1 - x0), abs(y1 - y0)) or 1
    for i in range(n + 1):
        px(g, round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), c)

def oval(g, cx, cy, rx, ry, c, only=None):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                if 0 <= y < len(g) and 0 <= x < len(g[0]) and (only is None or g[y][x] in only): g[y][x] = c

def rot_oval(g, cx, cy, rx, ry, ang, c):
    ca, sa = math.cos(ang), math.sin(ang)
    for y in range(int(cy - rx) - 2, int(cy + rx) + 3):
        for x in range(int(cx - rx) - 2, int(cx + rx) + 3):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            u, v = dx * ca + dy * sa, -dx * sa + dy * ca
            if (u / rx) ** 2 + (v / ry) ** 2 <= 1 and 0 <= y < len(g) and 0 <= x < len(g[0]): g[y][x] = c

def bez(g, p0, p1, p2, c, w=1):
    for i in range(41):
        t = i / 40
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
        for dx in range(w):
            px(g, round(x) + dx, round(y), c)

# ====================================================================== LEMON DRONE / WAR DRONE
def rotor(g, cx, cy, rx, f):
    # rotor blur: a pale disc, with a hub; the two frames swap the blade streak
    oval(g, cx, cy, rx, 2.2, 'r')
    if f == 0: hline(g, round(cx - rx + 2), round(cy) - 1, round(rx * 2 - 4), 'R')
    else: hline(g, round(cx - rx + 2), round(cy), round(rx * 2 - 4), 'R')
    rect(g, round(cx) - 1, round(cy) + 1, 2, 2, '2')

def drone(f=0, back=False, war=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = -f
    oy = 8 if back else 0
    by = 30 + oy + b
    s = 1.12 if war else 1.0
    # back rotors (smaller, higher), arms, front rotors
    for sx in (-1, 1):
        hx, hy = cx + sx * 12, 8 + oy + b
        line(g, cx + sx * 6, by - 8, hx, hy + 1, '2'); line(g, cx + sx * 7, by - 8, hx + sx, hy + 1, '1')
        rotor(g, hx, hy, 7 if not war else 8, f)
    for sx in (-1, 1):
        hx, hy = cx + sx * 19, 15 + oy + b
        line(g, cx + sx * 12, by - 2, hx, hy + 1, '2'); line(g, cx + sx * 12, by - 1, hx, hy + 2, '1')
        rotor(g, hx, hy, 6, 1 - f)
    # skids
    for sx in (-1, 1):
        line(g, cx + sx * 7, by + 11, cx + sx * 11, by + 18, '1')
        hline(g, cx + sx * 11 - (6 if sx < 0 else 0), by + 18, 7, '2'); hline(g, cx + sx * 11 - (6 if sx < 0 else 0), by + 19, 7, '1')
    # body: lemon with pointed tips (war: armoured, rounder)
    rx, ry = 16 * s, 12.5 * s
    if not war:
        ball(g, cx - rx + 1, by, 3.5, 2.8, '2345')
        ball(g, cx + rx - 1, by, 3.5, 2.8, '1234')
    ball(g, cx, by, rx, ry, '12344', bias=0.05, edge='1')
    if war:
        # armour seams + rivets, siren dome, antennas
        for x in (cx - 9, cx + 8):
            for y in range(by - 11, by + 12):
                if g[y][x] in '1234': g[y][x] = '1'
        for (x, y) in ((cx - 12, by - 5), (cx - 12, by + 5), (cx + 11, by - 5), (cx + 11, by + 5)): px(g, x, y, '5')
        line(g, cx - 6, by - 13, cx - 10, by - 21, 'k'); px(g, cx - 10, by - 22, 's')
        line(g, cx + 6, by - 13, cx + 10, by - 21, 'k'); px(g, cx + 10, by - 22, 's')
        ball(g, cx, by - 14, 4.5, 3.5, 'sS' if f == 0 else 'bB')
        hline(g, cx - 4, by - 11, 9, '1')
        # weapon pods under the body
        for sx in (-1, 1): ball(g, cx + sx * 10, by + 12, 3, 2.5, '123')
    else:
        # lemon leaf on top
        for (x, y) in ((cx + 1, by - 13), (cx + 2, by - 14), (cx + 3, by - 15), (cx + 4, by - 15), (cx + 5, by - 16), (cx + 2, by - 15), (cx + 3, by - 16), (cx + 4, by - 16)):
            px(g, x, y, 'l')
        px(g, cx + 1, by - 14, 'L'); px(g, cx + 6, by - 17, 'L'); px(g, cx, by - 12, 'k')
        # little dimples on the peel
        for (x, y) in ((cx - 9, by - 4), (cx + 6, by + 6), (cx - 3, by + 8), (cx + 10, by - 2)): px(g, x, y, '3')
    if not back:
        if war:
            # visor band with a red eye
            rect(g, cx - 11, by - 4, 22, 8, 'k'); hline(g, cx - 11, by - 4, 22, 'K')
            oval(g, cx, by, 4.5, 3, 'e'); oval(g, cx, by, 2.5, 1.6, 'E'); px(g, cx - 3, by - 2, 'w')
            # angry brow plate
            for i in range(6): px(g, cx - 10 + i, by - 7 + i // 2, '1'); px(g, cx + 9 - i, by - 7 + i // 2, '1')
        else:
            # camera eye
            oval(g, cx, by + 1, 7, 7, 'K'); oval(g, cx, by + 1, 5.5, 5.5, 'n')
            oval(g, cx + 0.5, by + 1.5, 3.2, 3.2, 'c'); oval(g, cx + 0.5, by + 1.5, 1.6, 1.6, 'k')
            px(g, cx - 3, by - 2, 'w'); px(g, cx - 2, by - 3, 'w'); px(g, cx - 3, by - 1, 'w')
            px(g, cx - 10, by + 4, 'p'); px(g, cx - 9, by + 4, 'p'); px(g, cx + 9, by + 4, 'p'); px(g, cx + 10, by + 4, 'p')
    else:
        # back panel: battery hatch with vents + status light
        rect(g, cx - 6, by - 4, 12, 9, '2'); hline(g, cx - 6, by - 4, 12, '3')
        for y in (by - 1, by + 1, by + 3): hline(g, cx - 4, y, 8, '1')
        px(g, cx + 4, by - 3, 'c' if f == 0 else 'n')
    outline_except(g, 'o')
    return g
DRONE_LEG = "{ o: '#3a2a14', 1: '#9a6a18', 2: '#cc961e', 3: '#ecc436', 4: '#f8e26a', 5: '#fff6b8', r: '#dde2ec', R: '#aab2c4', k: '#2a2d3e', K: '#4a4e64', n: '#1e2238', c: '#4ac0e8', l: '#5aa94a', L: '#9cd86e', w: '#ffffff', p: 'blush' }"
WAR_LEG = "{ c: '#4ae0c8', n: '#1e2238', o: '#2a1218', 1: '#6a1a24', 2: '#a8283a', 3: '#d8463e', 4: '#f07a5a', 5: '#ffc0a0', r: '#dde2ec', R: '#aab2c4', k: '#24202e', K: '#46405a', e: '#ff4a3a', E: '#fff0a0', s: '#ff5a4a', S: '#ffc0b0', b: '#4a7aff', B: '#c0d4ff', w: '#ffffff' }"

# ====================================================================== SHEET (hologram fake-ghost)
def sheet(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = 0
    oy = 8 if back else 0
    # projector puck + beam (drawn first, under the sheet)
    py = 50 + oy
    if py < W - 1:
        for x in (cx - 6, cx + 5):
            for y in range(40 + oy, py - 1, 2): px(g, x, y, 'c')
    # sheet silhouette: dome head + body + ragged hem
    m = blank(W, W)
    oval(m, cx, 19 + oy, 15, 14, '#')
    rect(m, cx - 15, 19 + oy, 30, 22, '#')
    for i, x in enumerate(range(cx - 15, cx + 15)):
        k = (x - (cx - 15)) % 7
        depth = [5, 6, 6, 5, 3, 2, 3][k]
        for y in range(41 + oy, 41 + oy + depth): m[y][x] = '#'
    # glitch: on frame 1 some slices jump sideways
    if f == 1:
        for (y0, y1, d) in ((14 + oy, 17 + oy, 2), (30 + oy, 32 + oy, -2), (42 + oy, 44 + oy, 1)):
            for y in range(y0, y1):
                m[y] = (['.'] * d + m[y][:W - d]) if d > 0 else (m[y][-d:] + ['.'] * (-d))
    # shading: lit upper left, scanlines every 3rd row in magenta
    for y in range(W):
        for x in range(W):
            if m[y][x] != '#': continue
            t = (x - (cx - 15)) / 30 + (y - (5 + oy)) / 80
            c = 'D' if t < 0.25 else 'C' if t < 0.6 else 'B' if t < 0.85 else 'A'
            if (y + f) % 3 == 0: c = {'D': 'N', 'C': 'M', 'B': 'M', 'A': 'm'}[c]
            g[y][x] = c
    if not back:
        sx = 2 if f == 1 else 0   # face rides on the glitched slice
        for ex in (cx - 7, cx + 3):
            oval(g, ex + 2, 21 + oy, 2.6, 3.8, 'e')
            px(g, ex + 1, 19 + oy, 'w'); px(g, ex + 1, 20 + oy, 'w')
        # wavy "oooo" mouth
        oval(g, cx - 0.5, 29 + oy, 2, 2.2, 'e'); px(g, cx - 1, 28 + oy, 'm')
    else:
        # back seam of the sheet + a "PROPERTY OF" tag stripe
        for y in range(10 + oy, 40 + oy): px(g, cx, y, 'A') if g[y][cx] not in '.' else None
    # stray glitch pixels
    for (x, y) in (((4, 12), (W - 6, 30), (6, 38)) if f == 0 else ((W - 5, 10), (3, 26), (W - 8, 44))):
        hline(g, x, y + oy, 3, 'm' if y % 2 else 'C')
    outline_except(g, 'o')
    if py < W - 1:
        oval(g, cx, py + 1, 8, 2.5, 'k'); hline(g, cx - 5, py, 10, 'K'); px(g, cx - 1, py, 'c'); px(g, cx, py, 'c')
    return g
SHEET_LEG = "{ o: '#1a1030', A: '#3a8ab8', B: '#5ac0e0', C: '#8ae8f4', D: '#d0fcff', m: '#8a3a9a', M: '#d060c0', N: '#f8a0e8', e: '#1a1030', w: '#ffffff', c: '#7af0ff', k: '#24202e', K: '#46405a' }"

# ====================================================================== GREY
def grey(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 8 if back else 0
    # legs + body
    for sx in (-1, 1):
        rect(g, cx + sx * 3 - (1 if sx < 0 else 0), 44 + oy, 2, 9, '2'); hline(g, cx + sx * 3 - (2 if sx < 0 else 0), 52 + oy, 4, '2')
    ball(g, cx, 40 + oy, 7.5, 8, '12345', bias=0.0, edge='1')
    # arms: left hangs, right holds a probe up
    line(g, cx - 7, 35 + oy, cx - 11, 45 + oy, '2'); line(g, cx - 8, 35 + oy, cx - 12, 45 + oy, '3')
    px(g, cx - 12, 46 + oy, '3'); px(g, cx - 11, 46 + oy, '3')
    line(g, cx + 7, 35 + oy, cx + 12, 40 + oy, '2'); line(g, cx + 7, 36 + oy, cx + 12, 41 + oy, '1')
    if not back:
        line(g, cx + 13, 41 + oy, cx + 17, 30 + oy - b, 'k'); line(g, cx + 14, 41 + oy, cx + 18, 30 + oy - b, 'K')
        ball(g, cx + 18, 28 + oy - b, 2.4, 2.4, 'cC' if f == 0 else 'Cc')
    # neck + head (big dome tapering to a small chin)
    rect(g, cx - 2, 29 + oy, 4, 4, '2'); vline(g, cx - 2, 29 + oy, 4, '3')
    ball(g, cx, 18 + oy + b, 14, 12, '12345', bias=0.1, edge='1')
    ball(g, cx, 25 + oy + b, 8.5, 7, '12345', bias=0.0, edge='1')
    if not back:
        # huge black almond eyes, outer corners up
        for sx in (-1, 1):
            rot_oval(g, cx + sx * 6.5, 21 + oy + b, 5.8, 2.9, -sx * 0.45, 'e')
        # shine on the same (upper-left) side of each eye
        for ex in (cx - 9, cx + 4): px(g, ex, 19 + oy + b, 'w'); px(g, ex + 1, 19 + oy + b, 'w'); px(g, ex, 20 + oy + b, 'W')
        hline(g, cx - 1, 29 + oy + b, 2, '1')
        px(g, cx - 1, 25 + oy + b, '2'); px(g, cx, 25 + oy + b, '2')   # nose slits
    else:
        # back of the head: a subtle ridge
        for y in range(10 + oy + b, 28 + oy + b): px(g, cx, y, '2') if g[y][cx] in '345' else None
    outline_except(g, 'o')
    return g
GREY_LEG = "{ o: '#22222e', 1: '#4e5062', 2: '#767a8e', 3: '#a0a4b6', 4: '#c6c9d6', 5: '#e8eaf2', e: '#14141e', w: '#ffffff', W: '#6a6c8a', k: '#3a3e52', K: '#8a90a8', c: '#4ae0c8', C: '#c8fff0' }"

# ====================================================================== THE BEHOLDEN (legendary)
def beholden(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2
    oy = 6 if back else 0
    ey = 31 + oy
    sw = f  # stalks sway 1px
    stalks = [((cx - 10, ey - 12), (cx - 22, ey - 17), (cx - 22, ey - 24)),
              ((cx - 4, ey - 15), (cx - 8, ey - 23), (cx - 11, ey - 26)),
              ((cx + 4, ey - 15), (cx + 8, ey - 23), (cx + 11, ey - 26)),
              ((cx + 10, ey - 12), (cx + 22, ey - 17), (cx + 22, ey - 24)),
              ((cx - 14, ey - 2), (cx - 23, ey - 2), (cx - 23, ey - 10)),
              ((cx + 14, ey - 2), (cx + 23, ey - 2), (cx + 22, ey - 10))]
    tips = []
    for i, (p0, p1, p2) in enumerate(stalks):
        d = sw if i % 2 == 0 else -sw
        p2 = (p2[0] + d, p2[1])
        bez(g, p0, p1, p2, '2', 2); bez(g, (p0[0], p0[1] + 1), (p1[0], p1[1] + 1), (p2[0], p2[1] + 1), '1', 2)
        tips.append(p2)
    # tendrils under the body
    for i, x in enumerate((cx - 8, cx, cx + 8)):
        bez(g, (x, ey + 14), (x + (2 if i % 2 else -2) * (1 - 2 * f), ey + 19), (x, ey + 23), '2', 2)
    # the body: one huge eyeball in purple flesh
    ball(g, cx, ey, 19, 17.5, '123445', bias=0.05, edge='1')
    # gold plates (crown) across the brow
    for i, x in enumerate(range(cx - 12, cx + 13, 6)):
        ball(g, x, ey - 14 + abs(i - 2), 3, 2.5, 'gGY')
    if not back:
        # eyelids + sclera + gold iris + slit pupil
        oval(g, cx, ey + 1, 14, 10, '1')
        oval(g, cx, ey + 1, 12.5, 8.5, 'u')
        oval(g, cx - 1, ey, 11.5, 7.5, 'v')
        oval(g, cx, ey + 1, 6.5, 6.5, 'G'); oval(g, cx - 0.5, ey + 0.5, 5.5, 5.5, 'g'); oval(g, cx - 1.5, ey - 0.5, 3, 3, 'Y')
        rect(g, cx - 1, ey - 4, 2, 10, 'k')
        px(g, cx - 4, ey - 3, 'w'); px(g, cx - 3, ey - 3, 'w'); px(g, cx - 4, ey - 2, 'w')
        # veins
        for (x, y) in ((cx - 10, ey - 1), (cx - 9, ey), (cx - 11, ey + 1), (cx + 9, ey + 3), (cx + 10, ey + 2), (cx + 8, ey + 4)): px(g, x, y, 'r')
        # upper lid shadow line
        for x in range(cx - 10, cx + 11):
            if g[ey - 7][x] in 'uv': g[ey - 7][x] = '2'
    else:
        # back: veins + the optic nerve cord
        for (x, y) in ((cx - 6, ey - 4), (cx - 5, ey - 3), (cx - 4, ey - 3), (cx + 3, ey + 2), (cx + 4, ey + 3), (cx + 6, ey + 3), (cx - 2, ey + 6)): px(g, x, y, 'r')
        ball(g, cx + 2, ey + 6, 4, 3, '123')
    outline_except(g, 'o')
    # unpaid bills at each stalk tip (drawn after the outline, with their own)
    for (x, y) in tips:
        bx, by = round(x) - 4, round(y) - 3
        rect(g, bx, by, 9, 7, 'o'); rect(g, bx + 1, by + 1, 7, 5, 'P'); hline(g, bx + 1, by + 1, 7, 'Q')
        if not back:
            hline(g, bx + 2, by + 3, 5, 'r'); px(g, bx + 2, by + 5, 'q'); px(g, bx + 3, by + 5, 'q'); px(g, bx + 5, by + 5, 'q')
        else:
            hline(g, bx + 2, by + 3, 5, 'q')
    return g
BEHOLDEN_LEG = "{ o: '#1e0f2a', 1: '#3e1a50', 2: '#5e2a74', 3: '#8240a0', 4: '#a862c4', 5: '#d098e4', u: '#d8c8d8', v: '#fff4f0', g: '#e0a020', G: '#a06a10', Y: '#ffe070', k: '#1e0f2a', w: '#ffffff', r: '#d83848', P: '#f4f0e4', Q: '#ffffff', q: '#a8a0b0' }"

MONS = [('drone', lambda f, b: drone(f, b, False), DRONE_LEG),
        ('wardrone', lambda f, b: drone(f, b, True), WAR_LEG),
        ('sheet', sheet, SHEET_LEG), ('grey', grey, GREY_LEG), ('beholden', beholden, BEHOLDEN_LEG)]

out = ["// Cracky — monster battle sprites, batch 3 (drone, wardrone, sheet, grey, beholden). Generated by tools/gen_mons_3.py.",
       "(function () {", "const S = Sprout;"]
for name, fn, leg in MONS:
    for back in (False, True):
        W = 64 if back else 56
        frames = "\n".join(js(f"idle{f}", fn(f, back)) for f in (0, 1))
        out.append(f"S.sprite('{name}_{'back' if back else 'front'}', {{ w: {W}, h: {W}, origin: [{W // 2}, {W}],\n  legend: {leg},\n  frames: {{\n{frames}\n  }} }});")
out.append("})();")
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'mons_3.js'), 'w').write("\n".join(out) + "\n")
