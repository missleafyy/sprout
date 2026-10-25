"""Cracky props for The Lot: Carl's saucer (the A.S.S.), lamp post, saguaro, shopping cart. Writes cracky/art_props.js."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

def outline_except(g, c, skip='s'):
    src = copy(g); H, W = len(g), len(g[0])
    for y in range(H):
        for x in range(W):
            if src[y][x] not in ('.', skip): continue
            nb = [src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < W and 0 <= y + dy < H]
            if any(n not in ('.', skip) for n in nb): g[y][x] = c
    return g

FONT3 = {'A': ['.#.', '#.#', '###', '#.#', '#.#'], 'S': ['.##', '#..', '.#.', '..#', '##.'], '.': ['.', '.', '.', '.', '#']}
def text3(g, s, x, y, c):
    for ch in s:
        gl = FONT3[ch]
        for j, r in enumerate(gl):
            for i, v in enumerate(r):
                if v == '#': px(g, x + i, y + j, c)
        x += len(gl[0]) + 1

# ---------------------------------------------------------------- the A.S.S. (80x64, footprint 5x2)
def ship():
    g = blank(80, 64)
    # ground shadow
    for y, (x0, x1) in zip(range(54, 62), [(18, 62), (10, 70), (6, 74), (5, 75), (6, 74), (9, 71), (14, 66), (22, 58)]):
        hline(g, x0, y, x1 - x0, 's')
    # legs (behind the hull)
    for (x0, x1) in ((16, 9), (64, 71)):
        for i, y in enumerate(range(40, 57)):
            xx = round(x0 + (x1 - x0) * i / 16)
            px(g, xx, y, '2'); px(g, xx + 1, y, '1')
        hline(g, x1 - 2, 57, 6, '2'); hline(g, x1 - 2, 58, 6, '1')
    # lower hull, then the big disk, then the dome
    ball(g, 40, 39, 28, 7, '1123', bias=-0.1)
    ball(g, 40, 31, 39.5, 9.5, '122334455', bias=0.05)
    ball(g, 40, 20, 15, 13, 'GHIJ', bias=0.1)
    # dome rim seam
    for x in range(26, 55): 
        if g[29][x] in 'GHIJ': g[29][x] = '2'
    # green accent band + rim lights along the equator
    for x in range(0, 80):
        if g[35][x] in '12345': g[35][x] = 'n'
        if g[36][x] in '12345': g[36][x] = 'N'
    for i, x in enumerate(range(6, 76, 6)):
        if g[33][x] in '12345':
            c = 'y' if i % 2 == 0 else 'c'
            px(g, x, 33, c); px(g, x + 1, 33, c)
    # name on the hull
    text3(g, 'A.S.S.', 6, 27, 'K')
    # open hatch + ramp in the middle of the bottom
    rect(g, 34, 41, 12, 4, 'Y'); hline(g, 34, 41, 12, 'y')
    for i, y in enumerate(range(45, 56)):
        hline(g, 33 - i // 4, y, 14 + (i // 4) * 2, '3' if i % 3 else '2')
    hline(g, 30, 55, 20, '2')
    # dome glint
    for (x, y) in ((33, 12), (34, 11), (35, 10), (33, 13)): px(g, x, y, 'W')
    outline_except(g, 'o')
    return g

# ---------------------------------------------------------------- lamp post (16x48)
def lamp():
    g = blank(16, 48)
    for y, (x0, x1) in zip(range(44, 48), [(4, 12), (2, 14), (3, 13), (5, 11)]): hline(g, x0, y, x1 - x0, 's')
    rect(g, 7, 10, 2, 34, '2'); vline(g, 7, 10, 34, '3')
    rect(g, 5, 41, 6, 3, '2'); hline(g, 5, 41, 6, '3')
    # head: a little arm and a lamp box
    hline(g, 7, 7, 6, '2'); 
    rect(g, 2, 4, 9, 4, '2'); hline(g, 2, 4, 9, '3'); rect(g, 3, 8, 7, 1, 'y'); hline(g, 4, 9, 5, 'Y')
    outline_except(g, 'o')
    return g

# ---------------------------------------------------------------- saguaro (16x32)
def cactus():
    g = blank(16, 32)
    for y, (x0, x1) in zip(range(29, 32), [(3, 13), (2, 14), (4, 12)]): hline(g, x0, y, x1 - x0, 's')
    m = blank(16, 32)
    rect(m, 6, 2, 4, 28, '#'); px(m, 6, 2, '.'); px(m, 9, 2, '.')          # trunk, rounded top
    rect(m, 12, 5, 3, 9, '#'); px(m, 12, 5, '.'); px(m, 14, 5, '.')        # right arm
    rect(m, 10, 12, 3, 3, '#'); px(m, 12, 14, '.')                          # right elbow
    rect(m, 1, 9, 3, 10, '#'); px(m, 1, 9, '.'); px(m, 3, 9, '.')          # left arm
    rect(m, 3, 17, 3, 3, '#'); px(m, 3, 19, '.')                            # left elbow
    for y in range(32):
        runs, x = [], 0
        while x < 16:
            if m[y][x] == '#':
                x0 = x
                while x < 16 and m[y][x] == '#': x += 1
                runs.append((x0, x))
            else: x += 1
        for (x0, x1) in runs:
            n = x1 - x0
            shade = {1: '2', 2: '32', 3: '342', 4: '3421', 5: '34221', 6: '344221', 7: '3442221'}.get(n, '3' + '4' * (n - 3) + '21')
            for i in range(n): g[y][x0 + i] = shade[i]
    # elbows: undersides darker
    for (x, y) in ((10, 14), (11, 14), (4, 19), (5, 19)): px(g, x, y, '1')
    for (x, y) in ((7, 6), (8, 13), (7, 20), (8, 26), (2, 12), (13, 8), (2, 16)): px(g, x, y, 'w')   # spines
    outline_except(g, 'o')
    return g

# ---------------------------------------------------------------- shopping cart (16x16)
def cart():
    g = blank(16, 16)
    for y, (x0, x1) in zip(range(14, 16), [(2, 14), (3, 13)]): hline(g, x0, y, x1 - x0, 's')
    rect(g, 2, 3, 11, 7, '3')
    for x in range(3, 13, 2): vline(g, x, 4, 5, '2')
    hline(g, 2, 3, 11, '4'); hline(g, 3, 6, 9, '4')
    vline(g, 13, 1, 3, '2'); px(g, 14, 1, '2')
    hline(g, 3, 10, 9, '2'); vline(g, 4, 10, 3, '2'); vline(g, 11, 10, 3, '2')
    px(g, 4, 13, 'k'); px(g, 11, 13, 'k')
    outline_except(g, 'o')
    return g

def sprite(name, g, legend, origin=None):
    h, w = len(g), len(g[0])
    rows = "\n".join(f"    '{''.join(r)}'," for r in g)
    return f"S.sprite('{name}', {{ w: {w}, h: {h}, origin: {origin or [0, h]},\n  legend: {legend},\n  frames: {{ 0: [\n{rows}\n  ] }} }});"

out = ["// Cracky — props for The Lot. Generated by tools/gen_cracky_props.py.", "(function () {", "const S = Sprout;"]
out.append(sprite('ship', ship(), "{ o: 'ink', s: 'sd2', 1: 'st0', 2: 'st1', 3: 'st2', 4: 'st3', 5: 'st4', G: 'gl0', H: 'gl1', I: 'gl2', J: 'gl3', W: '#ffffff', n: 'al2', N: 'al1', y: 'au2', Y: 'au3', c: 'wa3', K: 'bl1' }"))
out.append(sprite('lamp', lamp(), "{ o: 'ink', s: 'sd2', 2: 'st1', 3: 'st2', y: 'au3', Y: 'au2' }"))
out.append(sprite('cactus', cactus(), "{ o: 'lf0', s: 'sd2', 1: 'lf1', 2: 'lf2', 3: 'lf3', 4: 'lf4', w: 'sd4' }"))
out.append(sprite('cart', cart(), "{ o: 'ink', s: 'as1', 2: 'st1', 3: 'st2', 4: 'st3', k: 'ink2' }"))
out += [
    "S.prop('ship', { sprite: 'ship', fw: 5, fh: 2, solid: ['xxxxx', 'xxDxx'] });",
    "S.prop('lamp', { sprite: 'lamp', talk: 'A lamp post. It buzzes like it knows something.' });",
    "S.prop('cactus', { sprite: 'cactus', talk: 'A saguaro. It has been waiting here longer than the parking lot.' });",
    "S.prop('cart', { sprite: 'cart', talk: 'An abandoned shopping cart. One wheel points somewhere else entirely.' });",
    "})();"]
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'art_props.js'), 'w').write("\n".join(out) + "\n")
