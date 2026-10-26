"""Rhyolite Springs (ghost town at night) + Chapel and hotel interiors. Writes cracky/art_ghost.js.
Ramps are prefixed gt (see the palette block at the top of the output)."""
import sys, os, random, math
sys.path.insert(0, os.path.dirname(__file__))
from pxgen import *

PAL = {
    # moonlit dust (cool violet-grey) + dead scrub
    'gtd0': '#272436', 'gtd1': '#363248', 'gtd2': '#48425c', 'gtd3': '#5c546e', 'gtd4': '#7a7090',
    'gts0': '#1c2232', 'gts1': '#2c3442', 'gts2': '#425050', 'gts3': '#5e6c60', 'gts4': '#86907a',
    # weathered wood (cool, moonlit)
    'gtw0': '#22182a', 'gtw1': '#3c2c38', 'gtw2': '#5a4248', 'gtw3': '#7a5c5a', 'gtw4': '#9c7c70', 'gtw5': '#bca08a',
    # adobe (chapel)
    'gta0': '#33243a', 'gta1': '#58404e', 'gta2': '#7e5e64', 'gta3': '#a2807c', 'gta4': '#c4a294',
    # lamplight, candle flame
    'gtl0': '#c8782c', 'gtl1': '#f0b048', 'gtl2': '#ffe08a', 'gtl3': '#fff8dc',
    # red velvet (banner, curtains, rug) and magic purple
    'gtr0': '#3a1426', 'gtr1': '#6a1e36', 'gtr2': '#9a2c44', 'gtr3': '#c84a5a',
    'gtp0': '#2a1844', 'gtp1': '#4e2c7a', 'gtp2': '#7a4cb0', 'gtp3': '#b088e0',
    # gravestone / iron
    'gtk0': '#1e1e2c', 'gtk1': '#3a3a4e', 'gtk2': '#5a5a70', 'gtk3': '#828298', 'gtk4': '#aeaec0',
    # faded wallpaper (hotel)
    'gth0': '#283a3a', 'gth1': '#3a5250', 'gth2': '#506c66', 'gth3': '#6e8a7e',
    # stained glass
    'gtg0': '#3a6aa8', 'gtg1': '#d04a6a', 'gtg2': '#e8b048', 'gtg3': '#68b088',
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

FONT3 = {
    'A': ['.#.', '#.#', '###', '#.#', '#.#'], 'B': ['##.', '#.#', '##.', '#.#', '##.'], 'C': ['.##', '#..', '#..', '#..', '.##'],
    'D': ['##.', '#.#', '#.#', '#.#', '##.'], 'E': ['###', '#..', '##.', '#..', '###'], 'H': ['#.#', '#.#', '###', '#.#', '#.#'],
    'K': ['#.#', '#.#', '##.', '#.#', '#.#'], 'L': ['#..', '#..', '#..', '#..', '###'], 'N': ['#.#', '###', '###', '#.#', '#.#'],
    'O': ['.#.', '#.#', '#.#', '#.#', '.#.'], 'P': ['##.', '#.#', '##.', '#..', '#..'], 'R': ['##.', '#.#', '##.', '#.#', '#.#'],
    'S': ['.##', '#..', '.#.', '..#', '##.'], 'T': ['###', '.#.', '.#.', '.#.', '.#.'], 'U': ['#.#', '#.#', '#.#', '#.#', '###'],
    'Y': ['#.#', '#.#', '.#.', '.#.', '.#.'], 'I': ['###', '.#.', '.#.', '.#.', '###'], 'G': ['.##', '#..', '#.#', '#.#', '.##'],
    'M': ['#.#', '###', '###', '#.#', '#.#'], 'W': ['#.#', '#.#', '###', '###', '#.#'], ' ': ['.', '.', '.', '.', '.'],
}
def text3(g, s, x, y, c, slope=0):
    for k, ch in enumerate(s):
        gl = FONT3[ch]
        for j, r in enumerate(gl):
            for i, v in enumerate(r):
                if v == '#': px(g, x + i, y + j + round(k * slope), c)
        x += len(gl[0]) + 1
def text_w(s): return sum(len(FONT3[c][0]) + 1 for c in s) - 1

# ======================================================================= ground tiles
PEB = [["hS", "SD"], [".h.", "hSS", ".SD"], ["h", "S"], ["Sh."], ["DS", ".D"]]
CRACK = [["D..", ".D.", ".DD"], ["DD.", "..D"]]
def dust(seed, n, crack=False):
    rnd = random.Random(seed); g = blank(16, 16, 's'); placed = []
    items = [rnd.choice(PEB) for _ in range(n)] + ([rnd.choice(CRACK)] if crack else [])
    for t in items:
        for _ in range(200):
            w, h = len(t[0]), len(t)
            x, y = rnd.randint(1, 15 - w), rnd.randint(1, 15 - h)
            if any(abs(x - a) < 5 and abs(y - b) < 4 for a, b in placed): continue
            stamp(g, t, x, y); placed.append((x, y)); break
    return g
emit('gt_tiles', 16, 16, "{ s: 'gtd2', S: 'gtd1', D: 'gtd0', h: 'gtd3' }",
     {'dust0': dust(41, 3), 'dust1': dust(42, 2), 'dust2': dust(43, 2, True), 'dust3': dust(44, 4), 'dust4': dust(45, 1)}, origin=[0, 0])
out.append("S.tile('gt_dust', { sprite: 'gt_tiles', frames: ['dust0', 'dust1', 'dust2', 'dust3', 'dust4'], weights: [4, 4, 2, 3, 4] });")
out.append("// dead scrub = the tall grass art in cold night colours (wild encounters)")
out.append("S.recolor('tiles_night', 'tiles', { a: 'gts0', b: 'gts1', c: 'gts2', e: 'gts3', f: 'gts4' });")
out.append("S.tile('gt_scrub', { sprite: 'tiles_night', frame: 'tall0', rustle: 'tall1', over: 'tallOver', grass: true });")

# ---- dirt road (terrain): packed lighter dust with wheel ruts
def road():
    g = blank(16, 16, 'e')
    rnd = random.Random(7)
    for x in (4, 11):
        for y in range(16):
            if rnd.random() < 0.75: px(g, x, y, 'd')
    for _ in range(5): px(g, rnd.randint(0, 15), rnd.randint(0, 15), 'h')
    return g
out.append(f"""S.terrain('gt_road', {{
  legend: {{ e: 'gtd3', d: 'gtd2', h: 'gtd4' }},
  fill: [
{chr(10).join("    '" + ''.join(r) + "'," for r in road())}
  ],
  bands: {{ top: ['gtd1', 'gtd2'], left: ['gtd1', 'gtd2'], right: ['gtd1', 'gtd2'], bottom: ['gtd1', 'gtd4'] }},
  radius: 4, wobble: 0.35,
}});""")

# ---- boardwalk (terrain): planks across, nail dots, dark gaps; edge bands read as a raised deck
def planks(seed, a='p', b='P', gap='g', nail='n'):
    g = blank(16, 16, a)
    rnd = random.Random(seed)
    for y in (3, 7, 11, 15): hline(g, 0, y, 16, gap)
    for row, y0 in enumerate((0, 4, 8, 12)):
        seam = (seed * 5 + row * 7) % 16
        vline(g, seam, y0, 3, gap)
        hline(g, 0, y0, 16, b) if row % 2 else None
        px(g, (seam + 3) % 16, y0 + 1, nail); px(g, (seam + 11) % 16, y0 + 1, nail)
        if rnd.random() < 0.4: px(g, (seam + 6) % 16, y0 + 2, b); px(g, (seam + 7) % 16, y0 + 2, b)
    return g
out.append(f"""S.terrain('gt_boardwalk', {{
  legend: {{ p: 'gtw3', P: 'gtw4', g: 'gtw1', n: 'gtw2' }},
  fill: [[
{chr(10).join("    '" + ''.join(r) + "'," for r in planks(1))}
  ], [
{chr(10).join("    '" + ''.join(r) + "'," for r in planks(4))}
  ]], variants: true,
  bands: {{ top: ['gtw0', 'gtw4'], left: ['gtw0', 'gtw2'], right: ['gtw0', 'gtw2'], bottom: ['gtw0', 'gtw1', 'gtw1'] }},
  radius: 1, wobble: 0,
}});""")

# ======================================================================= buildings
def wood_wall(g, x0, y0, w, h, base='3', dark='2', light='4'):
    """Vertical board siding with weathered streaks."""
    rnd = random.Random(x0 * 7 + y0)
    rect(g, x0, y0, w, h, base)
    for x in range(x0, x0 + w, 4):
        vline(g, x, y0, h, dark)
        if rnd.random() < 0.7: vline(g, x + 1, y0 + rnd.randint(0, h // 2), rnd.randint(3, h // 2), light)
    for _ in range(w // 6):    # knots / missing paint
        px(g, rnd.randint(x0, x0 + w - 1), rnd.randint(y0, y0 + h - 1), dark)

def door(g, x, y, w=12, h=20, boarded=False):
    rect(g, x, y, w, h, '1'); rect(g, x + 1, y + 1, w - 2, h - 1, '2')
    vline(g, x + w // 2, y + 1, h - 1, '1')
    if boarded:
        for i, yy in enumerate((y + 4, y + 11)):
            line_ = [(x - 1 + k, yy + (k * (1 if i else -1)) // 6) for k in range(w + 2)]
            for (xx, yy2) in line_: px(g, xx, yy2, '4'); px(g, xx, yy2 + 1, '3')
    else:
        px(g, x + w // 2 - 2, y + h // 2, 'y'); px(g, x + w // 2 + 1, y + h // 2, 'y')

def window_(g, x, y, w=10, h=10, lit=False, broken=False):
    rect(g, x - 1, y - 1, w + 2, h + 2, '1')
    rect(g, x, y, w, h, 'L' if lit else 'G')
    if lit:
        rect(g, x, y + h // 2, w, h - h // 2, 'l')
    else:
        for i in range(min(w, h) // 2): px(g, x + 1 + i, y + h - 2 - i, 'g')
    vline(g, x + w // 2, y, h, '1'); hline(g, x, y + h // 2, w, '1')
    if broken:
        px(g, x + 1, y + 1, '1'); px(g, x + 2, y + 2, '1'); px(g, x + 2, y + 1, '1')
    hline(g, x - 2, y + h + 1, w + 4, '4')  # sill

def hotel():
    W, H = 96, 88
    g = blank(W, H)
    shadow(g, 48, H - 4, 44, 3)
    # false front (taller, flat top with stepped cornice)
    wood_wall(g, 4, 10, 88, 74)
    rect(g, 2, 6, 92, 5, '2'); hline(g, 2, 6, 92, '4'); hline(g, 2, 10, 92, '1')
    rect(g, 10, 2, 76, 5, '2'); hline(g, 10, 2, 76, '4')
    # sign board
    rect(g, 26, 14, 44, 11, 'b'); hline(g, 26, 14, 44, 'B'); hline(g, 26, 24, 44, '1')
    text3(g, 'HOTEL', 48 - text_w('HOTEL') // 2, 17, 'c')
    # second floor windows (one lit) + balcony
    for i, x in enumerate((12, 30, 56, 74)):
        window_(g, x, 30, 10, 11, lit=(i == 2), broken=(i == 0))
    rect(g, 4, 46, 88, 3, '2'); hline(g, 4, 46, 88, '4'); hline(g, 4, 48, 88, '1')
    for x in range(6, 92, 6): vline(g, x, 42, 4, '4'); px(g, x, 41, '2')
    hline(g, 4, 41, 88, '4')
    # porch roof posts
    for x in (6, 89): rect(g, x, 49, 2, 35, '4'); vline(g, x + 1, 49, 35, '2')
    # ground floor: door + two windows
    door(g, 42, 62, 12, 22)
    rect(g, 40, 59, 16, 3, '2'); hline(g, 40, 59, 16, '4')
    window_(g, 16, 60, 14, 12, lit=True); window_(g, 66, 60, 14, 12)
    # porch steps
    rect(g, 38, 84, 20, 2, '4'); hline(g, 38, 85, 20, '2')
    outline_except(g, 'o')
    return g

def chapel():
    W, H = 80, 104
    g = blank(W, H)
    shadow(g, 40, H - 4, 38, 3)
    # bell tower
    rect(g, 30, 4, 20, 34, 'a'); vline(g, 30, 4, 34, 'A'); vline(g, 49, 4, 34, 'D')
    for i in range(7): hline(g, 33 + i, -3 + i + 3, 14 - 2 * i, 'r') if False else None
    # tower roof (little pyramid)
    for i in range(6): hline(g, 32 - i + 5, i, 6 + 2 * (i) , 'r')
    rect(g, 28, 6, 24, 2, 'R'); hline(g, 28, 6, 24, 'h')
    # bell opening + bell
    rect(g, 35, 12, 10, 12, 'k'); ball(g, 40, 19, 3.5, 4, 'YYyw', bias=0.1); hline(g, 37, 22, 7, 'Y')
    px(g, 40, 23, 'Y')
    # cross
    vline(g, 40, -1 + 1, 5, 'w') if False else None
    # main body (adobe, rounded parapet)
    rect(g, 4, 36, 72, 64, 'a')
    for x in range(4, 76):
        t = (x - 4) / 71
        top = 36 - round(4 * math.sin(t * math.pi))
        for y in range(top, 36): g[y][x] = 'a'
        g[top][x] = 'h'
    vline(g, 4, 34, 66, 'A'); vline(g, 75, 34, 66, 'D'); vline(g, 74, 34, 66, 'd')
    # adobe texture: faint cracks + exposed bricks
    rnd = random.Random(3)
    for _ in range(14):
        x, y = rnd.randint(8, 70), rnd.randint(40, 94)
        hline(g, x, y, 3, 'd'); px(g, x + 1, y - 1, 'A')
    # round stained-glass window
    for y in range(44, 58):
        for x in range(32, 48):
            d = ((x + 0.5 - 40) / 7.5) ** 2 + ((y + 0.5 - 51) / 6.5) ** 2
            if d <= 1: g[y][x] = 'D' if d > 0.75 else ('1' if (x - 40) * (y - 51) > 0 else '2') if (abs(x - 40) + abs(y - 51)) % 5 else 'k'
    for y in range(44, 58):
        for x in range(32, 48):
            if g[y][x] in '12':
                q = (x >= 40) * 2 + (y >= 51)
                g[y][x] = 'BGYC'[q]
    # arched double door
    rect(g, 31, 72, 18, 28, 'k')
    for x in range(31, 49):
        t = (x - 31) / 17
        top = 72 - round(3 * math.sin(t * math.pi))
        for y in range(top, 72): g[y][x] = 'k'
    rect(g, 32, 74, 16, 26, '2'); vline(g, 40, 72, 28, '1'); vline(g, 32, 74, 26, '3')
    px(g, 38, 86, 'y'); px(g, 42, 86, 'y')
    # steps
    rect(g, 28, 100, 24, 2, 'h'); hline(g, 28, 101, 24, 'A')
    # crooked SPOOKY SANDS banner across the front (sags + tilts)
    for x in range(8, 72):
        t = (x - 8) / 63
        y = 61 + round(5 * math.sin(t * math.pi)) + round(t * 3)
        for yy in range(y, y + 9): g[yy][x] = 'r'
        g[y][x] = 'R'; g[y + 8][x] = 'q'
    text = 'SPOOKY SANDS'
    x = 12
    for k, ch in enumerate(text):
        t = (x - 8) / 63
        y = 63 + round(5 * math.sin(t * math.pi)) + round(t * 3)
        text3(g, ch, x, y, 'w')
        x += len(FONT3[ch][0]) + 1 + (1 if ch == ' ' else 0)
    # banner ropes to the corners
    px(g, 7, 60, 'q'); px(g, 72, 64, 'q')
    # stars painted on the banner ends
    for (sx, sy) in ((60 + 5, 70), ):
        pass
    outline_except(g, 'o')
    return g

def saloon():
    W, H = 80, 80
    g = blank(W, H)
    shadow(g, 40, H - 4, 38, 3)
    wood_wall(g, 4, 6, 72, 70, base='2', dark='1', light='3')
    rect(g, 2, 2, 76, 5, '3'); hline(g, 2, 2, 76, '4'); hline(g, 2, 6, 76, '1')
    rect(g, 14, 10, 52, 11, 'b'); hline(g, 14, 10, 52, 'B'); hline(g, 14, 20, 52, '1')
    text3(g, 'SALOON', 40 - text_w('SALOON') // 2, 13, 'c')
    px(g, 60, 12, 'b'); px(g, 61, 13, 'b')   # a chunk missing from the sign
    window_(g, 12, 28, 12, 10, broken=True); window_(g, 56, 28, 12, 10)
    rect(g, 4, 42, 72, 3, '2'); hline(g, 4, 42, 72, '4'); hline(g, 4, 44, 72, '1')
    for x in (6, 72): rect(g, x, 45, 2, 31, '4'); vline(g, x + 1, 45, 31, '2')
    # swinging doors, boarded shut
    door(g, 32, 54, 16, 22, boarded=True)
    window_(g, 14, 56, 12, 10, broken=True); window_(g, 56, 56, 12, 10)
    outline_except(g, 'o')
    return g

WOOD_LEG = "{ o: 'gtw0', s: 'gtd1', 1: 'gtw1', 2: 'gtw2', 3: 'gtw3', 4: 'gtw4', b: 'gtw1', B: 'gtw2', c: 'gtw5', G: 'gtk1', g: 'gtk2', L: 'gtl1', l: 'gtl0', y: 'gtl1' }"
emit('gt_hotel', 96, 88, WOOD_LEG, {'0': hotel()})
emit('gt_saloon', 80, 80, WOOD_LEG, {'0': saloon()})
emit('gt_chapel', 80, 104, "{ o: 'gta0', s: 'gtd1', a: 'gta3', A: 'gta4', d: 'gta2', D: 'gta1', h: 'gta4', r: 'gtr2', R: 'gtr3', q: 'gtr1', k: 'gtw0', 1: 'gtw1', 2: 'gtw2', 3: 'gtw3', y: 'gtl1', Y: 'gtl0', w: 'gtl3', B: 'gtg0', G: 'gtg3', C: 'gtg1', W: 'gtl3' }".replace("Y: 'gtl0', w", "Y: 'gtl0', w"), {'0': chapel()})

# ======================================================================= small props
def wagon():
    g = blank(48, 36)
    shadow(g, 24, 32, 22, 3)
    # bed of the wagon, tilted (one wheel gone)
    for x in range(6, 42):
        y = 14 + (x - 6) // 9
        rect(g, x, y, 1, 9, '3'); px(g, x, y, '4'); px(g, x, y + 8, '1')
    for x in range(8, 42, 6):
        vline(g, x, 15 + (x - 6) // 9, 7, '2')
    # wheel (left, intact) and broken wheel lying flat (right)
    for a in range(0, 360, 10):
        r = math.radians(a)
        px(g, round(12 + 8 * math.cos(r)), round(24 + 8 * math.sin(r)), '2')
        px(g, round(12 + 7 * math.cos(r)), round(24 + 7 * math.sin(r)), '3')
    for a in range(0, 180, 30):
        r = math.radians(a)
        for k in range(-6, 7): px(g, round(12 + k * math.cos(r)), round(24 + k * math.sin(r)), '2')
    ball(g, 12, 24, 1.6, 1.6, '13')
    for x in range(30, 46): px(g, x, 30, '2'); px(g, x, 31, '1')
    for x in (32, 37, 42): px(g, x, 29, '3')
    # tongue
    for i in range(6): px(g, 2 + i, 20 + i // 2, '2')
    outline_except(g, 'o')
    return g
emit('gt_wagon', 48, 36, WOOD_LEG, {'0': wagon()})

def post():
    g = blank(32, 24)
    shadow(g, 16, 21, 14, 3)
    for x in (4, 26): rect(g, x, 8, 3, 14, '3'); vline(g, x, 8, 14, '4'); vline(g, x + 2, 8, 14, '2')
    rect(g, 2, 8, 28, 3, '3'); hline(g, 2, 8, 28, '4'); hline(g, 2, 10, 28, '2')
    # an old rope
    for x in range(10, 20): px(g, x, 11 + (1 if 12 < x < 17 else 0), 'c')
    outline_except(g, 'o')
    return g
emit('gt_post', 32, 24, WOOD_LEG, {'0': post()})

def lamp(f):
    g = blank(16, 44)
    shadow(g, 8, 41, 5, 3)
    rect(g, 7, 14, 2, 27, '2'); vline(g, 7, 14, 27, '3')
    rect(g, 5, 38, 6, 3, '2'); hline(g, 5, 38, 6, '3')
    # lantern head
    rect(g, 4, 3, 8, 10, '1'); rect(g, 5, 4, 6, 8, 'L' if f == 0 else 'l')
    rect(g, 6, 6, 4, 5, 'w' if f == 0 else 'L')
    hline(g, 3, 2, 10, '2'); hline(g, 5, 1, 6, '2'); px(g, 7, 0, '2'); px(g, 8, 0, '2')
    hline(g, 4, 13, 8, '2')
    outline_except(g, 'o')
    return g
emit('gt_lamp', 16, 44, "{ o: 'gtk0', s: 'gtd1', 1: 'gtk1', 2: 'gtk2', 3: 'gtk3', L: 'gtl1', l: 'gtl0', w: 'gtl3' }", {'0': lamp(0), '1': lamp(1)})

def well():
    g = blank(32, 40)
    shadow(g, 16, 36, 15, 3)
    # stone ring
    ball(g, 16, 28, 13, 7, '1223', bias=0.0)
    ball(g, 16, 26, 10, 4.5, 'kk')
    for x in range(4, 29, 4):
        for y in range(25, 35):
            if g[y][x] in '123': g[y][x] = '1'
    # roof
    for x in (5, 26): rect(g, x, 8, 2, 18, 'b'); vline(g, x, 8, 18, 'B')
    for i in range(6): hline(g, 9 - i, 2 + i, 14 + 2 * i, 'B' if i < 2 else 'b')
    hline(g, 2, 8, 28, 'b2'[0])
    rect(g, 10, 13, 12, 2, 'b'); px(g, 15, 15, 'c'); px(g, 15, 16, 'c'); px(g, 15, 17, 'c')   # crank + rope
    rect(g, 13, 18, 5, 4, 'B'); hline(g, 13, 18, 5, 'c')    # bucket
    outline_except(g, 'o')
    return g
emit('gt_well', 32, 40, "{ o: 'gtk0', s: 'gtd1', 1: 'gtk1', 2: 'gtk2', 3: 'gtk3', k: 'gtk0', b: 'gtw2', B: 'gtw3', c: 'gtw5' }", {'0': well()})

def grave(kind):
    g = blank(16, 24)
    shadow(g, 8, 21, 6, 3)
    if kind == 0:   # rounded headstone, a bit tilted
        for y in range(6, 21):
            for x in range(3, 13):
                if y < 9 and ((x + 0.5 - 8) / 5) ** 2 + ((y + 0.5 - 9) / 3.5) ** 2 > 1: continue
                g[y][x] = '3' if x < 6 else '2' if x < 11 else '1'
        hline(g, 5, 11, 6, '1'); hline(g, 5, 13, 5, '1'); hline(g, 5, 15, 6, '1')   # worn engraving
        px(g, 4, 8, '4'); px(g, 5, 7, '4')
    else:           # wooden cross
        rect(g, 7, 4, 3, 17, 'b'); vline(g, 7, 4, 17, 'B')
        rect(g, 3, 8, 11, 3, 'b'); hline(g, 3, 8, 11, 'B')
    # dirt mound
    hline(g, 3, 20, 10, 'm'); hline(g, 4, 19, 8, 'm')
    outline_except(g, 'o', skip='sm')
    return g
emit('gt_grave', 16, 24, "{ o: 'gtk0', s: 'gtd1', m: 'gtd3', 1: 'gtk1', 2: 'gtk2', 3: 'gtk3', 4: 'gtk4', b: 'gtw3', B: 'gtw4' }", {'0': grave(0), '1': grave(1)})

def tumbleweed(f):
    g = blank(16, 16)
    shadow(g, 8, 13, 5, 2)
    rnd = random.Random(5 + f)
    for i in range(46):
        a = rnd.random() * math.tau; r = rnd.random() * 5.5
        x, y = round(8 + r * math.cos(a)), round(7 + r * math.sin(a))
        px(g, x, y, '3' if (x + y + f) % 3 else '2')
    for a in range(0, 360, 20):
        r = math.radians(a + f * 10)
        px(g, round(8 + 6 * math.cos(r)), round(7 + 5.5 * math.sin(r)), '2')
    outline_except(g, 'o')
    return g
emit('gt_tumble', 16, 16, "{ o: 'gtw1', s: 'gtd1', 2: 'gtw3', 3: 'gtw4' }", {'0': tumbleweed(0)})

# ======================================================================= chapel interior (magic-show stage)
def ifloor(seed):
    g = planks(seed)
    return replace(g, {'n': 'p'}) if seed % 2 else g
emit('gt_itiles', 16, 16, "{ p: 'gtw2', P: 'gtw3', g: 'gtw1', n: 'gtw1', a: 'gta3', A: 'gta4', d: 'gta2', D: 'gta1', k: 'gtw1', K: 'gtw0', B: 'gtg0', G: 'gtg3', C: 'gtg1', Y: 'gtg2', w: 'gtl3', h: 'gth2', H: 'gth1', j: 'gth3', J: 'gth0', y: 'gtl1' }", {
    'cfloor0': ifloor(2), 'cfloor1': ifloor(5),
}, origin=[0, 0])

def cwall_top():
    g = blank(16, 16, 'a')
    hline(g, 0, 0, 16, 'K'); hline(g, 0, 1, 16, 'D'); hline(g, 0, 2, 16, 'd')
    rnd = random.Random(9)
    for _ in range(3):
        x, y = rnd.randint(1, 12), rnd.randint(5, 13); hline(g, x, y, 3, 'd'); px(g, x + 1, y - 1, 'A')
    return g
def cwall_low():
    g = blank(16, 16, 'a')
    hline(g, 0, 4, 16, 'k'); hline(g, 0, 5, 16, 'p')   # chair rail
    rect(g, 0, 6, 16, 8, 'P')
    for x in (0, 8): vline(g, x, 6, 8, 'p')
    hline(g, 0, 13, 16, 'p'); hline(g, 0, 14, 16, 'k'); hline(g, 0, 15, 16, 'K')
    return g
def cwall_glass():
    g = cwall_top()
    rect(g, 4, 3, 8, 13, 'K')
    for y in range(4, 16):
        for x in range(5, 11):
            if y < 6 and (x == 5 or x == 10): continue
            q = (x >= 8) * 2 + (y >= 10)
            g[y][x] = 'BGCY'[q]
    vline(g, 7, 4, 12, 'K'); hline(g, 5, 10, 6, 'K'); px(g, 6, 5, 'w')
    return g
def hwall_top():
    g = blank(16, 16, 'h')
    hline(g, 0, 0, 16, 'K'); hline(g, 0, 1, 16, 'k'); hline(g, 0, 2, 16, 'J')
    for x in (3, 11):
        for y in range(4, 16, 3): px(g, x, y, 'j'); px(g, x + 1, y + 1, 'H')
    # a water stain
    for (x, y) in ((7, 6), (8, 6), (7, 7), (8, 8), (9, 7)): px(g, x, y, 'H')
    return g
def hwall_low():
    g = blank(16, 16, 'h')
    for x in (3, 11):
        for y in range(1, 5, 3): px(g, x, y, 'j')
    hline(g, 0, 5, 16, 'k'); hline(g, 0, 6, 16, 'p')
    rect(g, 0, 7, 16, 7, 'P')
    for x in (0, 8): vline(g, x, 7, 7, 'p')
    hline(g, 0, 13, 16, 'p'); hline(g, 0, 14, 16, 'k'); hline(g, 0, 15, 16, 'K')
    return g
emit('gt_walls', 16, 16, "{ a: 'gta3', A: 'gta4', d: 'gta2', D: 'gta1', k: 'gtw1', K: 'gtw0', p: 'gtw2', P: 'gtw3', B: 'gtg0', G: 'gtg3', C: 'gtg1', Y: 'gtg2', w: 'gtl3', h: 'gth2', H: 'gth1', j: 'gth3', J: 'gth0' }", {
    'edge': blank(16, 16, 'K'), 'cwallA': cwall_top(), 'cwallB': cwall_low(), 'cwin': cwall_glass(), 'hwallA': hwall_top(), 'hwallB': hwall_low(),
}, origin=[0, 0])
out += [
    "S.tile('gt_cfloor', { sprite: 'gt_itiles', frames: ['cfloor0', 'cfloor1'] });",
    "S.tile('gt_edge', { sprite: 'gt_walls', frame: 'edge', solid: true });",
    "S.tile('gt_cwallA', { sprite: 'gt_walls', frame: 'cwallA', solid: true });",
    "S.tile('gt_cwallB', { sprite: 'gt_walls', frame: 'cwallB', solid: true });",
    "S.tile('gt_cwin', { sprite: 'gt_walls', frame: 'cwin', solid: true });",
    "S.tile('gt_hwallA', { sprite: 'gt_walls', frame: 'hwallA', solid: true });",
    "S.tile('gt_hwallB', { sprite: 'gt_walls', frame: 'hwallB', solid: true });",
]
# red carpet aisle / worn hotel rug (terrains)
def rugfill(worn):
    g = blank(16, 16, 'r')
    rnd = random.Random(11 if worn else 12)
    for y in range(0, 16, 4):
        for x in range(0 if (y // 4) % 2 else 2, 16, 4): px(g, x, y + 1, 'R'); px(g, x + 1, y + 2, 'q')
    if worn:
        for _ in range(4):
            x, y = rnd.randint(1, 13), rnd.randint(1, 13); hline(g, x, y, 3, 'q'); px(g, x + 1, y + 1, 'R')
    return g
for name, worn in (('gt_aisle', False), ('gt_rug', True)):
    out.append(f"""S.terrain('{name}', {{
  legend: {{ r: 'gtr2', R: 'gtr3', q: 'gtr1' }},
  fill: [
{chr(10).join("    '" + ''.join(r) + "'," for r in rugfill(worn))}
  ],
  bands: {{ top: ['gtr0', 'gtl1', 'gtr1'], left: ['gtr0', 'gtl1'], right: ['gtr0', 'gtl1'], bottom: ['gtr0', 'gtl1', 'gtl0'] }},
  radius: 2, wobble: 0,
}});""")

def pew():
    g = blank(32, 24)
    shadow(g, 16, 21, 15, 3)
    rect(g, 1, 4, 30, 7, '3'); hline(g, 1, 4, 30, '4'); hline(g, 1, 10, 30, '2')   # backrest
    for x in range(4, 30, 5): vline(g, x, 5, 5, '2')
    rect(g, 1, 11, 30, 5, '4'); hline(g, 1, 11, 30, '5'); hline(g, 1, 15, 30, '2')  # seat
    rect(g, 1, 16, 3, 5, '2'); rect(g, 28, 16, 3, 5, '2')
    outline_except(g, 'o')
    return g
PEW_LEG = "{ o: 'gtw0', s: 'gtw1', 2: 'gtw2', 3: 'gtw3', 4: 'gtw4', 5: 'gtw5' }"
emit('gt_pew', 32, 24, PEW_LEG, {'0': pew()})

def stage(f):
    W, H = 80, 64
    g = blank(W, H)
    # back curtain (purple, folds), top valance (red, scalloped)
    for x in range(2, 78):
        fold = (x // 4) % 2
        for y in range(6, 44): g[y][x] = 'P' if fold else 'p'
        if x % 4 == 0: vline(g, x, 6, 38, 'q')
    for x in range(0, 80):
        ys = 6 + (2 if (x % 10) in (3, 4, 5, 6) else 1 if (x % 10) in (2, 7) else 0)
        for y in range(0, ys + 3): g[y][x] = 'r'
        g[ys + 3][x] = 'R' if (x % 10) in (4, 5) else 'Q'
        g[0][x] = 'R'
    # side curtains (red, tied back with gold rope)
    for side in (0, 1):
        for y in range(4, 46):
            w = 12 - max(0, (y - 18)) // 4 if y > 18 else 12
            w = max(4, w) if y < 30 else 4 + (y - 30) // 2
            for i in range(w):
                x = i if side == 0 else 79 - i
                g[y][x] = 'R' if i % 4 == (1 if side == 0 else 2) else 'r'
            x = w - 1 if side == 0 else 80 - w
            g[y][x] = 'Q'
        yy = 28
        for i in range(5): px(g, (5 + i) if side == 0 else (74 - i), yy, 'y')
    # stage floor (front edge with footlights)
    rect(g, 0, 44, 80, 12, '3'); hline(g, 0, 44, 80, '4')
    for y in (47, 50, 53): hline(g, 0, y, 80, '2')
    rect(g, 0, 56, 80, 6, '2'); hline(g, 0, 56, 80, '1'); hline(g, 0, 61, 80, '1')
    for x in range(6, 76, 10):
        rect(g, x, 57, 4, 3, 'y' if (x // 10 + f) % 2 else 'Y'); hline(g, x, 57, 4, 'w')
    # spotlight pool on the curtain + top hat on a little table
    for y in range(14, 44):
        for x in range(28, 52):
            if ((x + 0.5 - 40) / 11) ** 2 + ((y + 0.5 - 30) / 15) ** 2 <= 1 and g[y][x] in 'pPq':
                g[y][x] = {'p': 'v', 'P': 'V', 'q': 'p'}[g[y][x]]
    rect(g, 34, 36, 12, 2, '4'); rect(g, 36, 38, 2, 7, '2'); rect(g, 42, 38, 2, 7, '2')   # little table
    rect(g, 36, 26, 8, 9, 'k'); hline(g, 36, 26, 8, 'K'); rect(g, 33, 34, 14, 2, 'k'); hline(g, 33, 34, 14, 'K')
    hline(g, 36, 32, 8, 'r')   # hat band
    # sparkles drift above the hat (alternate frames)
    for (x, y) in ((31, 18), (48, 22), (40, 14)) if f == 0 else ((34, 16), (45, 18), (41, 21)):
        px(g, x, y, 'w'); px(g, x - 1, y, 'y'); px(g, x + 1, y, 'y'); px(g, x, y - 1, 'y'); px(g, x, y + 1, 'y')
    outline_except(g, 'o')
    return g
emit('gt_stage', 80, 64, "{ o: 'gtr0', r: 'gtr2', R: 'gtr3', Q: 'gtr1', p: 'gtp1', P: 'gtp2', q: 'gtp0', v: 'gtp2', V: 'gtp3', 1: 'gtw0', 2: 'gtw1', 3: 'gtw3', 4: 'gtw4', k: 'gtk0', K: 'gtk2', y: 'gtl1', Y: 'gtl0', w: 'gtl3' }", {'0': stage(0), '1': stage(1)})

def candle(f):
    g = blank(16, 28)
    shadow(g, 8, 25, 5, 3)
    # iron stand with three candles
    rect(g, 7, 12, 2, 13, '2'); rect(g, 4, 23, 8, 2, '2'); hline(g, 4, 23, 8, '3')
    hline(g, 2, 12, 12, '2'); hline(g, 2, 13, 12, '1')
    for i, x in enumerate((3, 7, 11)):
        h = (5, 7, 4)[i]
        rect(g, x, 12 - h, 2, h, 'c'); vline(g, x, 12 - h, h, 'C')
        fy = 12 - h - 3
        flick = (f + i) % 2
        px(g, x, fy + 1, 'L'); px(g, x + 1, fy + 1, 'l'); px(g, x + flick, fy, 'w'); px(g, x, fy + 2, 'L'); px(g, x + 1, fy + 2, 'L')
    outline_except(g, 'o', skip='sLlw')
    return g
emit('gt_candle', 16, 28, "{ o: 'gtk0', s: 'gtw1', 1: 'gtk1', 2: 'gtk2', 3: 'gtk3', c: 'gtl3', C: 'gtl2', L: 'gtl1', l: 'gtl0', w: 'gtl3' }", {'0': candle(0), '1': candle(1)})

# ---- hotel lobby props
def desk():
    g = blank(48, 32)
    shadow(g, 24, 29, 23, 3)
    rect(g, 1, 8, 46, 6, '4'); hline(g, 1, 8, 46, '5'); hline(g, 1, 13, 46, '2')   # countertop
    rect(g, 1, 14, 46, 14, '3')
    for x in (1, 16, 31): rect(g, x + 2, 16, 12, 10, '2'); hline(g, x + 2, 16, 12, '1'); vline(g, x + 2, 16, 10, '4')
    hline(g, 1, 27, 46, '1')
    # service bell + guest book + a dusty lamp
    ball(g, 10, 6, 3, 2.5, 'YYyw', bias=0.2); hline(g, 7, 7, 7, 'Y'); px(g, 10, 3, 'Y')
    rect(g, 20, 5, 9, 3, 'w'); hline(g, 20, 5, 9, 'c'); vline(g, 24, 5, 3, 'C')
    rect(g, 38, 1, 5, 4, 'L'); hline(g, 37, 5, 7, 'Y'); rect(g, 40, 5, 1, 3, '2')
    outline_except(g, 'o')
    return g
emit('gt_desk', 48, 32, "{ o: 'gtw0', s: 'gtw1', 1: 'gtw1', 2: 'gtw2', 3: 'gtw3', 4: 'gtw4', 5: 'gtw5', Y: 'gtl0', y: 'gtl1', w: 'gtl3', c: 'gtw5', C: 'gtw2', L: 'gtl2' }", {'0': desk()})

def clock(f):
    g = blank(16, 36)
    shadow(g, 8, 33, 6, 3)
    rect(g, 3, 4, 10, 29, '3'); vline(g, 3, 4, 29, '4'); vline(g, 12, 4, 29, '2')
    rect(g, 2, 2, 12, 3, '4'); hline(g, 2, 2, 12, '5')
    ball(g, 8, 10, 4, 4, 'ccw'); px(g, 8, 8, 'k'); px(g, 8, 9, 'k'); px(g, 9, 10, 'k'); px(g, 10, 10, 'k')   # stopped at 3
    rect(g, 5, 16, 6, 12, 'k')
    sw = -1 if f == 0 else 1
    vline(g, 8, 16, 7, 'y'); ball(g, 8 + sw * 2, 24, 1.6, 1.6, 'Yy')
    rect(g, 3, 30, 10, 3, '2')
    outline_except(g, 'o')
    return g
emit('gt_clock', 16, 36, "{ o: 'gtw0', s: 'gtw1', 2: 'gtw2', 3: 'gtw3', 4: 'gtw4', 5: 'gtw5', c: 'gta3', w: 'gtl3', k: 'gtw0', y: 'gtl1', Y: 'gtl0' }", {'0': clock(0), '1': clock(1)})

def deadplant():
    g = blank(16, 24)
    shadow(g, 8, 21, 5, 3)
    stamp(g, ['.nnnnnnnn.', 'nNNNNNNNNn', '.nNNNNNNn.', '.nNNNNNNn.', '..nnnnnn..'], 3, 15)
    for (x0, y0, x1, y1) in ((8, 15, 4, 4), (8, 15, 11, 3), (8, 15, 8, 6), (6, 10, 2, 8), (10, 9, 13, 7)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1): px(g, round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), 'b')
    for (x, y) in ((4, 4), (11, 3), (2, 8), (13, 7)): px(g, x, y, 'l')
    outline_except(g, 'o')
    return g
emit('gt_deadplant', 16, 24, "{ o: 'gtw0', s: 'gtw1', n: 'gta2', N: 'gta3', b: 'gtw3', l: 'gts3' }", {'0': deadplant()})

# ======================================================================= props
out += [
    "S.prop('gt_hotel', { sprite: 'gt_hotel', fw: 6, fh: 3, solid: ['xxxxxx', 'xxxxxx', 'xxDxxx'] });",
    "S.prop('gt_chapel', { sprite: 'gt_chapel', fw: 5, fh: 3, solid: ['xxxxx', 'xxxxx', 'xxDxx'] });",
    "S.prop('gt_saloon', { sprite: 'gt_saloon', fw: 5, fh: 3, talk: ['The saloon is boarded shut.', 'Someone has painted \"CLOSED FOR THE SEASON\" on it. The season was 1907.'] });",
    "S.prop('gt_wagon', { sprite: 'gt_wagon', fw: 3, fh: 2, solid: ['xxx', 'xxx'], talk: 'A broken wagon. One wheel rolled off a long time ago and never came back.' });",
    "S.prop('gt_post', { sprite: 'gt_post', fw: 2, fh: 1, talk: 'A hitching post. Nothing has been hitched here in a hundred years.' });",
    "S.prop('gt_lamp', { sprite: 'gt_lamp', anim: [0, 0, 0, 1, 0, 0, 1, 1], rate: 9, talk: 'A gas lamp. Nobody lit it. It is lit anyway.' });",
    "S.prop('gt_well', { sprite: 'gt_well', fw: 2, fh: 2, solid: ['xx', 'xx'], talk: ['An old well.', 'You hear an echo before you say anything.'] });",
    "S.prop('gt_grave', { sprite: 'gt_grave', talk: 'The name has worn away. Someone still leaves flowers.' });",
    "S.prop('gt_cross', { sprite: 'gt_grave', frame: 1, talk: 'A wooden cross. It leans toward the chapel, like it wants to see the show.' });",
    "S.prop('gt_tumble', { sprite: 'gt_tumble', talk: 'A tumbleweed. It is waiting for wind.' });",
    "// chapel + hotel interiors",
    "S.prop('gt_pew', { sprite: 'gt_pew', fw: 2, fh: 1 });",
    "S.prop('gt_stage', { sprite: 'gt_stage', fw: 5, fh: 2, anim: [0, 1], rate: 30, solid: ['xxxxx', 'xxxxx'] });",
    "S.prop('gt_candle', { sprite: 'gt_candle', anim: [0, 1], rate: 14 });",
    "S.prop('gt_desk', { sprite: 'gt_desk', fw: 3, fh: 1, talk: ['A guest book. The last entry says: \"Room 4. Don\\'t wait up.\"'] });",
    "S.prop('gt_clock', { sprite: 'gt_clock', anim: [0, 1], rate: 40, talk: 'A grandfather clock. The pendulum swings, but the hands have said 3:00 since forever.' });",
    "S.prop('gt_deadplant', { sprite: 'gt_deadplant', talk: 'A potted plant that gave up. Respect.' });",
]

head = "// Cracky — Rhyolite Springs (ghost town at night), Chapel + hotel interiors. Generated by tools/gen_ghost.py.\n(function () {\nconst S = Sprout;\n"
head += "S.palette({\n" + ",\n".join(f"  {k}: '{v}'" for k, v in PAL.items()) + ",\n});\n"
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'art_ghost.js'), 'w').write(head + "\n".join(out) + "\n})();\n")
