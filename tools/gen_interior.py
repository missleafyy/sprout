"""Draft generator for interior tiles + furniture. Prints JS grids; see game/art_interior.js."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

out = []

# ---- floor: long horizontal planks, soft seams
g = blank(16, 16, '3')
for p, seam in enumerate([5, 12, 2, 9]):
    y = p * 4
    hline(g, 0, y + 3, 16, '2')
    vline(g, seam, y, 3, '2')
    px(g, seam + 1, y, '4'); px(g, seam + 2, y, '4')
    px(g, (seam + 7) % 16, y + 1, '2'); px(g, (seam + 8) % 16, y + 1, '2')
out.append(js('floor', g))

# ---- wallpaper (mint stripes) top wall row, with ceiling trim
def paper():
    g = blank(16, 16, 't')
    for x in (2, 3, 10, 11): vline(g, x, 0, 16, 'm')
    for x in (6, 14):
        for y in range(1, 16, 4): px(g, x, y, 'o')   # tiny dotted line motif
    return g
g = paper(); hline(g, 0, 0, 16, 'D'); hline(g, 0, 1, 16, 'd'); hline(g, 0, 2, 16, 'B')
out.append(js('wallA', g))
# lower wall row: paper, chair rail, cream wainscot panels, baseboard
g = paper()
hline(g, 0, 6, 16, 'f'); hline(g, 0, 7, 16, 'e'); hline(g, 0, 8, 16, 'd')
rect(g, 0, 9, 16, 5, 'P')
for x in (1, 9):
    rect(g, x, 10, 6, 3, 'p'); hline(g, x, 10, 6, 'Q'); vline(g, x, 10, 3, 'Q')
hline(g, 0, 13, 16, 'Q')
hline(g, 0, 14, 16, 'd'); hline(g, 0, 15, 16, 'D')
out.append(js('wallB', g))
# window on the top wall row
g = paper(); hline(g, 0, 0, 16, 'D'); hline(g, 0, 1, 16, 'd'); hline(g, 0, 2, 16, 'B')
rect(g, 2, 3, 12, 12, 'd'); rect(g, 3, 4, 10, 10, 'q')
for i in range(6): px(g, 4 + i, 10 - i, 'Q'); px(g, 5 + i, 10 - i, 'Q')
px(g, 10, 5, 'Z'); px(g, 11, 5, 'Z'); px(g, 11, 6, 'Z')
vline(g, 7, 4, 10, 'f'); hline(g, 3, 8, 10, 'f')
hline(g, 1, 14, 14, 'f'); hline(g, 1, 15, 14, 'D')
out.append(js('window', g))
# door mat
g = blank(16, 16, '3')
for y in range(16):
    for x in range(16): g[y][x] = '3'
mat = blank(14, 10, 'G')
rect(mat, 0, 0, 14, 10, 'G'); rect(mat, 1, 1, 12, 8, 'g')
for x in range(2, 12, 2): vline(mat, x, 2, 6, 'G')
stamp(g, mat, 1, 3)
out.append(js('mat', g))

# ---- bed 16x32 (footprint 1x2), art 16x36
g = blank(16, 36)
rect(g, 1, 0, 14, 8, 'd'); rect(g, 2, 1, 12, 5, 'e'); hline(g, 2, 1, 12, 'f'); hline(g, 1, 7, 14, 'D')   # headboard
rect(g, 1, 8, 14, 26, 'W')                     # mattress edge
rect(g, 2, 8, 12, 7, 'w'); rect(g, 3, 9, 10, 5, 'W'); rect(g, 3, 9, 10, 4, 'w'); hline(g, 4, 9, 7, 'Y')  # pillow
rect(g, 1, 15, 14, 18, 'c'); hline(g, 1, 15, 14, 'v'); hline(g, 1, 16, 14, 'c')   # blanket
hline(g, 1, 17, 14, 'v')
for y in range(19, 33, 4): hline(g, 2, y, 12, 'C')
vline(g, 13, 17, 16, 'C'); vline(g, 14, 15, 18, 'V')
rect(g, 1, 33, 14, 2, 'd'); hline(g, 1, 34, 14, 'D')
outline(g, 'o')
out.append(js('bed', g))

# ---- table 32x24 (footprint 2x1)
g = blank(32, 26)
rect(g, 1, 2, 30, 14, 'e'); hline(g, 1, 2, 30, 'f'); hline(g, 2, 3, 28, 'f')
for x in (9, 20): vline(g, x, 4, 11, 'd')
rect(g, 1, 16, 30, 3, 'd'); hline(g, 1, 18, 30, 'D')
rect(g, 3, 19, 3, 6, 'D'); rect(g, 26, 19, 3, 6, 'D'); vline(g, 3, 19, 6, 'd'); vline(g, 26, 19, 6, 'd')
# a little vase with a flower
stamp(g, ['.rr.', 'rpRr', '.rr.', '.gg.', '.qQ.', 'qQQq', '.QQ.'], 13, 0)
outline(g, 'o')
out.append(js('table', g))

# ---- bookshelf 32x32 (footprint 2x1, leans on the wall)
g = blank(32, 34)
rect(g, 0, 0, 32, 32, 'd'); rect(g, 2, 2, 28, 28, 'D')
for sy in (2, 11, 20):
    books = 'rRbBgGyYpPrRbBgG'
    x = 2
    i = 0
    while x < 29:
        w = 2 + (i * 7) % 2
        h = 7 - (i * 5) % 3
        c = books[(i * 3) % len(books)]
        rect(g, x, sy + 8 - h, w, h, c)
        vline(g, x, sy + 8 - h, h, c.lower() if c.isupper() else c)
        x += w + (1 if i % 4 == 3 else 0); i += 1
    hline(g, 1, sy + 8, 30, 'e'); hline(g, 1, sy + 9, 30, 'd')
rect(g, 0, 30, 32, 2, 'e'); hline(g, 0, 31, 32, 'D')
vline(g, 0, 0, 32, 'e'); vline(g, 31, 0, 32, 'D'); hline(g, 0, 0, 32, 'f')
outline(g, 'o')
out.append(js('shelf', g))

# ---- potted plant 16x24
g = blank(16, 24)
for (cx, cy, rx, ry) in [(8, 7, 5, 4.5), (4.5, 10, 3.5, 3), (11.5, 10, 3.5, 3), (8, 11, 5, 3)]:
    ball(g, cx, cy, rx, ry, '1234', edge='1')
stamp(g, ['.nnnnnnnn.', 'nNNNNNNNNn', '.nNNNNNNn.', '.nNNNNNNn.', '..nnnnnn..', '..ssssss..'], 3, 14)
src = copy(g); outline(g, 'o')
out.append(js('plant', g))

# ---- TV 16x24 on a little stand
g = blank(16, 24)
rect(g, 1, 3, 14, 12, 'k'); rect(g, 2, 4, 12, 9, 'q'); rect(g, 3, 5, 10, 7, 'Q')
for i in range(4): px(g, 4 + i, 8 - i, 'Z')
px(g, 12, 13, 'r'); px(g, 10, 13, 'g')
stamp(g, ['..o...o.', '...o.o..'], 4, 1)
rect(g, 2, 15, 12, 6, 'd'); hline(g, 2, 15, 12, 'f'); hline(g, 3, 17, 10, 'D'); hline(g, 3, 19, 10, 'D')
outline(g, 'o')
out.append(js('tv', g))

print('\n'.join(out))
