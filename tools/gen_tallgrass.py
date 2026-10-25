"""Draft generator for tall grass: overlapping pointed tufts in a brick pattern. Prints JS grids."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

# one tuft, 8 wide x 9 tall: three pointed blades, lit from the left (e/f), shaded right (c/b)
TUFT = [
    "...f....",
    ".f.ef..f",
    ".ef.cf.e",
    "eecfcceb",
    "eccecccb",
    "ecccccbb",
    "cccccbbb",
    "bccccbba",
    ".abbbaa.",
]
# swayed frame: tips lean right by one
TUFT_SWAY = [
    "....f...",
    "..f.ef.f",
    ".ef.ccfe",
    "eecfcceb",
    "eccecccb",
    "ecccccbb",
    "cccccbbb",
    "bccccbba",
    ".abbbaa.",
]

def tile(t, base='b'):
    g = blank(16, 16, base)
    # back row then front row; each placed with wrap so the tile repeats seamlessly
    spots = [(-4, -1), (4, -1), (12, -1), (0, 7), (8, 7), (16, 7), (-4, 15), (4, 15), (12, 15)]
    for (ox, oy) in spots:
        for y, row in enumerate(t):
            for x, c in enumerate(row):
                if c == '.': continue
                X, Y = (ox + x) % 16, oy + y
                if 0 <= Y < 16: g[Y][X] = c
    return g

print(js('tall0', tile(TUFT)))
print(js('tall1', tile(TUFT_SWAY)))
