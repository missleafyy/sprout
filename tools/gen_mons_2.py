"""Cracky monsters, batch 2: mannequin, storespirit, cactus, saguaro, echo, choir.
Front 56x56, back 64x64, 2 idle frames each. Writes cracky/mons_2.js. Light upper-left, coloured outlines."""
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

def ring(g, cx, cy, rx, ry, c, only=None, t=0.9):
    """1px elliptical ring."""
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2
            if t <= d <= 1.0 and 0 <= y < len(g) and 0 <= x < len(g[0]) and (only is None or g[y][x] in only):
                g[y][x] = c

def eye(g, cx, cy, h=4, w=2):
    rect(g, cx, cy, w, h, 'e')
    px(g, cx, cy, 'w')
    if h > 3: px(g, cx, cy + 1, 'w')

def sparkle(g, x, y, c='W', big=False):
    px(g, x, y, c)
    for d in ((1, 0), (-1, 0), (0, 1), (0, -1)): px(g, x + d[0], y + d[1], c)
    if big:
        for d in ((2, 0), (-2, 0), (0, 2), (0, -2)): px(g, x + d[0], y + d[1], c)

def note(g, x, y, c):
    rect(g, x, y + 3, 2, 2, c); vline(g, x + 1, y - 2, 5, c); px(g, x + 2, y - 2, c); px(g, x + 3, y - 1, c)

