"""Below Nevada (White Suits facility under The Lot). Writes cracky/art_below.js. Ramps prefixed bn."""
import sys, os, random, math
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

PAL = {
    'bnw0': '#4e586c', 'bnw1': '#7a879c', 'bnw2': '#a8b6c8', 'bnw3': '#d2dde8', 'bnw4': '#eef5fb',
    'bnc0': '#164c60', 'bnc1': '#2486a0', 'bnc2': '#4cc8d8', 'bnc3': '#a8f0f6',
    'bnm0': '#1a1e2a', 'bnm1': '#2a3042', 'bnm2': '#40485e', 'bnm3': '#5e6882', 'bnm4': '#8490a8',
    'bny0': '#b88a1c', 'bny1': '#eec23c', 'bnk0': '#2a2a36',
    'bnr0': '#8a2234', 'bnr1': '#de4a50',
    'bng0': '#381848', 'bng1': '#8c2480', 'bng2': '#d852c0', 'bng3': '#ffb0f0',
    'bnl0': '#3a7a3a', 'bnl1': '#7ae070',
}

out = []
def emit(name, w, h, legend, frames, origin=None):
    o = origin or [0, h]
    body = "\n".join(js(k, g) for k, g in frames.items())
    out.append(f"S.sprite('{name}', {{ w: {w}, h: {h}, origin: {list(o)},\n  legend: {legend},\n  frames: {{\n{body}\n  }} }});")

def outline_except(g, c, skip='s'):
    src = copy(g); H, W = len(g), len(g[0])
    for y in range(H):
        for x in range(W):
            if src[y][x] not in ('.',) + tuple(skip): continue
            nb = [src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < W and 0 <= y + dy < H]
            if any(n not in ('.',) + tuple(skip) for n in nb): g[y][x] = c
    return g

def shadow(g, cx, y, rx, rows=3, c='s'):
    widths = [rx - 2, rx, rx - 1, rx - 3][:rows]
    for i, r in enumerate(widths):
        hline(g, max(0, cx - r), y + i, 2 * r, c)

def terrain_rows(g): return "\n".join("    '" + ''.join(r) + "'," for r in g)

# ======================================================================= tiles
def floor(kind):
    g = blank(16, 16, 'w')
    hline(g, 0, 15, 16, 'm'); vline(g, 15, 0, 16, 'm')   # grout (darker) on bottom/right
    hline(g, 0, 0, 15, 'h'); vline(g, 0, 0, 15, 'h')     # bevel highlight top/left
    if kind == 1:   # cyan inlay strip
        hline(g, 3, 7, 10, 'c'); hline(g, 3, 8, 10, 'C')
    elif kind == 2: # vent grille
        rect(g, 4, 4, 8, 8, 'm')
        for y in (5, 7, 9): hline(g, 5, y, 6, 'k')
        hline(g, 4, 4, 8, 'M')
    elif kind == 3: # scuff
        px(g, 9, 5, 'W'); px(g, 10, 5, 'W'); px(g, 11, 6, 'W'); px(g, 4, 11, 'W')
    return g
emit('bn_tiles', 16, 16, "{ w: 'bnw3', W: 'bnw2', h: 'bnw4', m: 'bnw1', M: 'bnw2', k: 'bnm2', c: 'bnc2', C: 'bnc1' }",
     {'floor0': floor(0), 'floor1': floor(1), 'floor2': floor(2), 'floor3': floor(3)}, origin=[0, 0])

def wall_top():   # upper wall: dark metal paneling with a cyan light strip
    g = blank(16, 16, 'm')
    hline(g, 0, 0, 16, 'K'); hline(g, 0, 1, 16, 'M')
    vline(g, 0, 2, 14, 'k'); vline(g, 8, 2, 14, 'k'); vline(g, 1, 2, 14, 'M'); vline(g, 9, 2, 14, 'M')
    hline(g, 0, 9, 16, 'k')
    hline(g, 0, 11, 16, 'c'); hline(g, 0, 12, 16, 'C'); hline(g, 0, 13, 16, 'c')
    px(g, 4, 5, 'M'); px(g, 12, 5, 'M')
    return g
