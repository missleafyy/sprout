"""Ground grass tiles: dense, varied tufts with lit tips, kept off tile edges so variants mix without seams.
Prints JS frame grids for the 'tiles' sprite (legend g=gr3 base, d=gr2, D=gr1, l=gr4, L=gr5)."""
import sys, os, random
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

TUFTS = [
    ["l.l", "dld", ".d."],                 # small v
    [".l..l", "ld.ld", ".dDd."],          # wide fan
    ["l.l.l", "dldld", ".ddd."],          # three blades
    ["l", "d"],                            # single blade
    [".l.", "ldl", "dDd"],                 # clump
]
def tile(seed, n, kinds):
    rnd = random.Random(seed)
    g = blank(16, 16, 'g')
    placed = []
    tries = 0
    while len(placed) < n and tries < 500:
        tries += 1
        t = TUFTS[rnd.choice(kinds)]
        w, h = len(t[0]), len(t)
        x, y = rnd.randint(1, 15 - w), rnd.randint(1, 15 - h)
        if any(abs(x - px_) < 5 and abs(y - py_) < 4 for px_, py_ in placed): continue
        stamp(g, t, x, y); placed.append((x, y))
    return g
frames = {
    'grass0': tile(1, 4, [0, 1, 2, 4]),
    'grass1': tile(2, 3, [0, 3, 4]),
    'grass2': tile(3, 5, [0, 1, 3, 4]),
    'grass3': tile(4, 4, [1, 2, 3]),
    'grass4': tile(5, 2, [0, 3]),
}
for k, g in frames.items(): print(js(k, g))
