"""Cracky overworld NPCs (16x24, origin [8,23], feet on row 22). Writes cracky/art_npcs.js.
Most people = a new head (rows 0-12) on the Sprout player body (rows 13-23), with optional body patches.
Garfield and Spooky Ghost have custom bodies."""
import os

# ---------------------------------------------------------------- the player's body, rows 13..23
BODY = {
 'down': ['...oqroSSorRo...', '..oqrrrwwrrrRo..', '..oqorrwwrroRo..', '..osoqrrrrRoSo..', '...ooQQQQQQoo...',
          '....oppppppo....', '...opppoopppo...', '...opPo..oPpo...', '...okko..okko...', '...oooo..oooo...', '................'],
 'up':   ['...orozzyyoRo...', '..oqrozyyyYoRo..', '..oqrozyyyYoRo..', '..osoozyyyYooSo.', '...ooQoYYYooQo..',
          '....oppppppo....', '...opppoopppo...', '...opPo..oPpo...', '...okko..okko...', '...oooo..oooo...', '................'],
 'left': ['.....oSSoo......', '....oqrrrRo.....', '....oqrqrRRo....', '....oqrqrRRo....', '....oqoSoRRo....',
          '....oQQQQQQo....', '....opppppPo....', '....oppopPPo....', '....okkookko....', '....oooooooo....', '................'],
}
LEGS = {
  'down1': ['...opppoopppo...', '...opPo.okkko...', '...okko..oooo...', '...oooo_________'],
  'down2': ['...opppoopppo...', '...okkko.oPpo...', '...oooo..okko...', '_________oooo...'],
  'left1': ['....oppooPPo....', '...opPo_oPPPo...', '..okkko__okko...', '..ooooo___oo____'],
  'left2': ['....opppPo______', '....oppPPo______', '....okkkko______', '....oooooo______'],
}

def stamp(g, rows, x, y):
    g = [list(r) for r in g]
    for j, r in enumerate(rows):
        for i, c in enumerate(r):
            if c == '.': continue
            g[y + j][x + i] = '.' if c == '_' else c
    return [''.join(r) for r in g]

def frames_for(heads, patch=None, legs=True):
    """heads: {down, up, left} 13-row lists. patch(dir, rows24) -> rows24 (body edits)."""
    out = {}
    for d in ('down', 'up', 'left'):
        g = heads[d] + BODY[d]
        if patch: g = patch(d, g)
        out[d + '0'] = g
        for f in ('1', '2'):
            lk = ('left' if d == 'left' else 'down') + f
            gg = stamp(g, LEGS[lk], 0, 19) if legs else g
            out[d + f] = gg
    return out

def check(name, frames):
    for k, g in frames.items():
        assert len(g) == 24, (name, k, len(g))
        for y, r in enumerate(g): assert len(r) == 16, (name, k, y, r, len(r))

def put(g, y, row):
    g = list(g); g[y] = row; return g

def edits(g, pts):
    g = [list(r) for r in g]
    for (x, y, c) in pts: g[y][x] = c
    return [''.join(r) for r in g]

CH = {}

# ================================================================ CEO LINDA
# pink rolled ponytail piled on top, side curls, stern brows, dark lips; black high-collar jacket, pink shirt + tie
CH['linda'] = dict(heads={
 'down': [
  '.....oooooo.....',
  '....oaabbbbo....',
  '....oabbbbco....',
  '...ooccccccoo...',
  '..obbbbbbbbbbo..',
  '..obabbbbbbbco..',
  '.obbsSSSSSSsbco.',
  '.obsddssssddsco.',
  '.obssessssesbco.',
  '.obssessssesbco.',
  '.ocbtssllsssbco.',
  '.occbSssssSbcco.',
  '..oco.oSSo.oco..',
 ],
 'up': [
  '.....oooooo.....',
  '....oaabbbbo....',
  '....oabbbbco....',
  '...ooccccccoo...',
  '..obbbbbbbbbbo..',
  '..obabbbbbbbco..',
  '.obbbbbbbbbbbco.',
  '.obbbbbbbbbbbco.',
  '.obbbbbbbbbbbco.',
  '.obbbbbbbbbbcco.',
  '.occbbbbbbbbcco.',
  '.occcbbbbbbccco.',
  '..oco.oooo.oco..',
 ],
 'left': [
  '......oooooo....',
  '.....oaabbbbo...',
  '.....oabbbbco...',
  '....ooccccccoo..',
  '...obbbbbbbbbbo.',
  '...obabbbbbbbco.',
  '..obbSSSbbbbbco.',
  '..osddsbbbbbbco.',
  '..osessbbbbbbco.',
  '..osessbbbbbbco.',
  '.otsssSbbbbbcco.',
  '..olsSSbbbbcco..',
  '...ooSSoobcco...',
 ]},
 patch=lambda d, g: put(put(g, 13, {'down': '...oqrrrrrrRo...', 'up': '...orrrrrrrRo...', 'left': '.....oqqoo......'}[d]), 18, g[18]),
 legend={'a': 'np_lp3', 'b': 'np_lp2', 'c': 'np_lp1', 's': 'sk3', 'S': 'sk2', 't': '#fff2e8', 'e': 'ink', 'd': '#5a2a3a', 'l': '#8a2048',
         'q': 'np_bk3', 'r': 'np_bk2', 'R': 'np_bk1', 'Q': 'np_bk0', 'w': 'np_lp2', 'p': 'np_bk2', 'P': 'np_bk1', 'k': 'ink2',
         'y': 'np_bk2', 'Y': 'np_bk1', 'z': 'np_bk3'})

