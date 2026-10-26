"""Cracky monsters, batch 1: the evolutions of the first six (front 56x56, back 64x64, 2 idle frames).
Writes cracky/mons_1.js. Same palette families as tools/gen_cracky_mons.py so each line reads as one family."""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

# ---------------------------------------------------------------- helpers (copied from gen_cracky_mons.py)
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

def eye(g, cx, cy, h=4, w=2):
    rect(g, cx, cy, w, h, 'e')
    px(g, cx, cy, 'w')
    if h > 3: px(g, cx, cy + 1, 'w')

def zigzag(g, x, y, c, n=5, flip=False):
    for i in range(n):
        px(g, x + ((i % 2) * (-1 if flip else 1)), y + i, c)

def bolt(g, x, y, c, c2=None):
    """A small lightning bolt (7 tall)."""
    pts = [(2, 0), (1, 1), (1, 2), (0, 3), (1, 3), (2, 3), (1, 4), (1, 5), (0, 6)]
    for (dx, dy) in pts: px(g, x + dx, y + dy, c)
    if c2: px(g, x + 2, y, c2)

def spiral(g, cx, cy, s, r0=6.6, turns=1.7):
    """A coiled cable horn: a thick dark spiral with a lit edge on its upper-left."""
    pts = []
    n = 120
    for i in range(n + 1):
        t = i / n
        a = math.pi * (1.25 if s < 0 else 1.75) + s * t * turns * 2 * math.pi
        r = r0 * (1 - 0.8 * t)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    for (x, y) in pts:
        for dx in (0, 1):
            for dy in (0, 1): px(g, int(x - 0.5) + dx, int(y - 0.5) + dy, 'k')
    for (x, y) in pts:
        if x - cx + y - cy < -2: px(g, int(x - 0.5), int(y - 0.5), 'h')
        else: px(g, int(x - 0.5), int(y - 0.5), 'K')

def tri(g, pts, c):
    (x1, y1), (x2, y2), (x3, y3) = pts
    d = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
    if d == 0: return
    for y in range(min(y1, y2, y3), max(y1, y2, y3) + 1):
        for x in range(min(x1, x2, x3), max(x1, x2, x3) + 1):
            a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / d
            b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / d
            if a >= 0 and b >= 0 and a + b <= 1: px(g, x, y, c)

