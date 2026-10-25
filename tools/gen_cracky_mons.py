"""Cracky monsters: front (56x56) and back (64x64) battle sprites, 2 idle frames each.
Writes cracky/art_mons.js. Light from the upper left, dark coloured outlines (see STYLE.md)."""
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

def eye(g, cx, cy, h=4, w=2):
    """Tall dark eye with a white shine on the upper-left (same side on both eyes)."""
    rect(g, cx, cy, w, h, 'e')
    px(g, cx, cy, 'w')
    if h > 3: px(g, cx, cy + 1, 'w')

def zigzag(g, x, y, c, n=5, flip=False):
    for i in range(n):
        px(g, x + ((i % 2) * (-1 if flip else 1)), y + i, c)

# ====================================================================== STATIC LAMB
# a TV-static sheep: cloud of wool, a little CRT screen for a face, rabbit-ear antenna
def lamb(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f            # b = bob
    oy = 10 if back else 0
    # antenna (behind the wool)
    for (x1, s) in ((cx - 9, -1), (cx + 9, 1)):
        line(g, cx + s, 16 + oy + b, x1, 3 + oy + b, 'k')
        ball(g, x1, 3 + oy + b, 2, 2, 'yY')
    # legs
    for lx in (cx - 11, cx - 5, cx + 4, cx + 10):
        rect(g, lx, 44 + oy, 3, 8 - (0 if not back else 0), 'f'); vline(g, lx, 44 + oy, 8, 'F')
        hline(g, lx, 51 + oy, 3, 'k')
    # wool: a big body plus puffs around it
    puffs = [(cx, 32, 17, 13), (cx - 15, 27, 7, 6.5), (cx + 15, 27, 7, 6.5), (cx - 13, 39, 8, 6), (cx + 13, 39, 8, 6),
             (cx, 41, 11, 6), (cx - 7, 19, 7, 6), (cx + 7, 19, 7, 6), (cx, 15, 7, 5.5)]
    for (x, y, rx, ry) in puffs:
        ball(g, x, y + oy + b, rx, ry, '12344', bias=0.05, edge='1')
    if not back:
        # ears poking out sideways
        for s in (-1, 1):
            ball(g, cx + s * 11, 26 + b, 3.5, 2.2, 'fF')
        # CRT screen face with scanlines
        rect(g, cx - 7, 24 + b, 14, 12, 'k')
        rect(g, cx - 6, 25 + b, 12, 10, 's')
        for y in range(26 + b, 35 + b, 2): hline(g, cx - 6, y, 12, 'S')
        px(g, cx - 6, 25 + b, 'k'); px(g, cx + 5, 25 + b, 'k'); px(g, cx - 6, 34 + b, 'k'); px(g, cx + 5, 34 + b, 'k')
        hline(g, cx - 5, 25 + b, 3, 'W')          # glass glare
        eye(g, cx - 4, 28 + b); eye(g, cx + 2, 28 + b)
        hline(g, cx - 1, 33 + b, 2, 'e')            # tiny mouth
        px(g, cx - 6, 32 + b, 'p'); px(g, cx + 5, 32 + b, 'p')
    else:
        # back of the screen poking through the wool
        rect(g, cx - 5, 23 + oy + b, 10, 6, 'F'); hline(g, cx - 5, 23 + oy + b, 10, 'f')
        for x in range(cx - 4, cx + 4, 2): px(g, x, 26 + oy + b, 'k')
    # static sparks
    sp = [(4, 14), (W - 7, 20), (6, 36)] if f == 0 else [(5, 22), (W - 6, 12), (W - 8, 34)]
    for i, (x, y) in enumerate(sp):
        zigzag(g, x, y + oy, 'y' if i % 2 else 'c', 5, flip=i == 1)
    outline_except(g, 'o')
    return g
LAMB_LEG = "{ o: '#28304a', 1: '#7286ac', 2: '#9eb0d0', 3: '#c8d6ec', 4: '#f2f6fc', f: '#454c66', F: '#2e3448', k: '#22283a', s: '#b8c6dc', S: '#9eaec8', W: '#eef6ff', e: 'ink', w: '#ffffff', p: 'blush', y: 'au2', Y: 'au3', c: 'wa3' }"

# ====================================================================== LOST SOCK
# a lost striped sock, floating like a ghost; one fang
def sock(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2 + (2 if not back else 0); b = -f
    oy = 8 if back else 0
    # ghostly wisps (behind)
    for (x, y) in ((cx - 18, 30), (cx + 15, 22)) if f == 0 else ((cx - 17, 24), (cx + 16, 28)):
        ball(g, x, y + oy, 3, 4, 'gG'); px(g, x - 1, y + oy - 3, 'G'); px(g, x, y + oy - 5, 'g')
    # leg tube
    rx, top, bot = 9, 7 + oy + b, 38 + oy + b
    for y in range(top, bot):
        for x in range(cx - rx, cx + rx):
            g[y][x] = '3'
    # foot: curls to the left (front) / heel bulge (back)
    ball(g, cx - 8, 41 + oy + b, 14, 8, '1233', bias=0.1)
    ball(g, cx + 3, 39 + oy + b, 8, 7, '1233', bias=0.0)
    # shade the tube: lit left, dark right
    for y in range(top, bot):
        for x in range(cx - rx, cx + rx):
            t = (x - (cx - rx)) / (2 * rx)
            g[y][x] = '4' if t < 0.18 else '3' if t < 0.62 else '2' if t < 0.88 else '1'
    # stripes
    for sy in range(top + 10, bot + 6, 7):
        for y in (sy, sy + 1, sy + 2):
            for x in range(W):
                c = g[y][x] if 0 <= y < W else '.'
                if c in '1234': g[y][x] = {'1': 'A', '2': 'B', '3': 'C', '4': 'D'}[c]
    # toe + heel patches
    oval(g, cx - 18, 42 + oy + b, 5, 5, 'A', only='1234ABCD'); oval(g, cx - 18, 41 + oy + b, 4, 4, 'B', only='ABCD')
    oval(g, cx + 6, 41 + oy + b, 5, 5, 'A', only='1234ABCD'); oval(g, cx + 5, 40 + oy + b, 4, 4, 'B', only='ABCD')
    # ribbed cuff
    rect(g, cx - rx - 1, top - 1, 2 * rx + 2, 7, 'C')
    for x in range(cx - rx - 1, cx + rx + 1, 2): vline(g, x, top - 1, 7, 'B')
    hline(g, cx - rx - 1, top - 1, 2 * rx + 2, 'D')
    # dark opening at the top
    hline(g, cx - rx + 1, top - 2, 2 * rx - 2, 'k'); hline(g, cx - rx + 3, top - 3, 2 * rx - 6, 'k')
    if not back:
        eye(g, cx - 6, 15 + b, 5, 3); eye(g, cx + 3, 15 + b, 5, 3)
        px(g, cx - 4, 15 + b, 'e'); px(g, cx + 5, 15 + b, 'e')
        # wobbly mouth + one fang
        for i, x in enumerate(range(cx - 3, cx + 3)): px(g, x, 23 + b + (i % 2), 'e')
        px(g, cx + 1, 25 + b, 'w')
        px(g, cx - 8, 21 + b, 'p'); px(g, cx - 7, 21 + b, 'p'); px(g, cx + 6, 21 + b, 'p'); px(g, cx + 7, 21 + b, 'p')
    outline_except(g, 'o')
    # floating shadow
    sy = (52 if not back else 62)
    if sy < W:
        for x in range(cx - 10, cx + 8): px(g, x, sy - 1 if back else sy, 'z')
    return g
SOCK_LEG = "{ o: '#2a1a40', 1: '#5a3a8a', 2: '#7c58b0', 3: '#a07ed4', 4: '#c8acf0', A: '#c8b890', B: '#e8dcb4', C: '#f8f0d8', D: '#fffcf0', k: '#1a1028', e: 'ink', w: '#ffffff', p: 'blush', g: '#8ae0a0', G: '#4cb87a', z: '#00000033' }"

# ====================================================================== CASSETTE MITE
# a cassette tape bug: the reels are its eyes, six little legs, tape antennae
def mite(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 12 if back else 6
    # legs
    for i, lx in enumerate((cx - 15, cx - 7, cx + 1)):
        s = 1 if (i + f) % 2 else 0
        line(g, lx + 2, 34 + oy, lx - 2, 41 + oy - s, 'k'); line(g, lx + 3, 34 + oy, lx - 1, 41 + oy - s, 'k')
    for i, lx in enumerate((cx + 13, cx + 5, cx - 3)):
        s = 1 if (i + f) % 2 else 0
        line(g, lx, 34 + oy, lx + 4, 41 + oy - s, 'k'); line(g, lx + 1, 34 + oy, lx + 5, 41 + oy - s, 'k')
    # tape antennae
    for (x0, x1, s) in ((cx - 8, cx - 15, -1), (cx + 8, cx + 15, 1)):
        for i in range(12):
            t = i / 11
            px(g, round(x0 + (x1 - x0) * t + s * 2 * math.sin(t * 6)), round(14 + oy + b - 12 * t), 'T')
    # shell
    x0, y0, w, h = cx - 19, 12 + oy + b, 38, 24
    rect(g, x0, y0, w, h, '2'); hline(g, x0, y0, w, '3'); vline(g, x0, y0, h, '3'); hline(g, x0, y0 + h - 1, w, '1'); vline(g, x0 + w - 1, y0, h, '1')
    for (sx, sy) in ((x0 + 2, y0 + 2), (x0 + w - 3, y0 + 2), (x0 + 2, y0 + h - 3), (x0 + w - 3, y0 + h - 3)): px(g, sx, sy, '4')
    if not back:
        # label
        rect(g, x0 + 4, y0 + 3, w - 8, 15, 'L'); hline(g, x0 + 4, y0 + 3, w - 8, 'M')
        hline(g, x0 + 4, y0 + 6, w - 8, 'r'); hline(g, x0 + 4, y0 + 7, w - 8, 'R')
        # reel windows = eyes
        rect(g, x0 + 8, y0 + 9, w - 16, 7, 'k')
        for ex in (cx - 7, cx + 7):
            oval(g, ex, y0 + 12.5, 4, 4, 'W'); oval(g, ex, y0 + 12.5, 2.2, 2.2, 'e')
            px(g, ex - 2, y0 + 10, 'w')
            # reel teeth
            px(g, ex - 1 + (f % 2), y0 + 12, 'w')
        rect(g, cx - 3, y0 + 11, 6, 3, 'T')     # visible tape between the reels
        # mouth: the tape slot at the bottom edge, happy
        rect(g, cx - 6, y0 + h - 4, 12, 3, '1')
        for x in range(cx - 3, cx + 3): px(g, x, y0 + h - 3, 'e')
        px(g, cx - 4, y0 + h - 4, 'e'); px(g, cx + 3, y0 + h - 4, 'e')
        px(g, x0 + 5, y0 + h - 5, 'p'); px(g, x0 + 6, y0 + h - 5, 'p'); px(g, x0 + w - 7, y0 + h - 5, 'p'); px(g, x0 + w - 6, y0 + h - 5, 'p')
    else:
        rect(g, x0 + 6, y0 + 5, w - 12, 12, '3'); hline(g, x0 + 6, y0 + 5, w - 12, '4')
        for sx in (cx - 8, cx + 7): px(g, sx, y0 + 10, '1'); px(g, sx, y0 + 11, '1')
        for x in range(x0 + 8, x0 + w - 8, 3): px(g, x, y0 + 19, '1')
    # floating music note
    nx, ny = (W - 10, 8 + oy) if f == 0 else (6, 10 + oy)
    rect(g, nx, ny + 3, 2, 2, 'n'); vline(g, nx + 1, ny - 2, 5, 'n'); px(g, nx + 2, ny - 2, 'n'); px(g, nx + 3, ny - 1, 'n')
    outline_except(g, 'o')
    return g
MITE_LEG = "{ o: '#1a1624', 1: '#2a2836', 2: '#3e3c50', 3: '#5a5872', 4: '#8a88a8', k: '#2a2836', T: '#7a4a2e', L: '#f4ead2', M: '#fffaf0', r: '#e04e42', R: '#f8a050', W: '#d8d4e4', e: 'ink', w: '#ffffff', p: 'blush', n: 'au2' }"

# ====================================================================== MALL RAT
def rat(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 10 if back else 2
    # tail curling off to the right
    for i in range(22):
        t = i / 21
        x = round(cx + 12 + 10 * t + 4 * math.sin(t * 5)); y = round(46 + oy - 22 * t + 3 * math.cos(t * 5))
        px(g, x, y, 't'); px(g, x + 1, y, 'T')
    # feet
    for s in (-1, 1): ball(g, cx + s * 7, 49 + oy, 4, 2.5, 'tT')
    # body
    ball(g, cx, 38 + oy, 13, 12, '12334', bias=0.0, edge='1')
    if not back: oval(g, cx, 41 + oy, 7, 7, 'b')            # pale belly
    # ears
    for s in (-1, 1):
        ball(g, cx + s * 12, 11 + oy + b, 6.5, 6.5, '1233', edge='1')
        if not back: oval(g, cx + s * 12, 12 + oy + b, 4, 4, 'T'); oval(g, cx + s * 12 + 0.5, 12.5 + oy + b, 2.6, 2.6, 't')
    # head
    ball(g, cx, 22 + oy + b, 12, 10, '12334', bias=0.05, edge='1')
    if not back:
        # muzzle, nose, teeth
        ball(g, cx, 27 + oy + b, 6, 4, 'bB', bias=0.2)
        rect(g, cx - 1, 24 + oy + b, 2, 2, 't'); px(g, cx - 1, 24 + oy + b, 'T')
        rect(g, cx - 1, 29 + oy + b, 2, 2, 'w'); px(g, cx - 1, 31 + oy + b, 'B')
        eye(g, cx - 6, 18 + oy + b, 3); eye(g, cx + 4, 18 + oy + b, 3)
        for s in (-1, 1):
            hline(g, cx + (s * 8 if s > 0 else -11), 26 + oy + b, 4, 'k')
            hline(g, cx + (s * 8 if s > 0 else -11), 28 + oy + b + (1 if s > 0 else 0), 3, 'k')
        # arms holding a pretzel
        ball(g, cx - 5, 37 + oy, 3, 3, '23'); ball(g, cx + 5, 37 + oy, 3, 3, '23')
        for (x, y) in ((cx - 4, 33), (cx - 3, 32), (cx - 2, 33), (cx - 1, 34), (cx, 33), (cx + 1, 32), (cx + 2, 33), (cx + 3, 34),
                       (cx - 4, 34), (cx - 3, 35), (cx + 3, 35), (cx + 2, 35), (cx - 1, 35), (cx, 35)):
            px(g, x, y + oy, 'P')
        px(g, cx - 2, 33 + oy, 'Q'); px(g, cx + 1, 33 + oy, 'Q')
    # paper food-court hat
    hy = 10 + oy + b
    for i in range(5): hline(g, cx - 6 + i, hy + i, 12 - 2 * i, 'h')
    rect(g, cx - 7, hy + 4, 14, 3, 'h'); hline(g, cx - 7, hy + 5, 14, 'r')
    outline_except(g, 'o')
    return g
RAT_LEG = "{ o: '#241c30', 1: '#3e3450', 2: '#5e5274', 3: '#857a9c', 4: '#b0a8c4', b: '#d8d0e0', B: '#b8aecb', t: '#f2a0b0', T: '#c86a86', k: '#3e3450', e: 'ink', w: '#ffffff', h: '#f4f4f8', r: '#e04e42', P: '#c8823a', Q: '#f0c070' }"

# ====================================================================== COURIER PIGEON
def pigeon(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = f
    oy = 10 if back else 2
    # feet
    for s in (-1, 1):
        for i in range(3): line(g, cx + s * 5, 47 + oy, cx + s * 5 + (i - 1) * 2, 50 + oy, 'f')
    # wings (behind body, a bit raised on frame 1)
    for s in (-1, 1):
        ball(g, cx + s * 13, 34 + oy - f, 6.5, 11, '1223', bias=0.0 if s < 0 else -0.2, edge='1')
        for i in range(3): px(g, cx + s * 13 + (i - 1) * 2, 44 + oy - f, '1')
    # body
    ball(g, cx, 35 + oy, 13, 13, '12334', bias=0.0, edge='1')
    # head + neck sheen
    ball(g, cx, 17 + oy + b, 9, 8.5, '12334', bias=0.05, edge='1')
    for y in range(24, 28):
        for x in range(cx - 9, cx + 10):
            if g[y + oy][x] in '1234': g[y + oy][x] = 'n' if y < 26 else 'N'
    if not back:
        # beak + cere
        rect(g, cx - 1, 19 + oy + b, 3, 2, 'k'); px(g, cx, 21 + oy + b, 'k'); px(g, cx - 1, 18 + oy + b, 'W'); px(g, cx + 1, 18 + oy + b, 'W')
        # orange eyes with dark pupils
        for ex in (cx - 6, cx + 4):
            rect(g, ex, 15 + oy + b, 3, 3, 'y'); px(g, ex + 1, 16 + oy + b, 'e'); px(g, ex, 15 + oy + b, 'w')
        # messenger bag strap + bag
        for i in range(18):
            px(g, cx - 9 + i, 27 + oy + i // 1 * 0 + i // 2, 'S')
        rect(g, cx + 3, 36 + oy, 11, 9, 'S'); hline(g, cx + 3, 36 + oy, 11, 's'); rect(g, cx + 3, 37 + oy, 11, 3, 's'); px(g, cx + 8, 40 + oy, 'y')
    # courier cap
    rect(g, cx - 6, 7 + oy + b, 12, 4, 'c'); hline(g, cx - 5, 6 + oy + b, 10, 'c'); hline(g, cx - 5, 7 + oy + b, 6, 'C')
    if not back: hline(g, cx - 7, 11 + oy + b, 9, 'k')
    outline_except(g, 'o')
    return g
PIGEON_LEG = "{ o: '#1e2234', 1: '#4a5470', 2: '#6c7896', 3: '#96a2bc', 4: '#c4ccdc', n: '#4cb88a', N: '#9a6ad0', f: '#e07a8a', k: '#2e2a3a', W: '#e8e4ec', y: '#f8a040', e: 'ink', w: '#ffffff', S: '#7a4a2e', s: '#a8683e', c: '#2e8c90', C: '#4cb8aa' }"

# ====================================================================== SPAM (junk mail with wings)
def spam(f=0, back=False):
    W = 64 if back else 56
    g = blank(W, W)
    cx = W // 2; b = -f * 2
    oy = 12 if back else 4
    # wings: little paper wings flapping
    for s in (-1, 1):
        wy = 22 + oy + b - (4 if f else 0)
        for i in range(9):
            hline(g, cx + s * 17 if s > 0 else cx - 17 - 9 + i, wy + i, 9 - i, 'v') if False else None
        pts = [(cx + s * 15, 26 + oy + b), (cx + s * 25, 15 + oy + b - 4 * f), (cx + s * 23, 31 + oy + b)]
        for y in range(10 + oy, 36 + oy):
            for x in range(W):
                # inside triangle
                (x1, y1), (x2, y2), (x3, y3) = pts
                d = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
                a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / d
                bb = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / d
                if a >= 0 and bb >= 0 and a + bb <= 1: g[y][x] = 'v' if a > 0.35 else 'V'
        for i in range(3): line(g, cx + s * 17, 27 + oy + b, cx + s * (20 + i), 20 + oy + b + i * 3 - 3 * f, 'V')
    # envelope body
    x0, y0, w, h = cx - 16, 14 + oy + b, 32, 22
    rect(g, x0, y0, w, h, '3'); hline(g, x0, y0, w, '4'); vline(g, x0, y0, h, '4'); hline(g, x0, y0 + h - 1, w, '1'); vline(g, x0 + w - 1, y0, h, '2')
    # bottom flaps (V shape)
    for i in range(h // 2 + 1):
        px(g, x0 + i, y0 + h - 1 - i // 1 * 0 - i, '2') if False else None
    for i in range(16):
        px(g, x0 + i, y0 + 8 + i * 13 // 16, '2'); px(g, x0 + w - 1 - i, y0 + 8 + i * 13 // 16, '2')
    if not back:
        # flap = forehead, eyes + grumpy grin
        for i in range(16):
            px(g, x0 + i, y0 + i * 9 // 16, '2'); px(g, x0 + w - 1 - i, y0 + i * 9 // 16, '2')
        eye(g, cx - 7, y0 + 7, 4); eye(g, cx + 5, y0 + 7, 4)
        hline(g, cx - 8, y0 + 5, 4, 'e'); hline(g, cx + 4, y0 + 5, 4, 'e')
        px(g, cx - 5, y0 + 4, 'e'); px(g, cx + 4, y0 + 4, 'e')
        rect(g, cx - 4, y0 + 13, 8, 3, 'e'); hline(g, cx - 3, y0 + 13, 6, 'w')
        # red !!! stamp in the corner
        rect(g, x0 + w - 8, y0 + h - 8, 6, 6, 'r'); vline(g, x0 + w - 6, y0 + h - 7, 3, 'W'); px(g, x0 + w - 6, y0 + h - 3, 'W')
        vline(g, x0 + w - 4, y0 + h - 7, 3, 'W'); px(g, x0 + w - 4, y0 + h - 3, 'W')
    else:
        # back: the sealed flap (big V) + a wax seal
        for i in range(16):
            px(g, x0 + i, y0 + i * 12 // 16, '2'); px(g, x0 + w - 1 - i, y0 + i * 12 // 16, '2')
        oval(g, cx, y0 + 12, 3, 3, 'r'); px(g, cx - 1, y0 + 11, 'R')
    # static sparks
    for i, (x, y) in enumerate([(4, 10 + oy), (W - 6, 38 + oy)] if f == 0 else [(6, 36 + oy), (W - 7, 8 + oy)]):
        zigzag(g, x, y, 'y', 5, flip=i == 1)
    outline_except(g, 'o')
    return g
SPAM_LEG = "{ o: '#3a2a3a', 1: '#b8a890', 2: '#d8ccb0', 3: '#f2ead6', 4: '#fffcf2', v: '#e0e4f0', V: '#a8b0c8', e: 'ink', w: '#ffffff', r: '#d83838', R: '#f88888', W: '#ffffff', y: 'au2' }"

MONS = [('lamb', lamb, LAMB_LEG), ('sock', sock, SOCK_LEG), ('mite', mite, MITE_LEG),
        ('rat', rat, RAT_LEG), ('pigeon', pigeon, PIGEON_LEG), ('spam', spam, SPAM_LEG)]

out = ["// Cracky — monster battle sprites (front 56x56, back 64x64). Generated by tools/gen_cracky_mons.py.", "(function () {", "const S = Sprout;"]
for name, fn, leg in MONS:
    for back in (False, True):
        W = 64 if back else 56
        frames = "\n".join(js(f"idle{f}", fn(f, back)) for f in (0, 1))
        out.append(f"S.sprite('{name}_{'back' if back else 'front'}', {{ w: {W}, h: {W}, origin: [{W // 2}, {W}],\n  legend: {leg},\n  frames: {{\n{frames}\n  }} }});")
out.append("})();")
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'art_mons.js'), 'w').write("\n".join(out) + "\n")