# ================================================================ generic short-hair head templates
SHORT = {
 'down': ['................', '................', '.....oooooo.....', '....ojhhhhho....', '...ojhhhhhhHo...', '..ojhhhhhhhhHo..',
          '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..ohSSSSSSSSho..', '..ohsessssesho..', '..ohsessssesho..', '..oHtssssssSHo..', '...oHSssssSHo...'],
 'up':   ['................', '................', '.....oooooo.....', '....ojhhhhho....', '...ojhhhhhhHo...', '..ojhhhhhhhhHo..',
          '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..ojhhhhhhhhHo..', '..ojhhhhhhhHHo..', '..oHhhhhhhhHHo..', '...oHHHHHHHHo...'],
 'left': ['................', '................', '......oooooo....', '.....ojhhhhho...', '....ojhhhhhhHo..', '...ojhhhhhhhHo..',
          '...ohhhhhhhhHo..', '..ohhhhhhhhhHo..', '...oSSSShhhhHo..', '...osesShhhhHo..', '...osesshhhhHo..', '..otssssShhHo...', '...ooSSSSHHo....'],
}
# peaked cap (police / postal): c cap, C shade, x badge, b visor
CAP = {
 'down': ['................', '................', '.....oooooo.....', '....ovccccco....', '...ovccccccCo...', '..ovcccxxccCCo..',
          '..oCCCCxxCCCCo..', '..obbbbbbbbbbo..', '..ohSSSSSSSSho..', '..ohsessssesho..', '..ohsessssesho..', '..oHtssssssSHo..', '...oHSssssSHo...'],
 'up':   ['................', '................', '.....oooooo.....', '....occcccvo....', '...occcccccvo...', '..occcccccccCo..',
          '..oCccccccccCo..', '..oCCCCCCCCCCo..', '..ohhhhhhhhhHo..', '..ojhhhhhhhhHo..', '..ojhhhhhhhHHo..', '..oHhhhhhhhHHo..', '...oHHHHHHHHo...'],
 'left': ['................', '................', '......oooooo....', '.....ovccccco...', '....ovccccccCo..', '...ovccccxxcCo..',
          '...oCCCCCxxCCo..', '.obbbbbCCCCCCo..', '...oSSSShhhhHo..', '...osesShhhhHo..', '...osesshhhhHo..', '..otssssShhHo...', '...ooSSSSHHo....'],
}
def with_rows(base, d, repl):
    g = list(base[d])
    for y, r in repl.items(): g[y] = r
    return g

# ================================================================ MALL COP: light-blue uniform, navy cap, gold badge, big moustache
CH['mallcop'] = dict(heads={
  'down': with_rows(CAP, 'down', {11: '..oHtmmmmmmSHo..'}),
  'up': CAP['up'],
  'left': with_rows(CAP, 'left', {11: '..otmmmSShhHo...'}),
 },
 patch=lambda d, g: edits(g, [(4, 14, 'x')]) if d == 'down' else edits(g, [(5, 15, 'x')]) if d == 'left' else g,
 legend={'c': '#2e3a7a', 'C': '#1e2656', 'v': '#4a5aa8', 'x': 'au2', 'b': '#14182e', 'h': 'hr1', 'H': 'hr0', 'j': 'hr2',
         's': 'sk2', 'S': 'sk1', 't': 'sk3', 'e': 'ink', 'm': 'hr0',
         'q': '#a8c8f0', 'r': '#7aa2e0', 'R': '#4a6ab8', 'Q': '#2e3a7a', 'w': '#2e3a7a', 'p': '#2e3a7a', 'P': '#1e2656', 'k': 'ink2',
         'y': '#7aa2e0', 'Y': '#4a6ab8', 'z': '#a8c8f0'})

# ================================================================ POSTAL INSPECTOR: navy jacket, navy cap w/ eagle-gold, brown satchel strap, glasses
def satchel(d, g):
    if d == 'down': return edits(g, [(4, 13, 'u'), (5, 14, 'u'), (6, 15, 'u'), (7, 16, 'u'), (8, 16, 'u'), (9, 16, 'U'), (10, 16, 'U'), (11, 16, 'U')])
    if d == 'up': return edits(g, [(11, 13, 'u'), (10, 14, 'u'), (9, 15, 'u'), (8, 16, 'u')])
    return edits(g, [(5, 15, 'U'), (6, 15, 'U'), (7, 15, 'U'), (5, 16, 'U'), (6, 16, 'u'), (7, 16, 'U')])
CH['inspector'] = dict(heads={
  'down': with_rows(CAP, 'down', {9: '..ohsggssggsho..', 10: '..ohgegssgegho..'}),
  'up': CAP['up'],
  'left': with_rows(CAP, 'left', {9: '...gggSShhhhHo..', 10: '...ogeShhhhHo..'[:16].ljust(16, '.')}),
 }, patch=satchel,
 legend={'c': '#22284a', 'C': '#161a32', 'v': '#363e6a', 'x': 'au2', 'b': '#101224', 'h': 'hr0', 'H': 'ink', 'j': 'hr1',
         's': 'sk2', 'S': 'sk1', 't': 'sk3', 'e': 'ink', 'g': '#8a8aa0',
         'q': '#4a5280', 'r': '#363e6a', 'R': '#22284a', 'Q': '#161a32', 'w': 'wh2', 'p': '#5a5a6a', 'P': '#3a3a4a', 'k': 'ink2',
         'u': 'wd2', 'U': 'wd1', 'y': '#363e6a', 'Y': '#22284a', 'z': '#4a5280'})

