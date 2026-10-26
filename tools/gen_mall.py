"""Mall of the Future + LINDA CORP. gym + shop interiors + Residences at Tomorrow. Writes cracky/art_mall.js.
Light from the upper left; props outlined in their own darkest colour; floors have no outlines."""
import sys, os, random, math
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

# ---------------------------------------------------------------- 3x5 lettering
F3 = {
 'A': ['.#.', '#.#', '###', '#.#', '#.#'], 'B': ['##.', '#.#', '##.', '#.#', '##.'], 'C': ['.##', '#..', '#..', '#..', '.##'],
 'D': ['##.', '#.#', '#.#', '#.#', '##.'], 'E': ['###', '#..', '##.', '#..', '###'], 'F': ['###', '#..', '##.', '#..', '#..'],
 'G': ['.##', '#..', '#.#', '#.#', '.##'], 'H': ['#.#', '#.#', '###', '#.#', '#.#'], 'I': ['###', '.#.', '.#.', '.#.', '###'],
 'J': ['..#', '..#', '..#', '#.#', '.#.'], 'K': ['#.#', '#.#', '##.', '#.#', '#.#'], 'L': ['#..', '#..', '#..', '#..', '###'],
 'M': ['#.#', '###', '###', '#.#', '#.#'], 'N': ['##.', '#.#', '#.#', '#.#', '#.#'], 'O': ['.#.', '#.#', '#.#', '#.#', '.#.'],
 'P': ['##.', '#.#', '##.', '#..', '#..'], 'Q': ['.#.', '#.#', '#.#', '##.', '.##'], 'R': ['##.', '#.#', '##.', '#.#', '#.#'],
 'S': ['.##', '#..', '.#.', '..#', '##.'], 'T': ['###', '.#.', '.#.', '.#.', '.#.'], 'U': ['#.#', '#.#', '#.#', '#.#', '###'],
 'V': ['#.#', '#.#', '#.#', '#.#', '.#.'], 'W': ['#.#', '#.#', '###', '###', '#.#'], 'X': ['#.#', '#.#', '.#.', '#.#', '#.#'],
 'Y': ['#.#', '#.#', '.#.', '.#.', '.#.'], 'Z': ['###', '..#', '.#.', '#..', '###'], '&': ['.#.', '#.#', '.#.', '#.#', '.##'],
 '.': ['.', '.', '.', '.', '#'], '-': ['...', '...', '###', '...', '...'], ' ': ['..', '..', '..', '..', '..'],
 '1': ['.#.', '##.', '.#.', '.#.', '###'], '2': ['##.', '..#', '.#.', '#..', '###'], '3': ['##.', '..#', '.#.', '..#', '##.'],
 '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '##.', '..#', '##.'], '6': ['.##', '#..', '##.', '#.#', '.#.'],
}
def twidth(s): return sum(len(F3[c][0]) + 1 for c in s) - 1
def text3(g, s, x, y, c, shadow=None):
    for ch in s:
        gl = F3[ch]
        for j, r in enumerate(gl):
            for i, v in enumerate(r):
                if v == '#':
                    if shadow: px(g, x + i + 1, y + j + 1, shadow)
        x += len(gl[0]) + 1
    x0 = x - (twidth(s) + 1)
    x = x0
    for ch in s:
        gl = F3[ch]
        for j, r in enumerate(gl):
            for i, v in enumerate(r):
                if v == '#': px(g, x + i, y + j, c)
        x += len(gl[0]) + 1
def ctext(g, s, cx, y, c, shadow=None): text3(g, s, cx - twidth(s) // 2, y, c, shadow)

def shadow(g, cx, cy, rx, ry):
    for y in range(len(g)):
        for x in range(len(g[0])):
            if g[y][x] == '.' and ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1: g[y][x] = '_'

def line(g, x0, y0, x1, y1, c):
    n = max(abs(x1 - x0), abs(y1 - y0)) or 1
    for i in range(n + 1): px(g, round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), c)

out_tiles = {}

# ================================================================== FLOOR TILES (legend: mall_tiles)
# plaza: cream tiles, soft grout on the bottom/right, the odd shine or scuff
def plaza(seed, extra):
    rnd = random.Random(seed); g = blank(16, 16, 'f')
    hline(g, 0, 15, 16, 'g'); vline(g, 15, 0, 16, 'g'); px(g, 15, 15, 'F')
    hline(g, 0, 0, 15, 'h'); vline(g, 0, 0, 15, 'h')
    if extra == 'shine':
        for i in range(3): px(g, 4 + i, 6 - i, 'H')
        px(g, 9, 3, 'H')
    elif extra == 'scuff':
        hline(g, 6, 10, 3, 'F'); px(g, 9, 11, 'F')
    elif extra == 'dot':
        px(g, rnd.randint(3, 11), rnd.randint(3, 11), 'F')
    return g
out_tiles['plaza0'] = plaza(1, None); out_tiles['plaza1'] = plaza(2, 'shine'); out_tiles['plaza2'] = plaza(3, 'scuff'); out_tiles['plaza3'] = plaza(4, 'dot')
# teal accent tile (for borders / paths through the plaza)
g = blank(16, 16, 't'); hline(g, 0, 15, 16, 'T'); vline(g, 15, 0, 16, 'T'); hline(g, 0, 0, 15, 'u'); vline(g, 0, 0, 15, 'u')
for i in range(4): px(g, 5 + i, 7 - i, 'U')
out_tiles['teal'] = g
# gym marble: black with a gold-ish vein and a faint glint
def marble(seed):
    rnd = random.Random(seed); g = blank(16, 16, 'k')
    hline(g, 0, 15, 16, 'K'); vline(g, 15, 0, 16, 'K'); hline(g, 0, 0, 15, 'm'); vline(g, 0, 0, 15, 'm')
    if seed % 2:
        x, y = 1, rnd.randint(3, 8)
        while x < 15:
            px(g, x, y, 'q'); x += 1; y += rnd.choice((0, 0, 1, -1)); y = max(2, min(13, y))
    if seed == 13: px(g, 9, 9, 'Q')
    return g
