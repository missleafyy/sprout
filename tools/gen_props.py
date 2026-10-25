"""Draft generator for the outdoor props (tree, bush, house, sign, fence, mailbox, rock).
Run: python3 tools/gen_props.py > /tmp/props.txt  — then paste grids into game/art_props.js and hand-tune."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

out = []

# ------------------------------------------------------------------ tree (32x40, footprint 2x2)
def tree():
    g = blank(32, 40)
    # ground shadow
    for y, (x0, x1) in zip(range(35, 40), [(7, 25), (4, 28), (3, 29), (4, 28), (7, 25)]):
        hline(g, x0, y, x1 - x0, 's')
    # trunk with root flare
    t = ['..kBBbbk..',
         '..kBBbbk..',
         '..kBBbbk..',
         '..kBbbak..',
         '.kBBbbbak.',
         'kBBbbbbaak',
         'kkkaakkakk']
    stamp(g, t, 11, 30)
    ramp = '112233445'
    clumps = [(16, 9, 8.5, 7), (8, 14, 6.5, 6), (24, 14, 6.5, 6), (16, 16, 8, 6.5),
              (7.5, 22, 7, 6), (24.5, 22, 7, 6), (16, 24.5, 8.5, 6)]
    for (cx, cy, rx, ry) in clumps:
        ball(g, cx, cy, rx, ry, ramp, bias=0.05 - cy / 40 * 0.35, edge='1')
    # outline: leaves get the deep leaf ink, bark gets bark ink
    src = copy(g)
    for y in range(40):
        for x in range(32):
            if src[y][x] != '.': continue
            nb = [src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < 32 and 0 <= y + dy < 40]
            if any(c in '12345' for c in nb): g[y][x] = 'o'
    return g
out.append(js('tree', tree()))

# ------------------------------------------------------------------ bush (16x16, footprint 1x1)
def bush():
    g = blank(16, 16)
    for y, (x0, x1) in zip(range(13, 16), [(2, 14), (1, 15), (3, 13)]):
        hline(g, x0, y, x1 - x0, 's')
    for (cx, cy, rx, ry) in [(5.5, 8, 4.5, 4.5), (10.5, 8, 4.5, 4.5), (8, 6, 5.5, 4.5), (8, 10, 6, 3.5)]:
        ball(g, cx, cy, rx, ry, '12345', bias=-0.05, edge='1')
    src = copy(g)
    for y in range(16):
        for x in range(16):
            if src[y][x] != '.' and src[y][x] != 's': continue
            nb = [src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < 16 and 0 <= y + dy < 16]
            if any(c in '12345' for c in nb): g[y][x] = 'o'
    return g
out.append(js('bush', bush()))

# ------------------------------------------------------------------ house (80x80, footprint 5x3)
def house():
    W, H = 80, 80
    g = blank(W, H)
    # wall
    rect(g, 4, 44, 72, 36, 'w')
    vline(g, 4, 44, 32, 'W')                 # lit left edge
    vline(g, 75, 44, 32, 'v')                # shaded right edge
    rect(g, 4, 44, 72, 3, 'u')               # eave shadow on wall
    hline(g, 4, 47, 72, 'v')
    rect(g, 4, 76, 72, 4, 'n')               # stone foundation
    hline(g, 4, 76, 72, 'N')
    for x in range(6, 76, 8): vline(g, x, 77, 3, 'm')
    # windows
    def window(x, y):
        rect(g, x, y, 16, 13, 'f')           # frame
        rect(g, x + 1, y + 1, 14, 11, 'F')
        rect(g, x + 2, y + 2, 12, 9, 'q')    # glass
        for i in range(5): px(g, x + 3 + i, y + 7 - i, 'Q'); px(g, x + 4 + i, y + 7 - i, 'Q')
        px(g, x + 10, y + 3, 'Z'); px(g, x + 11, y + 3, 'Z'); px(g, x + 11, y + 4, 'Z')
        vline(g, x + 8, y + 2, 9, 'F')       # mullion
        hline(g, x + 2, y + 6, 12, 'F')
        rect(g, x - 1, y + 13, 18, 2, 'S')   # sill
        hline(g, x - 1, y + 14, 18, 'n')
    window(9, 54); window(55, 54)
    # door
    rect(g, 31, 54, 18, 26, 'f')
    rect(g, 33, 56, 14, 24, 'd')
    for x in (36, 40, 44): vline(g, x, 57, 22, 'D')
    vline(g, 33, 56, 24, 'e')
    rect(g, 36, 59, 8, 5, 'q'); hline(g, 36, 59, 8, 'f'); px(g, 37, 60, 'Z'); px(g, 38, 60, 'Q')
    rect(g, 44, 68, 2, 2, 'y')
    rect(g, 30, 52, 20, 2, 'D')              # lintel
    hline(g, 30, 52, 20, 'f')
    # roof
    rect(g, 1, 6, 78, 38, 'r')
    # ridge cap
    rect(g, 1, 6, 78, 4, 'R'); hline(g, 1, 6, 78, 'h'); hline(g, 1, 9, 78, 'k')
    # shingle bands
    for bi, y in enumerate(range(10, 40, 5)):
        hline(g, 1, y, 78, 'h' if bi % 2 == 0 else 'R')
        hline(g, 1, y + 4, 78, 'k')
        off = 0 if bi % 2 == 0 else 5
        for x in range(1 + off, 79, 10):
            vline(g, x, y + 1, 3, 'k')
            px(g, x + 1, y + 1, 'R')
    # eave fascia
    rect(g, 0, 40, 80, 4, 'k'); hline(g, 0, 40, 80, 'r'); hline(g, 0, 43, 80, 'K')
    # chimney
    rect(g, 58, 0, 9, 12, 'n'); vline(g, 58, 0, 12, 'S'); vline(g, 66, 0, 12, 'N')
    rect(g, 57, 0, 11, 2, 'S'); hline(g, 57, 1, 11, 'N')
    # rounded roof corners
    for (x, y) in [(1, 6), (78, 6), (0, 40), (79, 40), (0, 43), (79, 43)]: px(g, x, y, '.')
    # outline everything
    src = copy(g)
    for y in range(H):
        for x in range(W):
            if src[y][x] != '.': continue
            nb = [src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < W and 0 <= y + dy < H]
            if any(c != '.' for c in nb): g[y][x] = 'o'
    return g
out.append(js('house', house()))

# ------------------------------------------------------------------ sign (16x16)
out.append(js('sign', [list(r) for r in [
    '................',
    '................',
    '.oooooooooooooo.',
    'oeddddddddddddDo',
    'odhhhhhhhhhhhhDo',
    'odhffffffffhhhDo',
    'odhhhhhhhhhhhhDo',
    'odhfffffffhhhhDo',
    'odhhhhhhhhhhhhDo',
    'oDDDDDDDDDDDDDDo',
    '.ooooodDDooooo..',
    '.....odDDo......',
    '.....odDDo......',
    '...ssodDDoss....',
    '..sssooooosss...',
    '...sssssssss....',
]]))

# ------------------------------------------------------------------ white picket fence (16x16 tile)
out.append(js('fence', [list(r) for r in [
    '................',
    '...o.......o....',
    '..owo.....owo...',
    '.owWWo...owWWo..',
    'ooowWoooooowWooo',
    'wwwwWwwwwwwwWwww',
    'WWWwWWWWWWWwWWWW',
    'ooowWoooooowWooo',
    '..owWo...owWo...',
    'ooowWoooooowWooo',
    'wwwwWwwwwwwwWwww',
    'WWWwWWWWWWWwWWWW',
    'ooowWoooooowWooo',
    '..owWo...owWo...',
    '.sowWos.sowWos..',
    '..ssss...ssss...',
]]))

# ------------------------------------------------------------------ mailbox (16x24)
out.append(js('mailbox', [list(r) for r in [
    '................',
    '................',
    '................',
    '.....oooooo.....',
    '....oRRRRRro....',
    '...oRrrrrrrko...',
    '...oRrrrrrrko...',
    '...oRrrrrrrkoyo.',
    '...oRrrrrrrkoyo.',
    '...okkkkkkkkoyo.',
    '...ooooooooooo..',
    '.......odDo.....',
    '.......odDo.....',
    '.......odDo.....',
    '.......odDo.....',
    '.......odDo.....',
    '.......odDo.....',
    '.......odDo.....',
    '.....sooooos....',
    '....sssssssss...',
    '.....sssssss....',
    '................',
    '................',
    '................',
]]))

# ------------------------------------------------------------------ rock (16x16)
def rock():
    g = blank(16, 16)
    for y, (x0, x1) in zip(range(12, 15), [(2, 14), (1, 15), (3, 13)]):
        hline(g, x0, y, x1 - x0, 's')
    ball(g, 8, 8.5, 6.5, 5, '1234', bias=0.05)
    ball(g, 5.5, 10, 3.5, 2.5, '1234', bias=-0.1)
    src = copy(g)
    for y in range(16):
        for x in range(16):
            if src[y][x] not in '.s': continue
            nb = [src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < 16 and 0 <= y + dy < 16]
            if any(c in '1234' for c in nb): g[y][x] = 'o'
    return g
out.append(js('rock', rock()))

print('\n'.join(out))
