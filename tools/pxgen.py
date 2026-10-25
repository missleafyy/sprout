"""pxgen — helpers for drafting text-grid pixel art in Python, then pasting the grids into game/*.js.

Grids are lists of lists of single characters; '.' is transparent. The characters map to palette
names through each sprite's legend in the JS file.
"""
import math

def blank(w, h, c='.'):
    return [[c] * w for _ in range(h)]

def copy(g):
    return [r[:] for r in g]

def stamp(g, s, x, y, wrapx=False, wrapy=False, skip='.'):
    H, W = len(g), len(g[0])
    for j, row in enumerate(s):
        for i, ch in enumerate(row):
            if ch == skip: continue
            xx, yy = x + i, y + j
            if wrapx: xx %= W
            if wrapy: yy %= H
            if 0 <= xx < W and 0 <= yy < H: g[yy][xx] = '.' if ch == '_' else ch

def rect(g, x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            if 0 <= yy < len(g) and 0 <= xx < len(g[0]): g[yy][xx] = c

def hline(g, x, y, w, c): rect(g, x, y, w, 1, c)
def vline(g, x, y, h, c): rect(g, x, y, 1, h, c)

def px(g, x, y, c):
    if 0 <= y < len(g) and 0 <= x < len(g[0]): g[y][x] = c

def ball(g, cx, cy, rx, ry, ramp, light=(-0.55, -0.75, 0.55), bias=0.0, edge=None, only_empty=False):
    """Shaded ellipse. ramp = chars dark->light. edge = char for the lower-right rim (separates clumps)."""
    L = math.sqrt(sum(v * v for v in light)); lx, ly, lz = (v / L for v in light)
    H, W = len(g), len(g[0])
    pts = []
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            d = dx * dx + dy * dy
            if d > 1 or not (0 <= x < W and 0 <= y < H): continue
            if only_empty and g[y][x] != '.': continue
            nz = math.sqrt(max(0, 1 - d))
            i = dx * lx + dy * ly + nz * lz + bias
            k = int((i + 0.15) / 1.15 * len(ramp))
            g[y][x] = ramp[max(0, min(len(ramp) - 1, k))]
            pts.append((x, y, dx, dy))
    if edge:
        for (x, y, dx, dy) in pts:
            # rim on the lower/right side where the next pixel leaves the ellipse
            for (ox, oy) in ((1, 0), (0, 1)):
                ddx, ddy = (x + ox + 0.5 - cx) / rx, (y + oy + 0.5 - cy) / ry
                if ddx * ddx + ddy * ddy > 1 and (dx + dy) > 0.2:
                    g[y][x] = edge
    return g

def outline(g, c, diag=False, inside=False):
    """Add a 1px outline around all opaque pixels (outside, or replacing the edge if inside=True)."""
    H, W = len(g), len(g[0])
    src = copy(g)
    nb = [(1, 0), (-1, 0), (0, 1), (0, -1)] + ([(1, 1), (-1, -1), (1, -1), (-1, 1)] if diag else [])
    for y in range(H):
        for x in range(W):
            if inside:
                if src[y][x] == '.': continue
                if any(not (0 <= x + dx < W and 0 <= y + dy < H) or src[y + dy][x + dx] == '.' for dx, dy in nb):
                    g[y][x] = c
            else:
                if src[y][x] != '.': continue
                if any(0 <= x + dx < W and 0 <= y + dy < H and src[y + dy][x + dx] != '.' for dx, dy in nb):
                    g[y][x] = c
    return g

def replace(g, mapping, region=None):
    x0, y0, x1, y1 = region or (0, 0, len(g[0]), len(g))
    for y in range(y0, y1):
        for x in range(x0, x1):
            if g[y][x] in mapping: g[y][x] = mapping[g[y][x]]
    return g

def flip(g): return [r[::-1] for r in g]

def js(name, g, indent='    '):
    lines = [f"{indent}{name}: ["] + [f"{indent}  '{''.join(r)}'," for r in g] + [f"{indent}],"]
    return '\n'.join(lines)

def show(g):
    print('\n'.join(''.join(r) for r in g))