out_tiles['marble0'] = marble(4); out_tiles['marble1'] = marble(7); out_tiles['marble2'] = marble(13)
g = blank(16, 16, 'k'); hline(g, 0, 15, 16, 'K'); vline(g, 15, 0, 16, 'K'); hline(g, 0, 0, 15, 'm'); vline(g, 0, 0, 15, 'm')
for i in range(5): hline(g, 7 - i, 3 + i, 2 + 2 * i, 'n'); hline(g, 7 - i, 12 - i, 2 + 2 * i, 'n')
for i in range(4): hline(g, 7 - i, 4 + i, 2 + 2 * i, 'v'); hline(g, 7 - i, 11 - i, 2 + 2 * i, 'v')
px(g, 7, 4, 'y'); px(g, 6, 5, 'y')
out_tiles['marble_inlay'] = g
# apartment carpet: worn beige, a stain here and there
def carpet(seed, stain):
    rnd = random.Random(seed); g = blank(16, 16, 'c')
    for _ in range(2): px(g, rnd.randint(0, 15), rnd.randint(0, 15), 'e')

    if stain:
        x, y = rnd.randint(3, 9), rnd.randint(3, 9)
        for (dx, dy) in ((0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (2, 1), (3, 1), (1, 2), (2, 2)): px(g, x + dx, y + dy, 'C')
    return g
out_tiles['carpet0'] = carpet(21, False); out_tiles['carpet1'] = carpet(22, True); out_tiles['carpet2'] = carpet(23, False)

# ================================================================== WALL TILES (solid)
# mall interior wall (upper): lavender panels, a pink trim line and a tiny light
g = blank(16, 16, 'w'); hline(g, 0, 0, 16, 'W'); hline(g, 0, 1, 16, 'x')
hline(g, 0, 2, 16, 'p'); hline(g, 0, 3, 16, 'P')
vline(g, 7, 4, 12, 'W'); vline(g, 8, 4, 12, 'X'); vline(g, 15, 4, 12, 'X')
px(g, 3, 7, 'y'); px(g, 11, 7, 'y')
out_tiles['mwall'] = g
# mall interior wall (lower): panel + kickplate
g = blank(16, 16, 'w'); vline(g, 7, 0, 10, 'W'); vline(g, 8, 0, 10, 'X'); vline(g, 15, 0, 10, 'X')
hline(g, 0, 10, 16, 'p'); hline(g, 0, 11, 16, 'P'); rect(g, 0, 12, 16, 3, 'X'); hline(g, 0, 12, 16, 'W'); hline(g, 0, 15, 16, 'O')
out_tiles['mwallb'] = g
# the space outside the mall ("outside of time and space"): purple void with stars
def void(seed):
    rnd = random.Random(seed); g = blank(16, 16, 'z')
    for _ in range(3): px(g, rnd.randint(0, 15), rnd.randint(0, 15), 'Z')
    if seed % 2: px(g, 7, 7, 'H'); px(g, 6, 7, 'Z'); px(g, 8, 7, 'Z'); px(g, 7, 6, 'Z'); px(g, 7, 8, 'Z')
    return g
out_tiles['void0'] = void(31); out_tiles['void1'] = void(32); out_tiles['void2'] = void(34)
# gym wall: black lacquer with a gold rail
g = blank(16, 16, 'K'); hline(g, 0, 0, 16, 'm'); hline(g, 0, 11, 16, 'v'); hline(g, 0, 12, 16, 'n'); hline(g, 0, 13, 16, 'v')
rect(g, 0, 14, 16, 2, 'k'); px(g, 4, 5, 'm'); px(g, 12, 5, 'm')
out_tiles['gwall'] = g
# apartment wallpaper (upper + lower): sickly yellow stripes, a water stain
g = blank(16, 16, 'a')
for x in (2, 3, 10, 11): vline(g, x, 0, 16, 'A')
hline(g, 0, 0, 16, 'b'); hline(g, 0, 1, 16, 'B')

out_tiles['awall'] = g
g = blank(16, 16, 'a')
for x in (2, 3, 10, 11): vline(g, x, 0, 10, 'A')
hline(g, 0, 10, 16, 'B'); rect(g, 0, 11, 16, 4, 'b'); hline(g, 0, 11, 16, 'a'); hline(g, 0, 15, 16, 'O')
out_tiles['awallb'] = g

TILE_LEGEND = ("{ f: 'mlf3', F: 'mlf1', G: 'mlf0', g: 'mlf2', q: 'mlk3', Q: 'mlg2', h: '#fffdf8', H: '#ffffff', t: 'mlt3', T: 'mlt2', u: 'mlt4', U: '#ffffff', "
    "k: 'mlk1', K: 'mlk0', m: 'mlk2', n: 'mlg2', v: 'mlg1', c: 'mla2', C: 'mla1', e: 'mla3', "
    "w: 'mlw2', W: 'mlw3', x: 'mlw1', X: 'mlw1', p: 'mlp2', P: 'mlp1', y: 'mlg3', O: 'mlw0', "
    "z: 'mlv0', Z: 'mlv2', a: 'mly2', A: 'mly1', b: 'mly1', B: 'mly0' }")

# ================================================================== TERRAINS
runway_fill = blank(16, 16, 'r')
for y in (3, 11):
    for x in range(0, 16, 4): px(runway_fill, x + (2 if y == 11 else 0), y, 'R')

# ================================================================== PROPS
props = []      # (name, grid, legend, origin)

# ---- storefront 80x64 (fw5 fh3, door in the middle of the bottom row)
STORE_LEG = ("{ o: 'mlw0', w: 'mlw2', W: 'mlw3', x: 'mlw1', s: 'mlf3', S: 'mlf2', g: 'gl1', G: 'gl2', Z: 'gl3', i: 'mlk2', I: 'mlk1', "
             "a: 'A1', A: 'A2', b: 'B1', B: 'B2', t: 'T1', T: 'T2', y: 'mlg3', k: 'ink2' }")
def storefront(sign, aw1, aw2, signbg, signtx, deco=None):
    g = blank(80, 64)
    rect(g, 0, 0, 80, 64, 'w')
    hline(g, 0, 0, 80, 'W'); hline(g, 0, 1, 80, 'W')
    for x in (0, 79): vline(g, x, 0, 64, 'x')
    # sign board
    tw = twidth(sign); bw = max(tw + 10, 30); bx = 40 - bw // 2
    rect(g, bx, 3, bw, 11, 'o'); rect(g, bx + 1, 4, bw - 2, 9, 'b'); hline(g, bx + 1, 4, bw - 2, 'B')
    ctext(g, sign, 40, 6, 't', shadow='T')
    # awning: stripes + scallops
    for x in range(1, 79):
        c = 'a' if (x // 4) % 2 == 0 else 'A'
        for y in range(16, 22): g[y][x] = c
    for x in range(1, 79):
        if (x // 4) % 2 == 0 and x % 4 in (1, 2): px(g, x, 22, 'a')
        elif (x // 4) % 2 == 1 and x % 4 in (1, 2): px(g, x, 22, 'A')
    hline(g, 1, 16, 78, 'o')
    # windows
    for wx in (5, 53):
        rect(g, wx, 27, 22, 26, 'o'); rect(g, wx + 1, 28, 20, 24, 'g')
        for i in range(8): px(g, wx + 3 + i, 49 - i, 'G'); px(g, wx + 4 + i, 49 - i, 'G')
        px(g, wx + 15, 31, 'Z'); px(g, wx + 16, 31, 'Z'); px(g, wx + 16, 32, 'Z')
        hline(g, wx, 53, 22, 'x'); hline(g, wx - 1, 54, 24, 'o')
    if deco: deco(g)
    # double glass door
    rect(g, 31, 30, 18, 34, 'o'); rect(g, 32, 31, 16, 33, 'i'); vline(g, 39, 31, 33, 'o'); vline(g, 40, 31, 33, 'o')
    rect(g, 33, 32, 5, 30, 'I'); rect(g, 42, 32, 5, 30, 'I')
    for i in range(4): px(g, 33 + i, 40 - i, 'g'); px(g, 42 + i, 40 - i, 'g')
    px(g, 37, 46, 'y'); px(g, 42, 46, 'y')
    # kickplate
    hline(g, 1, 62, 30, 'x'); hline(g, 49, 62, 30, 'x'); hline(g, 0, 63, 80, 'o')
    outline_except(g, 'o')
    return g
def leg(base, **cols):
    s = base
    for k, v in cols.items(): s = s.replace(f"'{k}'", f"'{v}'")
    return s

def deco_pills(g):   # pill bottles in both windows
    for wx in (8, 56):
        for i, c in enumerate('aAa'):
            x = wx + i * 6; rect(g, x, 42, 4, 8, 'W'); rect(g, x, 40, 4, 2, c); hline(g, x, 45, 4, c)
def deco_pretzel(g):
    for wx in (9, 57):
        pts = [(1, 2), (2, 1), (3, 1), (4, 2), (5, 3), (6, 2), (7, 1), (8, 1), (9, 2), (9, 3), (8, 4), (7, 5), (6, 6), (5, 7), (4, 6),
               (3, 5), (2, 4), (1, 3), (4, 4), (5, 5), (6, 4), (3, 7), (7, 7), (2, 8), (8, 8)]
        for (x, y) in pts: px(g, wx + x + 2, 36 + y, 'a')
        for (x, y) in ((2, 1), (7, 1), (5, 3)): px(g, wx + x + 2, 36 + y, 'A')
def deco_boxes(g):
    for wx in (7, 55):
        rect(g, wx, 42, 8, 8, 'a'); hline(g, wx, 42, 8, 'A'); rect(g, wx + 9, 45, 7, 5, 'b'); hline(g, wx + 9, 45, 7, 'B')
        rect(g, wx + 3, 36, 7, 6, 'b'); hline(g, wx + 3, 36, 7, 'B'); px(g, wx + 6, 38, 'y')

props.append(('store_prop', storefront('PROP SHOP', 0, 0, 0, 0, deco_pills),
              leg(STORE_LEG, A1='mlt2', A2='mlt4', B1='mlt1', B2='mlt2', T1='mlt4', T2='mlt0'), None))
props.append(('store_food', storefront('FOOD COURT', 0, 0, 0, 0, deco_pretzel),
              leg(STORE_LEG, A1='mlg2', A2='mlf3', B1='mlp1', B2='mlp2', T1='mlg3', T2='mlp0').replace("'A1'", "'mlg2'"), None))
props.append(('store_lost', storefront('LOST & FOUND', 0, 0, 0, 0, deco_boxes),
              leg(STORE_LEG, A1='wd2', A2='wd4', B1='mlk1', B2='mlk2', T1='mlg3', T2='mlk0'), None))

# ---- LINDA CORP. (gym 1): 112x80, fw7 fh3, door col 3
def linda_corp():
    g = blank(112, 80)
    rect(g, 4, 10, 104, 70, 'k')
    # pediment
    for i in range(10): hline(g, 4 + 10 - i, i, 104 - 2 * (10 - i), 'k' if i else 'v')
    hline(g, 2, 10, 108, 'v'); hline(g, 2, 11, 108, 'n')
    rect(g, 30, 14, 52, 13, 'v'); rect(g, 31, 15, 50, 11, 'p'); hline(g, 31, 15, 50, 'P')
    ctext(g, 'LINDA CORP.', 56, 18, 'y', shadow='q')
    # gold columns
    for cx in (10, 26, 82, 98):
        rect(g, cx - 3, 30, 7, 46, 'n'); vline(g, cx - 3, 30, 46, 'y'); vline(g, cx + 3, 30, 46, 'v'); vline(g, cx, 32, 42, 'v')
        rect(g, cx - 5, 28, 11, 3, 'y'); hline(g, cx - 5, 30, 11, 'v'); rect(g, cx - 5, 75, 11, 3, 'v')
    # tall windows (dark glass with a pink glow)
    for wx in (36, 66):
        rect(g, wx, 34, 10, 30, 'K'); rect(g, wx + 1, 35, 8, 28, 'm'); hline(g, wx + 1, 35, 8, 'p')
        for i in range(5): px(g, wx + 2 + i, 50 - i, 'P')
    # grand door
    rect(g, 49, 44, 14, 36, 'v'); rect(g, 50, 45, 12, 35, 'K'); vline(g, 55, 45, 35, 'v'); vline(g, 56, 45, 35, 'v')
    px(g, 53, 62, 'y'); px(g, 58, 62, 'y')
    for i in range(3): hline(g, 46 - i * 2, 77 + i - 1, 20 + i * 4, 'n' if i % 2 else 'v')
    hline(g, 4, 79, 104, 'K')
    # little pink banners between columns
    for bx in (16, 92):
        rect(g, bx, 34, 5, 16, 'p'); vline(g, bx, 34, 16, 'P'); px(g, bx + 2, 50, 'p'); px(g, bx + 1, 49, 'p'); px(g, bx + 3, 49, 'p')
        px(g, bx + 2, 40, 'y')
    outline_except(g, 'o')
    return g
props.append(('linda_corp', linda_corp(), "{ o: 'mlk0', k: 'mlk2', K: 'mlk1', m: 'mlk3', v: 'mlg1', n: 'mlg2', y: 'mlg3', p: 'mlp2', P: 'mlp1', q: 'mlp0' }", None))

# ---- Residences at Tomorrow wing door: 80x64 fw5 fh3, dingy beige, flickering sign
def residences():
    g = blank(80, 64)
    rect(g, 0, 0, 80, 64, 'w'); hline(g, 0, 0, 80, 'W')
    for x in range(0, 80, 10): vline(g, x, 2, 60, 'x')
    for y in range(12, 62, 10): hline(g, 0, y, 80, 'x')
    rect(g, 12, 3, 56, 11, 'o'); rect(g, 13, 4, 54, 9, 'b'); hline(g, 13, 4, 54, 'B')
    ctext(g, 'RESIDENCES', 40, 6, 'y', shadow='Y')
    # the "TOMORROW" bit is broken: only some letters lit
    tw = twidth('AT TOMORROW'); sx = 40 - tw // 2
    rect(g, sx - 3, 16, tw + 6, 9, 'o'); rect(g, sx - 2, 17, tw + 4, 7, 'k')
    text3(g, 'AT TOMORROW', sx, 18, 'y')
    x0 = sx + twidth('AT TOM')     # one dead bulb: the second O
    for y in range(18, 23):
        for x in range(x0 + 1, x0 + 4):
            if g[y][x] == 'y': g[y][x] = 'K'
    # metal security door, half-open shutter
    rect(g, 28, 28, 24, 36, 'o'); rect(g, 29, 29, 22, 35, 'k')
    for y in range(29, 44, 2): hline(g, 29, y, 22, 'm')
    hline(g, 29, 44, 22, 'M')
    rect(g, 29, 45, 22, 19, 'K')
    # paper notice taped by the door
    rect(g, 56, 34, 13, 15, 'p'); hline(g, 56, 34, 13, 'P'); px(g, 58, 34, 'q'); px(g, 66, 34, 'q')
    for y in (37, 40, 43, 46): hline(g, 58, y, 9 - (y % 3), 'K')
    # a sad window
    rect(g, 7, 30, 14, 14, 'o'); rect(g, 8, 31, 12, 12, 'g'); vline(g, 14, 31, 12, 'o'); hline(g, 8, 37, 12, 'o')
    hline(g, 0, 63, 80, 'o')
    outline_except(g, 'o')
    return g
props.append(('res_door', residences(), "{ o: 'mlw0', w: 'mly2', W: 'mly3', x: 'mly1', b: 'mlk1', B: 'mlk2', y: 'mlg3', Y: 'mlg0', k: 'mlk1', K: 'mlk2', m: 'st2', M: 'st3', p: 'mlf3', P: 'mlf2', q: 'mlp2', g: 'mly1' }", None))

# ---- fountain 48x40, fw3 fh2, two frames
def fountain(f):
    g = blank(48, 40)
    oval_ = lambda cx, cy, rx, ry, c: [px(g, x, y, c) for y in range(40) for x in range(48) if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1]
    shadow(g, 25, 34, 23, 5)
    oval_(24, 31, 22, 7, 'z'); oval_(24, 29, 22, 7, 's'); oval_(24, 26, 22, 7, 'S')
    oval_(23, 25, 21, 6, 'H')                      # lit rim edge (upper-left)
    oval_(24, 26, 21, 6, 'S'); oval_(24, 26, 19, 5, 'b'); oval_(24, 25, 18, 4, 'B')
    for (x, y, w) in ((10, 25, 3), (34, 27, 4), (19, 28, 3), (28, 23, 2)): hline(g, x + (f if x > 24 else -f), y, w, 'c')
    # pedestal + upper bowl
    rect(g, 22, 15, 5, 11, 's'); vline(g, 22, 15, 11, 'S'); vline(g, 26, 15, 11, 'z')
    oval_(24, 16, 9, 3, 'z'); oval_(24, 15, 9, 3, 'S'); oval_(24, 15, 7, 2, 'b'); hline(g, 20, 14, 6, 'B')
    # the jet and its spray
    top = 2 + f
    for y in range(top, 15): px(g, 24, y, 'W'); px(g, 23, y, 'c') if y > top + 2 else None
    spray = [(-2, 1), (-4, 2), (-6, 4), (-7, 7), (-8, 10), (2, 1), (4, 2), (6, 4), (7, 7), (8, 10)]
    for i, (dx, dy) in enumerate(spray):
        if (i + f) % 2 == 0 or abs(dx) < 5: px(g, 24 + dx, top + dy, 'W' if abs(dx) < 5 else 'c')
    for sx in (15, 33):                             # drips off the upper bowl
        for y in range(17 + f, 24, 3): px(g, sx, y, 'c')
    outline_except(g, 'o', '_')
    return g
props.append(('fountain', [fountain(0), fountain(1)], "{ o: 'mlw0', _: 'mlf1', z: 'mlw1', H: '#ffffff', s: 'mlw2', S: 'mlw3', b: 'wa2', B: 'wa3', c: 'wa4', W: '#ffffff' }", None))

# ---- planter 16x24 (a fan palm in a pink pot)
def planter():
    g = blank(16, 24)
    for (x1, y1, s) in ((1, 4, 1), (14, 4, -1), (3, 1, 1), (12, 1, -1), (8, 0, 0), (0, 9, 1), (15, 9, -1)):
        line(g, 8, 13, x1, y1, '2'); line(g, 8, 12, x1, y1 + 1, '3')
    for (x, y) in ((5, 7), (10, 7), (8, 5), (6, 10), (10, 10)): px(g, x, y, '4')
    rect(g, 3, 14, 10, 2, 'P'); rect(g, 4, 16, 8, 6, 'p'); vline(g, 4, 16, 6, 'q'); vline(g, 11, 16, 6, 'P'); hline(g, 3, 14, 10, 'q')
    rect(g, 4, 13, 8, 1, 'd')
    shadow(g, 8, 22, 7, 2)
    outline_except(g, 'o', '_')
    return g
props.append(('planter', planter(), "{ _: 'mlf1', o: 'lf0', 2: 'lf2', 3: 'lf3', 4: 'lf4', p: 'mlp2', P: 'mlp1', q: 'mlp3', d: 'wd1' }", None))

# ---- bench 32x16 (teal slats, gold legs)
def bench():
    g = blank(32, 16)
    rect(g, 1, 2, 30, 3, 't'); hline(g, 1, 2, 30, 'u'); rect(g, 1, 7, 30, 3, 't'); hline(g, 1, 7, 30, 'u'); hline(g, 1, 9, 30, 'T')
    for x in (3, 27): rect(g, x, 5, 2, 2, 'v'); rect(g, x, 10, 2, 4, 'v'); px(g, x, 10, 'y')
    shadow(g, 16, 14, 15, 2)
    outline_except(g, 'o', '_')
    return g
props.append(('bench', bench(), "{ _: 'mlf1', o: 'mlt0', t: 'mlt2', T: 'mlt1', u: 'mlt3', v: 'mlg1', y: 'mlg3' }", None))

# ---- escalator 32x48 fw2 fh3
def escalator():
    g = blank(32, 48)
    rect(g, 0, 0, 32, 48, 'r'); vline(g, 0, 0, 48, 'k'); vline(g, 1, 0, 48, 'K'); vline(g, 31, 0, 48, 'k'); vline(g, 30, 0, 48, 'K')
    rect(g, 4, 0, 24, 48, 's')
    for y in range(1, 48, 4): hline(g, 4, y, 24, 'S'); hline(g, 4, y + 1, 24, 'm')
    for y in range(0, 48): px(g, 2, y, 'y' if y % 6 < 3 else 'K'); px(g, 29, y, 'y' if y % 6 < 3 else 'K')
    hline(g, 4, 0, 24, 'W'); hline(g, 4, 46, 24, 'M'); hline(g, 4, 47, 24, 'k')
    rect(g, 9, 18, 14, 9, 'k'); ctext(g, 'UP', 16, 20, 'y')
    outline_except(g, 'o')
    return g
props.append(('escalator', escalator(), "{ o: 'mlk0', r: 'mlk2', k: 'mlk1', K: 'mlk3', s: 'st2', S: 'st1', m: 'st3', M: 'st1', W: 'st4', y: 'mlg3' }", None))

# ---- directory board 16x32 ("YOU ARE HERE" map)
def directory():
    g = blank(16, 32)
    rect(g, 1, 2, 14, 20, 'f'); rect(g, 2, 3, 12, 18, 'w')
    rect(g, 3, 5, 4, 3, 'p'); rect(g, 8, 5, 5, 3, 't'); rect(g, 3, 9, 10, 2, 'y'); rect(g, 3, 12, 5, 5, 'P'); rect(g, 9, 12, 4, 5, 'T')
    px(g, 10, 17, 'r'); px(g, 9, 18, 'r'); px(g, 11, 18, 'r'); px(g, 10, 19, 'r')
    hline(g, 1, 2, 14, 'F')
    rect(g, 7, 22, 2, 8, 'f'); vline(g, 7, 22, 8, 'F'); rect(g, 4, 29, 8, 2, 'f')
    shadow(g, 8, 30.5, 6, 1.6)
    outline_except(g, 'o', '_')
    return g
props.append(('directory', directory(), "{ _: 'mlf1', o: 'mlk0', f: 'mlg1', F: 'mlg3', w: 'mlf3', p: 'mlp2', P: 'mlp3', t: 'mlt2', T: 'mlt3', y: 'mlg2', r: 'jk2' }", None))

# ---- STATUE OF LINDA-TY: 32x56, fw2 fh2. Oxidised-copper Linda raising a pretzel torch on a pedestal
def statue():
    g = blank(32, 56)
    shadow(g, 17, 54, 15, 2.5)
    # pedestal: two steps and a plaque
    rect(g, 4, 40, 24, 14, 's'); vline(g, 4, 40, 14, 'S'); vline(g, 27, 40, 14, 'z'); hline(g, 4, 53, 24, 'z')
    rect(g, 2, 37, 28, 3, 'S'); hline(g, 2, 39, 28, 's')
    rect(g, 5, 43, 22, 7, 'y'); hline(g, 5, 43, 22, 'Y'); vline(g, 26, 43, 7, 'q'); ctext(g, 'LINDA', 16, 44, 'q')
    # long robe (wide at the hem), lit from the left
    for y in range(22, 37):
        w = 3 + (y - 22) * 5 // 14
        for x in range(16 - w, 17 + w): g[y][x] = '4' if x < 16 - w + 2 else '3' if x < 17 else '2' if x < 17 + w - 1 else '1'
    for y in range(25, 37, 2): px(g, 17, y, '2'); px(g, 14, y + 1, '3')
    # head
    rect(g, 14, 15, 5, 6, '3'); vline(g, 14, 16, 4, '4'); vline(g, 18, 15, 6, '2'); hline(g, 15, 21, 3, '2')
    px(g, 15, 18, '1'); px(g, 17, 18, '1')
    # crown of rays + the famous rolled ponytail
    for (x, y) in ((13, 13), (15, 12), (17, 12), (19, 13), (12, 14), (20, 14)): px(g, x, y, '4')
    hline(g, 13, 14, 7, '3')
    rect(g, 19, 16, 3, 3, '2'); rect(g, 20, 19, 3, 3, '2'); px(g, 20, 16, '3'); px(g, 21, 19, '3'); px(g, 22, 21, '1')
    # raised right arm (her right = our left) holding a pretzel torch
    for i in range(10): px(g, 12 - i // 4, 22 - i, '3'); px(g, 13 - i // 4, 22 - i, '2')
    rect(g, 8, 10, 3, 3, '3'); px(g, 8, 10, '4')
    for (x, y) in ((7, 6), (8, 5), (10, 5), (11, 6), (11, 7), (10, 8), (9, 7), (8, 8), (7, 7), (9, 6)): px(g, x, y, 'P')
    px(g, 8, 6, 'p'); px(g, 10, 6, 'p')
    px(g, 9, 1, 'Y'); px(g, 9, 2, 'y'); px(g, 8, 3, 'y'); px(g, 10, 3, 'Y'); px(g, 9, 3, 'Y'); px(g, 9, 4, 'y')
    # tablet (a phone, obviously) in the other arm
    rect(g, 19, 24, 4, 6, '4'); vline(g, 22, 24, 6, '2'); px(g, 20, 25, '1')
    outline_except(g, 'o', '_')
    return g
props.append(('statue', statue(), "{ o: 'mlt0', _: 'mlf1', p: 'wd4', 1: 'mlt1', 2: 'mlt2', 3: 'mlt3', 4: 'mlt4', s: 'mlw2', S: 'mlw3', z: 'mlw1', y: 'mlg2', Y: 'mlg3', q: 'mlg0', P: 'wd3' }", None))

# ================================================================== INTERIOR PIECES
# ---- shop counter 48x24 fw3 fh1, cash register on top
def counter():
    g = blank(48, 24)
    rect(g, 0, 4, 48, 6, 't'); hline(g, 0, 4, 48, 'u'); hline(g, 0, 9, 48, 'T')
    rect(g, 1, 10, 46, 13, 'w'); for_ = [vline(g, x, 11, 11, 'x') for x in range(4, 46, 6)]
    hline(g, 1, 22, 46, 'x'); hline(g, 1, 13, 46, 'p'); hline(g, 1, 14, 46, 'P')
    # register
    rect(g, 30, 0, 12, 6, 'k'); rect(g, 31, 1, 10, 2, 'g'); rect(g, 29, 5, 14, 3, 'K'); px(g, 32, 6, 'y'); px(g, 35, 6, 'y'); px(g, 38, 6, 'y')
    # little pill display
    for i, c in enumerate('pPp'): rect(g, 6 + i * 4, 1, 3, 4, 'W'); px(g, 6 + i * 4, 1, c); px(g, 7 + i * 4, 1, c); px(g, 8 + i * 4, 1, c)
    outline_except(g, 'o')
    return g
props.append(('counter', counter(), "{ o: 'mlt0', t: 'mlt3', u: 'mlt4', T: 'mlt2', w: 'mlf3', x: 'mlf1', p: 'mlp2', P: 'mlp1', k: 'mlk2', K: 'mlk1', g: 'ey1', y: 'mlg3', W: '#ffffff' }", None))

# ---- Lost & Found terminal 16x32 (beige retro PC, green screen)
def terminal():
    g = blank(16, 32)
    rect(g, 1, 3, 14, 12, 'b'); hline(g, 1, 3, 14, 'B'); vline(g, 1, 3, 12, 'B'); vline(g, 14, 3, 12, 'c')
    rect(g, 3, 5, 10, 7, 'k'); rect(g, 4, 6, 8, 5, 'g')
    for y in (7, 9): hline(g, 5, y, 5 - (y % 3), 'G')
    px(g, 11, 13, 'r')
    rect(g, 2, 15, 12, 3, 'b'); hline(g, 2, 15, 12, 'B'); for_ = [px(g, x, 16, 'c') for x in range(3, 13, 2)]
    rect(g, 4, 18, 8, 12, 'w'); vline(g, 4, 18, 12, 'W'); vline(g, 11, 18, 12, 'x'); rect(g, 3, 29, 10, 2, 'x')
    ctext(g, 'L&F', 8, 21, 'y')
    shadow(g, 8, 30.5, 7, 1.6)
    outline_except(g, 'o', '_')
    return g
props.append(('terminal', terminal(), "{ _: 'mlf1', o: 'mlk0', b: 'wl3', B: 'wl4', c: 'wl1', k: 'mlk1', g: '#1f6e3a', G: '#7cf08a', r: 'jk2', w: 'mlk2', W: 'mlk3', x: 'mlk1', y: 'mlg3' }", None))

# ---- food court table 32x24 fw2 fh1 (tray with a pretzel + two cups) and stools
def ftable():
    g = blank(32, 24)
    for sx in (2, 26):
        ball(g, sx + 2, 18, 3, 2, 'pP'); rect(g, sx + 1, 19, 2, 4, 'k')
    rect(g, 6, 6, 20, 9, 'w'); hline(g, 6, 6, 20, 'W'); hline(g, 6, 14, 20, 'x')
    rect(g, 15, 15, 2, 7, 'k'); rect(g, 12, 21, 8, 2, 'k')
    rect(g, 9, 7, 9, 6, 't'); hline(g, 9, 7, 9, 'u')
    for (x, y) in ((11, 9), (12, 8), (13, 9), (14, 8), (15, 9), (14, 10), (13, 11), (12, 10), (11, 10)): px(g, x, y, 'd')
    for cx in (20, 23): rect(g, cx, 7, 2, 4, 'r'); px(g, cx, 7, 'W')
    shadow(g, 16, 22.5, 14, 1.6)
    outline_except(g, 'o', '_')
    return g
props.append(('ftable', ftable(), "{ _: 'mlf1', o: 'mlk0', w: 'mlf3', W: '#ffffff', x: 'mlf1', k: 'st1', p: 'mlp2', P: 'mlp1', t: 'mlt2', u: 'mlt3', d: 'wd3', r: 'jk2' }", None))

# ---- gym pillar 16x40 (black + gold)
def pillar():
    g = blank(16, 40)
    rect(g, 3, 4, 10, 32, 'k'); vline(g, 3, 4, 32, 'm'); vline(g, 12, 4, 32, 'K'); vline(g, 7, 6, 28, 'v')
    rect(g, 1, 1, 14, 4, 'n'); hline(g, 1, 1, 14, 'y'); hline(g, 1, 4, 14, 'v')
    rect(g, 1, 35, 14, 4, 'n'); hline(g, 1, 35, 14, 'y'); hline(g, 1, 38, 14, 'v')
    shadow(g, 8, 38.5, 8, 1.6)
    outline_except(g, 'o', '_')
    return g
props.append(('pillar', pillar(), "{ _: 'mlk0', o: 'mlk0', k: 'mlk2', m: 'mlk3', K: 'mlk1', v: 'mlg1', n: 'mlg2', y: 'mlg3' }", None))

# ---- apartment door 16x32 (stands on a wall row, numbered plate), variants
def aptdoor(num, shut=False):
    g = blank(16, 32)
    rect(g, 1, 6, 14, 26, 'd'); vline(g, 1, 6, 26, 'D'); hline(g, 1, 6, 14, 'D')
    rect(g, 3, 8, 10, 9, 'e'); rect(g, 3, 19, 10, 11, 'e'); hline(g, 3, 8, 10, 'E'); hline(g, 3, 19, 10, 'E')
    px(g, 12, 20, 'y'); px(g, 12, 21, 'Y')
    rect(g, 5, 1, 7, 7, 'k'); rect(g, 6, 2, 5, 5, 'b'); ctext(g, num, 8, 2, 'y')
    if shut:   # painted shut: drips of yellow paint over the frame
        for x in range(1, 15):
            px(g, x, 6, 'a')
            if x % 3 == 0: px(g, x, 7, 'a'); px(g, x, 8, 'a')
            if x % 5 == 1: px(g, x, 9, 'a')
        for y in range(6, 32): px(g, 1, y, 'a'); px(g, 14, y, 'a')
    outline_except(g, 'o')
    return g
APT_LEG = "{ o: 'mly0', d: 'wd1', D: 'wd2', e: 'wd2', E: 'wd3', y: 'mlg3', Y: 'mlg1', k: 'mlk0', b: 'mlk1', a: 'mly2' }"
props.append(('aptdoor', {'n1': aptdoor('1A'), 'n2': aptdoor('2B'), 'n3': aptdoor('2C'), 'n3f': aptdoor('3F', True)}, APT_LEG, None))

# ---- floor lamp 16x32 (warm shade, cheap glow)
def lamp():
    g = blank(16, 32)
    for y in range(2, 10):
        w = 2 + (y - 2) // 2
        hline(g, 8 - w, y, w * 2, 'l' if y < 8 else 'L')
    for y in range(3, 9): px(g, 8 - (2 + (y - 2) // 2), y, 'h')
    hline(g, 4, 10, 8, 'y')
    rect(g, 7, 11, 2, 18, 'k'); vline(g, 7, 11, 18, 'K')
    rect(g, 4, 29, 8, 2, 'k'); hline(g, 4, 29, 8, 'K')
    shadow(g, 8, 30.5, 5, 1.6)
    outline_except(g, 'o', '_')
    return g
props.append(('lamp_in', lamp(), "{ _: 'mla1', o: 'mly0', l: 'mly3', L: 'mly2', h: '#fffbe0', y: 'mlg3', k: 'st1', K: 'st2' }", None))

# ---- sad houseplant 16x24 (droopy, a brown leaf)
def sadplant():
    g = blank(16, 24)
    for (pts, c) in ((((8, 14), (7, 10), (5, 8), (3, 9), (2, 11)), '2'), (((8, 14), (9, 9), (11, 7), (13, 8), (14, 11)), '2'),
                     (((8, 14), (8, 8), (7, 5), (5, 4)), '3'), (((8, 14), (10, 11), (12, 12), (13, 15)), 'b')):
        for (a, b) in zip(pts, pts[1:]): line(g, a[0], a[1], b[0], b[1], c)
    for (x, y) in ((3, 10), (4, 9), (12, 8), (13, 9), (6, 5), (12, 13)): px(g, x, y, '3' if y < 12 else 'B')
    rect(g, 4, 15, 8, 2, 'P'); rect(g, 5, 17, 6, 5, 'p'); vline(g, 5, 17, 5, 'q'); hline(g, 4, 15, 8, 'q'); hline(g, 5, 14, 6, 'd')
    shadow(g, 8, 22, 6, 2)
    outline_except(g, 'o', '_')
    return g
props.append(('sadplant', sadplant(), "{ _: 'mla1', o: 'lf0', 2: 'lf2', 3: 'lf3', b: 'wd2', B: 'wd3', p: 'wl2', P: 'wl1', q: 'wl3', d: 'wd1' }", None))

# ================================================================== emit JS
def frames_js(gs):
    if isinstance(gs, dict): return "\n".join(js(k, v) for k, v in gs.items())
    if isinstance(gs, list) and isinstance(gs[0][0], list): return "\n".join(js(str(i), v) for i, v in enumerate(gs))
    return js('0', gs)

out = ["// Cracky — Mall of the Future, LINDA CORP., shop interiors, Residences at Tomorrow. Generated by tools/gen_mall.py.", "(function () {", "const S = Sprout;", "",
"Sprout.palette({",
"  // plaza floor (cream), lavender walls, mall pink, teal, gold, black lacquer",
"  mlf0: '#a898a4', mlf1: '#d4c6cc', mlf2: '#ece2e2', mlf3: '#f8f2ec',",
"  mlw0: '#3a2a4a', mlw1: '#6e5e86', mlw2: '#a796bc', mlw3: '#d4c8e2',",
"  mlp0: '#5e1e44', mlp1: '#b23a6a', mlp2: '#e66a96', mlp3: '#f8a6c2',",
"  mlt0: '#12384a', mlt1: '#1c6672', mlt2: '#2c9a9a', mlt3: '#66ccbc', mlt4: '#b6eedc',",
"  mlg0: '#5e3e12', mlg1: '#a8761c', mlg2: '#e0b034', mlg3: '#fbe08a',",
"  mlk0: '#100e18', mlk1: '#1e1b2a', mlk2: '#2e2a3e', mlk3: '#48425e',",
"  // the void outside the mall, apartment carpet + wallpaper",
"  mlv0: '#241a3c', mlv2: '#8a72c0',",
"  mla1: '#4a6458', mla2: '#66826c', mla3: '#7e9a7e',",
"  mly0: '#4e4226', mly1: '#a08c48', mly2: '#cab868', mly3: '#e8dc9c',",
"});", "",
"S.sprite('mall_tiles', {", "  w: 16, h: 16,", f"  legend: {TILE_LEGEND},", "  frames: {"]
for k, g in out_tiles.items(): out.append(js(k, g))
out += ["  },", "});",
"S.tile('plaza', { sprite: 'mall_tiles', frames: ['plaza0', 'plaza1', 'plaza2', 'plaza3'], weights: [6, 1, 1, 2] });",
"S.tile('plaza_teal', { sprite: 'mall_tiles', frame: 'teal' });",
"S.tile('marble', { sprite: 'mall_tiles', frames: ['marble0', 'marble1', 'marble2'], weights: [5, 3, 1] });",
"S.tile('marble_inlay', { sprite: 'mall_tiles', frame: 'marble_inlay' });",
"S.tile('carpet', { sprite: 'mall_tiles', frames: ['carpet0', 'carpet1', 'carpet2'], weights: [4, 1, 3] });",
"S.tile('mwall', { sprite: 'mall_tiles', frame: 'mwall', solid: true });",
"S.tile('mwallb', { sprite: 'mall_tiles', frame: 'mwallb', solid: true });",
"S.tile('void', { sprite: 'mall_tiles', frames: ['void0', 'void1', 'void2'], weights: [4, 1, 3], solid: true });",
"S.tile('gwall', { sprite: 'mall_tiles', frame: 'gwall', solid: true });",
"S.tile('awall', { sprite: 'mall_tiles', frame: 'awall', solid: true });",
"S.tile('awallb', { sprite: 'mall_tiles', frame: 'awallb', solid: true });",
"",
"// pink runway (plaza walkways, the gym)",
"S.terrain('runway', {",
"  legend: { r: 'mlp2', R: 'mlp3' },",
"  fill: [", ",\n".join(f"    '{''.join(r)}'" for r in runway_fill) + ",", "  ],",
"  bands: { top: ['mlg1', 'mlg3', 'mlp1'], left: ['mlg1', 'mlg2'], right: ['mlg1', 'mlg2'], bottom: ['mlg1', 'mlg3'] },",
"  radius: 2, wobble: 0,",
"});", ""]
for name, gs, legend, origin in props:
    first = list(gs.values())[0] if isinstance(gs, dict) else gs[0] if isinstance(gs[0][0], list) else gs
    h, w = len(first), len(first[0])
    out.append(f"S.sprite('{name}', {{ w: {w}, h: {h}, origin: {origin or [0, h]},\n  legend: {legend},\n  frames: {{\n{frames_js(gs)}\n  }} }});")
out += [
"",
"// ---------------------------------------------------------------- props",
"S.prop('store_prop', { sprite: 'store_prop', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });",
"S.prop('store_food', { sprite: 'store_food', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });",
"S.prop('store_lost', { sprite: 'store_lost', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });",
"S.prop('linda_corp', { sprite: 'linda_corp', fw: 7, fh: 3, solid: ['xxxxxxx', 'xxxxxxx', 'xxxDxxx'] });",
"S.prop('res_door', { sprite: 'res_door', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });",
"S.prop('fountain', { sprite: 'fountain', fw: 3, fh: 2, anim: ['0', '1'], rate: 18, talk: 'A fountain. The coins at the bottom are from currencies that don\\'t exist yet.' });",
"S.prop('planter', { sprite: 'planter', talk: 'A potted palm. It is plastic, but it believes.' });",
"S.prop('bench', { sprite: 'bench', fw: 2, talk: 'A mall bench. Someone has been waiting here since 1987.' });",
"S.prop('escalator', { sprite: 'escalator', fw: 2, fh: 3, talk: ['UP ONLY.', 'It only goes up. Nobody knows where to.'] });",
"S.prop('directory', { sprite: 'directory', talk: ['{blue}MALL DIRECTORY{/}', 'YOU ARE HERE. You are also, technically, nowhere.'] });",
"S.prop('statue', { sprite: 'statue', fw: 2, fh: 2, talk: ['{blue}THE STATUE OF LINDA-TY{/}', '\"Give me your tired, your poor, your huddled shoppers.\"'] });",
"S.prop('counter', { sprite: 'counter', fw: 3 });",
"S.prop('terminal', { sprite: 'terminal' });",
"S.prop('ftable', { sprite: 'ftable', fw: 2 });",
"S.prop('pillar', { sprite: 'pillar' });",
"S.prop('aptdoor1', { sprite: 'aptdoor', frame: 'n1', solid: ['D'] });",
"S.prop('aptdoor2', { sprite: 'aptdoor', frame: 'n2', solid: ['D'] });",
"S.prop('aptdoor3', { sprite: 'aptdoor', frame: 'n3', solid: ['D'] });",
"S.prop('aptdoor3f', { sprite: 'aptdoor', frame: 'n3f', talk: ['Unit 3F. The door has been painted shut.', 'Something on the other side is humming along to the walls.'] });",
"S.prop('lamp_in', { sprite: 'lamp_in', talk: 'A floor lamp. It makes everything look like a cheap 3D game.' });",
"S.recolor('planter_g', 'planter', { _: 'mlk0' });",
"S.prop('planter_g', { sprite: 'planter_g', talk: 'A potted palm. It is plastic, but it is expensive plastic.' });",
"S.recolor('sadplant_m', 'sadplant', { _: 'mlf1' });",
"S.prop('sadplant_m', { sprite: 'sadplant_m', talk: 'A houseplant in the lost and found. Nobody has claimed it.' });",
"S.prop('sadplant', { sprite: 'sadplant', talk: 'A houseplant. It has given up, but politely.' });",
"})();"]
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'art_mall.js'), 'w').write("\n".join(out) + "\n")
print('ok')
