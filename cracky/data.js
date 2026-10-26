// Cracky — types, moves, monsters (with learnsets and evolutions), items. See cracky/DESIGN.md.
(function () {
const S = Sprout;
const G = S.game = S.game || {};

// starter triangle: SOUND beats STATIC, STATIC beats CURSE, CURSE beats SOUND
G.types = {   // button colour, damage multiplier vs defender type
  normal: { color: 'gray', vs: {} },
  static: { color: 'yellow', vs: { curse: 2, gate: 2, static: 0.5, sound: 0.5 } },
  curse: { color: 'purple', vs: { sound: 2, light: 2, curse: 0.5, static: 0.5, dark: 0.5 } },
  sound: { color: 'blue', vs: { static: 2, dark: 2, sound: 0.5, curse: 0.5 } },
  dark: { color: 'red', vs: { curse: 2, light: 2, dark: 0.5, gate: 0.5 } },
  gate: { color: 'green', vs: { dark: 2, sound: 2, static: 0.5, gate: 0.5 } },
  light: { color: 'pink', vs: { curse: 2, dark: 2, light: 0.5, gate: 0.5 } },
};
const FX = { normal: 'hit', static: 'zap', curse: 'wisp', sound: 'notes', dark: 'bite', gate: 'letter', light: 'shine' };

// power 0 = status move: boost (own stat up), lower (foe stat down), heal (fraction of max HP)
const M = (name, type, power, pp, extra) => Object.assign({ name, type, power, pp, fx: FX[type] }, extra);
G.moves = {
  // normal
  tackle: M('TACKLE', 'normal', 35, 35), snag: M('SNAG', 'normal', 35, 35), scurry: M('SCURRY', 'normal', 35, 35),
  peck: M('PECK', 'normal', 35, 35), spineshot: M('SPINE SHOT', 'normal', 50, 25), headbutt: M('HEADBUTT', 'normal', 60, 20),
  pileon: M('PILE ON', 'normal', 80, 15), coo: M('COO', 'normal', 0, 30, { fx: 'notes', lower: 'atk' }),
  deadpan: M('DEADPAN', 'normal', 0, 30, { fx: 'down', lower: 'def' }),
  // static
  spam: M('SPAM', 'static', 35, 30, { fx: 'letter' }), fuzz: M('FUZZ', 'static', 40, 25), shock: M('STATIC SHOCK', 'static', 60, 20),
  broadcast: M('BROADCAST', 'static', 85, 10), deadair: M('DEAD AIR', 'static', 0, 30, { fx: 'down', lower: 'atk' }),
  phish: M('PHISH', 'static', 0, 25, { fx: 'down', lower: 'def' }), chargeup: M('CHARGE UP', 'static', 0, 20, { fx: 'sparkle', boost: 'atk' }),
  // curse
  haunt: M('HAUNT', 'curse', 40, 25), hex: M('HEX', 'curse', 60, 20), spincycle: M('SPIN CYCLE', 'curse', 85, 10),
  lint: M('LINT', 'curse', 0, 30, { fx: 'fluff', lower: 'def' }), omen: M('BAD OMEN', 'curse', 0, 20, { fx: 'down', lower: 'atk' }),
  // sound
  feedback: M('FEEDBACK', 'sound', 40, 25), bassdrop: M('BASS DROP', 'sound', 60, 20), mixtape: M('MIXTAPE', 'sound', 85, 10),
  rewind: M('REWIND', 'sound', 0, 10, { fx: 'sparkle', heal: 0.4 }), bside: M('B-SIDE', 'sound', 0, 20, { fx: 'sparkle', boost: 'atk' }),
  // dark
  nibble: M('NIBBLE', 'dark', 40, 25), lossprev: M('LOSS PREVENTION', 'dark', 60, 20), audit: M('AUDIT', 'dark', 85, 10),
  hoard: M('HOARD', 'dark', 0, 20, { fx: 'sparkle', boost: 'def' }), latefee: M('LATE FEE', 'dark', 0, 25, { fx: 'down', lower: 'def' }),
  // gate
  delivery: M('DELIVERY', 'gate', 45, 25), shortcut: M('SHORTCUT', 'gate', 60, 20), wormhole: M('WORMHOLE', 'gate', 85, 10),
  tracking: M('TRACKING', 'gate', 0, 25, { fx: 'down', lower: 'def' }),
  // light
  glint: M('GLINT', 'light', 40, 25), probe: M('PROBE', 'light', 55, 20), markdown: M('MARKDOWN', 'light', 60, 20),
  grandopen: M('GRAND OPENING', 'light', 85, 10), spotlight: M('SPOTLIGHT', 'light', 0, 20, { fx: 'sparkle', boost: 'atk' }),
};

// learn: [level, move] in order. evo: [species, level]. Base stats are "at level 5"; makeMon scales them.
const SP = (name, type, hp, atk, def, spd, exp, ctch, learn, dex, evo) => ({ name, types: [type], hp, atk, def, spd, exp, catch: ctch, learn, dex, evo });
G.species = {
  lamb: SP('STATIC LAMB', 'static', 21, 10, 10, 10, 40, 0.45,
    [[1, 'tackle'], [1, 'deadair'], [5, 'fuzz'], [9, 'chargeup'], [13, 'shock'], [19, 'headbutt'], [25, 'broadcast']],
    'Grazes on dead channels. Its wool crackles when it is happy, which is always.', ['thunderram', 16]),
  thunderram: SP('THUNDER RAM', 'static', 26, 14, 13, 11, 110, 0.2,
    [[1, 'tackle'], [1, 'deadair'], [5, 'fuzz'], [9, 'chargeup'], [13, 'shock'], [19, 'headbutt'], [22, 'broadcast'], [30, 'pileon']],
    'Its horns pick up every station at once. Mostly it hears weather reports from 1987.'),
  sock: SP('LOST SOCK', 'curse', 19, 11, 9, 11, 40, 0.45,
    [[1, 'snag'], [1, 'lint'], [5, 'haunt'], [9, 'omen'], [13, 'hex'], [19, 'headbutt'], [25, 'spincycle']],
    'Every dryer eats one sock. This is where they go. It is still looking for its pair.', ['wraith', 16]),
  wraith: SP('LAUNDRY WRAITH', 'curse', 24, 15, 11, 13, 110, 0.2,
    [[1, 'snag'], [1, 'lint'], [5, 'haunt'], [9, 'omen'], [13, 'hex'], [19, 'headbutt'], [22, 'spincycle'], [30, 'pileon']],
    'A whole lost load. It never found its pair, so it found everyone else\'s.'),
  mite: SP('CASSETTE MITE', 'sound', 20, 10, 11, 9, 40, 0.45,
    [[1, 'tackle'], [1, 'deadpan'], [5, 'feedback'], [9, 'rewind'], [13, 'bassdrop'], [19, 'bside'], [25, 'mixtape']],
    'Lives in glove boxes. Plays the same mixtape forever and will not take requests.', ['masterdeck', 16]),
  masterdeck: SP('MASTER DECK', 'sound', 26, 13, 15, 9, 110, 0.2,
    [[1, 'tackle'], [1, 'deadpan'], [5, 'feedback'], [9, 'rewind'], [13, 'bassdrop'], [19, 'bside'], [22, 'mixtape'], [30, 'pileon']],
    'Dubs other monsters\' cries onto blank tapes and sells them in the parking lot.'),
  rat: SP('MALL RAT', 'dark', 18, 10, 8, 10, 30, 0.6,
    [[1, 'scurry'], [1, 'hoard'], [4, 'nibble'], [10, 'latefee'], [14, 'lossprev'], [24, 'audit']],
    'Has never left the mall. Wears a food court hat it found. Nobody has the heart to tell it.', ['ratmanager', 14]),
  ratmanager: SP('RAT MANAGER', 'dark', 24, 14, 11, 12, 90, 0.3,
    [[1, 'scurry'], [1, 'hoard'], [4, 'nibble'], [10, 'latefee'], [14, 'lossprev'], [22, 'audit'], [30, 'pileon']],
    'Promoted for showing up. Would like to speak to whoever is in charge, which is itself.'),
  pigeon: SP('COURIER PIGEON', 'gate', 18, 10, 8, 12, 30, 0.6,
    [[1, 'peck'], [1, 'coo'], [4, 'delivery'], [10, 'tracking'], [15, 'shortcut'], [26, 'wormhole']],
    'Delivers anything to anyone, a little late. Signature required. It cannot sign.', ['pizzapigeon', 14]),
  pizzapigeon: SP('PIZZA PIGEON', 'gate', 23, 13, 10, 15, 90, 0.3,
    [[1, 'peck'], [1, 'coo'], [4, 'delivery'], [10, 'tracking'], [15, 'shortcut'], [24, 'wormhole'], [30, 'pileon']],
    'Thirty minutes or less, guaranteed. One slice is always missing. It does not know why.'),
  spam: SP('SPAM', 'static', 16, 9, 8, 13, 28, 0.7,
    [[1, 'spam'], [1, 'phish'], [6, 'tackle'], [11, 'fuzz'], [16, 'shock'], [28, 'broadcast']],
    'Junk mail that learned to fly. You have already won a prize. Claim it now.', ['phishking', 18]),
  phishking: SP('PHISHING KING', 'static', 22, 13, 11, 15, 95, 0.3,
    [[1, 'spam'], [1, 'phish'], [6, 'tackle'], [11, 'fuzz'], [16, 'shock'], [24, 'broadcast'], [32, 'pileon']],
    'A prince who needs your help moving his fortune. It only needs your account number.'),
  mannequin: SP('MANNEQUIN', 'light', 19, 9, 11, 9, 35, 0.5,
    [[1, 'tackle'], [1, 'deadpan'], [5, 'glint'], [11, 'spotlight'], [15, 'markdown'], [26, 'grandopen']],
    'Stands very still in shop windows. When you look away, it changes outfits.', ['storespirit', 18]),
  storespirit: SP('STORE SPIRIT', 'light', 25, 13, 14, 12, 100, 0.25,
    [[1, 'tackle'], [1, 'deadpan'], [5, 'glint'], [11, 'spotlight'], [15, 'markdown'], [24, 'grandopen'], [32, 'pileon']],
    'The ghost of every grand opening. It glows brightest at 9:59, a minute before the doors open.'),
  cactus: SP('JUMPER CACTUS', 'normal', 20, 11, 11, 7, 35, 0.55,
    [[1, 'tackle'], [1, 'deadpan'], [5, 'spineshot'], [12, 'headbutt'], [20, 'pileon']],
    'Hops onto passing hikers for a ride. It thinks it is helping.', ['saguaro', 16]),
  saguaro: SP('OLD MAN SAGUARO', 'normal', 28, 15, 15, 6, 105, 0.25,
    [[1, 'tackle'], [1, 'deadpan'], [5, 'spineshot'], [12, 'headbutt'], [20, 'pileon']],
    'Has been holding its arms up for two hundred years. Nobody has told it to put them down.'),
  echo: SP('ECHO', 'sound', 18, 10, 9, 12, 40, 0.5,
    [[1, 'feedback'], [1, 'coo'], [8, 'rewind'], [14, 'bassdrop'], [24, 'mixtape']],
    'Repeats the last thing it heard, a little quieter. Lives in empty hallways.', ['choir', 20]),
  choir: SP('THE CHOIR', 'sound', 25, 14, 12, 13, 110, 0.25,
    [[1, 'feedback'], [1, 'coo'], [8, 'rewind'], [14, 'bassdrop'], [22, 'mixtape'], [30, 'bside']],
    'Three echoes that found each other. They only know one hymn and it is a jingle.'),
  drone: SP('LEMON DRONE', 'gate', 20, 11, 10, 14, 45, 0.45,
    [[1, 'tackle'], [1, 'tracking'], [5, 'delivery'], [14, 'shortcut'], [26, 'wormhole']],
    'A surveillance drone painted yellow so nobody would suspect it. Everybody suspects it.', ['wardrone', 22]),
  wardrone: SP('WAR DRONE', 'gate', 26, 15, 13, 15, 115, 0.2,
    [[1, 'tackle'], [1, 'tracking'], [5, 'delivery'], [14, 'shortcut'], [24, 'wormhole'], [30, 'lossprev']],
    'Contains things. Professionally. Its siren plays a short legal notice.'),
  sheet: SP('SHEET', 'curse', 19, 12, 9, 12, 45, 0.45,
    [[1, 'haunt'], [1, 'lint'], [10, 'hex'], [16, 'omen'], [24, 'spincycle']],
    'A hologram of a ghost, projected to scare off trespassers. It is the one that got scared.'),
  grey: SP('GREY', 'light', 20, 12, 10, 13, 55, 0.3,
    [[1, 'glint'], [1, 'deadpan'], [10, 'probe'], [18, 'spotlight'], [26, 'grandopen']],
    'A visitor. Takes notes about everyone. Swears it has never seen Carl before, a little too quickly.'),
  beholden: SP('THE BEHOLDEN', 'dark', 40, 18, 16, 12, 250, 0.08,
    [[1, 'latefee'], [1, 'hex'], [1, 'audit'], [1, 'grandopen']],
    'An eye with one stalk for every unpaid debt. It has been watching you since your first late fee.'),
};

G.items = {
  pill: { info: 'Heals 20 HP.', name: 'PROP PILLS', short: 'PROP PILL', heal: 20, price: 100, desc: 'Recalled for working better than a placebo. Heals 20 HP.' },
  pillmax: { info: 'Heals all HP.', name: 'PILLS MAX', short: 'PILL MAX', heal: 999, price: 300, desc: 'Extra strength. Heals all HP. Ask your doctor if MAX is right for you.' },
  tape: { info: 'Revives a fainted monster.', name: 'REVIVE TAPE', short: 'TAPE', revive: true, price: 600, desc: 'Rewinds a fainted monster to half its HP. Be kind.' },
  jar: { info: 'Contains wild monsters.', name: 'CONTAINMENT JAR', short: 'JAR', catch: 1, price: 200, desc: 'Standard issue. Holds one monster. Do not shake.' },
  chalk: { info: 'Keeps weak monsters away.', name: 'SIGIL CHALK', short: 'CHALK', repel: 100, price: 250, desc: 'Draw a circle around yourself. Weak monsters stay away for 100 steps.' },
};

// ---------------------------------------------------------------- monsters
const movesAt = (sp, lv) => G.species[sp].learn.filter(([l]) => l <= lv).map(([, m]) => m).filter((m, i, a) => a.lastIndexOf(m) === i).slice(-4);
G.statsAt = (sp, lv) => {
  const s = G.species[sp];
  const st = k => Math.floor(s[k] + (lv - 5) * (k === 'hp' ? 2.6 : 1.3));
  return { maxhp: st('hp'), atk: st('atk'), def: st('def'), spd: st('spd') };
};
G.makeMon = (sp, lv) => {
  const s = G.species[sp];
  const m = Object.assign({ sp, name: s.name, lv, exp: 0, moves: movesAt(sp, lv) }, G.statsAt(sp, lv));
  m.pp = m.moves.map(k => G.moves[k].pp);
  m.hp = m.maxhp;
  return m;
};
G.expNeed = lv => Math.floor(1.2 * lv * lv + 10);
G.healAll = () => { for (const m of G.party) { m.hp = m.maxhp; m.pp = m.moves.map(k => G.moves[k].pp); } };
G.dexOrder = ['lamb', 'thunderram', 'sock', 'wraith', 'mite', 'masterdeck', 'rat', 'ratmanager', 'pigeon', 'pizzapigeon', 'spam', 'phishking',
  'mannequin', 'storespirit', 'cactus', 'saguaro', 'echo', 'choir', 'drone', 'wardrone', 'sheet', 'grey', 'beholden'];
})();