# ================================================================ GARF (diner owner): paper hat, moustache, white apron over red shirt
GARF_HAT = {
 'down': ['................', '................', '................', '......oooo......', '....oogggGoo....', '..oogggggggGoo..',
          '..oGGGGGGGGGGo..', '..ohhhhhhhhhHo..', '..ohSSSSSSSSho..', '..ohsessssesho..', '..ohsessssesho..', '..oHtmmmmmmSHo..', '...oHSmssmSHo...'],
 'up':   ['................', '................', '................', '......oooo......', '....ooGgggoo....', '..ooGggggggGoo..',
          '..oGGGGGGGGGGo..', '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..ojhhhhhhhhHo..', '..ojhhhhhhhHHo..', '..oHhhhhhhhHHo..', '...oHHHHHHHHo...'],
 'left': ['................', '................', '................', '.......oooo.....', '.....oogggGoo...', '...oogggggggGo..',
          '...oGGGGGGGGGo..', '...ohhhhhhhhHo..', '...oSSSShhhhHo..', '...osesShhhhHo..', '...osesshhhhHo..', '..otmmmsShhHo...', '...ooSmSSHHo....'],
}
def apron(d, g):
    if d == 'down':
        g = put(g, 14, '..oqrraaaarrRo..'); g = put(g, 15, '..oqoraaaaroRo..'); g = put(g, 16, '..osoaaaaaAoSo..'); g = put(g, 17, '...ooaaaaaAoo...')
        return put(g, 18, '....oaaaaAAo....')
    if d == 'left':
        g = put(g, 15, '....oaarqRRo....'); g = put(g, 16, '....oaarqRRo....'); g = put(g, 17, '....oaoSoRRo....'); return put(g, 18, '....oaaAQQQo....')
    return edits(g, [(x, 14, 'a') for x in (6, 7, 8, 9)])   # apron bow at the back
CH['garf'] = dict(heads=GARF_HAT, patch=apron,
 legend={'g': '#ffffff', 'G': 'wh1', 'h': 'hr1', 'H': 'hr0', 'j': 'hr2', 's': 'sk2', 'S': 'sk1', 't': 'sk3', 'e': 'ink', 'm': 'hr0',
         'q': '#f07a6a', 'r': '#d84a42', 'R': '#a8323a', 'Q': '#6a1f2e', 'w': 'wh2', 'a': '#f8f8f8', 'A': 'wh1',
         'p': '#3a4a6a', 'P': '#2a3450', 'k': 'ink2', 'y': '#d84a42', 'Y': '#a8323a', 'z': '#f07a6a'})

# ================================================================ TOURIST: khaki bucket hat, sunglasses, hawaiian shirt, camera
BUCKET = {
 'down': ['................', '................', '................', '....oooooooo....', '...oaaaaaaaAo...', '...oaaaaaaaAo...',
          '.ooAAAAAAAAAAoo.', '..ohSSSSSSSSho..', '..ohssssssssho..', '..ohgggssgggho..', '..ohsggssggsho..', '..oHtssssssSHo..', '...oHSssssSHo...'],
 'up':   ['................', '................', '................', '....oooooooo....', '...oaaaaaaaAo...', '...oaaaaaaaAo...',
          '.ooAAAAAAAAAAoo.', '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..ojhhhhhhhhHo..', '..ojhhhhhhhHHo..', '..oHhhhhhhhHHo..', '...oHHHHHHHHo...'],
 'left': ['................', '................', '................', '.....oooooooo...', '....oaaaaaaaAo..', '....oaaaaaaaAo..',
          '.ooAAAAAAAAAAAo.', '...oSSSShhhhHo..', '...ossSShhhhHo..', '..gggsShhhhhHo..', '...ogsshhhhHo...', '..otssssShhHo...', '...ooSSSSHHo....'],
}
def hawaii(d, g):
    pts = {'down': [(4, 14, 'f'), (10, 15, 'f'), (5, 16, 'f'), (11, 14, 'F'), (7, 14, 'c'), (8, 14, 'c'), (7, 15, 'c'), (8, 15, 'C')],
           'up': [(4, 14, 'f'), (10, 15, 'f'), (7, 16, 'f')],
           'left': [(6, 14, 'f'), (8, 15, 'F'), (5, 16, 'c'), (6, 16, 'C')]}[d]
    return edits(g, pts)
CH['tourist'] = dict(heads=BUCKET, patch=hawaii,
 legend={'a': '#e0cc98', 'A': '#b8a070', 'h': 'hr2', 'H': 'hr1', 'j': 'hr3', 's': 'sk2', 'S': 'sk1', 't': 'sk3', 'e': 'ink', 'g': 'ink2',
         'q': '#f8b060', 'r': '#f08a3a', 'R': '#c8642a', 'Q': '#8a4020', 'w': '#f08a3a', 'f': '#f8f0a0', 'F': '#e85a8a',
         'c': '#3a3a4a', 'C': '#6a6a7a', 'p': '#e0cc98', 'P': '#b8a070', 'k': '#8a5a3a', 'y': '#f08a3a', 'Y': '#c8642a', 'z': '#f8b060'})