def wall_low():   # lower wall: white panel with baseboard
    g = blank(16, 16, 'w')
    hline(g, 0, 0, 16, 'h'); vline(g, 0, 0, 13, 'h'); vline(g, 15, 0, 13, 'W')
    rect(g, 3, 3, 10, 6, 'W'); rect(g, 4, 4, 9, 5, 'w'); hline(g, 4, 4, 9, 'h')
    hline(g, 0, 12, 16, 'W'); hline(g, 0, 13, 16, 'k'); hline(g, 0, 14, 16, 'm'); hline(g, 0, 15, 16, 'K')
    return g
def wall_warn():  # lower wall with a hazard panel
    g = wall_low()
    for y in range(3, 10):
        for x in range(2, 14):
            g[y][x] = 'y' if ((x + y) // 2) % 2 else 'b'
    hline(g, 2, 2, 12, 'k'); hline(g, 2, 10, 12, 'k'); vline(g, 1, 2, 9, 'k'); vline(g, 14, 2, 9, 'k')
    return g
def void():
    return blank(16, 16, 'K')
emit('bn_walls', 16, 16, "{ m: 'bnm2', M: 'bnm3', k: 'bnm1', K: 'bnm0', c: 'bnc2', C: 'bnc3', w: 'bnw3', W: 'bnw2', h: 'bnw4', y: 'bny1', b: 'bnk0' }",
     {'wallA': wall_top(), 'wallB': wall_low(), 'wallW': wall_warn(), 'void': void()}, origin=[0, 0])
out += [
    "S.tile('bn_floor', { sprite: 'bn_tiles', frames: ['floor0', 'floor1', 'floor2', 'floor3'], weights: [10, 2, 1, 2] });",
    "S.tile('bn_floorPlain', { sprite: 'bn_tiles', frame: 'floor0' });",
    "S.tile('bn_wallA', { sprite: 'bn_walls', frame: 'wallA', solid: true });",
    "S.tile('bn_wallB', { sprite: 'bn_walls', frame: 'wallB', solid: true });",
    "S.tile('bn_wallW', { sprite: 'bn_walls', frame: 'wallW', solid: true });",
    "S.tile('bn_void', { sprite: 'bn_walls', frame: 'void', solid: true });",
]

# hazard stripes (terrain) + dark metal grating (terrain, e.g. catwalks around the generator)
def stripes():
    g = blank(16, 16)
    for y in range(16):
        for x in range(16):
            g[y][x] = 'y' if ((x + y) // 4) % 2 == 0 else 'b'
    return g
out.append(f"""S.terrain('bn_stripe', {{
  legend: {{ y: 'bny1', b: 'bnk0' }},
  fill: [
{terrain_rows(stripes())}
  ],
  bands: {{ top: ['bnm1', 'bny0'], left: ['bnm1', 'bny0'], right: ['bnm1', 'bny0'], bottom: ['bnm1', 'bny0'] }},
  radius: 0, wobble: 0,
}});""")
def grate():
    g = blank(16, 16, 'm')
    for y in range(1, 16, 4):
        for x in range(1, 16, 4):
            rect(g, x, y, 3, 3, 'k'); px(g, x, y, 'K')
    return g
out.append(f"""S.terrain('bn_grate', {{
  legend: {{ m: 'bnm3', k: 'bnm1', K: 'bnm0' }},
  fill: [
{terrain_rows(grate())}
  ],
  bands: {{ top: ['bnm0', 'bnm4'], left: ['bnm0', 'bnm2'], right: ['bnm0', 'bnm2'], bottom: ['bnm0', 'bnm1'] }},
  radius: 0, wobble: 0,
}});""")

# ======================================================================= props
METAL = "{ o: 'bnm0', s: 'bnw1', 1: 'bnm1', 2: 'bnm2', 3: 'bnm3', 4: 'bnm4', w: 'bnw2', W: 'bnw3', h: 'bnw4', c: 'bnc1', C: 'bnc2', l: 'bnc3', d: 'bnc0', r: 'bnr1', R: 'bnr0', g: 'bnl1', G: 'bnl0', y: 'bny1', Y: 'bny0', b: 'bnk0', p: 'bng1', P: 'bng2', q: 'bng3', Q: 'bng0' }"

def tube(f, who=0):
    g = blank(16, 44)
    shadow(g, 8, 41, 7, 3)
    # base + cap (white metal)
    rect(g, 1, 34, 14, 7, 'w'); hline(g, 1, 34, 14, 'h'); hline(g, 1, 40, 14, '2'); rect(g, 3, 36, 10, 2, '2')
    px(g, 4, 36, 'g' if f == 0 else 'G'); px(g, 11, 36, 'C')
    rect(g, 1, 2, 14, 5, 'w'); hline(g, 1, 2, 14, 'h'); hline(g, 1, 6, 14, '2')
    # glass + liquid
    rect(g, 2, 7, 12, 27, 'd')
    for y in range(9, 34): hline(g, 3, y, 10, 'c')
    hline(g, 3, 9, 10, 'C')                        # liquid surface
    vline(g, 3, 9, 25, 'C'); vline(g, 4, 10, 22, 'l')  # glass glint left
    vline(g, 12, 9, 25, 'd')
    # dim silhouette
    sil = [['..bbb..', '.bbbbb.', '.bbbbb.', '..bbb..', '.bbbbb.', 'bbbbbbb', 'bbbbbbb', 'b.bbb.b', 'b.bbb.b', '..bbb..', '..b.b..', '..b.b..', '..b.b..'],
           ['.b...b.', '.bb.bb.', '.bbbbb.', '.bbbbb.', '..bbb..', '.bbbbb.', 'bbbbbbb', '.bbbbb.', '.bbbbb.', '..bbb..', '..bbb..', '...b...', '.......']][who]
    bob = 1 if f else 0
    for j, r in enumerate(sil):
        for i, v in enumerate(r):
            if v == 'b' and g[14 + j + bob][5 + i] in 'cCl': g[14 + j + bob][5 + i] = 'D'
    # bubbles
    for (x, y) in ((10, 28 - 6 * f), (9, 20 - 4 * f), (11, 14 + 2 * f)):
        if 9 < y < 33: px(g, x, y, 'l')
    outline_except(g, 'o')
    return g
emit('bn_tube', 16, 44, METAL[:-2] + ", D: 'bnc0' }".replace("D: 'bnc0'", "D: 'bnm1'") if False else METAL.replace("d: 'bnc0'", "d: 'bnc0', D: 'bnm1'"),
     {'0': tube(0), '1': tube(1), '2': tube(0, 1), '3': tube(1, 1)})

def console(f):
    g = blank(32, 32)
    shadow(g, 16, 29, 15, 3)
    rect(g, 1, 14, 30, 15, 'w'); hline(g, 1, 14, 30, 'h'); hline(g, 1, 28, 30, '2'); vline(g, 30, 14, 15, 'W')
    rect(g, 3, 19, 26, 7, 'W')
    # keys
    for i, x in enumerate(range(5, 27, 3)):
        px(g, x, 21, 'r' if i == 2 else 'y' if i == 5 else '3'); px(g, x + 1, 21, '2')
        px(g, x, 23, '3'); px(g, x + 1, 23, '2')
    # monitor
    rect(g, 4, 1, 24, 13, '1'); rect(g, 5, 2, 22, 10, 'd'); hline(g, 4, 1, 24, '3')
    rect(g, 14, 12, 4, 2, '2')
    # screen contents: scrolling readout + a waveform
    for row, y in enumerate((3, 5, 7)):
        n = (row * 5 + f * 3) % 9 + 6
        hline(g, 6, y, n, 'C')
    for x in range(6, 26):
        y = 9 + round(1.2 * math.sin((x + f * 3) * 0.9))
        px(g, x, y, 'l')
    px(g, 24, 3, 'r' if f else 'R')
    outline_except(g, 'o')
    return g
emit('bn_console', 32, 32, METAL, {'0': console(0), '1': console(1)})

def rack(f):
    g = blank(16, 36)
    shadow(g, 8, 33, 7, 3)
    rect(g, 1, 2, 14, 31, '2'); hline(g, 1, 2, 14, '4'); vline(g, 1, 2, 31, '3'); vline(g, 14, 2, 31, '1')
    for k, y in enumerate(range(5, 31, 4)):
        rect(g, 3, y, 10, 3, '1'); hline(g, 3, y, 10, 'b')
        on = (k * 3 + f) % 4
        px(g, 4, y + 1, 'g' if on else 'G'); px(g, 6, y + 1, 'C' if on != 2 else 'd'); px(g, 11, y + 1, 'r' if (k + f) % 5 == 0 else '2')
        hline(g, 8, y + 2, 3, '3')
    outline_except(g, 'o')
    return g
emit('bn_rack', 16, 36, METAL, {'0': rack(0), '1': rack(1), '2': rack(2)})

def crate():
    g = blank(16, 20)
    shadow(g, 8, 17, 7, 3)
    rect(g, 1, 3, 14, 14, 'w'); hline(g, 1, 3, 14, 'h'); rect(g, 1, 3, 14, 4, 'W'); hline(g, 1, 3, 14, 'h'); hline(g, 1, 6, 14, '2')
    vline(g, 14, 3, 14, '2'); hline(g, 1, 16, 14, '2')
    # WS stencil
    stamp(g, ['c.c.cc', 'c.c.c.', 'ccc..c', 'ccc.cc'], 5, 9)
    hline(g, 1, 13, 1, 'y')
    for x in (2, 4): px(g, x, 15, 'y')
    outline_except(g, 'o')
    return g
emit('bn_crate', 16, 20, METAL, {'0': crate()})

def elevator(f):
    """Lift door: 32 wide, 1 tile deep footprint at the bottom of a wall. f=0 closed, f=1 open."""
    g = blank(32, 40)
    rect(g, 0, 0, 32, 40, '2'); hline(g, 0, 0, 32, '4'); vline(g, 0, 0, 40, '3'); vline(g, 31, 0, 40, '1')
    rect(g, 3, 2, 26, 4, '1'); hline(g, 6, 3, 20, 'C' if f else 'c')   # indicator strip
    px(g, 15, 4, 'y'); px(g, 16, 4, 'y')
    if f == 0:
        rect(g, 4, 8, 24, 32, 'w'); vline(g, 15, 8, 32, '1'); vline(g, 16, 8, 32, '2')
        vline(g, 4, 8, 32, 'h'); hline(g, 4, 8, 24, 'h')
        for x in (8, 22): rect(g, x, 18, 2, 10, 'W')
    else:
        rect(g, 4, 8, 24, 32, 'b'); rect(g, 6, 10, 20, 30, '1')
        hline(g, 6, 10, 20, 'd'); rect(g, 4, 8, 2, 32, 'w'); rect(g, 26, 8, 2, 32, 'w')
    rect(g, 29, 18, 2, 5, '1'); px(g, 29, 19, 'g'); px(g, 29, 21, 'r')
    return g
emit('bn_elevator', 32, 40, METAL, {'0': elevator(0), '1': elevator(1)})

def bossdoor(f):
    g = blank(48, 48)
    rect(g, 0, 0, 48, 48, '1'); hline(g, 0, 0, 48, '3'); vline(g, 0, 0, 48, '2'); vline(g, 47, 0, 48, '0' if False else 'b')
    # hazard frame
    for y in range(2, 48):
        for x in list(range(2, 6)) + list(range(42, 46)):
            g[y][x] = 'y' if ((x + y) // 3) % 2 else 'b'
    for x in range(2, 46):
        for y in range(2, 6): g[y][x] = 'y' if ((x + y) // 3) % 2 else 'b'
    # heavy door, red alert stripe, big logo lock
    rect(g, 6, 6, 36, 42, 'w'); hline(g, 6, 6, 36, 'h'); vline(g, 6, 6, 42, 'h'); vline(g, 41, 6, 42, '2')
    vline(g, 23, 6, 42, '2'); vline(g, 24, 6, 42, '1')
    hline(g, 6, 16, 36, 'R'); hline(g, 6, 17, 36, 'r' if f else 'R')
    ball(g, 24, 30, 6, 6, '12', bias=0.2); ball(g, 24, 30, 4, 4, 'WWh', bias=0.3)
    stamp(g, ['c.c', 'c.c', 'ccc'], 23, 29)
    for y in (40, 43): hline(g, 8, y, 14, 'W'); hline(g, 26, y, 14, 'W')
    return g
emit('bn_bossdoor', 48, 48, METAL.replace("c: 'bnc1'", "c: 'bnc1'"), {'0': bossdoor(0), '1': bossdoor(1)})

def generator(f):
    W, H = 64, 72
    g = blank(W, H)
    shadow(g, 32, 68, 30, 3)
    # base ring (wide disc)
    ball(g, 32, 60, 30, 9, '1233', bias=0.0)
    for x in range(4, 61, 6):
        vline(g, x, 57, 6, '1')
    ball(g, 32, 57, 24, 6, '2344', bias=0.0)
    # side pylons
    for x in (6, 52):
        rect(g, x, 18, 6, 40, '2'); vline(g, x, 18, 40, '4'); vline(g, x + 5, 18, 40, '1')
        rect(g, x - 1, 15, 8, 4, 'w'); hline(g, x - 1, 15, 8, 'h')
        for y in range(22, 54, 6): hline(g, x + 1, y, 4, 'p' if (y // 6 + f) % 2 else 'Q')
    # central glass column with the pulsing core
    rect(g, 20, 6, 24, 50, 'Q')
    for y in range(8, 54):
        for x in range(22, 42):
            d = abs(x + 0.5 - 32) / 10
            g[y][x] = 'P' if d < 0.35 + 0.15 * f else 'p' if d < 0.75 else 'Q'
    core_r = 6 + 2 * f
    ball(g, 32, 31, core_r, core_r + 1, 'Pqqq', bias=0.15)
    px(g, 30, 28, 'h'); px(g, 29, 28, 'h'); px(g, 30, 27, 'h')
    vline(g, 23, 8, 46, 'q'); vline(g, 24, 10, 40, 'P')   # glass glint
    # bands and caps
    for y in (6, 18, 44, 54):
        rect(g, 18, y, 28, 3, 'w'); hline(g, 18, y, 28, 'h'); hline(g, 18, y + 2, 28, '2')
    rect(g, 22, 0, 20, 6, '2'); hline(g, 22, 0, 20, '4'); rect(g, 26, 2, 12, 2, 'P' if f else 'p')
    # cables
    for (x0, y0) in ((12, 26), (52, 26)):
        for i in range(8):
            px(g, x0 + (i if x0 < 30 else -i) - (0 if x0 < 30 else 0), y0 + i // 2, 'b')
    # warning label
    rect(g, 26, 48, 12, 4, 'y'); hline(g, 27, 49, 10, 'b'); hline(g, 27, 50, 6, 'b')
    outline_except(g, 'o')
    return g
emit('bn_generator', 64, 72, METAL, {'0': generator(0), '1': generator(1)})

def banner():
    g = blank(32, 32)
    rect(g, 3, 0, 26, 28, 'w'); vline(g, 3, 0, 28, 'h'); vline(g, 28, 0, 28, '2')
    for x in range(3, 29):   # notched bottom
        if abs(x - 15.5) < 4 - (0 if x < 16 else 0): pass
    for i in range(4):
        hline(g, 12 + i, 27 - i, 8 - 2 * i, '.') if False else None
    for y in range(24, 28):
        for x in range(3, 29):
            if abs(x + 0.5 - 16) < (y - 23) * 3: g[y][x] = '.'
    hline(g, 1, 0, 30, '3'); px(g, 1, 0, '4')
    # logo: a white suit collar / tie inside a cyan circle
    ball(g, 16, 11, 8, 8, 'dcC', bias=0.2)
    stamp(g, ['hh....hh', '.hh..hh.', '..hbbh..', '...bb...', '...bb...', '..bbbb..', '...bb...'], 12, 7)
    hline(g, 7, 21, 18, 'c')
    outline_except(g, 'o')
    return g
emit('bn_banner', 32, 32, METAL, {'0': banner()})

def hatch(f):
    g = blank(32, 32)
    ball(g, 16, 16, 15, 15, '1233', bias=0.0) if False else None
    rect(g, 1, 1, 30, 30, '2'); hline(g, 1, 1, 30, '4'); vline(g, 1, 1, 30, '3'); hline(g, 1, 30, 30, '1'); vline(g, 30, 1, 30, '1')
    for y in range(3, 29):
        for x in range(3, 29):
            if x in (3, 28) or y in (3, 28): g[y][x] = 'y' if ((x + y) // 2) % 2 else 'b'
    if f == 0:
        rect(g, 5, 5, 22, 22, 'w'); hline(g, 5, 5, 22, 'h'); vline(g, 5, 5, 22, 'h'); hline(g, 5, 26, 22, '2')
        vline(g, 16, 5, 22, '2'); ball(g, 16, 16, 4, 4, '23', bias=0.2)
        for x in range(8, 25, 4): px(g, x, 8, '3'); px(g, x, 23, '3')
    else:
        rect(g, 5, 5, 22, 22, 'b'); rect(g, 7, 7, 18, 18, '0' if False else 'Q')
        for y in range(8, 25, 3): hline(g, 12, y, 8, '3')   # ladder rungs
        vline(g, 11, 7, 18, '2'); vline(g, 20, 7, 18, '2')
    outline_except(g, 'o')
    return g
emit('bn_hatch', 32, 32, METAL.replace("Q: 'bng0'", "Q: 'bnm0'"), {'0': hatch(0), '1': hatch(1)})

def chair():
    g = blank(16, 20)
    shadow(g, 8, 17, 5, 3)
    rect(g, 4, 2, 8, 8, 'w'); hline(g, 4, 2, 8, 'h'); vline(g, 11, 2, 8, '2')
    rect(g, 3, 10, 10, 3, 'W'); hline(g, 3, 10, 10, 'h')
    vline(g, 8, 13, 3, '2'); hline(g, 4, 16, 9, '2')
    outline_except(g, 'o')
    return g
emit('bn_chair', 16, 20, METAL, {'0': chair()})

out += [
    "S.prop('bn_tube', { sprite: 'bn_tube', anim: [0, 1], rate: 24, talk: ['A containment tube.', 'Something inside turns to look at you. Slowly.'] });",
    "S.prop('bn_tube2', { sprite: 'bn_tube', anim: [2, 3], rate: 28, talk: ['A containment tube.', 'The label says: SUBJECT 14 (\"STEVE\"). PROBABLY FINE.'] });",
    "S.prop('bn_console', { sprite: 'bn_console', fw: 2, fh: 1, anim: [0, 1], rate: 20, talk: ['The screen reads: POTENTIALITY OUTPUT 340%.', 'Below that: DO NOT ROUND UP.'] });",
    "S.prop('bn_rack', { sprite: 'bn_rack', anim: [0, 1, 2], rate: 16, talk: 'A server rack. It is humming the Prop Pills jingle. Badly.' });",
    "S.prop('bn_crate', { sprite: 'bn_crate', talk: 'A White Suits crate. Stencilled: CONTENTS: CONTAINED.' });",
    "S.prop('bn_chair', { sprite: 'bn_chair' });",
    "// doors: draw the lift/boss door as the bottom row of a wall; the D cell is the warp tile",
    "S.prop('bn_elevator', { sprite: 'bn_elevator', fw: 2, fh: 1, solid: ['xD'] });",
    "S.prop('bn_elevatorOpen', { sprite: 'bn_elevator', frame: 1, fw: 2, fh: 1, solid: ['xD'] });",
    "S.prop('bn_bossdoor', { sprite: 'bn_bossdoor', fw: 3, fh: 1, anim: [0, 1], rate: 30, solid: ['xDx'] });",
    "S.prop('bn_generator', { sprite: 'bn_generator', fw: 4, fh: 2, anim: [0, 1], rate: 22, solid: ['xxxx', 'xxxx'], talk: ['THE POTENTIALITY GENERATOR.', 'It hums at the exact pitch of a decision you never made.'] });",
    "S.prop('bn_banner', { sprite: 'bn_banner', fw: 2, fh: 1, flat: true, solid: ['xx'] });",
    "S.prop('bn_hatch', { sprite: 'bn_hatch', fw: 2, fh: 2, flat: true, solid: ['DD', 'DD'] });",
    "S.prop('bn_hatchOpen', { sprite: 'bn_hatch', frame: 1, fw: 2, fh: 2, flat: true, solid: ['DD', 'DD'] });",
]

head = "// Cracky — Below Nevada (White Suits facility under The Lot). Generated by tools/gen_below.py.\n(function () {\nconst S = Sprout;\n"
head += "S.palette({\n" + ",\n".join(f"  {k}: '{v}'" for k, v in PAL.items()) + ",\n});\n"
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'art_below.js'), 'w').write(head + "\n".join(out) + "\n})();\n")
