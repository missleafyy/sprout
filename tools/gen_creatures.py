"""Draft generator for battle sprites (Sprig back view, Puffmoth front view). Prints JS grids."""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

def leaf(g, x0, y0, x1, y1, w, light, dark, rib=None, shape='leaf'):
    """Leaf/ear shape along a segment. light/dark = chars for the two halves."""
    L = math.hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / L, (y1 - y0) / L
    H, W = len(g), len(g[0])
    for y in range(H):
        for x in range(W):
            px_, py_ = x + 0.5 - x0, y + 0.5 - y0
            t = (px_ * ux + py_ * uy) / L
            if t < 0 or t > 1: continue
            d = px_ * -uy + py_ * ux
            if shape == 'leaf': hw = w * math.sin(math.pi * min(1, t * 1.0)) ** 0.75
            else: hw = w * (1 - t) ** 0.6 * min(1, t * 6 + 0.4)
            if abs(d) > hw: continue
            if rib and abs(d) < 0.55 and 0.08 < t < 0.85: g[y][x] = rib
            else: g[y][x] = light if d < 0 else dark

def outline_except(g, c, skip='.'):
    H, W = len(g), len(g[0]); src = copy(g)
    for y in range(H):
        for x in range(W):
            if src[y][x] != '.': continue
            if any(0 <= x + dx < W and 0 <= y + dy < H and src[y + dy][x + dx] != '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                g[y][x] = c

# ------------------------------------------------------------------ Sprig, back view (64x64)
def sprig_back(bob=0):
    g = blank(64, 64)
    # tail leaf behind the body
    leaf(g, 46, 58 + bob, 61, 40 + bob, 6.5, 'd', 'b', 'a')
    # ears (backs are darker leaf green)
    leaf(g, 21, 30 + bob, 5, 6 + bob, 9, 'c', 'b', 'a', shape='ear')
    leaf(g, 43, 30 + bob, 59, 6 + bob, 9, 'c', 'a', 'a', shape='ear')
    # body + head
    ball(g, 32, 53 + bob, 21, 13, '1223345', bias=-0.1, edge='1')
    # leaf marking on the back
    leaf(g, 32, 60 + bob, 32, 45 + bob, 3.5, 'c', 'b', 'b')
    ball(g, 32, 33 + bob, 18, 14.5, '1223345', bias=0.05, edge='1')
    # sprout
    vline(g, 32, 13 + bob, 6, 'b'); vline(g, 33, 14 + bob, 5, 'a')
    leaf(g, 32, 14 + bob, 23, 9 + bob, 3.4, 'd', 'c', 'b')
    leaf(g, 33, 14 + bob, 42, 8 + bob, 3.4, 'c', 'b', 'a')
    outline_except(g, 'o')
    return g

# ------------------------------------------------------------------ Puffmoth, front view (56x56)
def puffmoth(flap=0):
    g = blank(56, 56)
    # antennae
    for (x0, x1, s) in ((24, 15, -1), (32, 41, 1)):
        for i in range(10):
            t = i / 9
            x = round(x0 + (x1 - x0) * t); y = round(14 - 10 * t - 3 * math.sin(t * math.pi) * 0.5)
            px(g, x, y, 'A')
        ball(g, x1, 4, 2.6, 2.6, 'BCD')
    # wings (upper then lower)
    wy = -flap
    ball(g, 14, 21 + wy, 13, 12.5, '12345', bias=0.0, edge='1')
    ball(g, 42, 21 + wy, 13, 12.5, '12345', bias=-0.1, edge='1')
    ball(g, 15, 38 + wy // 2, 9.5, 8, '12345', bias=-0.1, edge='1')
    ball(g, 41, 38 + wy // 2, 9.5, 8, '12345', bias=-0.2, edge='1')
    # eye-spots on the upper wings
    for cx in (11, 45):
        ball(g, cx, 19 + wy, 3.2, 3.2, 'st')
        px(g, cx - 1, 18 + wy, 'w')
    # body
    ball(g, 28, 42, 8.5, 9.5, 'klmn', bias=-0.05, edge='k')
    # stripes on the body
    for y in (44, 47):
        for x in range(21, 36):
            if g[y][x] in 'klmn': g[y][x] = 'k' if g[y][x] in 'kl' else 'l'
    # collar fluff
    for (cx, cy, rx, ry) in [(21, 30, 5.5, 4.5), (35, 30, 5.5, 4.5), (28, 33, 6.5, 4.5)]:
        ball(g, cx, cy, rx, ry, 'pqqr', bias=0.1, edge='p')
    # head
    ball(g, 28, 21, 10, 9, 'lmnn', bias=0.05, edge='l')
    # eyes
    for cx in (24, 32):
        for y in range(18, 25):
            for x in range(cx - 2, cx + 2):
                if ((x + 0.5 - cx) / 2.1) ** 2 + ((y + 0.5 - 21.5) / 3.4) ** 2 <= 1: g[y][x] = 'e'
        px(g, cx - 2, 19, 'w'); px(g, cx - 1, 19, 'w'); px(g, cx - 2, 20, 'w')
        px(g, cx, 23, 'v')
    px(g, 20, 24, 't'); px(g, 21, 24, 't'); px(g, 35, 24, 't'); px(g, 36, 24, 't')
    px(g, 27, 26, 'e'); px(g, 28, 26, 'e')
    # feet
    for cx in (24, 32):
        ball(g, cx, 51, 2.5, 2, 'kl')
    outline_except(g, 'o')
    return g

print(js('back0', sprig_back(0)))
print(js('back1', sprig_back(1)))
print(js('front0', puffmoth(0)))
print(js('front1', puffmoth(2)))