# ================================================================ SHOPPERS
def bag(d, g):
    if d == 'down': return edits(g, [(1, 16, 'o'), (1, 17, 'o'), (2, 17, 'u'), (1, 18, 'o'), (2, 18, 'u'), (3, 18, 'U'), (1, 19, 'o'), (2, 19, 'o'), (3, 19, 'o'), (2, 16, 'o'), (3, 17, 'U')])
    if d == 'left': return edits(g, [(9, 17, 'o'), (9, 18, 'u'), (10, 18, 'U'), (9, 19, 'o'), (10, 19, 'o'), (11, 18, 'o'), (10, 17, 'o')])
    return g
LONG = {   # long hair (shopper)
 'down': ['................', '................', '.....oooooo.....', '....ojhhhhho....', '...ojhhhhhhHo...', '..ojhhhhhhhhHo..',
          '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '.ohhSSSSSSSShHo.', '.ohhsessssesHHo.', '.ohhsessssesHHo.', '.ohHtssssssSHHo.', '.ohHHSssssSHHHo.'],
 'up':   ['................', '................', '.....oooooo.....', '....ojhhhhho....', '...ojhhhhhhHo...', '..ojhhhhhhhhHo..',
          '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '.ohhhhhhhhhhHHo.', '.ojhhhhhhhhhHHo.', '.ojhhhhhhhhHHHo.', '.oHhhhhhhhhHHHo.', '.oHHHHHHHHHHHHo.'],
 'left': ['................', '................', '......oooooo....', '.....ojhhhhho...', '....ojhhhhhhHo..', '...ojhhhhhhhHo..',
          '...ohhhhhhhhHo..', '..ohhhhhhhhhHHo.', '...oSSSShhhhHHo.', '...osesShhhhHHo.', '...osesshhhhHHo.', '..otssssShhhHHo.', '...ooSSSShhHHHo.'],
}
CH['shopper'] = dict(heads=LONG, patch=bag,
 legend={'h': 'fy2', 'H': 'fy1', 'j': 'fy3', 's': 'sk2', 'S': 'sk1', 't': 'sk3', 'e': 'ink',
         'q': '#9ad890', 'r': '#62b86a', 'R': '#3a8a50', 'Q': '#22603a', 'w': '#9ad890', 'p': '#4a5aa8', 'P': '#2e3a7a', 'k': 'ink2',
         'u': 'fr2', 'U': 'fr1', 'y': '#62b86a', 'Y': '#3a8a50', 'z': '#9ad890'})
CH['shopper2'] = dict(heads={
  'down': with_rows(SHORT, 'down', {9: '..ohgggssgggho..', 10: '..ohgesssgesho..'}),
  'up': SHORT['up'],
  'left': with_rows(SHORT, 'left', {9: '..gggSShhhhHo...'.ljust(16, '.'), 10: '...ogesshhhhHo..'}),
 }, patch=bag,
 legend={'h': 'ink2', 'H': 'ink', 'j': '#5a5070', 's': 'sk1', 'S': 'sk0', 't': 'sk2', 'e': 'ink', 'g': '#c8c8d8',
         'q': '#6ad0c8', 'r': '#2e9a98', 'R': '#1f6a70', 'Q': '#174a52', 'w': '#f4f4f8', 'p': '#5a4a3a', 'P': '#3a2e26', 'k': 'ink2',
         'u': 'au2', 'U': 'au1', 'y': '#2e9a98', 'Y': '#1f6a70', 'z': '#6ad0c8'})

# ================================================================ PEE KID: dark bowl cut, white sailor shirt, blue sailor collar, brown neckerchief
BOWL = {
 'down': ['................', '................', '................', '.....oooooo.....', '....ohhhhhjo....', '...ohhhhhhhjo...',
          '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..oHHHHHHHHHHo..', '..oSsessssesSo..', '..oSsessssesSo..', '..oStsspssssSo..', '...oSSssssSSo...'],
 'up':   ['................', '................', '................', '.....oooooo.....', '....ohhhhhjo....', '...ohhhhhhhjo...',
          '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..ohhhhhhhhhHo..', '..oHhhhhhhhhHo..', '..oSHHHHHHHHSo..', '...oSSSSSSSSo...'],
 'left': ['................', '................', '................', '......oooooo....', '.....ohhhhhjo...', '....ohhhhhhhjo..',
          '...ohhhhhhhhHo..', '...ohhhhhhhhHo..', '...oHHHHhhhhHo..', '...osesShhhhHo..', '...osesshhhhHo..', '..otssssShhHo...', '...ooSSSSHHo....'],
}
def sailor(d, g):
    if d == 'down': return edits(g, [(4, 13, 'b'), (11, 13, 'b'), (3, 14, 'b'), (4, 14, 'b'), (11, 14, 'b'), (12, 14, 'B'), (6, 14, 'b'), (9, 14, 'b')])
    if d == 'up': return put(put(g, 13, '...obbbbbbbbo...'), 14, '..oqbbbbbbbbRo..')
    return edits(g, [(5, 14, 'b'), (6, 14, 'b'), (7, 14, 'b'), (8, 14, 'B'), (5, 15, 'w')])
CH['peekid'] = dict(heads=BOWL, patch=sailor,
 legend={'h': '#2e2a3a', 'H': '#1c1824', 'j': '#4a4458', 's': 'sk3', 'S': 'sk2', 't': '#fff2e8', 'e': 'ink', 'p': 'blush',
         'q': '#ffffff', 'r': '#f0f0f6', 'R': '#c8cadc', 'Q': '#9a9cb8', 'w': '#9a5a3a', 'b': '#3a6ad0', 'B': '#22408a',
         'p_': '', 'k': 'ink2', 'y': '#f0f0f6', 'Y': '#c8cadc', 'z': '#ffffff'})
CH['peekid']['legend'].pop('p_')
CH['peekid']['legend']['p'] = '#2e3a6a'   # shorts (blush only used on face via 'p' -> moved below)
# face blush uses 'f' instead of 'p'
for d in ('down',):
    BOWL[d][11] = '..oStssfssssSo..'
CH['peekid']['legend']['f'] = 'blush'
CH['peekid']['legend']['P'] = '#1e2650'

# ================================================================ PILOT X: wild spiky black hair, red headband, yellow ring goggles, 天 mark, pale teal coat
CH['pilotx'] = dict(heads={
 'down': [
  '................',
  '...o...oo...o...',
  '..oho.ohho.oho..',
  '..ohhoohhhoohho.',
  '.ohhhhhhhhhhhhho',
  '.ohjhhhhhhhhhhHo',
  'ohhhhhhhhhhhhhHo',
  '.oaaaaaaaaaaaaAo',
  '.ohYYYssssYYYho.',
  '.ohYgYsdssYgYho.',
  '.ohYYYssssYYYho.',
  '..ohtsssssSSho..',
  '...oHSsmmsSHo...',
 ],
 'up': [
  '................',
  '...o...oo...o...',
  '..oho.ohho.oho..',
  '..ohhoohhhoohho.',
  '.ohhhhhhhhhhhhho',
  '.ohjhhhhhhhhhhHo',
  'ohhhhhhhhhhhhhHo',
  '.oaaaaaaaaaaaaAo',
  '.ohhhhhhhhhhhHHo',
  'ohhhhhhhhhhhhhHo',
  '.ohhAhhhhhhhhHo.',
  '..ohAAhhhhhhHo..',
  '...oHHHHHHHHo...',
 ],
 'left': [
  '................',
  '....o...oo..o...',
  '...oho.ohho.oho.',
  '...ohhoohhhoohho',
  '..ohhhhhhhhhhhho',
  '..ohjhhhhhhhhhHo',
  '.ohhhhhhhhhhhhHo',
  '.oaaaaaaaaaaaaAo',
  '.YYYsshhhhhhhHo.',
  'oYgYsshhhhhhHHo.',
  '.YYYdshhhhhhHo..',
  '.otsssShhhhHo...',
  '..oomSSoHHHo....',
 ]},
 patch=lambda d, g: (put(put(g, 18, {'down': '...orrrppprRo...', 'up': '...orrrrrrrRo...', 'left': '....orrpppRo....'}[d]), 13,
                         {'down': '...oqroSSorRo...', 'up': g[13], 'left': g[13]}[d])),
 legend={'h': '#24202e', 'H': '#14121a', 'j': '#3e3850', 'a': '#e04e42', 'A': '#a8323a', 'Y': '#f2cc58', 'g': '#fff8c0', 'd': 'ink',
         's': 'sk2', 'S': 'sk1', 't': 'sk3', 'm': 'sk0',
         'q': '#c8ece0', 'r': '#9ad4c4', 'R': '#62a89a', 'Q': '#3e7a70', 'w': '#2a2836', 'p': '#2a2836', 'P': '#1a1824', 'k': 'ink2',
         'y': '#9ad4c4', 'Y': '#62a89a', 'z': '#c8ece0'})

# ================================================================ YOKO: brown bob, lavender sleeveless turtleneck, white belt, gold pendant
CH['yoko'] = dict(heads={
  'down': ['................', '................', '.....oooooo.....', '....ojhhhhho....', '...ojhhhhhhHo...', '..ojhhhhhhhhHo..',
           '..ohhhhhhhhhHo..', '.ohhhhhhhhhhHHo.', '.ohhSSSSSSSShHo.', '.ohhsessssesHHo.', '.ohhsessssesHHo.', '.ohHtssssssSHHo.', '.ooHHSssssSHHoo.'],
  'up':   ['................', '................', '.....oooooo.....', '....ojhhhhho....', '...ojhhhhhhHo...', '..ojhhhhhhhhHo..',
           '..ohhhhhhhhhHo..', '.ohhhhhhhhhhHHo.', '.ojhhhhhhhhhHHo.', '.ojhhhhhhhhHHHo.', '.oHhhhhhhhhHHHo.', '.oHHhhhhhhHHHHo.', '.ooHHHHHHHHHHoo.'],
  'left': ['................', '................', '......oooooo....', '.....ojhhhhho...', '....ojhhhhhhHo..', '...ojhhhhhhhHo..',
           '...ohhhhhhhhHHo.', '..ohhhhhhhhhHHo.', '...oSShhhhhhHHo.', '...osShhhhhhHHo.', '...osshhhhhHHHo.', '..otssShhhhHHHo.', '...ooSSohhHHHo..'],
 },
 patch=lambda d, g: edits(put(g, 17, {'down': '...oobbbbbbBo...', 'up': '...oobbbbbbBo...', 'left': '....obbbbbBo....'}[d]),
                          ([(7, 15, 'x')] if d == 'down' else []) + ([(3, 14, 'S'), (3, 15, 'S'), (12, 14, 'S'), (12, 15, 'S')] if d != 'left' else [])),
 legend={'h': '#7a4a32', 'H': '#4e2e24', 'j': '#a06a48', 's': 'sk3', 'S': 'sk2', 't': '#fff2e8', 'e': 'ink',
         'q': '#e0d0f4', 'r': '#c0a8e8', 'R': '#9278c8', 'Q': '#6a52a0', 'w': '#c0a8e8', 'x': 'au2', 'b': '#ffffff', 'B': 'wh1',
         'p': '#4a5a8a', 'P': '#323e66', 'k': 'ink2', 'y': '#c0a8e8', 'Y': '#9278c8', 'z': '#e0d0f4'})

# ================================================================ HEAD OF CONTAINMENT: white visor helmet, grey moustache, white suit
HELM = {
 'down': ['................', '................', '.....oooooo.....', '....ouuuuuVo....', '...ouuuuuuuVo...', '..ouuuuuuuuuVo..',
          '..ouuuuuuuuuVo..', '..oVVVVVVVVVVo..', '..oxxxxxxxxxxo..', '..oxXXxxxxxxxo..', '..oSssssssssSo..', '..oSmmmmmmmmSo..', '...oSssssssSo...'],
 'up':   ['................', '................', '.....oooooo.....', '....ouuuuuVo....', '...ouuuuuuuVo...', '..ouuuuuuuuuVo..',
          '..ouuuuuuuuuVo..', '..ouuuuuuuuuVo..', '..ouuuuuuuuuVo..', '..oVuuuuuuuVVo..', '..oVVVVVVVVVVo..', '..ohhhhhhhhhho..', '...oSSSSSSSSo...'],
 'left': ['................', '................', '......oooooo....', '.....ouuuuuVo...', '....ouuuuuuuVo..', '...ouuuuuuuuVo..',
          '...ouuuuuuuuVo..', '..oVVVVVuuuuVo..', '..oxxxxVuuuuVo..', '..oXxxxVuuuVVo..', '..osssSVVVVVo...', '..ommmSSSSSo....', '...ooSSSSoo.....'],
}
CH['headofc'] = dict(heads=HELM,
  legend={'u': '#ffffff', 'V': 'wh1', 'x': '#2a3044', 'X': '#8ab8e8', 'h': 'wh0', 's': 'sk2', 'S': 'sk1', 'm': '#a8a8b8', 'e': 'ink',
         'q': '#ffffff', 'r': 'wh2', 'R': 'wh1', 'Q': 'wh0', 'w': 'ink', 'p': 'wh2', 'P': 'wh1', 'k': 'ink2',
         'y': 'wh2', 'Y': 'wh1', 'z': '#ffffff'})

# ================================================================ COWBOY GHOST: pale translucent-looking blue cowboy with a wide hat
HAT = {
 'down': ['................', '................', '................', '.....oooooo.....', '....oaaaaaAo....', '....oaabbaAo....',
          'ooaaaaaaaaaaaAoo', '.oAAAAAAAAAAAAo.', '..ohSSSSSSSSho..', '..ohsessssesho..', '..ohsessssesho..', '..oHtsmmmmsSHo..', '...oHSssssSHo...'],
 'up':   ['................', '................', '................', '.....oooooo.....', '....oaaaaaAo....', '....oaaaaaAo....',
          'ooaaaaaaaaaaaAoo', '.oAAAAAAAAAAAAo.', '..ohhhhhhhhhHo..', '..ojhhhhhhhhHo..', '..ojhhhhhhhHHo..', '..oHhhhhhhhHHo..', '...oHHHHHHHHo...'],
 'left': ['................', '................', '................', '......oooooo....', '.....oaaaaaAo...', '.....oabbaaAo...',
          'ooaaaaaaaaaaaAoo', '.oAAAAAAAAAAAAo.', '...oSSSShhhhHo..', '...osesShhhhHo..', '...osesshhhhHo..', '..otmmssShhHo...', '...ooSSSSHHo....'],
}
CH['cowboy'] = dict(heads=HAT,
 patch=lambda d, g: edits(g, [(3, 14, 'v'), (12, 14, 'v'), (3, 15, 'v'), (12, 15, 'v'), (4, 16, 'v'), (11, 16, 'v')]) if d == 'down' else g,
 legend={'o': '#4a5a8a', 'a': '#b8d0ec', 'A': '#8aa8d4', 'b': '#e8f4ff', 'h': '#9ab8e0', 'H': '#7a98c8', 'j': '#c8dcf4',
         's': '#dceefc', 'S': '#b8d4f0', 't': '#f4faff', 'e': '#2e3a6a', 'm': '#9ab8e0',
         'q': '#e8f4ff', 'r': '#c8dcf4', 'R': '#a8c4ec', 'Q': '#7a98c8', 'w': '#f4faff', 'v': '#8aa8d4',
         'p': '#a8c4ec', 'P': '#8aa8d4', 'k': '#7a98c8', 'y': '#c8dcf4', 'Y': '#a8c4ec', 'z': '#e8f4ff'})

# ================================================================ LINDA LITE: waitress, pink side ponytail, white headband cap, pink dress, white apron
LITE = {
 'down': ['................', '................', '.....oooooo.....', '....ojhhhhhoo...', '...ojhhhhhhhhoo.', '..owwwwwwwwwHhho',
          '..ohhhhhhhhhHohH', '..ohhhhhhhhhHoHo', '..ohSSSSSSSShoo.', '..ohsessssesho..', '..ohsessssesho..', '..oHtsslssSSHo..', '...oHSssssSHo...'],
 'up':   ['................', '................', '.....oooooo.....', '....ojhhhhhoo...', '...ojhhhhhhhhoo.', '..owwwwwwwwwHhho',
          '..ohhhhhhhhhHohH', '..ohhhhhhhhhHoHo', '..ohhhhhhhhhHoo.', '..ojhhhhhhhhHo..', '..ojhhhhhhhHHo..', '..oHhhhhhhhHHo..', '...oHHHHHHHHo...'],
 'left': ['................', '................', '......oooooo....', '.....ojhhhhho...', '....ojhhhhhhHo..', '...owwwwwwwwHo..',
          '...ohhhhhhhhHHoo', '..ohhhhhhhhhHhHo', '...oSSSShhhhHoHo', '...osesShhhhHo.o', '...osesshhhhHo..', '..otslssShhHo...', '...ooSSSSHHo....'],
}
def dress(d, g):
    leg = {'down': ['...oRRRRRRRRo...', '...osssoosSso...'], 'up': ['...oRRRRRRRRo...', '...osssoosSso...'], 'left': ['....oRRRRRRo....', '....osssSSso....']}[d]
    g = put(g, 18, leg[0]); g = put(g, 19, leg[1])
    if d == 'down': g = edits(g, [(6, 15, 'a'), (7, 15, 'a'), (8, 15, 'a'), (9, 15, 'a'), (6, 16, 'a'), (7, 16, 'a'), (8, 16, 'a'), (9, 16, 'A'), (6, 17, 'a'), (7, 17, 'a'), (8, 17, 'A'), (9, 17, 'A')])
    return g
CH['lindalite'] = dict(heads=LITE, patch=dress,
 legend={'h': 'np_lp2', 'H': 'np_lp1', 'j': 'np_lp3', 'w': '#ffffff', 's': 'sk3', 'S': 'sk2', 't': '#fff2e8', 'e': 'ink', 'l': '#c84a6a',
         'q': '#ffb8d8', 'r': '#f088b8', 'R': '#c85a90', 'Q': '#8a3a66', 'a': '#ffffff', 'A': 'wh1',
         'p': 'sk3', 'P': 'sk2', 'k': '#8a3a66', 'y': '#f088b8', 'Y': '#c85a90', 'z': '#ffb8d8'})
# Linda Lite's shirt centre is the apron
CH['lindalite']['legend']['w'] = '#ffffff'

# ================================================================ JB GARFIELD (custom body): fat orange cat, grey fedora, tan trenchcoat, arms crossed
GARF_D = [
 '................',
 '................',
 '.....oooooo.....',
 '.oo.offFFFFo.oo.',
 '.ocooffFFFFooCo.',
 '.ocobbbbbbbboCo.',
 'ooFFFFFFFFFFFFoo',
 '.oGGGGGGGGGGGGo.',
 '..occcccccccCo..',
 '..ocDDDccDDDCo..',
 '..ocjjeccjjeCo..',
 '.oocmmmkkmmmCoo.',
 '..oCmmmoommmCo..',
 '...oCCmmmmCCo...',
 '..oTTTnddnTTTo..',
 '.oTTTTnddnTTTTo.',
 '.oTggUUUUUUggTo.',
 '.oTUUUUUUUUUUTo.',
 '.oTTTTTbbTTTTTo.',
 '..oTTTTTTTTTTo..',
 '..oTTTToTTTTTo..',
 '...occo..occo...',
 '...oooo..oooo...',
 '................',
]
GARF_U = [
 '................',
 '................',
 '.....oooooo.....',
 '.oo.offFFFFo.oo.',
 '.ocooffFFFFooCo.',
 '.ocobbbbbbbboCo.',
 'ooFFFFFFFFFFFFoo',
 '.oGGGGGGGGGGGGo.',
 '..occcccccccCo..',
 '..ocCcccccCcCo..',
 '..occccccccCCo..',
 '..ocCcccccCcCo..',
 '..oCcccccccCCo..',
 '...oCCCCCCCCo...',
 '..oTTTTTTTTTTo..',
 '.oTTTTTTTTTTTTo.',
 '.oTTTTTTTTTTTTo.',
 '.oUTTTTTTTTTTUo.',
 '.oTTTTTbbTTTTTo.',
 '..oTTTTTTTTTTocc',
 '..oTTTToTTTTTocC',
 '...occo..occo.oo',
 '...oooo..oooo...',
 '................',
]
GARF_L = [
 '................',
 '................',
 '.....oooooo.....',
 '....offFFFFo.oo.',
 '....offFFFFooCo.',
 '...obbbbbbbboCo.',
 'ooFFFFFFFFFFFFo.',
 '.oGGGGGGGGGGGo..',
 '..occcccccCCo...',
 '..oDDcccccCCo...',
 '..ojecccccCCo...',
 'okmmmcccccCCo...',
 '.ommmmccccCCo...',
 '..oomCCCCCCo....',
 '...oTTnTTTTo....',
 '...oTTnTTTTTo...',
 '...ogUUUUTTTo...',
 '...oTUUUUTTTo...',
 '...oTTTbbTTTo...',
 '...oTTTTTTTTo...',
 '...oTTTTToTTo...',
 '...occco.occo...',
 '...ooooo.oooo...',
 '................',
]
def garf_walk(g, side):
    # lift one foot (same idea as the player's step frames): blank that foot's sole row
    if side == 1: return put(g, 22, g[22][:9] + '.' * 7)
    return put(g, 22, '.' * 9 + g[22][9:])
GL = {'o': 'ink', 'F': '#7a7a8e', 'f': '#a8a8bc', 'b': '#26222e', 'G': '#5a5a6e', 'c': 'ct2', 'C': 'ct1', 'D': 'ct0', 'j': '#ffffff',
      'e': 'ink', 'm': '#fff4e0', 'k': '#e86a8a', 'T': '#d8b880', 'U': '#b89458', 'n': '#f4f4f8', 'd': '#3a3a4a', 'g': '#26222e'}
CH['garfield'] = dict(custom={
  'down0': GARF_D, 'down1': garf_walk(GARF_D, 1), 'down2': garf_walk(GARF_D, 2),
  'up0': GARF_U, 'up1': garf_walk(GARF_U, 1), 'up2': garf_walk(GARF_U, 2),
  'left0': GARF_L, 'left1': put(GARF_L, 22, '...ooooo........'), 'left2': put(GARF_L, 22, '.........oooo...'),
 }, legend=GL)

# ================================================================ SPOOKY GHOST (custom): white sheet, black oval eyes, fanged grin, violet glow; floats + bobs
GH_D = [
 '................',
 '.....oooooo.....',
 '....owwwwwWo....',
 '...owwwwwwwWo...',
 '..owwwwwwwwwWo..',
 '..owweewweewWo..',
 '..owweewweewWo..',
 '..owweewweewWo..',
 '..owwwwwwwwwWo..',
 '..owmwwwwwwmWo..',
 '..owwmFmmFmwWo..',
 '..owwwmmmmwwWo..',
 '.owwwwwwwwwwwWo.',
 'owwwwwwwwwwwwWWo',
 'owWowwwwwwwwoWWo',
 '.oo.owwwwwwWo.oo',
 '....owwwwwwWo...',
 '....owwwwwWWo...',
 '...owwwwwwWWWo..',
 '...owWwwwWwWWo..',
 '...oWowWoWoWWo..',
 '....o.oo.o.oo...',
 '................',
 '................',
]
def noface(g): return [r.replace('e', 'w').replace('m', 'w').replace('F', 'w') for r in g]
def sideface(g):
    out = []
    for y, r in enumerate(g):
        if 5 <= y <= 11:
            a = list(r.replace('e', 'w').replace('m', 'w').replace('F', 'w'))
            for x, c in enumerate(r):
                if c in 'emF' and x - 2 >= 3: a[x - 2] = c
            r = ''.join(a)
        out.append(r)
    # one arm only (the far arm hides behind)
    out = [r for r in out]
    out[13] = '.owwwwwwwwwwwWo.'; out[14] = 'owWowwwwwwwwWo..'; out[15] = '.oo.owwwwwwWo...'
    return out
def hem2(g):
    g = put(g, 20, '...owWoWwoWoWo..'); return put(g, 21, '....o.o.oo.o....')
GHL = {'o': '#4a3a6a', 'w': '#ffffff', 'W': '#c8c0e0', 'e': '#14121a', 'm': '#14121a', 'F': '#ffffff'}
def up1(g): return g[1:] + ['.' * 16]
CH['ghost'] = dict(custom={
  'down0': GH_D, 'down1': up1(GH_D), 'down2': hem2(GH_D),
  'up0': noface(GH_D), 'up1': up1(noface(GH_D)), 'up2': hem2(noface(GH_D)),
  'left0': sideface(GH_D), 'left1': up1(sideface(GH_D)), 'left2': hem2(sideface(GH_D)),
 }, legend=GHL)

# ================================================================ output
PALETTE = """Sprout.palette({
  // CEO Linda's pink hair, black jacket (shared by Linda Lite's hair)
  np_lp1: '#b83c80', np_lp2: '#f07ab0', np_lp3: '#ffc0dc',
  np_bk0: '#14121e', np_bk1: '#1e1c2a', np_bk2: '#2c2a3c', np_bk3: '#4a4660',
});"""

def js_frames(frames, shift=None):
    parts = []
    for k, g in frames.items():
        rows = "\n".join(f"      '{r}'," for r in g)
        parts.append(f"    {k}: [\n{rows}\n    ],")
    return "\n".join(parts)

out = ["// Cracky — overworld NPCs (16x24, origin [8,23]). Generated by tools/gen_npcs.py.", "(function () {", "const S = Sprout;", PALETTE, ""]
for name, c in CH.items():
    frames = c['custom'] if 'custom' in c else frames_for(c['heads'], c.get('patch'))
    check(name, frames)
    if 'custom' not in c:
        legend = {'o': 'ink'}
        legend.update(c['legend'])
    else:
        legend = dict(c['legend'])
    # frames with a vertical bob
    fr = js_frames(frames)
    leg = "{ " + ", ".join(f"{k}: '{v}'" if not v.startswith("'") else f"{k}: {v}" for k, v in legend.items()) + " }"
    out.append(f"S.sprite('{name}', {{ w: 16, h: 24, origin: [8, 23],\n  legend: {leg},\n  frames: {{\n{fr}\n  }} }});")
out.append("})();")
open(os.path.join(os.path.dirname(__file__), '..', 'cracky', 'art_npcs.js'), 'w').write("\n".join(out) + "\n")
print('ok', len(CH))
