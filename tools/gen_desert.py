"""Desert stop art for Cracky: Route 45, Garf's, E.T. Highway + diner / bar / inn interiors.
Writes cracky/art_desert.js. Palette prefix: dz. Light from the upper left; props get coloured outlines."""
import sys, os, random
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

F3 = {
    'A': ['.#.', '#.#', '###', '#.#', '#.#'], 'B': ['##.', '#.#', '##.', '#.#', '##.'], 'C': ['.##', '#..', '#..', '#..', '.##'],
    'D': ['##.', '#.#', '#.#', '#.#', '##.'], 'E': ['###', '#..', '##.', '#..', '###'], 'F': ['###', '#..', '##.', '#..', '#..'],
    'G': ['.##', '#..', '#.#', '#.#', '.##'], 'H': ['#.#', '#.#', '###', '#.#', '#.#'], 'I': ['###', '.#.', '.#.', '.#.', '###'],
    'J': ['..#', '..#', '..#', '#.#', '.#.'], 'K': ['#.#', '#.#', '##.', '#.#', '#.#'], 'L': ['#..', '#..', '#..', '#..', '###'], 'M': ['#.#', '###', '###', '#.#', '#.#'],
    'N': ['##.', '#.#', '#.#', '#.#', '#.#'], 'O': ['.#.', '#.#', '#.#', '#.#', '.#.'], 'P': ['##.', '#.#', '##.', '#..', '#..'],
    'R': ['##.', '#.#', '##.', '#.#', '#.#'], 'S': ['.##', '#..', '.#.', '..#', '##.'], 'T': ['###', '.#.', '.#.', '.#.', '.#.'],
    'U': ['#.#', '#.#', '#.#', '#.#', '###'], 'V': ['#.#', '#.#', '#.#', '#.#', '.#.'], 'X': ['#.#', '#.#', '.#.', '#.#', '#.#'],
    'Y': ['#.#', '#.#', '.#.', '.#.', '.#.'], "'": ['#', '#', '.', '.', '.'], '4': ['#.#', '#.#', '###', '..#', '..#'],
    '5': ['###', '#..', '##.', '..#', '##.'], ' ': ['.', '.', '.', '.', '.'], '1': ['.#', '##', '.#', '.#', '.#'],
}
def text_w(s): return sum(len(F3[c][0]) + 1 for c in s) - 1
def text(g, s, x, y, c, shadow=None):
    for ch in s:
        gl = F3[ch]
        for j, r in enumerate(gl):
            for i, v in enumerate(r):
                if v == '#':
                    if shadow: px(g, x + i + 1, y + j + 1, shadow)
        x += len(gl[0]) + 1
    x0 = x - text_w(s) - 1
    xx = x0
    for ch in s:
        gl = F3[ch]
        for j, r in enumerate(gl):
            for i, v in enumerate(r):
                if v == '#': px(g, xx + i, y + j, c)
        xx += len(gl[0]) + 1

def roundbox(g, x, y, w, h, c, r=1):
    rect(g, x, y, w, h, c)
    if r:
        for (cx, cy) in ((x, y), (x + w - 1, y), (x, y + h - 1), (x + w - 1, y + h - 1)): px(g, cx, cy, '.')

out = []
def sprite(name, g, legend, origin=None):
    h, w = len(g), len(g[0])
    rows = "\n".join(f"    '{''.join(r)}'," for r in g)
    out.append(f"S.sprite('{name}', {{ w: {w}, h: {h}, origin: {origin or [0, h]},\n  legend: {legend},\n  frames: {{ 0: [\n{rows}\n  ] }} }});")

# ================================================================== GARF'S DINER (96x72, 6x3)
def diner():
    g = blank(96, 72)
    # neon sign on the roof: dark board, pink tube letters, a little steam cup
    rect(g, 22, 1, 52, 13, 'K'); rect(g, 23, 2, 50, 11, 'k')
    vline(g, 30, 14, 4, 'K'); vline(g, 65, 14, 4, 'K')
    text(g, "GARF'S", 27, 4, 'P', shadow='p')
    px(g, 51, 4, '.')
    text(g, 'EAT', 55, 4, 'C', shadow='c')
    hline(g, 24, 11, 48, 'p')
    # roof: rounded teal band with a lit top edge
    roundbox(g, 2, 17, 92, 8, 'T', 1); hline(g, 3, 17, 90, 't'); hline(g, 3, 18, 90, 't'); hline(g, 3, 24, 90, 'U')
    # chrome body
    rect(g, 2, 25, 92, 47, '3')
    hline(g, 2, 25, 92, '4'); hline(g, 2, 26, 92, '5')
    # windows band
    for wx in range(6, 90, 14):
        if 46 <= wx <= 60: continue
        rect(g, wx, 29, 12, 14, '1')
        rect(g, wx + 1, 30, 10, 12, 'G'); rect(g, wx + 1, 30, 10, 5, 'H')
        hline(g, wx + 1, 39, 10, 'r'); hline(g, wx + 1, 40, 10, 'R'); hline(g, wx + 1, 41, 10, 'R')   # red booth backs inside
        px(g, wx + 2, 31, 'W'); px(g, wx + 3, 31, 'W'); px(g, wx + 2, 32, 'W')
    # teal band with chrome rail
    rect(g, 2, 44, 92, 5, 'T'); hline(g, 2, 44, 92, 't'); hline(g, 2, 48, 92, 'U')
    # chrome fluting
    for y in range(49, 69):
        for x in range(2, 94):
            g[y][x] = '2' if x % 3 == 0 else ('4' if x % 3 == 1 else '3')
    hline(g, 2, 49, 92, '5')
    rect(g, 2, 69, 92, 3, '1'); hline(g, 2, 69, 92, '2')
    # door (col 3: x 48..63)
    rect(g, 49, 30, 14, 42, '1'); rect(g, 50, 31, 12, 38, '2')
    rect(g, 51, 32, 10, 34, 'G'); rect(g, 51, 32, 10, 12, 'H')
    hline(g, 51, 47, 10, '2')
    px(g, 52, 33, 'W'); px(g, 53, 33, 'W'); px(g, 52, 34, 'W')
    rect(g, 58, 50, 2, 6, '5')
    # OPEN sign on the door glass
    rect(g, 52, 37, 8, 5, 'k'); text(g, 'OPEN', 52, 38, 'P') if False else None
    hline(g, 53, 39, 6, 'P')
    rect(g, 48, 69, 16, 3, '2')
    outline_except(g, 'o')
    return g
