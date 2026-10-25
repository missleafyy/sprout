// Cracky — overworld characters (16x24, feet on row 22, origin at feet centre). Drafts: tools/gen_carl.py
(function () {
const S = Sprout;

// walk legs (rows 19..22) shared by everyone built on the 16x24 body; '_' erases
const LEGS = {
  down1: ['...opppoopppo...', '...opPo.okkko...', '...okko..oooo...', '...oooo_________'],
  down2: ['...opppoopppo...', '...okkko.oPpo...', '...oooo..okko...', '_________oooo...'],
  left1: ['....oppooPPo....', '...opPo_oPPPo...', '..okkko__okko...', '..ooooo___oo____'],
  left2: ['....opppPo______', '....oppPPo______', '....okkkko______', '....oooooo______'],
};
S.game = S.game || {};
S.game.walker = function (name, legend, base) {
  const frames = {};
  for (const d of ['down', 'up', 'left']) {
    frames[d + '0'] = base[d + '0'];
    frames[d + '1'] = { from: d + '0', parts: [{ x: 0, y: 19, rows: LEGS[(d === 'up' ? 'down' : d) + '1'] }] };
    frames[d + '2'] = { from: d + '0', parts: [{ x: 0, y: 19, rows: LEGS[(d === 'up' ? 'down' : d) + '2'] }] };
  }
  return S.sprite(name, { w: 16, h: 24, origin: [8, 23], legend, frames });
};

// Carl: big bald alien head, black cap worn backwards, yellow bow tie, black hoodie with gold trim
S.game.walker('carl', {
  o: 'ink', K: 'bl1', c: 'bl3',
  a: 'al2', A: 'al1', L: 'al3', E: 'ey0', G: 'ey1', w: '#ffffff', m: 'al0',
  Y: 'au1', y: 'au2', g: 'au2', h: 'bl2', H: 'bl1',
  p: 'pn1', P: 'pn0', k: 'ink2',
}, {
    down0: [
      '................',
      '....oooooooo....',
      '..ooKccKKKKKoo..',
      '.oKccKKKKKKKKKo.',
      '.oKKKKKKKKKKKKo.',
      'oKKKKKoaaoKKKKKo',
      'oaLLaaaaaaaaaaAo',
      'oaaEEaaaaaaEEaAo',
      'oaEwEEaaaaEwEEAo',
      'oaEEGEaaaaEEGEAo',
      'oaEEGEaaaaEEGEAo',
      '.oaEEaaaaaaEEAo.',
      '..oAaaammaaaAo..',
      '...ooAAAAAAoo...',
      '..ohYyyooyyYho..',
      '..ohhhhHHhhhHo..',
      '.ohohhhHHhhhoHo.',
      '.ogohhhHHhhhogo.',
      '..oggggggggggo..',
      '...opppoopppo...',
      '...opPo..oPpo...',
      '...okko..okko...',
      '...oooo..oooo...',
      '................',
    ],
    up0: [
      '................',
      '....oooooooo....',
      '..ooKccKKKKKoo..',
      '.oKccKKKKKKKKKo.',
      '.oKKKKKKKKKKKKo.',
      'oKKKKKKKKKKKKKKo',
      'oaKKKKKKKKKKKKAo',
      'oaLaoKKKKKKoaAAo',
      'oaaaaoKKKKoaaAAo',
      'oaaaaaooooaaaAAo',
      'oaaaaaaaaaaaaAAo',
      '.oaaaaaaaaaaAAo.',
      '..oAaaaaaaaAAo..',
      '...ooAAAAAAoo...',
      '...ohhhhhhhhHo..',
      '..ohhhhhhhhhHo..',
      '.oHohhhhhhhhoHo.',
      '.ogohhhhhhhhogo.',
      '..oggggggggggo..',
      '...opppoopppo...',
      '...opPo..oPpo...',
      '...okko..okko...',
      '...oooo..oooo...',
      '................',
    ],
    left0: [
      '................',
      '.....oooooooo...',
      '...ooKccKKKKKo..',
      '..oKccKKKKKKKKo.',
      '..oKKKKKKKKKKKKo',
      '.oKKKKKKKKKKKKKo',
      '.oaLLaaaaoKKKKKo',
      'oaLaaaaaaaoooooo',
      'oaEEaaaaaaaaaAo.',
      'oEwEEaaaaaaaaAo.',
      'oEEGEaaaaaaaaAo.',
      '.oEGEaaaaaaaAo..',
      '.oammaaaaaaAo...',
      '..ooAAAAAAoo....',
      '....ohhyYhho....',
      '....ohhhhHHo....',
      '....ohahhHHo....',
      '....ohaohHHo....',
      '....oggggggo....',
      '....oppppPPo....',
      '....oppopPPo....',
      '....okkookko....',
      '....oooooooo....',
      '................',
    ],
});
})();

// Boo as Carl's partner: overworld frames built from the Boo sprite in game/art_chars.js
(function () {
const S = Sprout;
const boo = S.sprites.boo;
const g0 = boo.grid('idle0'), g1 = boo.grid('idle1');
const face = c => c === 'e' || c === 'p';
// back view: no face; side view: face slides 2px toward the left edge
const back = g => g.map(r => [...r].map(c => (face(c) ? 'b' : c)).join(''));
const side = g => g.map((r, y) => {
  if (y < 5 || y > 10) return r;
  const a = [...r].map(c => (face(c) ? 'b' : c));
  [...r].forEach((c, x) => { if (face(c) && x - 2 >= 2) a[x - 2] = c; });
  return a.join('');
});
S.sprite('boo_ow', {
  w: 16, h: 20, origin: [8, 20], legend: boo.def.legend,
  frames: {
    down0: g0, down1: g1, down2: g1,
    up0: back(g0), up1: back(g1), up2: back(g1),
    left0: side(g0), left1: side(g1), left2: side(g1),
  },
});
})();

