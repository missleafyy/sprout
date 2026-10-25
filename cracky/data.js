// Cracky — types, moves, monsters, items.
(function () {
const S = Sprout;
const G = S.game = S.game || {};

// starter triangle: SOUND beats STATIC, STATIC beats CURSE, CURSE beats SOUND
G.types = {   // button colour, damage multiplier vs defender type
  normal: { color: 'gray', vs: {} },
  static: { color: 'yellow', vs: { curse: 2, gate: 2, static: 0.5, sound: 0.5 } },
  curse: { color: 'purple', vs: { sound: 2, curse: 0.5, static: 0.5, dark: 0.5 } },
  sound: { color: 'blue', vs: { static: 2, sound: 0.5, curse: 0.5 } },
  dark: { color: 'red', vs: { curse: 2, gate: 0.5, dark: 0.5 } },
  gate: { color: 'green', vs: { dark: 2, static: 0.5 } },
};

// power 0 = status move: boost (own stat up), lower (foe stat down), heal (fraction of max HP)
G.moves = {
  tackle: { name: 'TACKLE', type: 'normal', power: 35, pp: 35, fx: 'hit' },
  fuzz: { name: 'FUZZ', type: 'static', power: 40, pp: 25, fx: 'zap' },
  deadair: { name: 'DEAD AIR', type: 'static', power: 0, pp: 30, fx: 'down', lower: 'atk' },
  snag: { name: 'SNAG', type: 'normal', power: 35, pp: 35, fx: 'hit' },
  haunt: { name: 'HAUNT', type: 'curse', power: 40, pp: 25, fx: 'wisp' },
  lint: { name: 'LINT', type: 'curse', power: 0, pp: 30, fx: 'fluff', lower: 'def' },
  feedback: { name: 'FEEDBACK', type: 'sound', power: 40, pp: 25, fx: 'notes' },
  rewind: { name: 'REWIND', type: 'sound', power: 0, pp: 10, fx: 'sparkle', heal: 0.4 },
  scurry: { name: 'SCURRY', type: 'normal', power: 35, pp: 35, fx: 'hit' },
  nibble: { name: 'NIBBLE', type: 'dark', power: 40, pp: 25, fx: 'bite' },
  hoard: { name: 'HOARD', type: 'dark', power: 0, pp: 20, fx: 'sparkle', boost: 'def' },
  peck: { name: 'PECK', type: 'normal', power: 35, pp: 35, fx: 'hit' },
  delivery: { name: 'DELIVERY', type: 'gate', power: 45, pp: 20, fx: 'letter' },
  coo: { name: 'COO', type: 'normal', power: 0, pp: 30, fx: 'notes', lower: 'atk' },
  spam: { name: 'SPAM', type: 'static', power: 35, pp: 30, fx: 'letter' },
  phish: { name: 'PHISH', type: 'static', power: 0, pp: 25, fx: 'down', lower: 'def' },
};

G.species = {
  lamb: { name: 'STATIC LAMB', types: ['static'], hp: 21, atk: 10, def: 10, spd: 10, exp: 40, catch: 0.45,
    moves: ['tackle', 'fuzz', 'deadair'], dex: 'Grazes on dead channels. Its wool crackles when it is happy, which is always.' },
  sock: { name: 'LOST SOCK', types: ['curse'], hp: 19, atk: 11, def: 9, spd: 11, exp: 40, catch: 0.45,
    moves: ['snag', 'haunt', 'lint'], dex: 'Every dryer eats one sock. This is where they go. It is still looking for its pair.' },
  mite: { name: 'CASSETTE MITE', types: ['sound'], hp: 20, atk: 10, def: 11, spd: 9, exp: 40, catch: 0.45,
    moves: ['tackle', 'feedback', 'rewind'], dex: 'Lives in glove boxes. Plays the same mixtape forever and will not take requests.' },
  rat: { name: 'MALL RAT', types: ['dark'], hp: 18, atk: 10, def: 8, spd: 10, exp: 30, catch: 0.6,
    moves: ['scurry', 'nibble', 'hoard'], dex: 'Has never left the mall. Wears a food court hat it found. Nobody has the heart to tell it.' },
  pigeon: { name: 'COURIER PIGEON', types: ['gate'], hp: 18, atk: 10, def: 8, spd: 12, exp: 30, catch: 0.6,
    moves: ['peck', 'delivery', 'coo'], dex: 'Delivers anything to anyone, a little late. Signature required. It cannot sign.' },
  spam: { name: 'SPAM', types: ['static'], hp: 16, atk: 9, def: 8, spd: 13, exp: 28, catch: 0.7,
    moves: ['spam', 'phish', 'tackle'], dex: 'Junk mail that learned to fly. You have already won a prize. Claim it now.' },
};

G.items = {
  pill: { name: 'PROP PILLS', short: 'PROP PILL', heal: 20, desc: 'Recalled for working better than a placebo. Heals 20 HP.' },
  jar: { name: 'CONTAINMENT JAR', short: 'JAR', catch: true, desc: 'Standard issue. Holds one monster. Do not shake.' },
};

G.makeMon = (sp, lv) => {
  const s = G.species[sp];
  const st = k => Math.floor(s[k] + (lv - 5) * (k === 'hp' ? 3 : 1.4));
  const m = { sp, name: s.name, lv, maxhp: st('hp'), atk: st('atk'), def: st('def'), spd: st('spd'), moves: s.moves.slice(), exp: 0 };
  m.pp = m.moves.map(k => G.moves[k].pp);
  m.hp = m.maxhp;
  return m;
};
G.expNeed = lv => lv * 6;
G.healAll = () => { for (const m of G.party) { m.hp = m.maxhp; m.pp = m.moves.map(k => G.moves[k].pp); } };
})();