sprite('dz_diner', diner(), "{ o: 'ink', k: 'bl1', K: 'bl0', P: 'dzp2', p: 'dzp1', C: 'wa4', c: 'wa2', T: 'rt2', t: 'rt3', U: 'rt1', 1: 'st0', 2: 'st1', 3: 'st2', 4: 'st3', 5: 'st4', G: 'gl1', H: 'gl2', W: '#ffffff', r: 'jk2', R: 'jk1' }")

# ================================================================== THE LITTER BOX (80x72, 5x3)
def litterbox():
    g = blank(80, 72)
    # neon cat sign on the roof
    rect(g, 10, 0, 60, 18, 'K'); rect(g, 11, 1, 58, 16, 'k')
    vline(g, 18, 18, 4, 'K'); vline(g, 61, 18, 4, 'K')
    cat = ['P...P', 'PP.PP', 'PPPPP', 'P.P.P', 'PPPPP', '.PPP.']
    cat = ['P.....P', 'PP...PP', 'P.PPP.P', 'P.....P', 'P.C.C.P', 'P..P..P', '.P...P.', '..PPP..']
    stamp(g, cat, 14, 5)
    text(g, 'LITTER', 26, 3, 'C', shadow='c')
    text(g, 'BOX', 26, 10, 'P', shadow='p')
    px(g, 52, 12, 'C'); px(g, 55, 12, 'C'); px(g, 58, 12, 'C')
    # parapet
    rect(g, 2, 21, 76, 4, '0'); hline(g, 2, 21, 76, '2')
    # dark plank walls
    rect(g, 2, 25, 76, 47, '1')
    for x in range(2, 78):
        if (x - 2) % 6 == 0: vline(g, x, 25, 44, '0')
        elif (x - 2) % 6 == 1: vline(g, x, 25, 44, '2')
    for y in (36, 52):
        for x in range(2, 78):
            if (x + y // 2) % 6 == 3: px(g, x, y, '0')
    rect(g, 2, 69, 76, 3, '0')
    # windows with blinds, warm light leaking through
    for wx in (7, 57):
        rect(g, wx, 33, 16, 16, '0')
        rect(g, wx + 1, 34, 14, 14, 'Y')
        for y in range(34, 48, 2): hline(g, wx + 1, y, 14, 'y')
        px(g, wx + 7, 34, 'q'); vline(g, wx + 7, 34, 14, 'q')
        hline(g, wx - 1, 49, 18, '2')
    # awning + door (col 2: x 32..47)
    rect(g, 29, 34, 22, 4, 'R'); hline(g, 29, 34, 22, 'r')
    for x in range(29, 51, 2): px(g, x, 37, 'Q')
    rect(g, 33, 39, 14, 33, '0'); rect(g, 34, 40, 12, 31, '2'); vline(g, 34, 40, 31, '3')
    for (x, y) in ((39, 44), (40, 43), (41, 44), (40, 45)): px(g, x, y, 'Y')   # diamond window
    rect(g, 43, 55, 2, 2, 'y')
    # wall lamp
    rect(g, 27, 40, 3, 3, 'y'); px(g, 27, 40, 'Y')
    outline_except(g, 'o')
    return g
sprite('dz_litterbox', litterbox(), "{ o: 'ink', k: 'bl1', K: 'bl0', P: 'dzp2', p: 'dzp1', C: 'wa4', c: 'wa2', 0: 'dzw0', 1: 'dzw1', 2: 'dzw2', 3: 'dzw3', Y: 'au3', y: 'au2', q: 'dzw1', R: 'jk1', r: 'jk2', Q: 'jk0' }")

# ================================================================== LITTLE GREEN INN (96x64, 6x3)
def inn():
    g = blank(96, 64)
    # roof sign: green board, alien head, two lines of text
    rect(g, 38, 0, 56, 17, 'N'); rect(g, 39, 1, 54, 15, 'n'); hline(g, 39, 1, 54, 'm')
    vline(g, 46, 17, 4, 'N'); vline(g, 86, 17, 4, 'N')
    head = ['..aaaa..', '.aaaaaa.', 'aEEaaEEa', 'aEEaaEEa', '.aaaaaa.', '..aaaa..', '...aa...']
    stamp(g, head, 41, 4)
    text(g, 'LITTLE', 51, 3, 'W', shadow='N')
    text(g, 'GREEN INN', 51, 9, 'y', shadow='N')
    # flat roof with green trim
    rect(g, 1, 20, 94, 5, 'N'); hline(g, 1, 20, 94, 'm'); hline(g, 1, 21, 94, 'n')
    # cream walls
    rect(g, 2, 25, 92, 39, 'w'); hline(g, 2, 25, 92, 'v')
    rect(g, 2, 59, 92, 5, 'u'); hline(g, 2, 59, 92, 'v')
    # office (col 1: x 16..31): glass door + VACANCY window
    rect(g, 18, 33, 12, 31, 'N'); rect(g, 19, 34, 10, 30, 'H'); rect(g, 19, 34, 10, 10, 'J')
    px(g, 20, 35, 'W'); px(g, 21, 35, 'W'); px(g, 20, 36, 'W')
    rect(g, 4, 33, 11, 12, 'N'); rect(g, 5, 34, 9, 10, 'H'); rect(g, 5, 38, 9, 3, 'R'); hline(g, 6, 39, 7, 'r')   # VACANCY neon
    # room doors 1..3
    for i, dx in enumerate((40, 58, 76)):
        rect(g, dx, 35, 12, 29, 'N'); rect(g, dx + 1, 36, 10, 28, 'n'); vline(g, dx + 1, 36, 28, 'm')
        rect(g, dx + 4, 40, 4, 3, 'y'); px(g, dx + 9, 50, 'y')
        rect(g, dx - 7, 37, 6, 7, 'H'); hline(g, dx - 7, 37, 6, 'J')    # little window
    outline_except(g, 'o')
    return g
sprite('dz_inn', inn(), "{ o: 'ink', N: 'dzg0', n: 'dzg2', m: 'dzg3', a: 'dzg3', E: 'ink', W: '#ffffff', y: 'au2', w: 'wl3', v: 'wl4', u: 'wl2', H: 'gl1', J: 'gl2', R: 'dzp1', r: 'dzp2' }")

# ================================================================== DESERT BUS (80x40, 5x2)
def bus():
    g = blank(80, 40)
    for y, (x0, x1) in zip(range(35, 40), [(6, 74), (3, 77), (2, 78), (4, 76), (10, 70)]): hline(g, x0, y, x1 - x0, 's')
    roundbox(g, 2, 4, 76, 30, 'w')
    hline(g, 3, 4, 74, 'v'); hline(g, 2, 5, 76, 'v'); hline(g, 2, 6, 76, 'w')
    # windows
    rect(g, 3, 9, 74, 10, 'k')
    for wx in range(20, 76, 9): rect(g, wx, 10, 8, 8, 'H'); rect(g, wx, 10, 8, 3, 'J'); px(g, wx + 1, 11, 'W')
    rect(g, 4, 10, 12, 8, 'J'); rect(g, 4, 14, 12, 4, 'H'); px(g, 5, 11, 'W'); px(g, 6, 11, 'W')   # windshield
    # teal stripe + lettering
    rect(g, 2, 20, 76, 3, 'T'); hline(g, 2, 20, 76, 't')
    text(g, 'DESERT BUS', 30, 25, 'U')
    # door (front)
    rect(g, 10, 19, 7, 14, 'k'); vline(g, 13, 19, 14, 'w')
    # headlight, bumper
    rect(g, 2, 26, 3, 3, 'y'); rect(g, 2, 31, 76, 3, 'u')
    # wheels
    for cx in (16, 62):
        ball(g, cx, 33, 5, 4.5, 'kKK'); rect(g, cx - 1, 32, 3, 2, 'u'); px(g, cx - 1, 32, 'v')
    outline_except(g, 'o')
    return g
sprite('dz_bus', bus(), "{ o: 'ink', s: 'sd2', w: 'wl3', v: 'wl4', u: 'wl1', k: 'bl1', K: 'bl2', H: 'gl1', J: 'gl2', W: '#ffffff', T: 'rt2', t: 'rt3', U: 'rt1', y: 'au3' }")

# ================================================================== WATER TOWER (32x64, 2x2)
def watertower():
    g = blank(32, 64)
    for y, (x0, x1) in zip(range(60, 64), [(4, 28), (2, 30), (3, 29), (6, 26)]): hline(g, x0, y, x1 - x0, 's')
    # legs + braces
    for (x0, x1) in ((8, 4), (23, 27)):
        for i, y in enumerate(range(30, 61)):
            xx = round(x0 + (x1 - x0) * i / 30); px(g, xx, y, '2'); px(g, xx + 1, y, '1')
    for y0 in (36, 48):
        for i in range(17): px(g, 8 + i, y0 + i // 3, '1'); px(g, 24 - i, y0 + i // 3, '1')
    # tank: vertical cylinder shading
    shade = '4433322211'
    for y in range(9, 31):
        for x in range(5, 27):
            g[y][x] = shade[min(9, (x - 5) * 10 // 22)]
    for y in (14, 24): hline(g, 5, y, 22, '1')
    text(g, 'NV', 13, 17, 'K')
    hline(g, 4, 30, 24, '1'); hline(g, 4, 31, 24, '2')
    # cone roof
    for i in range(9):
        hline(g, 16 - i - 2, i + 1, (i + 2) * 2, '3'); px(g, 16 - i - 2, i + 1, '4'); px(g, 16 + i + 1, i + 1, '2')
    px(g, 15, 0, '3'); px(g, 16, 0, '3')
    # rust streaks
    for (x, y) in ((9, 25), (9, 26), (9, 27), (20, 26), (20, 27), (14, 28)): px(g, x, y, 'r')
    outline_except(g, 'o')
    return g
sprite('dz_watertower', watertower(), "{ o: 'st0', s: 'sd2', 1: 'st1', 2: 'st2', 3: 'st3', 4: 'st4', K: 'rt1', r: 'sd1' }")

# ================================================================== road signs (16x32)
def roadsign(label, alien=False):
    g = blank(16, 32)
    for y, (x0, x1) in zip(range(29, 32), [(3, 13), (2, 14), (4, 12)]): hline(g, x0, y, x1 - x0, 's')
    vline(g, 4, 14, 16, '2'); vline(g, 11, 14, 16, '2'); vline(g, 5, 14, 16, '1'); vline(g, 12, 14, 16, '1')
    roundbox(g, 1, 3, 14, 12, 'w'); roundbox(g, 2, 4, 12, 10, 'G')
    if alien:
        stamp(g, ['.aaaa.', 'aaaaaa', 'EaaaaE', 'EEaaEE', '.aaaa.', '..aa..'], 5, 6)
    else:
        text(g, label, 8 - text_w(label) // 2, 7, 'w')
    outline_except(g, 'o')
    return g
sprite('dz_sign45', roadsign('45'), "{ o: 'ink', s: 'sd2', 1: 'st1', 2: 'st2', w: '#f4f4f8', G: '#2e8a4e' }")
sprite('dz_signet', roadsign('', True), "{ o: 'ink', s: 'sd2', 1: 'st1', 2: 'st2', w: '#f4f4f8', G: '#3a5aa8', a: 'dzg3', E: 'ink' }")

# ================================================================== tumbleweed (16x16)
def tumbleweed():
    g = blank(16, 16)
    for y, (x0, x1) in zip(range(13, 16), [(3, 13), (2, 14), (4, 12)]): hline(g, x0, y, x1 - x0, 's')
    rnd = random.Random(7)
    ball(g, 8, 8, 6, 5.5, '122', bias=0.0)
    for y in range(3, 14):
        for x in range(2, 15):
            if g[y][x] != '.' and rnd.random() < 0.38: g[y][x] = '.'
    for (cx, cy, r) in ((8, 8, 4), (7, 7, 2.5), (10, 9, 3)):
        for i in range(24):
            import math
            a = i / 24 * 6.283
            px(g, round(cx + r * math.cos(a)), round(cy + r * 0.85 * math.sin(a)), '2' if math.cos(a) + math.sin(a) < 0 else '1')
    outline_except(g, 'o')
    return g
sprite('dz_tumbleweed', tumbleweed(), "{ o: 'dzw0', s: 'sd2', 1: 'dzw2', 2: 'dzw3' }")

# ================================================================== fence post (16x16; wires join neighbours)
def fencepost():
    g = blank(16, 16)
    for y, (x0, x1) in zip(range(14, 16), [(5, 11), (6, 10)]): hline(g, x0, y, x1 - x0, 's')
    hline(g, 0, 6, 16, 'w'); hline(g, 0, 10, 16, 'w')
    rect(g, 6, 2, 4, 12, '2'); vline(g, 6, 2, 12, '3'); vline(g, 9, 2, 12, '1'); hline(g, 6, 2, 4, '3')
    src = copy(g)
    for y in range(16):
        for x in range(16):
            if src[y][x] != '.' and src[y][x] not in 'sw': continue
            if src[y][x] == 'w': continue
            if any(0 <= x + dx < 16 and 0 <= y + dy < 16 and src[y + dy][x + dx] in '123' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): g[y][x] = 'o'
    return g
sprite('dz_fence', fencepost(), "{ o: 'dzw0', s: 'sd2', 1: 'dzw1', 2: 'dzw2', 3: 'dzw3', w: 'st1' }")

# ================================================================== broken car (48x32, 3x2)
def car():
    g = blank(48, 32)
    for y, (x0, x1) in zip(range(27, 32), [(6, 42), (3, 45), (2, 46), (4, 44), (8, 40)]): hline(g, x0, y, x1 - x0, 's')
    # body
    roundbox(g, 2, 13, 44, 13, '2'); hline(g, 3, 13, 42, '3'); hline(g, 2, 14, 44, '3')
    # cabin
    roundbox(g, 11, 4, 26, 10, '2'); hline(g, 12, 4, 24, '3')
    rect(g, 13, 6, 10, 7, 'k'); rect(g, 25, 6, 10, 7, 'k'); px(g, 14, 7, 'H'); px(g, 15, 7, 'H'); px(g, 27, 8, 'H')
    for (x, y) in ((16, 9), (17, 10), (19, 8), (30, 10), (31, 9)): px(g, x, y, 'H')   # cracked glass
    # rust patches + missing door
    for (cx, cy, rx, ry) in ((8, 19, 3, 2), (38, 21, 4, 2), (24, 15, 2, 1)):
        for y in range(cy - ry, cy + ry + 1):
            for x in range(cx - rx, cx + rx + 1):
                if g[y][x] in '23': g[y][x] = 'r'
    rect(g, 26, 15, 9, 9, 'k'); vline(g, 26, 15, 9, '1')
    hline(g, 2, 22, 44, '1'); rect(g, 2, 17, 2, 2, 'y'); rect(g, 44, 17, 2, 2, 'R')
    # wheels (front one flat)
    ball(g, 11, 26, 4.5, 4, 'kK'); rect(g, 10, 25, 2, 2, '3')
    rect(g, 32, 26, 9, 3, 'k'); hline(g, 32, 26, 9, 'K')
    outline_except(g, 'o')
    return g
sprite('dz_car', car(), "{ o: 'ink', s: 'sd2', 1: 'dzr1', 2: 'dzr3', 3: 'dzr4', r: 'dzr2', k: 'bl1', K: 'bl2', H: 'gl1', y: 'au3', R: 'jk2' }")

# ================================================================== terrains: mesa cliff, road
def rocky(seed):
    rnd = random.Random(seed); g = blank(16, 16, 'b')
    for y in (4, 11):
        x = rnd.randint(0, 6)
        while x < 16:
            n = rnd.randint(3, 7)
            for i in range(n):
                if x + i < 16: g[y][x + i] = 'a'
                if x + i < 16 and y > 0: g[y - 1][x + i] = 'c' if rnd.random() < 0.5 else g[y - 1][x + i]
            x += n + rnd.randint(2, 5)
    for _ in range(4):
        x, y = rnd.randint(0, 15), rnd.randint(0, 15)
        g[y][x] = 'c'
    return g
def road(seed, mark=None):
    rnd = random.Random(seed); g = blank(16, 16, 'b')
    for _ in range(6):
        x, y = rnd.randint(0, 15), rnd.randint(0, 15)
        g[y][x] = 'a' if rnd.random() < 0.7 else 'c'
    if mark == 'h':
        for x in range(2, 10): g[7][x] = 'y'; g[8][x] = 'Y'
    if mark == 'v':
        for y in range(2, 10): g[y][7] = 'y'; g[y][8] = 'Y'
    return g
def terr(name, fills, legend, bands, extra=''):
    blocks = "\n  ], [\n".join(",\n".join(f"    '{''.join(r)}'" for r in g) + "," for g in fills)
    out.append(f"S.terrain('{name}', {{\n  legend: {legend},\n  fill: [[\n{blocks}\n  ]], variants: true,\n  bands: {bands},\n  {extra}\n}});")
terr('dz_mesa', [rocky(1), rocky(2), rocky(3)], "{ a: 'dzr1', b: 'dzr2', c: 'dzr3' }",
     "{ top: ['dzr0', 'dzr4', 'dzr3'], left: ['dzr0', 'dzr3'], right: ['dzr0', 'dzr1'], bottom: ['dzr0', 'dzr0', 'dzr1', 'dzr1', 'dzr1', 'dzr2'] }",
     "radius: 4, wobble: 0.4, solid: true,")
RB = "{ top: ['as1', 'pw1', 'as2'], left: ['as1', 'pw1', 'as2'], right: ['as1', 'pw1', 'as2'], bottom: ['as0', 'pw0', 'as2'] }"
RL = "{ a: 'as1', b: 'as2', c: 'as3', y: 'py2', Y: 'py1' }"
terr('dz_road', [road(31), road(32), road(33)], RL, RB, "radius: 2, wobble: 0, joins: ['dz_roadH', 'dz_roadV', 'lot', 'lotV', 'lotE'],")
terr('dz_roadH', [road(34, 'h')], RL, RB, "radius: 2, wobble: 0, joins: ['dz_road', 'dz_roadV', 'lot', 'lotV', 'lotE'],")
terr('dz_roadV', [road(35, 'v')], RL, RB, "radius: 2, wobble: 0, joins: ['dz_road', 'dz_roadH', 'lot', 'lotV', 'lotE'],")

# ================================================================== interior tiles (sprite dz_in)
T = {}
g = blank(16, 16, 'w')
rect(g, 8, 0, 8, 8, 'k'); rect(g, 0, 8, 8, 8, 'k')
px(g, 1, 1, 'W'); px(g, 2, 1, 'W'); px(g, 9, 9, 'K'); px(g, 10, 9, 'K')
T['checker'] = g
g = blank(16, 16, '2')
for p, end in enumerate([5, 12, 2, 9]):      # vertical floorboards, staggered ends
    x = p * 4
    vline(g, x + 3, 0, 16, '1'); vline(g, x, 0, 16, '3') if p % 2 else None
    hline(g, x, end, 3, '1'); hline(g, x, end + 1, 3, '3')
T['wood'] = g
g = blank(16, 16, 'c')
for (x, y) in ((7, 3), (8, 3), (6, 4), (9, 4), (5, 5), (10, 5), (6, 6), (9, 6), (7, 7), (8, 7)): px(g, x, y + 4, 'q')
px(g, 7, 8, 'Q'); px(g, 8, 8, 'Q')
T['carpet'] = g
g = blank(16, 16, 'm'); rect(g, 1, 1, 14, 14, 'M');
for x in range(2, 14, 2): vline(g, x, 2, 12, 'm')
T['mat'] = g
# diner walls: square teal tiles, chrome rail
def tiles(g, y0, y1, a, b):
    for y in range(y0, y1):
        for x in range(16):
            g[y][x] = b if (x % 4 == 3 or y % 4 == 3) else a
g = blank(16, 16, 't'); tiles(g, 0, 16, 't', 'T'); hline(g, 0, 0, 16, 'K'); hline(g, 0, 1, 16, 'S'); hline(g, 0, 2, 16, 's')
T['dwallA'] = g
g = blank(16, 16, 't'); tiles(g, 0, 8, 't', 'T'); hline(g, 0, 7, 16, 'S'); hline(g, 0, 8, 16, 'W'); hline(g, 0, 9, 16, 's')
for y in range(10, 14):
    for x in range(16): g[y][x] = 'k' if ((x // 2) + (y // 2)) % 2 else 'w'
hline(g, 0, 14, 16, 's'); hline(g, 0, 15, 16, 'K')
T['dwallB'] = g
g = copy(T['dwallA']); rect(g, 2, 4, 12, 11, 'S'); rect(g, 3, 5, 10, 9, 'n'); rect(g, 3, 11, 10, 3, 'N')
for (x, y) in ((5, 7), (10, 6), (8, 8)): px(g, x, y, 'W')
px(g, 11, 12, 'N'); hline(g, 3, 10, 10, 'N'); px(g, 6, 9, 'N'); px(g, 7, 9, 'N')
T['dwin'] = g
# bar walls: dark panels
g = blank(16, 16, '1')
for x in (0, 8): vline(g, x, 0, 16, '0')
for x in (1, 9): vline(g, x, 0, 16, '2')
hline(g, 0, 0, 16, '0'); hline(g, 0, 1, 16, '3'); hline(g, 0, 2, 16, '0')
T['bwallA'] = g
g = blank(16, 16, '1')
hline(g, 0, 5, 16, '3'); hline(g, 0, 6, 16, '0')
for x0 in (1, 9):
    rect(g, x0, 8, 6, 5, '0'); rect(g, x0 + 1, 9, 4, 3, '1'); hline(g, x0, 8, 6, '2')
hline(g, 0, 14, 16, '0'); hline(g, 0, 15, 16, '0'); hline(g, 0, 13, 16, '2')
for x in (0, 8): vline(g, x, 0, 5, '0')
T['bwallB'] = g
# inn walls: green stripes
g = blank(16, 16, 'g')
for x in (3, 4, 11, 12): vline(g, x, 0, 16, 'G')
hline(g, 0, 0, 16, 'K'); hline(g, 0, 1, 16, 'D'); hline(g, 0, 2, 16, 'd')
T['iwallA'] = g
g = blank(16, 16, 'g')
for x in (3, 4, 11, 12): vline(g, x, 0, 6, 'G')
hline(g, 0, 6, 16, 'd'); hline(g, 0, 7, 16, 'D'); rect(g, 0, 8, 16, 6, 'w'); hline(g, 0, 8, 16, 'W')
for x in (0, 8): vline(g, x, 9, 5, 'u')
hline(g, 0, 14, 16, 'D'); hline(g, 0, 15, 16, 'K')
T['iwallB'] = g
rows = "\n".join(js(k, v) for k, v in T.items())
out.append("S.sprite('dz_in', { w: 16, h: 16,\n  legend: { w: 'wl3', W: 'wl4', k: 'dzk1', K: 'dzk0', 0: 'dzw0', 1: 'dzw1', 2: 'dzw2', 3: 'dzw3', c: 'dzc1', C: 'dzc0', q: 'au1', Q: 'au2', m: 'dzw1', M: 'dzw2',\n"
           "    t: 'rt3', T: 'rt2', S: 'st3', s: 'st1', n: 'dzn1', N: 'dzn0', g: 'dzg2', G: 'dzg3', d: 'wd2', D: 'wd1', u: 'wl2' },\n  frames: {\n" + rows + "\n  } });")
out.append("""S.tile('dz_checker', { sprite: 'dz_in', frame: 'checker' });
S.tile('dz_wood', { sprite: 'dz_in', frame: 'wood' });
S.tile('dz_carpet', { sprite: 'dz_in', frame: 'carpet' });
S.tile('dz_mat', { sprite: 'dz_in', frame: 'mat' });
S.tile('dz_dwallA', { sprite: 'dz_in', frame: 'dwallA', solid: true });
S.tile('dz_dwallB', { sprite: 'dz_in', frame: 'dwallB', solid: true });
S.tile('dz_dwin', { sprite: 'dz_in', frame: 'dwin', solid: true });
S.tile('dz_bwallA', { sprite: 'dz_in', frame: 'bwallA', solid: true });
S.tile('dz_bwallB', { sprite: 'dz_in', frame: 'bwallB', solid: true });
S.tile('dz_iwallA', { sprite: 'dz_in', frame: 'iwallA', solid: true });
S.tile('dz_iwallB', { sprite: 'dz_in', frame: 'iwallB', solid: true });""")

# ================================================================== interior props
def booth():   # 32x40, 2x2: bench, table, bench (seen from above)
    g = blank(32, 40)
    def bench(y, back_top):
        roundbox(g, 1, y, 30, 10, 'R'); hline(g, 2, y, 28, 'r')
        if back_top: rect(g, 1, y, 30, 4, 'R'); hline(g, 2, y, 28, 'r'); hline(g, 1, y + 4, 30, 'Q'); rect(g, 1, y + 5, 30, 5, 'r'); hline(g, 2, y + 9, 28, 'R')
        else: rect(g, 1, y, 30, 5, 'r'); hline(g, 1, y + 5, 30, 'Q'); rect(g, 1, y + 6, 30, 4, 'R')
        for x in (8, 16, 24): vline(g, x, y + (5 if back_top else 0), 5, 'R')
    bench(1, True)
    roundbox(g, 3, 13, 26, 13, '3'); hline(g, 4, 13, 24, '4'); hline(g, 3, 25, 26, '2'); vline(g, 3, 14, 11, '4')
    for (x, y) in ((8, 16), (9, 16), (8, 17)): px(g, x, y, '5')
    rect(g, 18, 16, 6, 5, 'w'); hline(g, 18, 16, 6, 'W'); rect(g, 19, 17, 4, 2, 'y')    # plate with a slice of pie
    rect(g, 10, 19, 3, 4, 'k'); px(g, 10, 19, 'K')                                      # cup
    rect(g, 6, 26, 3, 3, '2'); rect(g, 23, 26, 3, 3, '2')
    bench(29, False)
    outline_except(g, 'o')
    return g
sprite('dz_booth', booth(), "{ o: 'ink', R: 'jk1', r: 'jk2', Q: 'jk3', 2: 'st1', 3: 'st3', 4: 'st4', 5: '#ffffff', w: 'wh2', W: '#ffffff', y: 'au2', k: 'rt2', K: 'rt3' }")

def counter():   # 48x24, 3x1: chrome counter with a pie case + register
    g = blank(48, 28)
    rect(g, 1, 8, 46, 19, '3'); hline(g, 1, 8, 46, '5'); hline(g, 1, 9, 46, '4'); rect(g, 1, 14, 46, 13, 'T'); hline(g, 1, 14, 46, 't')
    for x in range(3, 46, 4): vline(g, x, 16, 10, 'U')
    hline(g, 1, 26, 46, '1')
    # pie dome
    for y, (x0, x1) in enumerate([(7, 13), (6, 14), (5, 15), (5, 15), (5, 15)]): hline(g, x0, y + 3, x1 - x0, 'G')
    rect(g, 6, 5, 8, 3, 'y'); hline(g, 6, 5, 8, 'Y'); px(g, 7, 4, 'W'); hline(g, 4, 8, 12, '2')
    # register
    rect(g, 32, 1, 10, 8, '2'); rect(g, 33, 2, 8, 3, 'k'); rect(g, 34, 3, 3, 1, 'C'); rect(g, 33, 6, 8, 2, '4')
    # napkin + ketchup
    rect(g, 22, 5, 3, 4, 'R'); px(g, 23, 4, 'R'); rect(g, 26, 6, 4, 3, 'w')
    outline_except(g, 'o')
    return g
sprite('dz_counter', counter(), "{ o: 'ink', 1: 'st0', 2: 'st1', 3: 'st2', 4: 'st3', 5: 'st4', T: 'rt2', t: 'rt3', U: 'rt1', G: 'gl2', y: 'au2', Y: 'au3', W: '#ffffff', k: 'bl1', C: 'dzp2', R: 'jk2', w: 'wh2' }")

def stool():    # 16x16 red diner stool
    g = blank(16, 16)
    ball(g, 8, 6, 5.5, 3.5, 'RRrq', bias=0.1)
    rect(g, 7, 9, 2, 5, '3'); vline(g, 7, 9, 5, '4'); hline(g, 5, 14, 6, '2')
    outline_except(g, 'o')
    return g
sprite('dz_stool', stool(), "{ o: 'ink', R: 'jk1', r: 'jk2', q: 'jk3', 2: 'st1', 3: 'st2', 4: 'st3' }")

def jukebox():  # 16x32
    g = blank(16, 32)
    rect(g, 1, 8, 14, 23, 'w')
    for y in range(1, 10):
        for x in range(1, 15):
            if ((x - 7.5) / 7) ** 2 + ((y - 9) / 8.5) ** 2 <= 1: g[y][x] = 'w'
    # rainbow arch tubes
    for i, c in enumerate('PYC'):
        for y in range(2 + i, 12):
            for x in range(2 + i, 14 - i):
                d = ((x - 7.5) / (6 - i)) ** 2 + ((y - 10) / (8 - i)) ** 2
                if 0.75 <= d <= 1: g[y][x] = c
    rect(g, 4, 9, 8, 6, 'k'); for_ = [px(g, x, 11, 'Y') for x in range(5, 11, 2)]
    rect(g, 3, 17, 10, 7, 'g'); hline(g, 3, 17, 10, 'G'); for_ = [vline(g, x, 18, 5, 'k') for x in (5, 8, 11)]
    rect(g, 2, 26, 12, 4, 'R'); hline(g, 2, 26, 12, 'r')
    outline_except(g, 'o')
    return g
sprite('dz_jukebox', jukebox(), "{ o: 'ink', w: 'wd3', P: 'dzp2', Y: 'au3', C: 'wa4', k: 'bl1', g: 'gl1', G: 'gl2', R: 'wd1', r: 'wd2' }")

def barcounter():   # 48x24 dark wood, brass rail
    g = blank(48, 26)
    rect(g, 1, 4, 46, 21, '1'); rect(g, 1, 4, 46, 6, '3'); hline(g, 1, 4, 46, 'h'); hline(g, 1, 9, 46, '0')
    for x in range(4, 46, 8): rect(g, x, 12, 5, 9, '0'); rect(g, x + 1, 13, 3, 7, '2')
    hline(g, 1, 22, 46, 'q'); hline(g, 1, 23, 46, 'Q'); hline(g, 1, 24, 46, '0')
    # a glass of milk and a lasagna on a plate
    rect(g, 8, 0, 3, 6, 'w'); hline(g, 8, 0, 3, 'W')
    rect(g, 28, 3, 10, 4, 'W'); rect(g, 29, 3, 8, 3, 'R'); hline(g, 29, 3, 8, 'y'); px(g, 31, 4, 'y')
    outline_except(g, 'o')
    return g
sprite('dz_bar', barcounter(), "{ o: 'ink', 0: 'dzw0', 1: 'dzw1', 2: 'dzw2', 3: 'dzw3', h: 'wd4', q: 'au1', Q: 'au2', w: 'wh1', W: 'wh2', R: 'jk1', y: 'au2' }")

def backbar():   # 48x32 shelf of milk bottles, against the wall
    g = blank(48, 34)
    rect(g, 0, 0, 48, 32, '1'); rect(g, 2, 2, 44, 28, '0')
    for sy in (2, 16):
        x = 3
        i = 0
        while x < 44:
            h = 10 - (i % 3)
            rect(g, x, sy + 12 - h, 3, h, 'w'); hline(g, x, sy + 12 - h, 3, 'W'); px(g, x + 1, sy + 12 - h - 1, 'b')
            if i % 4 == 1: rect(g, x, sy + 7, 3, 2, 'c')
            x += 5; i += 1
        hline(g, 1, sy + 12, 46, '3'); hline(g, 1, sy + 13, 46, '2')
    hline(g, 0, 0, 48, '3'); rect(g, 0, 30, 48, 2, '3')
    outline_except(g, 'o')
    return g
sprite('dz_backbar', backbar(), "{ o: 'ink', 0: 'dzw0', 1: 'dzw1', 2: 'dzw2', 3: 'dzw3', w: 'wh1', W: 'wh2', b: 'rt2', c: 'rt3' }")

def pooltable():   # 32x32, 2x2
    g = blank(32, 32)
    roundbox(g, 1, 3, 30, 24, '2', 1); rect(g, 1, 3, 30, 3, '3'); hline(g, 2, 3, 28, 'h')
    rect(g, 4, 6, 24, 18, 'f'); hline(g, 4, 6, 24, 'F')
    for (x, y) in ((3, 5), (15, 5), (28, 5), (3, 24), (15, 24), (28, 24)): rect(g, x, y, 2, 2, 'k')
    for (x, y, c) in ((9, 11, 'w'), (19, 14, 'y'), (21, 15, 'R'), (20, 17, 'b'), (22, 13, 'k')):
        rect(g, x, y, 2, 2, c)
    for i in range(12): px(g, 6 + i, 18 - i // 3, 'c')     # cue
    rect(g, 4, 27, 3, 4, '1'); rect(g, 25, 27, 3, 4, '1')
    outline_except(g, 'o')
    return g
sprite('dz_pool', pooltable(), "{ o: 'ink', 1: 'dzw0', 2: 'dzw1', 3: 'dzw2', h: 'dzw3', f: '#2e7a4e', F: '#3e9a5e', k: 'bl0', w: 'wh2', y: 'au2', R: 'jk2', b: 'gl1', c: 'wd4' }")

def neoncat():   # 32x16 wall sign
    g = blank(32, 16)
    roundbox(g, 0, 0, 32, 16, 'k')
    stamp(g, ['P.....P', 'PP...PP', 'P.PPP.P', 'P.....P', 'P.C.C.P', 'P..P..P', '.P...P.', '..PPP..'], 3, 4)
    text(g, 'JB', 13, 3, 'C'); hline(g, 13, 10, 16, 'P'); text(g, 'BAR', 17, 3, 'P') if False else None
    for x in range(13, 29, 2): px(g, x, 12, 'p')
    outline_except(g, 'o')
    return g
sprite('dz_neoncat', neoncat(), "{ o: 'bl0', k: 'bl1', P: 'dzp2', p: 'dzp1', C: 'wa4' }")

def lamp():   # 16x32 noir floor lamp
    g = blank(16, 32)
    for y, (x0, x1) in enumerate([(5, 11), (4, 12), (3, 13), (2, 14), (2, 14), (1, 15)]): hline(g, x0, y + 2, x1 - x0, 'y')
    for y in range(2, 8): px(g, 2 + max(0, 5 - y) if False else 0, y, '.')
    for y in range(2, 8):
        for x in range(16):
            if g[y][x] == 'y' and x < 8 - (y - 2) // 2 + 1 and y < 4: g[y][x] = 'Y'
    hline(g, 1, 8, 14, 'q')
    vline(g, 7, 9, 20, '2'); vline(g, 8, 9, 20, '1')
    rect(g, 4, 28, 8, 2, '2'); hline(g, 4, 28, 8, '3')
    outline_except(g, 'o')
    return g
sprite('dz_lamp', lamp(), "{ o: 'ink', y: 'au2', Y: 'au3', q: 'au1', 1: 'bl1', 2: 'bl2', 3: 'bl3' }")

def desk():   # 48x24 inn front desk with bell + guest book
    g = blank(48, 28)
    rect(g, 1, 6, 46, 21, '1'); rect(g, 1, 6, 46, 6, '3'); hline(g, 1, 6, 46, 'h'); hline(g, 1, 11, 46, '0')
    for x in range(4, 46, 11): rect(g, x, 14, 8, 9, '0'); rect(g, x + 1, 15, 6, 7, '2')
    hline(g, 1, 26, 46, '0')
    ball(g, 12, 5, 3, 2.5, 'qQY'); px(g, 12, 2, 'q')                 # bell
    rect(g, 26, 4, 12, 6, 'W'); vline(g, 32, 4, 6, 'w'); hline(g, 27, 6, 4, 'k'); hline(g, 33, 7, 4, 'k')   # guest book
    rect(g, 40, 0, 4, 7, 'g'); rect(g, 41, 1, 2, 2, 'G')               # tiny alien bobblehead
    outline_except(g, 'o')
    return g
sprite('dz_desk', desk(), "{ o: 'ink', 0: 'wd0', 1: 'wd1', 2: 'wd2', 3: 'wd3', h: 'wd4', q: 'au1', Q: 'au2', Y: 'au3', W: 'wh2', w: 'wh1', k: 'ink2', g: 'dzg3', G: 'ink' }")

def poster():   # 16x16 "WE BELIEVE" alien poster for walls
    g = blank(16, 16)
    rect(g, 1, 1, 14, 14, 'f'); rect(g, 2, 2, 12, 12, 'b')
    stamp(g, ['.aaaa.', 'aaaaaa', 'EaaaaE', 'EEaaEE', '.aaaa.', '..aa..'], 5, 3)
    hline(g, 4, 11, 8, 'w'); hline(g, 5, 12, 6, 'w')
    outline_except(g, 'o')
    return g
sprite('dz_poster', poster(), "{ o: 'ink', f: 'wd2', b: '#2a2a4a', a: 'dzg3', E: 'ink', w: 'wh2' }")

# ================================================================== props
out.append("""
// ---------------------------------------------------------------- props (talk lines are defaults; maps may override)
S.prop('dz_diner', { sprite: 'dz_diner', fw: 6, fh: 3, solid: ['xxxxxx', 'xxxxxx', 'xxxDxx'] });
S.prop('dz_litterbox', { sprite: 'dz_litterbox', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });
S.prop('dz_inn', { sprite: 'dz_inn', fw: 6, fh: 3, solid: ['xxxxxx', 'xxxxxx', 'xDxxxx'] });
S.prop('dz_bus', { sprite: 'dz_bus', fw: 5, fh: 2, talk: ['The {blue}DESERT BUS{/}. Eleven years on schedule.', 'It is parked. It is somehow also still going 45.'] });
S.prop('dz_watertower', { sprite: 'dz_watertower', fw: 2, fh: 2, talk: 'A water tower. Somebody painted NV on it, then gave up.' });
S.prop('dz_sign45', { sprite: 'dz_sign45', talk: ['{blue}ROUTE 45{/}', 'Next services: eventually.'] });
S.prop('dz_signet', { sprite: 'dz_signet', talk: ['{blue}E.T. HIGHWAY{/}', 'The sign has a little alien on it. Carl does not make eye contact with it.'] });
S.prop('dz_tumbleweed', { sprite: 'dz_tumbleweed', talk: 'A tumbleweed. It is resting between tumbles.' });
S.prop('dz_fence', { sprite: 'dz_fence' });
S.prop('dz_car', { sprite: 'dz_car', fw: 3, fh: 2, talk: 'A rusted-out car. The radio is still on. It is playing the same song as the Cassette Mites.' });
S.prop('dz_booth', { sprite: 'dz_booth', fw: 2, fh: 2 });
S.prop('dz_counter', { sprite: 'dz_counter', fw: 3, fh: 1 });
S.prop('dz_stool', { sprite: 'dz_stool' });
S.prop('dz_jukebox', { sprite: 'dz_jukebox', talk: 'A jukebox. Every song on it is "Desert Bus (Extended)".' });
S.prop('dz_bar', { sprite: 'dz_bar', fw: 3, fh: 1 });
S.prop('dz_backbar', { sprite: 'dz_backbar', fw: 3, fh: 1, talk: 'Rows of milk bottles. The good stuff is on the top shelf.' });
S.prop('dz_pool', { sprite: 'dz_pool', fw: 2, fh: 2, talk: 'A pool table. The eight ball is missing. There is a chalk outline where it used to be.' });
S.prop('dz_neoncat', { sprite: 'dz_neoncat', fw: 2, fh: 1 });
S.prop('dz_lamp', { sprite: 'dz_lamp' });
S.prop('dz_desk', { sprite: 'dz_desk', fw: 3, fh: 1 });
S.prop('dz_poster', { sprite: 'dz_poster', talk: 'A poster of a little green alien. It says WE BELIEVE.' });
// roads join the parking-lot asphalt so the two connect without a curb
for (const t of ['lot', 'lotV', 'lotE']) if (S.terrains[t]) S.terrains[t].joins = (S.terrains[t].joins || []).concat(['dz_road', 'dz_roadH', 'dz_roadV']);
""")

head = """// Cracky — desert stops: Route 45, Garf's, E.T. Highway, and the diner / bar / inn interiors. Generated by tools/gen_desert.py.
(function () {
const S = Sprout;
Sprout.palette({
  // red mesa rock
  dzr0: '#4a2232', dzr1: '#7a3a3e', dzr2: '#a65a4c', dzr3: '#cc7c5c', dzr4: '#eaa67c',
  // dark bar wood
  dzw0: '#22161e', dzw1: '#3e2626', dzw2: '#5e3a2e', dzw3: '#86583c',
  // Little Green Inn greens
  dzg0: '#1c3a2c', dzg1: '#2a5e3c', dzg2: '#3e8a4c', dzg3: '#76c068',
  // neon pink, diner checker darks, inn carpet, night window
  dzp1: '#c83c7a', dzp2: '#ff8ac4', dzk0: '#22222e', dzk1: '#33334a', dzc0: '#5a1e2a', dzc1: '#8a2e3a',
  dzn0: '#3a2a5a', dzn1: '#5a4a8a',
});
"""
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'art_desert.js'), 'w').write(head + "\n".join(out) + "\n})();\n")
print('wrote cracky/art_desert.js')