# ====================================================================== THUNDER RAM (static, from STATIC LAMB)
# a storm-cloud ram: dark wool with lightning, coiled antenna-cable horns, a big CRT face
def thunderram(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 8 if back else 0
    # antenna (signature from the lamb), taller, glowing tips
    for (x1, s) in ((cx - 12, -1), (cx + 12, 1)):
        line(g, cx + s * 2, 14 + oy + b, x1, 1 + oy + b, 'k')
        ball(g, x1, 2 + oy + b, 2.2, 2.2, 'yY')
    # thick legs with dark hooves
    for lx in (cx - 14, cx - 7, cx + 4, cx + 11):
        rect(g, lx, 44 + oy, 4, 9, 'f'); vline(g, lx, 44 + oy, 9, 'F'); px(g, lx + 3, 44 + oy, 'F')
        rect(g, lx, 51 + oy, 4, 2, 'k')
    # storm-cloud wool: big body + billows
    puffs = [(cx, 32, 21, 14), (cx - 18, 26, 8, 7.5), (cx + 18, 26, 8, 7.5), (cx - 16, 39, 9, 7), (cx + 16, 39, 9, 7),
             (cx, 43, 13, 6.5), (cx - 9, 18, 8, 7), (cx + 9, 18, 8, 7), (cx, 14, 8, 6)]
    for (x, y, rx, ry) in puffs:
        ball(g, x, y + oy + b, rx, ry, '123445', bias=0.05, edge='1')
    # lightning crackling through the wool
    for (x, y) in ((cx - 18, 30), (cx + 15, 36), (cx - 8, 40)) if not back else ((cx - 14, 26), (cx + 10, 34), (cx - 4, 40), (cx + 16, 22)):
        bolt(g, x, y + oy + b, 'y' if (x + f) % 2 else 'Y')
    if not back:
        # coiled cable horns, curling forward on both sides of the face
        for s in (-1, 1):
            hx = cx + s * 13
            spiral(g, hx, 25 + b, s)
        # big CRT face screen
        x0, y0 = cx - 9, 22 + b
        rect(g, x0, y0, 18, 15, 'k')
        rect(g, x0 + 1, y0 + 1, 16, 13, 's')
        for y in range(y0 + 2, y0 + 14, 2): hline(g, x0 + 1, y, 16, 'S')
        for (x, y) in ((x0 + 1, y0 + 1), (x0 + 16, y0 + 1), (x0 + 1, y0 + 13), (x0 + 16, y0 + 13)): px(g, x, y, 'k')
        hline(g, x0 + 2, y0 + 1, 4, 'W'); px(g, x0 + 2, y0 + 2, 'W')
        # confident eyes: brows slanted in, eyes a little narrowed
        eye(g, cx - 6, y0 + 5, 4); eye(g, cx + 3, y0 + 5, 4)
        hline(g, cx - 7, y0 + 3, 3, 'e'); px(g, cx - 4, y0 + 4, 'e')
        hline(g, cx + 4, y0 + 3, 3, 'e'); px(g, cx + 3, y0 + 4, 'e')
        # smirk
        hline(g, cx - 2, y0 + 11, 4, 'e'); px(g, cx + 2, y0 + 10, 'e')
        px(g, x0 + 2, y0 + 9, 'p'); px(g, x0 + 15, y0 + 9, 'p')
    else:
        # horns seen from behind + back of the screen
        for s in (-1, 1):
            hx = cx + s * 13
            spiral(g, hx, 19 + oy + b, s)
        rect(g, cx - 6, 22 + oy + b, 12, 6, 'F'); hline(g, cx - 6, 22 + oy + b, 12, 'f')
        for x in range(cx - 5, cx + 5, 2): px(g, x, 25 + oy + b, 'k')
    # sparks around (alternate per frame)
    sp = [(3, 12), (W - 6, 18), (4, 40), (W - 5, 44)] if f == 0 else [(4, 22), (W - 5, 10), (W - 7, 36), (5, 46)]
    for i, (x, y) in enumerate(sp):
        zigzag(g, x, y + oy - (2 if back else 0), 'y' if i % 2 else 'c', 5, flip=i % 2 == 1)
    outline_except(g, 'o')
    return g
THUNDER_LEG = ("{ o: '#1c2238', 1: '#3a4568', 2: '#53618a', 3: '#7282aa', 4: '#94a4c8', 5: '#c0cce4', "
               "f: '#454c66', F: '#2e3448', k: '#1e2234', K: '#3c4260', h: '#7a86a8', s: '#b8c6dc', S: '#9eaec8', W: '#eef6ff', "
               "e: 'ink', w: '#ffffff', p: 'blush', y: 'au2', Y: 'au3', c: 'wa3' }")

# ====================================================================== LAUNDRY WRAITH (curse, from LOST SOCK)
# a floating laundry-pile ghost: a sheet body, sock-striped arms, a clothespin on its head, hollow glowing eyes
def wraith(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = -f
    oy = 6 if back else 0
    # green wisps (behind)
    for (x, y) in ((cx - 22, 12), (cx + 22, 8), (cx + 23, 22)) if f == 0 else ((cx - 22, 6), (cx + 22, 14), (cx - 23, 22)):
        ball(g, x, y + oy, 2.6, 3.6, 'gG'); px(g, x, y + oy - 4, 'g'); px(g, x - 1, y + oy - 5, 'G')
    # sock-striped arms reaching out from under the sheet (drawn after the sheet, below)
    # the sheet: a tall rounded body with a ragged hem
    ball(g, cx, 20 + oy + b, 15, 14, 'CCDDD', bias=0.1)
    for y in range(20 + oy + b, 44 + oy + b):
        t = (y - (20 + oy + b)) / 24
        hw = 15 + t * 4
        for x in range(int(cx - hw), int(cx + hw) + 1):
            rel = (x - (cx - hw)) / (2 * hw)
            g[y][x] = 'D' if rel < 0.2 else 'C' if rel < 0.62 else 'B' if rel < 0.86 else 'A'
    # ragged hem: three points, wave with the frame
    hem = 44 + oy + b
    for i, x0 in enumerate(range(cx - 19, cx + 20, 8)):
        dy = 4 if (i + f) % 2 else 2
        for k in range(dy):
            for x in range(x0 + k, x0 + 8 - k):
                if 0 <= x < W: g[hem + k][x] = 'B' if x > cx + 6 else 'C'
    # fold shadows down the sheet
    for x, y0 in ((cx + 6, 26), (cx - 5, 32), (cx + 11, 34)):
        vline(g, x, y0 + oy + b, 8, 'B')
    # a single sock stripe band across the middle (it's still part sock)
    for y in (33 + oy + b, 34 + oy + b):
        for x in range(W):
            c = g[y][x]
            if c in 'ABCD': g[y][x] = {'A': '1', 'B': '2', 'C': '3', 'D': '4'}[c]
    # sock-striped arms: out of the sheet's sides, drooping down and outward
    for s_ in (-1, 1):
        for i in range(14):
            x = cx + s_ * (16 + i * 0.6); y = 27 + oy + b + i
            band = (i // 3) % 2
            for dx in range(-2, 3):
                lit = (dx * s_) < 0
                c = ('3' if lit else '2') if band else ('B' if lit else 'A')
                if dx == -2 * s_: c = '4' if band else 'C'
                px(g, round(x) + dx, y, c)
        ball(g, cx + s_ * 24, 42 + oy + b, 3.4, 3, '1233', bias=0.1)
    # clothespin on the head (wood)
    px0 = cx + 3
    rect(g, px0, 2 + oy + b, 3, 8, 'P'); vline(g, px0, 2 + oy + b, 8, 'Q'); rect(g, px0 + 3, 3 + oy + b, 2, 7, 'R')
    rect(g, px0, 6 + oy + b, 5, 1, 'm')
    if not back:
        # hollow eyes with a green glow inside
        for ex in (cx - 8, cx + 3):
            oval(g, ex + 2.5, 19 + b, 3, 4, 'k')
            rect(g, ex + 2, 19 + b, 2, 3, 'G'); px(g, ex + 2, 19 + b, 'g')
        # jagged mouth with one fang (the sock's)
        for i, x in enumerate(range(cx - 4, cx + 5)): px(g, x, 27 + b + (i % 2), 'k')
        px(g, cx + 1, 29 + b, 'w')
        px(g, cx - 10, 25 + b, 'p'); px(g, cx - 9, 25 + b, 'p'); px(g, cx + 8, 25 + b, 'p'); px(g, cx + 9, 25 + b, 'p')
    outline_except(g, 'o')
    # floating shadow
    sy = 54 if not back else 63
    for x in range(cx - 12, cx + 12): px(g, x, sy, 'z')
    return g
WRAITH_LEG = ("{ o: '#2a1a40', 1: '#5a3a8a', 2: '#7c58b0', 3: '#a07ed4', 4: '#c8acf0', A: '#b8a888', B: '#dccfae', "
              "C: '#f2ead2', D: '#fffcf0', k: '#1a1028', e: 'ink', w: '#ffffff', p: 'blush', g: '#8ae0a0', G: '#4cb87a', "
              "P: '#c8823a', Q: '#f0c070', R: '#8a5428', m: '#5a5868', z: '#00000033' }")

# ====================================================================== MASTER DECK (sound, from CASSETTE MITE)
# a boombox beast: double tape deck body, two big speaker eyes, carry handle like horns, six stubby legs
def masterdeck(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 8 if back else 4
    # six stubby legs
    for i, lx in enumerate((cx - 20, cx - 12, cx - 4, cx + 3, cx + 11, cx + 19)):
        s = (i + f) % 2
        rect(g, lx - 1, 40 + oy, 3, 6 - s, 'k'); rect(g, lx - 2, 45 + oy - s, 5, 2, '1')
    # carry handle (like horns), behind the body
    hx0, hx1, hy = cx - 15, cx + 15, 9 + oy + b
    rect(g, hx0, hy, 3, 7, '2'); rect(g, hx1 - 2, hy, 3, 7, '2')
    rect(g, hx0, hy - 3, hx1 - hx0 + 1, 3, '3'); hline(g, hx0, hy - 3, hx1 - hx0 + 1, '4')
    # antenna from the handle
    line(g, hx1 - 1, hy - 3, hx1 + 7, hy - 12, 'k'); px(g, hx1 + 7, hy - 12, 'n'); px(g, hx1 + 8, hy - 13, 'n')
    # body
    x0, y0, w, h = cx - 25, 15 + oy + b, 50, 27
    rect(g, x0, y0, w, h, '2'); hline(g, x0, y0, w, '3'); hline(g, x0, y0 + 1, w, '3'); vline(g, x0, y0, h, '3')
    hline(g, x0, y0 + h - 1, w, '1'); vline(g, x0 + w - 1, y0, h, '1'); vline(g, x0 + w - 2, y0 + 2, h - 3, '1')
    for (sx, sy) in ((x0 + 2, y0 + 2), (x0 + w - 3, y0 + 2), (x0 + 2, y0 + h - 3), (x0 + w - 3, y0 + h - 3)): px(g, sx, sy, '4')
    # red/orange stripe across the top (from the mite's label)
    hline(g, x0 + 3, y0 + 3, w - 6, 'r'); hline(g, x0 + 3, y0 + 4, w - 6, 'R')
    if not back:
        # speaker eyes
        for ex in (cx - 15, cx + 15):
            oval(g, ex, y0 + 14, 8.5, 8.5, '1'); oval(g, ex, y0 + 14, 7.5, 7.5, 'S')
            oval(g, ex, y0 + 14, 5.5, 5.5, 'T'); oval(g, ex, y0 + 14, 3.2, 3.2, 'e')
            oval(g, ex + 0.5, y0 + 14.5, 1.6, 1.6, 'K')
            px(g, ex - 4, y0 + 10, 'w'); px(g, ex - 3, y0 + 10, 'w'); px(g, ex - 4, y0 + 11, 'w')
            # speaker grille ring dots
            for a in range(0, 360, 45):
                px(g, round(ex + 6.5 * math.cos(math.radians(a))), round(y0 + 14 + 6.5 * math.sin(math.radians(a))), '1')
        # double tape deck in the middle = the mouth
        rect(g, cx - 6, y0 + 7, 12, 15, '1')
        for dy in (8, 15):
            rect(g, cx - 5, y0 + dy, 10, 6, 'L'); hline(g, cx - 5, y0 + dy, 10, 'M')
            px(g, cx - 3, y0 + dy + 3, 'e'); px(g, cx + 2, y0 + dy + 3, 'e'); hline(g, cx - 2, y0 + dy + 3, 4, 'T')
        # buttons along the bottom
        for i, x in enumerate(range(x0 + 6, x0 + w - 6, 5)):
            rect(g, x, y0 + h - 4, 3, 2, 'r' if i == 3 else '4')
    else:
        # back panel: battery hatch, screws, a cable
        rect(g, cx - 14, y0 + 8, 28, 13, '3'); hline(g, cx - 14, y0 + 8, 28, '4'); hline(g, cx - 14, y0 + 20, 28, '1')
        for x in range(cx - 12, cx + 12, 3): vline(g, x, y0 + 10, 9, '2')
        for sx in (x0 + 4, x0 + w - 5): px(g, sx, y0 + 10, '1'); px(g, sx, y0 + 18, '1')
        for i in range(10):
            px(g, x0 + w - 2 + i // 3, y0 + h - 6 + i, 'k')
    # floating notes, swapping sides
    notes = [(3, 8), (W - 9, 14)] if f == 0 else [(5, 16), (W - 8, 6)]
    for i, (nx, ny) in enumerate(notes):
        c = 'n' if i % 2 == 0 else 'N'
        rect(g, nx, ny + 4 + oy, 2, 2, c); vline(g, nx + 1, ny - 1 + oy, 5, c); px(g, nx + 2, ny - 1 + oy, c); px(g, nx + 3, ny + oy, c)
    outline_except(g, 'o')
    return g
DECK_LEG = ("{ o: '#1a1624', 1: '#2a2836', 2: '#3e3c50', 3: '#5a5872', 4: '#8a88a8', k: '#2a2836', T: '#7a4a2e', "
            "L: '#f4ead2', M: '#fffaf0', r: '#e04e42', R: '#f8a050', S: '#5a5872', K: '#3e3c50', e: 'ink', w: '#ffffff', "
            "n: 'au2', N: '#78b8f8' }")

# ====================================================================== RAT MANAGER (dark, from MALL RAT)
def ratmanager(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 8 if back else 0
    # tail (behind), bigger curl
    for i in range(26):
        t = i / 25
        x = round(cx + 14 + 11 * t + 4 * math.sin(t * 5)); y = round(50 + oy - 26 * t + 3 * math.cos(t * 5))
        px(g, x, y, 't'); px(g, x + 1, y, 'T')
    # feet
    for s in (-1, 1): ball(g, cx + s * 8, 53 + oy, 5, 2.6, 'tT')
    # body (shirt)
    ball(g, cx, 41 + oy, 15, 13, '12334', bias=0.0, edge='1')
    if not back:
        # short-sleeve shirt + tie + badge
        for y in range(31 + oy, 52 + oy):
            for x in range(cx - 11, cx + 12):
                if g[y][x] in '1234': g[y][x] = 'H' if x < cx - 6 else 'h' if x < cx + 6 else 'J'
        tri(g, [(cx - 5, 30 + oy), (cx, 35 + oy), (cx - 1, 31 + oy)], 'h')
        tri(g, [(cx + 5, 30 + oy), (cx, 35 + oy), (cx + 1, 31 + oy)], 'J')
        # tie
        rect(g, cx - 1, 32 + oy, 3, 2, 'r'); tri(g, [(cx - 2, 34 + oy), (cx + 2, 34 + oy), (cx, 46 + oy)], 'r')
        vline(g, cx + 1, 35 + oy, 9, 'R')
        # MANAGER badge
        rect(g, cx - 10, 37 + oy, 6, 4, 'G'); hline(g, cx - 10, 37 + oy, 6, 'g'); hline(g, cx - 9, 39 + oy, 4, 'k')
        # arms holding a clipboard
        rect(g, cx + 3, 39 + oy, 11, 13, 'c'); rect(g, cx + 4, 41 + oy, 9, 10, 'C')
        for yy in (43, 45, 47): hline(g, cx + 5, yy + oy, 6, '2')
        rect(g, cx + 6, 38 + oy, 5, 2, 'm')
        ball(g, cx + 3, 44 + oy, 3, 3, '23'); ball(g, cx + 13, 46 + oy, 3, 3, '23')
    else:
        # shirt back + collar
        for y in range(30 + oy, 52 + oy):
            for x in range(cx - 13, cx + 14):
                if g[y][x] in '1234': g[y][x] = 'H' if x < cx - 6 else 'h' if x < cx + 7 else 'J'
        hline(g, cx - 5, 30 + oy, 11, 'J')
    # ears
    for s in (-1, 1):
        ball(g, cx + s * 14, 11 + oy + b, 7.5, 7.5, '1233', edge='1')
        if not back: oval(g, cx + s * 14, 12 + oy + b, 4.6, 4.6, 'T'); oval(g, cx + s * 14 + 0.5, 12.5 + oy + b, 3, 3, 't')
    # head
    ball(g, cx, 23 + oy + b, 13.5, 11, '12334', bias=0.05, edge='1')
    if not back:
        ball(g, cx, 28 + b, 7, 4.5, 'bB', bias=0.2)
        rect(g, cx - 1, 25 + b, 3, 2, 't'); px(g, cx - 1, 25 + b, 'T')
        rect(g, cx - 1, 30 + b, 3, 2, 'w'); px(g, cx, 31 + b, 'B')
        # unimpressed half-lidded eyes
        for ex in (cx - 7, cx + 4):
            rect(g, ex, 19 + b, 4, 3, 'e'); hline(g, ex, 19 + b, 4, '1'); hline(g, ex - 1, 18 + b, 5, 'e')
            px(g, ex, 20 + b, 'w')
        for s in (-1, 1):
            hline(g, cx + (9 if s > 0 else -13), 27 + b, 5, 'k')
            hline(g, cx + (9 if s > 0 else -12), 29 + b + (1 if s > 0 else 0), 4, 'k')
    outline_except(g, 'o')
    return g
RATM_LEG = ("{ o: '#241c30', 1: '#3e3450', 2: '#5e5274', 3: '#857a9c', 4: '#b0a8c4', b: '#d8d0e0', B: '#b8aecb', "
            "t: '#f2a0b0', T: '#c86a86', k: '#3e3450', e: 'ink', w: '#ffffff', h: '#eef0f6', H: '#ffffff', J: '#c4c8d8', "
            "r: '#e04e42', R: '#a8323a', g: '#fff0a0', G: '#ecc548', c: '#a8683e', C: '#f4ead2', m: '#8a88a8' }")

# ====================================================================== PIZZA PIGEON (gate, from COURIER PIGEON)
def pizzapigeon(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 8 if back else 2
    # feet
    for s in (-1, 1):
        for i in range(3): line(g, cx + s * 6, 50 + oy, cx + s * 6 + (i - 1) * 2, 53 + oy, 'f')
    # wings
    for s in (-1, 1):
        ball(g, cx + s * 16, 37 + oy - f, 7.5, 12, '1223', bias=0.0 if s < 0 else -0.2, edge='1')
        for i in range(3): px(g, cx + s * 16 + (i - 1) * 2, 48 + oy - f, '1')
    # chunky body
    ball(g, cx, 37 + oy, 16, 15, '12334', bias=0.0, edge='1')
    # head
    ball(g, cx, 17 + oy + b, 10, 9, '12334', bias=0.05, edge='1')
    for y in range(25, 30):
        for x in range(cx - 12, cx + 13):
            if g[y + oy][x] in '1234': g[y + oy][x] = 'n' if y < 27 else 'N'
    if not back:
        rect(g, cx - 1, 19 + oy + b, 3, 2, 'k'); px(g, cx, 21 + oy + b, 'k'); px(g, cx - 1, 18 + oy + b, 'W'); px(g, cx + 1, 18 + oy + b, 'W')
        for ex in (cx - 7, cx + 5):
            rect(g, ex, 15 + oy + b, 3, 3, 'y'); px(g, ex + 1, 16 + oy + b, 'e'); px(g, ex, 15 + oy + b, 'w')
        # pizza box held in front of the belly
        bx0, by0 = cx - 13, 42 + oy
        rect(g, bx0, by0, 26, 4, 'X'); hline(g, bx0, by0, 26, 'x'); hline(g, bx0, by0 + 3, 26, 'Z')
        # open lid leaning back with the pizza showing
        rect(g, bx0 + 1, by0 - 9, 24, 9, 'x'); hline(g, bx0 + 1, by0 - 9, 24, 'X')
        oval(g, cx, by0 - 4, 10, 4, 'u'); oval(g, cx, by0 - 4, 8.5, 3, 'v')
        for (x, y) in ((cx - 5, -5), (cx + 2, -3), (cx - 1, -6), (cx + 6, -5), (cx - 7, -3)): px(g, x, by0 + y, 'r')
        # missing slice
        tri(g, [(cx, by0 - 4), (cx + 9, by0 - 6), (cx + 9, by0 - 2)], 'x')
        # wing tips holding the box
        ball(g, bx0 + 1, by0 + 2, 3, 2.5, '23'); ball(g, bx0 + 25, by0 + 2, 3, 2.5, '12')
    # delivery cap (teal) with a bill
    rect(g, cx - 7, 6 + oy + b, 14, 4, 'c'); hline(g, cx - 6, 5 + oy + b, 12, 'c'); hline(g, cx - 6, 6 + oy + b, 7, 'C')
    if not back: hline(g, cx - 9, 10 + oy + b, 11, 'K'); hline(g, cx - 8, 9 + oy + b, 3, 'y')
    else: hline(g, cx - 5, 10 + oy + b, 10, 'K')
    if back:
        # pizza box stack strapped on its back
        rect(g, cx - 11, 26 + oy, 22, 5, 'X'); hline(g, cx - 11, 26 + oy, 22, 'x'); rect(g, cx - 11, 31 + oy, 22, 4, 'x'); hline(g, cx - 11, 34 + oy, 22, 'Z')
        vline(g, cx, 26 + oy, 9, 'S')
    outline_except(g, 'o')
    return g
PIZZA_LEG = ("{ o: '#1e2234', 1: '#4a5470', 2: '#6c7896', 3: '#96a2bc', 4: '#c4ccdc', n: '#4cb88a', N: '#9a6ad0', f: '#e07a8a', "
             "k: '#2e2a3a', K: '#1f6070', W: '#e8e4ec', y: '#f8a040', e: 'ink', w: '#ffffff', S: '#7a4a2e', "
             "c: '#2e8c90', C: '#4cb8aa', x: '#e8c890', X: '#c8a068', Z: '#9a7448', u: '#e8a040', v: '#f8d878', r: '#d83838' }")

# ====================================================================== PHISHING KING (static, from SPAM)
# a regal envelope with a crown of fishhooks, a junk-mail cape and a hook tail
def phishking(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = -f * 2
    oy = 8 if back else 2
    # cape of junk mail (behind): a wide trapezoid of red with letter patches
    for y in range(18 + oy, 52 + oy):
        t = (y - 18 - oy) / 34
        hw = 16 + t * 8 + (1 if (y + f) % 6 < 3 and y > 44 + oy else 0)
        for x in range(int(cx - hw), int(cx + hw) + 1):
            rel = (x - (cx - hw)) / (2 * hw)
            g[y][x] = 'Q' if rel < 0.25 else 'q' if rel < 0.7 else 'j'
    for (x, y) in ((cx - 19, 40), (cx + 14, 44), (cx - 12, 48), (cx + 6, 49)):
        rect(g, x, y + oy, 6, 4, '3'); hline(g, x, y + oy, 6, '4'); px(g, x + 1, y + oy + 1, '2'); px(g, x + 4, y + oy + 1, '2')
    # hook tail curling out on the right
    for i in range(18):
        t = i / 17
        x = round(cx + 18 + 6 * math.sin(t * 3.6)); y = round(50 + oy - 10 * t)
        px(g, x, y, 'H'); px(g, x + 1, y, 'h')
    px(g, cx + 22, 39 + oy, 'H'); px(g, cx + 21, 38 + oy, 'H')
    # envelope body
    x0, y0, w, h = cx - 18, 16 + oy + b, 36, 26
    rect(g, x0, y0, w, h, '3'); hline(g, x0, y0, w, '4'); vline(g, x0, y0, h, '4'); hline(g, x0, y0 + h - 1, w, '1'); vline(g, x0 + w - 1, y0, h, '2')
    for i in range(18):
        px(g, x0 + i, y0 + 10 + i * 14 // 18, '2'); px(g, x0 + w - 1 - i, y0 + 10 + i * 14 // 18, '2')
    if not back:
        for i in range(18):
            px(g, x0 + i, y0 + i * 10 // 18, '2'); px(g, x0 + w - 1 - i, y0 + i * 10 // 18, '2')
        # sly half-lidded eyes + smirk
        for ex in (cx - 9, cx + 5):
            rect(g, ex, y0 + 8, 4, 3, 'e'); hline(g, ex, y0 + 8, 4, '2'); hline(g, ex - 1, y0 + 7, 6, 'e'); px(g, ex, y0 + 9, 'w')
        hline(g, cx - 4, y0 + 15, 8, 'e'); px(g, cx + 4, y0 + 14, 'e'); px(g, cx + 5, y0 + 13, 'e'); px(g, cx - 5, y0 + 14, 'e')
        px(g, cx + 2, y0 + 16, 'w')
        # red !!! stamp
        rect(g, x0 + w - 9, y0 + h - 9, 7, 7, 'r'); vline(g, x0 + w - 7, y0 + h - 8, 3, 'W'); px(g, x0 + w - 7, y0 + h - 4, 'W')
        vline(g, x0 + w - 5, y0 + h - 8, 3, 'W'); px(g, x0 + w - 5, y0 + h - 4, 'W')
    else:
        for i in range(18):
            px(g, x0 + i, y0 + i * 13 // 18, '2'); px(g, x0 + w - 1 - i, y0 + i * 13 // 18, '2')
        oval(g, cx, y0 + 13, 3.5, 3.5, 'r'); px(g, cx - 1, y0 + 12, 'R')
    # crown of fishhooks: a gold band with hook points
    cy0 = y0 - 4
    rect(g, cx - 12, cy0, 24, 4, 'G'); hline(g, cx - 12, cy0, 24, 'g')
    for hx in (cx - 9, cx, cx + 9):
        # shank up from the band, bend over the top, point coming back down with a barb
        vline(g, hx, cy0 - 7, 7, 'G'); vline(g, hx + 1, cy0 - 7, 7, 'k')
        hline(g, hx - 2, cy0 - 9, 3, 'g'); px(g, hx - 1, cy0 - 8, 'G'); px(g, hx, cy0 - 8, 'G')
        px(g, hx + 1, cy0 - 8, 'k')
        vline(g, hx - 3, cy0 - 8, 4, 'G'); px(g, hx - 2, cy0 - 5, 'G')
        px(g, hx - 1, cy0 - 7, '.')
    for hx in (cx - 5, cx + 4): px(g, hx, cy0 + 1, 'r')
    # static sparks
    for i, (x, y) in enumerate([(3, 12 + oy), (W - 6, 30 + oy)] if f == 0 else [(4, 30 + oy), (W - 6, 10 + oy)]):
        zigzag(g, x, y, 'y', 6, flip=i == 1)
    outline_except(g, 'o')
    return g
PHISH_LEG = ("{ o: '#3a2a3a', 1: '#b8a890', 2: '#d8ccb0', 3: '#f2ead6', 4: '#fffcf2', e: 'ink', w: '#ffffff', r: '#d83838', R: '#f88888', "
             "W: '#ffffff', y: 'au2', g: 'au3', G: 'au2', k: 'au0', h: '#c8cad8', H: '#8a8aa8', "
             "q: '#b8333c', Q: '#e2504a', j: '#7a1f2e' }")

MONS = [('thunderram', thunderram, THUNDER_LEG), ('wraith', wraith, WRAITH_LEG), ('masterdeck', masterdeck, DECK_LEG),
        ('ratmanager', ratmanager, RATM_LEG), ('pizzapigeon', pizzapigeon, PIZZA_LEG), ('phishking', phishking, PHISH_LEG)]

out = ["// Cracky — monster batch 1: evolutions of the first six. Generated by tools/gen_mons_1.py.", "(function () {", "const S = Sprout;"]
for name, fn, leg in MONS:
    for back in (False, True):
        W = 64 if back else 56
        frames = "\n".join(js(f"idle{f}", fn(f, back)) for f in (0, 1))
        out.append(f"S.sprite('{name}_{'back' if back else 'front'}', {{ w: {W}, h: {W}, origin: [{W // 2}, {W}],\n  legend: {leg},\n  frames: {{\n{frames}\n  }} }});")
out.append("})();")
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'mons_1.js'), 'w').write("\n".join(out) + "\n")