// ---------------------------------------------------------------- NPCs: a new head on the Sprout player's body
(function () {
const S = Sprout;
function person(name, heads, legend) {
  const base = S.sprites.player, frames = {};
  for (const d of ['down', 'up', 'left']) for (const i of [0, 1, 2]) frames[d + i] = heads[d].concat(base.grid(d + i).slice(13));
  for (const [k, g] of Object.entries(frames)) g.forEach((r, y) => { if (r.length !== 16) console.warn(name, k, y, r); });
  return S.sprite(name, { w: 16, h: 24, origin: [8, 23], legend: Object.assign({}, base.def.legend, legend), frames });
}

// flat-top + sunglasses: HU-MAN (the focus-tested "normal human") and the Men in White Suits
const SHADES = {
  down: [
    '................',
    '....oooooooo....',
    '...ojjjjjjjjo...',
    '..ohjjjjjjjjho..',
    '..ohhhhhhhhhHo..',
    '..osssssssssSo..',
    '..okkkkskkkkSo..',
    '..oKkkksKkkkSo..',
    '..osssssssssSo..',
    '..ossssmmmssSo..',
    '..oSsssssssSSo..',
    '..ooSSSSSSSSoo..',
    '....oooSSooo....',
  ],
  up: [
    '................',
    '....oooooooo....',
    '...ojjjjjjjjo...',
    '..ohjjjjjjjjho..',
    '..ohhhhhhhhhHo..',
    '..ohhhhhhhhhHo..',
    '..okkhhhhhhkko..',
    '..ohhhhhhhhhHo..',
    '..ohhhhhhhhhHo..',
    '..oHhhhhhhhHHo..',
    '..oSHHHHHHHHSo..',
    '..ooSSSSSSSSoo..',
    '....oooSSooo....',
  ],
  left: [
    '................',
    '.....oooooooo...',
    '....ojjjjjjjjo..',
    '...ojjjjjjjjhho.',
    '...ohhhhhhhhhHo.',
    '...osssshhhhhHo.',
    '..okkkkkshhhhHo.',
    '..oKkkkssshhhHo.',
    '...osssssshhHo..',
    '...ommsssssSHo..',
    '...oSssssSSHo...',
    '....ooSSSSSoo...',
    '.....ooSSoo.....',
  ],
};
person('human', SHADES, {
  j: 'fy3', h: 'fy2', H: 'fy1', s: 'sk2', S: 'sk1', k: 'ink2', K: '#6a7898', m: 'sk0',
  q: '#7aa8f0', r: '#4a78d0', R: '#2e4f9a', Q: '#1e2f60', w: 'wh2', y: '#4a78d0', Y: '#2e4f9a', z: '#7aa8f0',
  p: '#c8b090', P: '#9a8060', n: '#e0cca8',
});
person('suit', SHADES, {
  j: 'hr1', h: 'hr0', H: 'ink', s: 'sk3', S: 'sk2', k: 'ink', K: '#4a4a5a', m: 'sk1',
  q: '#ffffff', r: 'wh2', R: 'wh1', Q: 'wh0', w: 'ink', y: 'wh2', Y: 'wh1', z: '#ffffff',
  p: 'wh2', P: 'wh1', n: '#ffffff', k2: 'ink',
});

// Old Face: a wireframe head, and (as the bibles insist) always exactly four shades of green
const GB = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
person('oldface', {
  down: [
    '................',
    '....oooooooo....',
    '...odldddlddo...',
    '..odldddlddddo..',
    '..ollllllllllo..',
    '..odldddlddddo..',
    '..oEEddddddEEo..',
    '..odEEddddEEdo..',
    '..oddddLLddddo..',
    '..odddddLddddo..',
    '..odddEEEEdddo..',
    '...oddddddddo...',
    '....oooddooo....',
  ],
  up: [
    '................',
    '....oooooooo....',
    '...odldddlddo...',
    '..odldddlddddo..',
    '..ollllllllllo..',
    '..odldddlddddo..',
    '..odldddlddddo..',
    '..ollllllllllo..',
    '..odldddlddddo..',
    '..odldddlddddo..',
    '..odldddlddddo..',
    '...oddddddddo...',
    '....oooddooo....',
  ],
  left: [
    '................',
    '.....oooooooo...',
    '....odldddlddo..',
    '...odldddlddddo.',
    '...ollllllllllo.',
    '...odldddlddddo.',
    '..oEEddddlddddo.',
    '..odEEdddlddddo.',
    '.oLLddddlddddo..',
    '..oLdddddddddo..',
    '..oEEEddddddo...',
    '...odddddddo....',
    '.....ooddoo.....',
  ],
}, {
  o: GB[0], d: GB[1], l: GB[2], E: GB[3], L: GB[3],
  q: GB[3], r: GB[2], R: GB[1], Q: GB[1], w: GB[3], s: GB[2], S: GB[1], t: GB[2],
  p: GB[1], P: GB[0], n: GB[2], k: GB[0], y: GB[2], Y: GB[1], z: GB[3], c: GB[1], C: GB[1], v: GB[2], V: GB[0],
  h: GB[1], H: GB[0], j: GB[2], e: GB[0], W: GB[2],
});
})();