# ====================================================================== MANNEQUIN (light)
# a faceless mall mannequin bust on a stand, pastel SALE scarf, price tag, glint
def torso(g, cx, top, b, back=False, arms=False, f=0):
    """Dress-form bust: egg head, neck, rounded shoulders, chest, nipped waist, flared hips."""
    ball(g, cx, top + 7 + b, 7, 8, '12345', bias=0.1, edge='1')
    rect(g, cx - 2, top + 15 + b, 5, 3, '3'); vline(g, cx + 2, top + 15 + b, 3, '2'); vline(g, cx - 2, top + 15 + b, 3, '4')
    prof = [5, 9, 11, 12, 13, 13, 13, 13, 12, 12, 11, 10, 9, 9, 8, 8, 9, 10, 10, 9, 7]
    y0 = top + 18 + b
    for j, hw in enumerate(prof):
        for x in range(cx - hw, cx + hw + 1):
            t = (x - (cx - hw)) / (2 * hw)
            c = '4' if t < 0.14 else '5' if t < 0.32 else '4' if t < 0.5 else '3' if t < 0.74 else '2' if t < 0.9 else '1'
            if j < 2 and c in '23': c = '4'
            if j == len(prof) - 1: c = '2' if c in '345' else '1'
            g[y0 + j][x] = c
    if arms:
        # arms out and down a little: "ta-da"
        for s_ in (-1, 1):
            for i in range(10):
                x = cx + s_ * (13 + i // 2); y = y0 + 3 + i
                g[y][x] = '4' if s_ < 0 else '2'; g[y][x + s_] = '3' if s_ < 0 else '1'
            ball(g, cx + s_ * 19, y0 + 13 + (f if s_ > 0 else 0), 2.2, 2.2, '345')
    # seam down the front
    if not back:
        for y in range(y0 + 4, y0 + len(prof) - 1, 2):
            if g[y][cx] in '2345': g[y][cx] = '3'
    return g

def scarf(g, cx, y, b, long_=0, back=False):
    # wraps the neck, tail hangs off the right shoulder
    rect(g, cx - 6, y + b, 13, 3, 'P'); hline(g, cx - 6, y + b, 13, 'Q'); hline(g, cx - 6, y + 2 + b, 13, 'p')
    tx = cx + (3 if not back else -5)
    for i in range(7 + long_):
        rect(g, tx + (i // 4), y + 3 + i + b, 3, 1, 'P' if i % 3 else 'Q')
        px(g, tx + (i // 4) + 2, y + 3 + i + b, 'p')
    # fringe
    for i in range(3): px(g, tx + (6 + long_) // 4 + i, y + 10 + long_ + b, 'p')

def mannequin(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 8 if back else 0
    # stand: pole + round base
    rect(g, cx - 1, 41 + oy, 3, 9, 'k'); vline(g, cx - 1, 41 + oy, 9, 'K')
    ball(g, cx, 51 + oy, 9, 2.6, 'kKk', bias=0.2)
    torso(g, cx, 4 + oy, b, back)
    scarf(g, cx, 18 + oy, b, back=back)
    if not back:
        # blush where a face would be: it has no face and it is fine with that
        for s in (-1, 1): hline(g, cx + s * 4 - (1 if s < 0 else 0), 12 + b, 2, 'r')
        # price tag on a string from the shoulder
        line(g, cx - 10, 22 + b, cx - 14, 30 + b, 'k')
        rect(g, cx - 19, 29 + b, 7, 9, 'T'); hline(g, cx - 19, 29 + b, 7, 'W'); px(g, cx - 16, 30 + b, 'k')
        # "%" on the tag
        px(g, cx - 18, 32 + b, 'R'); px(g, cx - 14, 36 + b, 'R')
        for i in range(4): px(g, cx - 14 - i, 32 + i + b, 'R')
    # glint (light type)
    sx, sy = ((cx - 12, 8 + oy) if f == 0 else (cx + 13, 14 + oy))
    sparkle(g, sx, sy, 'y', big=f == 0)
    outline_except(g, 'o')
    return g

# ====================================================================== STORE SPIRIT (light)
# the mannequin, ascended: floating, gold glow, a halo of shopping bags, long scarf
def bag(g, x, y, c, C):
    rect(g, x, y + 2, 6, 6, c); vline(g, x + 5, y + 2, 6, C); hline(g, x, y + 7, 6, C)
    px(g, x + 1, y + 1, 'o'); px(g, x + 4, y + 1, 'o'); hline(g, x + 2, y, 2, 'o')

def storespirit(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = -f
    oy = 8 if back else 2
    # aura behind everything
    # wispy glowing tail instead of a stand
    for i, (x, y, r) in enumerate([(cx, 42, 6), (cx + 1, 46, 4.5), (cx + 3, 49, 3), (cx + 5, 51, 1.6)]):
        ball(g, x, y + oy + b, r, r * 0.9, 'GHy', bias=0.2)
    torso(g, cx, 2 + oy, b, back, arms=True, f=f)
    # recolour the body gold (the mannequin, gilded)
    for y in range(W):
        for x in range(W):
            c = g[y][x]
            if c in '12345': g[y][x] = {'1': 'g', '2': 'G', '3': 'H', '4': 'y', '5': 'Y'}[c]
    scarf(g, cx, 16 + oy, b, long_=6, back=back)
    if not back:
        for s in (-1, 1): hline(g, cx + s * 4 - (1 if s < 0 else 0), 10 + oy + b, 2, 'r')
        # a tiny serene smile, it has found peace (and a 70% off sale)
        hline(g, cx - 1, 13 + oy + b, 3, 'G'); px(g, cx - 2, 12 + oy + b, 'G'); px(g, cx + 2, 12 + oy + b, 'G')
    # halo of shopping bags, rotating between frames
    bags = [(-19, 2), (13, 0), (-23, 20), (18, 18)] if f == 0 else [(-18, 0), (14, 2), (-22, 18), (19, 20)]
    cols = [('P', 'p'), ('c', 'C'), ('y', 'G'), ('P', 'p')]
    for (dx, dy), (c, C) in zip(bags, cols):
        bag(g, cx + dx, 4 + oy + dy + b, c, C)
    # halo ring above the head
    for (x, y) in ((cx - 16, 34), (cx + 17, 36)) if f == 0 else ((cx - 18, 30), (cx + 16, 40)):
        sparkle(g, x, y + oy, 'W')
    outline_except(g, 'o')
    ring(g, cx, 2 + oy + b, 9, 2.6, 'Y', t=0.45)
    for x in range(cx - 8, cx + 9):
        if g[3 + oy + b][x] == 'Y' and x > cx: g[3 + oy + b][x] = 'H'
    for (rx, ry, c) in ((22, 24, 'A'), (19, 21, 'a')):
        oval(g, cx, 28 + oy + b, rx, ry, c, only='.')
    return g

MANN_LEG = ("{ o: '#4a2a3a', 1: '#9a7680', 2: '#c8a4a4', 3: '#e8c8bc', 4: '#f8e4da', 5: '#fff8f2', "
            "P: '#f28ab0', Q: '#ffc0d8', p: '#c0507e', k: '#3e3a4e', K: '#6a6680', T: '#fffaf0', W: '#ffffff', "
            "R: '#d83838', r: '#f2a0a0', y: '#ffe890' }")
SPIRIT_LEG = ("{ o: '#5a3418', g: '#a8702a', G: '#d09a3a', H: '#ecc458', y: '#fbe48a', Y: '#fff8d0', "
              "a: '#fff2c8', A: '#ffe8b0', P: '#f28ab0', Q: '#ffc0d8', p: '#c0507e', c: '#4cb8aa', C: '#2e8c90', "
              "W: '#ffffff', r: '#f2a0a0' }")

# ====================================================================== JUMPER CACTUS (normal)
def cactus_ball(g, cx, cy, rx, ry):
    ball(g, cx, cy, rx, ry, '12345', bias=0.05, edge='1')
    # ribs: vertical darker lines following the ball
    for k in (-0.55, 0.0, 0.55):
        for y in range(int(cy - ry) + 2, int(cy + ry) - 1):
            dy = (y + 0.5 - cy) / ry
            if abs(dy) >= 1: continue
            x = round(cx + k * rx * math.sqrt(1 - dy * dy))
            if g[y][x] in '2345': g[y][x] = '2' if g[y][x] in '345' else '1'
    # white spine dots on the ribs
    for (dx, dy) in ((-0.55, -0.4), (0.0, -0.7), (0.55, -0.35), (-0.55, 0.35), (0.55, 0.4), (0.0, 0.55)):
        x = round(cx + dx * rx * 1.0); y = round(cy + dy * ry)
        if g[y][x] != '.': px(g, x - 1 if dx <= 0 else x + 1, y, 's')

def cactus(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2
    up = 4 if f else 0
    oy = 10 if back else 4
    # shadow on the sand stays put while it hops
    # stubby feet
    for s in (-1, 1):
        ball(g, cx + s * 6, 46 + oy - up - (1 if f else 0), 3.5, 2.2, '123')
    cactus_ball(g, cx, 31 + oy - up, 16, 15)
    # flower on top
    fy = 15 + oy - up
    for (dx, dy) in ((-2, 0), (2, 0), (0, -2), (-1, -1), (1, -1), (-1, 1), (1, 1), (0, 1)): px(g, cx + dx, fy + dy, 'F')
    px(g, cx - 2, fy - 1, 'f'); px(g, cx + 2, fy - 1, 'f'); px(g, cx, fy, 'y'); px(g, cx - 1, fy - 2, 'f')
    if not back:
        eye(g, cx - 7, 27 + oy - up, 5, 3); eye(g, cx + 4, 27 + oy - up, 5, 3)
        px(g, cx - 5, 27 + oy - up, 'e'); px(g, cx + 6, 27 + oy - up, 'e')
        # little open mouth (it's mid-hop, delighted)
        rect(g, cx - 1, 35 + oy - up, 3, 2, 'e'); px(g, cx, 36 + oy - up, 'm')
        for s in (-1, 1): hline(g, cx + s * 9 - (1 if s < 0 else 0), 34 + oy - up, 2, 'r')
    if f:   # dust puffs from the jump
        for (x, y) in ((cx - 15, 49), (cx + 14, 49)): ball(g, x, y, 2.5, 1.8, 'dD')
    outline_except(g, 'o', skip='z')
    return g

# ====================================================================== OLD MAN SAGUARO (normal)
def saguaro(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 8 if back else 0
    def column(x0, x1, y0, y1):
        # vertical cactus segment shaded by column, rounded top
        n = x1 - x0
        for y in range(y0, y1):
            for i, x in enumerate(range(x0, x1)):
                t = i / max(1, n - 1)
                c = '4' if t < 0.2 else '5' if t < 0.35 else '3' if t < 0.65 else '2' if t < 0.88 else '1'
                if y == y0 and (i == 0 or i == n - 1): continue
                g[y][x] = c
        for x in range(x0 + 2, x1 - 1, 3):
            for y in range(y0 + 2, y1, 2):
                if g[y][x] in '345': g[y][x] = '2'
    # arms raised (behind the trunk), elbows
    lx = cx - 19; rx_ = cx + 13
    column(lx, lx + 7, 8 + oy + b, 30 + oy)
    for y in range(26 + oy, 33 + oy):
        for x in range(lx + 2, cx - 8):
            g[y][x] = '2' if y > 30 + oy else '3'
    column(rx_, rx_ + 7, 4 + oy - b, 26 + oy)
    for y in range(22 + oy, 29 + oy):
        for x in range(cx + 8, rx_ + 5):
            g[y][x] = '2' if y > 26 + oy else '3'
    # trunk
    column(cx - 10, cx + 10, 10 + oy, 52 + oy)
    if not back:
        # bushy white brows, beady eyes, big white spine beard
        hline(g, cx - 8, 19 + oy, 6, 'b'); hline(g, cx + 2, 19 + oy, 6, 'b')
        hline(g, cx - 7, 18 + oy, 4, 'B'); hline(g, cx + 3, 18 + oy, 4, 'B')
        eye(g, cx - 6, 21 + oy, 3); eye(g, cx + 4, 21 + oy, 3)
        bx = [(cx - 8, cx + 9)] + [(cx - 9 + i // 2, cx + 10 - i // 2) for i in range(10)]
        for j, (a, z) in enumerate(bx):
            for x in range(a, z):
                g[26 + oy + j][x] = 'b' if (x == a or x == z - 1 or (j > 6 and (x - cx) % 5 == 0)) else 'B'
        hline(g, cx - 3, 27 + oy, 6, 'e')        # frown hidden in the beard
        px(g, cx - 4, 28 + oy, 'e'); px(g, cx + 3, 28 + oy, 'e')
        # spines elsewhere
        for (x, y) in ((cx - 17, 14), (cx - 13, 22), (cx + 16, 10), (cx + 18, 18), (cx - 7, 42), (cx + 6, 46)):
            px(g, x, y + oy, 'B')
    # cowboy hat
    hy = 4 + oy
    rect(g, cx - 14, hy + 6, 28, 3, 'h'); hline(g, cx - 14, hy + 6, 28, 'H'); hline(g, cx - 13, hy + 8, 26, 'k')
    px(g, cx - 15, hy + 5, 'h'); px(g, cx + 14, hy + 5, 'h')
    rect(g, cx - 7, hy, 14, 6, 'h'); hline(g, cx - 6, hy, 12, 'H'); vline(g, cx - 7, hy + 1, 5, 'H')
    hline(g, cx - 7, hy + 4, 14, 'F'); px(g, cx + 4, hy + 4, 'f'); px(g, cx + 5, hy + 3, 'F'); px(g, cx + 5, hy + 5, 'F')
    outline_except(g, 'o')
    return g

CACT_LEG = ("{ o: '#163a36', 1: '#1f5640', 2: '#2c7a46', 3: '#46a052', 4: '#72c460', 5: '#acdf7a', "
            "s: '#fffaf0', F: '#f28ab0', f: '#ffc0d8', y: '#f8cc40', e: 'ink', w: '#ffffff', m: '#e88aa0', "
            "r: '#f2a0a0', z: '#d6976e', d: '#f8d8ae', D: '#eab88a', "
            "b: '#c8c8d8', B: '#f4f4fa', h: '#a8683e', H: '#cc8e52', k: '#7a4632' }")

# ====================================================================== ECHO (sound)
# a small translucent blob made of ripple rings
def echo_body(g, cx, cy, rx, ry, face=True, f=0, mouth=True):
    ball(g, cx, cy, rx, ry, '12344', bias=0.1, edge='1')
    # inner ripple rings (lighter), offset per frame so it "hums"
    for k, c in ((0.78, '5'), (0.5, '5'), (0.24, '4')):
        kk = k + (0.06 if f else 0)
        ring(g, cx + 1, cy + 1, rx * kk, ry * kk, c, only='2345', t=0.72)
    if face:
        eye(g, cx - round(rx * 0.42), cy - round(ry * 0.32), 4)
        eye(g, cx + round(rx * 0.42) - 1, cy - round(ry * 0.32), 4)
        if mouth:   # round "O" mouth
            my = cy + round(ry * 0.25)
            oval(g, cx + 0.5, my + 1, 2.6, 2.4 + (0.6 if f else 0), 'e')
            px(g, cx, my + 1, 'm')
        px(g, cx - round(rx * 0.62), cy + 1, 'r'); px(g, cx + round(rx * 0.62), cy + 1, 'r')

def sound_arcs(g, cx, cy, r, side, c, n=2, gap=4):
    for i in range(n):
        rr = r + i * gap
        for a in range(-40, 41, 8):
            t = math.radians(a)
            px(g, round(cx + side * rr * math.cos(t)), round(cy + rr * math.sin(t)), c)

def echo(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = -f
    oy = 12 if back else 6
    # a little wavy tail where a blob would sit
    for i in range(3):
        ball(g, cx - 6 + i * 6, 42 + oy + b + (i % 2), 3, 2.4, '234')
    echo_body(g, cx, 30 + oy + b, 14, 13, face=not back, f=f)
    sound_arcs(g, cx + 16, 30 + oy + b, 3, 1, 'c', n=2 + f)
    sound_arcs(g, cx - 17, 30 + oy + b, 3, -1, 'c', n=3 - f)
    outline_except(g, 'o')
    return g

# ====================================================================== THE CHOIR (sound)
# three echo heads in one choir robe, stacked, singing
def choir(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2
    oy = 8 if back else 0
    # robe: wide bell shape, violet, white collar
    for y in range(26 + oy, 56):
        t = (y - 26 - oy) / 30
        hw = round(14 + 9 * t)
        for x in range(cx - hw, cx + hw + 1):
            u = (x - (cx - hw)) / (2 * hw)
            g[y][x] = 'V' if u < 0.15 else 'v' if u < 0.6 else 'u' if u < 0.85 else 'U'
    for x in range(cx - 20, cx + 21, 7):   # robe folds
        for y in range(36 + oy, 56):
            if g[y][x] in 'vV': g[y][x] = 'u'
    # sleeves holding a hymn book (front)
    if not back:
        rect(g, cx - 7, 40 + oy, 14, 8, 'k'); hline(g, cx - 7, 40 + oy, 14, 'K'); vline(g, cx, 40 + oy, 8, 'K')
        for s in (-1, 1): ball(g, cx + s * 9, 43 + oy, 4, 4, 'uvV', bias=0.1)
    # three heads: two at the shoulders, one on top (they bob out of sync)
    heads = [(cx - 10, 26, 0), (cx + 10, 26, 1), (cx, 13, 0)]
    for i, (hx, hy, ph) in enumerate(heads):
        bb = -1 if (f + ph) % 2 else 0
        echo_body(g, hx, hy + oy + bb, 9, 8.5, face=not back, f=(f + i) % 2)
    # white collars under the lower heads
    for hx in (cx - 10, cx + 10):
        hline(g, hx - 5, 34 + oy, 10, 'W'); hline(g, hx - 4, 35 + oy, 8, 'W')
    # notes floating up
    for i, (x, y) in enumerate([(cx - 22, 10), (cx + 20, 6), (cx + 23, 26)] if f == 0 else [(cx - 23, 6), (cx + 21, 12), (cx - 24, 24)]):
        note(g, x, y + oy, 'n' if i % 2 else 'c')
    outline_except(g, 'o')
    return g

ECHO_LEG = ("{ o: '#1e3a5a', 1: '#3a7aa8', 2: '#5aaad0', 3: '#88d0e8', 4: '#b8ecf6', 5: '#e8fbff', "
            "e: '#1e2a48', w: '#ffffff', m: '#e88aa0', r: '#f2a0b8', c: '#5aaad0', z: '#00000033', "
            "V: '#a890e0', v: '#7a62c0', u: '#5a449a', U: '#3a2a70', k: '#3a2a3a', K: '#f2ead6', W: '#ffffff', n: 'au2' }")

MONS = [('mannequin', mannequin, MANN_LEG), ('storespirit', storespirit, SPIRIT_LEG),
        ('cactus', cactus, CACT_LEG), ('saguaro', saguaro, CACT_LEG),
        ('echo', echo, ECHO_LEG), ('choir', choir, ECHO_LEG)]

out = ["// Cracky — monster battle sprites, batch 2 (front 56x56, back 64x64). Generated by tools/gen_mons_2.py.",
       "(function () {", "const S = Sprout;"]
for name, fn, leg in MONS:
    for back in (False, True):
        W = 64 if back else 56
        frames = "\n".join(js(f"idle{f}", fn(f, back)) for f in (0, 1))
        out.append(f"S.sprite('{name}_{'back' if back else 'front'}', {{ w: {W}, h: {W}, origin: [{W // 2}, {W}],\n  legend: {leg},\n  frames: {{\n{frames}\n  }} }});")
out.append("})();")
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'mons_2.js'), 'w').write("\n".join(out) + "\n")
