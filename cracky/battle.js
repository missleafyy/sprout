// Cracky — turn-based battles: wild or trainer, party of up to 6, switching, bag, catching with Containment Jars.
//   G.startBattle({ wild: ['rat', 3] })
//   G.startBattle({ trainer: { name: 'HU-MAN', party: [['mite', 5]], win: [...], lose: [...] } }, result => ...)
(function () {
const S = Sprout;
const G = S.game;

// the Containment Jar (thrown in battle, shown in the bag)
S.sprite('jar', { w: 12, h: 14, origin: [6, 14],
  legend: { o: 'ink', C: 'rt3', c: 'rt2', g: '#cfe8f4', G: '#8ab8d4', W: '#ffffff' },
  frames: {
    0: [
      '..oooooooo..',
      '..oCCCCCCo..',
      '..occcccco..',
      '.oooooooooo.',
      '.oWggggggGo.',
      '.oWgggggGGo.',
      '.ogggggggGo.',
      '.ogggggggGo.',
      '.ogggggggGo.',
      '.oggggggGGo.',
      '.ogggggGGGo.',
      '..oGGGGGGo..',
      '...oooooo...',
      '............',
    ],
  } });
S.sprite('pill', { w: 12, h: 12, origin: [6, 12],
  legend: { o: 'ink', r: 'jk2', R: 'jk1', w: 'wh2', W: 'wh1', h: '#ffffff' },
  frames: { 0: [
    '............',
    '.......ooo..',
    '......owwwo.',
    '.....owhwWo.',
    '....oowwWWo.',
    '...orRoWWo..',
    '..orrRRoo...',
    '.orhrRRo....',
    '.orrRRo.....',
    '.oRRRo......',
    '..ooo.......',
    '............',
  ] } });

S.recolor('pillmax', 'pill', { r: 'au2', R: 'au1' });
S.sprite('tape', { w: 12, h: 12, origin: [6, 12],
  legend: { o: 'ink', g: '#9a9ab0', G: '#c8c8d8', w: '#f4f4f8', r: 'jk2', d: '#3e3f56' },
  frames: { 0: [
    '............',
    '............',
    '.oooooooooo.',
    '.oGGGGGGGGo.',
    '.oGrrrrrrGo.',
    '.oGoowwooGo.',
    '.oGodwwdoGo.',
    '.oGoowwooGo.',
    '.oggggggggo.',
    '.oggooooggo.',
    '.oooooooooo.',
    '............',
  ] } });
S.sprite('chalk', { w: 12, h: 12, origin: [6, 12],
  legend: { o: 'ink', w: '#f8f4e8', W: '#d8d0c0', p: '#b49cf0' },
  frames: { 0: [
    '............',
    '........oo..',
    '.......owwo.',
    '......owwWo.',
    '.....owwWo..',
    '....owwWo...',
    '...owwWo....',
    '..owwWo.....',
    '.oWWWo......',
    '.oooo.p.p...',
    '....p.....p.',
    '.....ppppp..',
  ] } });
G.itemSprite = k => (k === 'jar' ? 'jar' : k === 'pillmax' ? 'pillmax' : k === 'tape' ? 'tape' : k === 'chalk' ? 'chalk' : 'pill');

// ---------------------------------------------------------------- battle backgrounds per area
// each: sky/wall drawing + a platform ramp [rim, base, mid, hi] and the floor colour
const BG = {};
const bands = (g, cols, h) => cols.forEach((c, i) => g.rect(0, i * h, 256, h, c));
BG.desert = { plat: ['sd0', 'sd1', 'sd2', 'sd4'], draw(g) {
  bands(g, ['#f6c08a', '#f4b07e', '#f0a07a', '#e88e78', '#d97e7c', '#c47080'], 10);
  g.ellipse(196, 34, 9, 9, '#ffe0a8'); g.ellipse(196, 34, 7, 7, '#fff2d0');
  const mesa = (x, w, h, c, top) => { g.rect(x, 60 - h, w, h, c); g.rect(x + 3, 60 - h - 2, w - 6, 2, c); g.rect(x + 4, 60 - h - 2, w - 10, 1, top); };
  mesa(-4, 60, 16, '#a85e6a', '#c47a7e'); mesa(78, 34, 10, '#a85e6a', '#c47a7e'); mesa(150, 70, 20, '#9a5464', '#b86e78'); mesa(228, 40, 12, '#a85e6a', '#c47a7e');
  for (let x = 0; x < 256; x += 64) { g.rect(x + 20, 38, 1, 24, '#7a4a5a'); g.rect(x + 16, 40, 9, 1, '#7a4a5a'); }
  g.rect(0, 41, 256, 1, '#9a6070');
  g.rect(0, 60, 256, 132, 'sd3');
  g.rect(0, 60, 256, 2, 'sd1'); g.rect(0, 62, 256, 1, 'sd2');
  for (let y = 72, i = 0; y < 192; y += 10 + i * 2, i++) g.rect(0, y, 256, 1, 'sd4');
} };
// highway: hotter noon sky, the road running across
BG.road = { plat: ['sd0', 'sd1', 'sd2', 'sd4'], draw(g) {
  bands(g, ['#8ac8e8', '#9cd2ea', '#b0dcec', '#c6e4ec', '#dcecea'], 11);
  const mesa = (x, w, h, c) => { g.rect(x, 55 - h, w, h, c); g.rect(x + 3, 55 - h - 2, w - 6, 2, c); };
  mesa(10, 50, 12, '#c49a84'); mesa(120, 80, 18, '#b88a78'); mesa(220, 50, 9, '#c49a84');
  g.rect(0, 55, 256, 137, 'sd3'); g.rect(0, 55, 256, 2, 'sd2');
  g.rect(0, 63, 256, 14, 'as1'); g.rect(0, 64, 256, 12, 'as2'); g.rect(0, 63, 256, 1, 'as0');
  for (let x = 4; x < 256; x += 28) g.rect(x, 69, 14, 2, '#ecc548');
  for (let y = 86, i = 0; y < 192; y += 10 + i * 2, i++) g.rect(0, y, 256, 1, 'sd4');
} };
// the Mall of the Future: storefronts and a checker floor
BG.mall = { plat: ['#5a4a6e', '#b8a8d0', '#d6caea', '#f4eefc'], draw(g) {
  g.rect(0, 0, 256, 70, '#3e3458');
  for (let x = -8; x < 256; x += 64) {
    g.rect(x + 4, 14, 56, 44, '#2a2440'); g.rect(x + 6, 16, 52, 40, '#6a8ac8'); g.rect(x + 6, 16, 52, 6, '#9ab8e8');
    g.rect(x + 6, 56, 52, 2, '#f4eefc');
    g.rect(x + 10, 6, 44, 7, ['#e872aa', '#46b05a', '#ecb830', '#4a8ae8', '#e2504a'][((x + 8) / 64) % 5]);
    g.rect(x + 12, 8, 40, 3, '#fff4f8');
  }
  g.rect(0, 0, 256, 3, '#fff4c0'); g.rect(0, 3, 256, 1, '#b8a060');
  g.rect(0, 64, 256, 128, '#e8e0f0');
  for (let y = 64, r = 0; y < 192; y += 8 + r, r++) for (let x = (r % 2) * 16; x < 256; x += 32) g.rect(x, y, 16, 8 + r, '#cfc4e0');
  g.rect(0, 64, 256, 2, '#8a7aa8');
} };
// Rhyolite Springs at night
BG.night = { plat: ['#1e1a30', '#4a4060', '#625878', '#8a80a0'], draw(g) {
  bands(g, ['#141428', '#1a1a34', '#22203e', '#2a2848', '#342e54', '#3e3660'], 10);
  for (let i = 0; i < 40; i++) g.px(Math.floor(S.hash(i, 1, 7) * 256), Math.floor(S.hash(i, 2, 7) * 56), i % 5 ? '#c8c8e8' : '#fff4c0');
  g.ellipse(52, 24, 10, 10, '#f4ecd0'); g.ellipse(56, 21, 8, 8, '#1a1a34');
  // ruined buildings
  g.rect(140, 30, 40, 30, '#2a2236'); g.rect(146, 36, 6, 8, '#1a1424'); g.rect(166, 36, 6, 8, '#d8b860');
  g.rect(190, 40, 30, 20, '#2a2236'); g.rect(196, 22, 4, 18, '#2a2236'); g.rect(194, 26, 8, 2, '#2a2236');
  g.rect(20, 44, 60, 16, '#2a2236');
  g.rect(0, 60, 256, 132, '#5a5070'); g.rect(0, 60, 256, 2, '#3a3450');
  for (let y = 72, i = 0; y < 192; y += 10 + i * 2, i++) g.rect(0, y, 256, 1, '#6a6080');
} };
// Residences at Tomorrow: beige wallpaper, carpet
BG.apartment = { plat: ['#4a3a3a', '#a88a7a', '#c4a490', '#e0c8b0'], draw(g) {
  g.rect(0, 0, 256, 72, '#e8dcc0');
  for (let x = 0; x < 256; x += 12) g.rect(x, 0, 2, 72, '#dccfb0');
  g.rect(0, 58, 256, 14, '#8a6a5a'); g.rect(0, 58, 256, 2, '#a88a7a');
  for (let x = 30; x < 256; x += 110) { g.rect(x, 12, 36, 28, '#5a4a4a'); g.rect(x + 3, 15, 30, 22, '#8ab8d4'); g.rect(x + 3, 15, 30, 4, '#c8e0f0'); }
  g.rect(0, 72, 256, 120, '#b8566a');
  for (let y = 80, r = 0; y < 192; y += 10 + r * 2, r++) g.rect(0, y, 256, 1, '#a44a5e');
} };
// Below Nevada: white panels, hazard stripes
BG.facility = { plat: ['#3a4050', '#9aa4b8', '#c0c8d8', '#e8eef8'], draw(g) {
  g.rect(0, 0, 256, 70, '#d8dee8');
  for (let x = 0; x < 256; x += 32) { g.rect(x, 0, 1, 70, '#b0b8c8'); g.rect(x + 1, 0, 1, 70, '#f4f8fc'); }
  g.rect(0, 20, 256, 6, '#2a2a3a'); for (let x = 0; x < 256; x += 12) g.rect(x, 20, 6, 6, '#ecc548');
  g.rect(110, 36, 36, 20, '#3a4050'); g.rect(112, 38, 32, 16, '#1a2030');
  g.text('B-2', 128, 42, { color: 'red', align: 'center', shadow: false });
  g.rect(0, 70, 256, 122, '#8a92a4');
  for (let y = 70, r = 0; y < 192; y += 10 + r * 2, r++) g.rect(0, y, 256, 1, '#7a8294');
  for (let x = 0; x < 256; x += 40) g.rect(x, 70, 1, 122, '#7a8294');
} };
// gyms
BG.lindacorp = { plat: ['#5a1f4a', '#e872aa', '#f8a8cc', '#ffe0f0'], draw(g) {
  bands(g, ['#2a2030', '#322638', '#3a2c40'], 24);
  for (let i = 0; i < 5; i++) { const x = 20 + i * 54; g.alpha(0.25, () => { g.rect(x, 0, 14, 72, '#ffe0f0'); }); }
  g.text('LINDA CORP.', 128, 30, { color: 'pink', align: 'center', shadow: '#5a1f4a' });
  g.rect(0, 72, 256, 120, '#f4eef0');
  for (let y = 72, r = 0; y < 192; y += 10 + r * 2, r++) g.rect(0, y, 256, 1, '#e0d0d8');
} };
BG.litterbox = { plat: ['#3a2a1a', '#a88a60', '#c8a878', '#e8d0a0'], draw(g) {
  g.rect(0, 0, 256, 70, '#2a1e30');
  for (let x = 0; x < 256; x += 16) g.rect(x, 0, 8, 70, '#30223a');
  g.ellipse(128, 26, 30, 12, '#4a3050'); g.text('THE LITTER BOX', 128, 22, { color: 'yellow', align: 'center', shadow: '#2a1e30' });
  g.rect(0, 70, 256, 122, '#c8b088');
  for (let i = 0; i < 160; i++) g.px(Math.floor(S.hash(i, 3, 9) * 256), 70 + Math.floor(S.hash(i, 4, 9) * 122), i % 2 ? '#b09870' : '#e0c8a0');
} };
BG.chapel = { plat: ['#1e1a30', '#5a4a70', '#7a6a90', '#a090b8'], draw(g) {
  g.rect(0, 0, 256, 74, '#1e1a2e');
  for (const x of [40, 128, 216]) {
    g.ellipse(x, 22, 14, 14, '#2a2440'); g.rect(x - 14, 22, 28, 34, '#2a2440');
    const glass = ['#8a6ad8', '#4cb87a', '#ecb830', '#e2504a'];
    for (let j = 0; j < 4; j++) g.rect(x - 11 + (j % 2) * 11, 16 + Math.floor(j / 2) * 18, 10, 16, glass[(j + x) % 4]);
    g.ellipse(x, 22, 11, 9, '#b49cf0');
  }
  g.rect(0, 74, 256, 118, '#3a3048');
  for (let y = 74, r = 0; y < 192; y += 10 + r * 2, r++) g.rect(0, y, 256, 1, '#46395a');
  g.rect(118, 74, 20, 118, '#6a2a3a');
} };
BG.penthouse = { plat: ['#1f2a5a', '#7ab8f8', '#a8d0f8', '#e0f0ff'], draw(g) {
  bands(g, ['#1a1440', '#2a1a58', '#3e1e6a', '#5a2478', '#7a2c80', '#a83c80'], 12);
  for (let i = 0; i < 18; i++) { const x = i * 15, h = 8 + Math.floor(S.hash(i, 5, 3) * 24); g.rect(x, 72 - h, 13, h, '#141030'); if (i % 3 === 0) g.px(x + 4, 72 - h + 4, '#ecc548'); }
  for (let x = 0; x < 256; x += 64) g.rect(x, 0, 3, 72, '#e0f0ff');
  g.rect(0, 72, 256, 120, '#2e2650');
  for (let y = 72, r = 0; y < 192; y += 10 + r * 2, r++) g.rect(0, y, 256, 1, '#3a3260');
} };
BG.lot = BG.desert;

let B = null;
const stageMul = s => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));

G.startBattle = function (opts, onEnd) {
  const first = G.party.findIndex(m => m.hp > 0);
  const foes = opts.wild ? [G.makeMon(opts.wild[0], opts.wild[1])] : opts.trainer.party.map(([sp, lv]) => G.makeMon(sp, lv));
  B = {
    opts, onEnd, trainer: opts.trainer || null, foes, fi: 0, mi: Math.max(0, first),
    t: 0, intro: 0, menu: null, sel: 0, cmd: null, msgs: 0,
    fx: [], shake: { me: 0, foe: 0 }, blink: { me: 0, foe: 0 }, lunge: { me: 0, foe: 0 },
    hpShown: { me: 0, foe: 0 }, gone: { me: 0, foe: 0 }, flash: 0, slideIn: { me: 0, foe: 0 },
    st: { me: { atk: 0, def: 0 }, foe: { atk: 0, def: 0 } }, jar: null, fought: new Set(), evos: [],
    bg: BG[opts.bg || (G.battleBg && G.battleBg()) || 'desert'] || BG.desert,
  };
  Object.defineProperty(B, 'me', { get: () => G.party[B.mi] });
  Object.defineProperty(B, 'foe', { get: () => B.foes[B.fi] });
  B.hpShown.me = B.me.hp; B.hpShown.foe = B.foe.hp;
  B.fought.add(B.mi);
  G.seen.add(B.foe.sp);
  S.music(opts.music || (B.trainer && B.trainer.leader ? 'leader' : B.trainer ? 'trainer' : 'battle'));
  S.go(battleScene, 'battle');
};

const battleScene = {
  enter() { B.t = 0; S.run(flow); },
  update() {
    B.t++;
    if (B.intro < 60) B.intro++;
    for (const k of ['me', 'foe']) {
      const mon = B[k], target = mon.hp;
      if (B.hpShown[k] > target) B.hpShown[k] = Math.max(target, B.hpShown[k] - Math.max(0.2, mon.maxhp / 70));
      if (B.hpShown[k] < target) B.hpShown[k] = Math.min(target, B.hpShown[k] + mon.maxhp / 70);
      for (const o of [B.shake, B.blink, B.lunge]) if (o[k] > 0) o[k]--;
      if (B.gone[k] > 0 && B.gone[k] < 99) B.gone[k]++;
      if (B.slideIn[k] > 0) B.slideIn[k]--;
    }
    if (B.flash > 0) B.flash--;
    if (B.jar) B.jar.t++;
    for (const p of B.fx) { if (p.delay > 0) { p.delay--; continue; } p.t++; p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; }
    B.fx = B.fx.filter(p => p.t < p.life);
    if (B.menu) menuInput();
  },
  draw(top, bot) { drawTop(top); drawBottom(bot); },
};

// ---------------------------------------------------------------- the battle, as one script task
const nm = m => `{green}${m.name}{/}`;
const foeName = m => (B.trainer ? `${B.trainer.name}'s {red}${m.name}{/}` : `The wild {red}${m.name}{/}`);

function* choose(menu, extra) {
  B.menu = menu; B.sel = 0; B.cmd = null;
  if (extra) Object.assign(B, extra);
  if (menu === 'party') B.sel = Math.max(0, G.party.findIndex((m, i) => m.hp > 0 && i !== B.mi));
  yield () => B.cmd;
  const c = B.cmd; B.menu = null;
  return c;
}

function* flow() {
  yield 56;
  if (B.trainer) {
    yield* S.say(`{blue}${B.trainer.name}{/} wants to battle!`, { auto: 70 });
    if (B.trainer.intro) yield* S.say(...[].concat(B.trainer.intro), { name: B.trainer.name });
    yield* S.say(`${B.trainer.name} sent out {red}${B.foe.name}{/}!`, { auto: 50 });
  } else yield* S.say(`A wild {red}${B.foe.name}{/} appeared!`, { auto: 70 });
  yield* S.say(`Go! ${nm(B.me)}!`, { auto: 40 });

  for (;;) {
    S.ui.openDialog([`What will ${nm(B.me)} do?`], { keep: true, speed: 2 });
    const cmd = yield* choose('main');
    S.ui.closeDialog();
    let myMove = null;
    if (cmd.kind === 'run') {
      if (B.trainer) { yield* S.say('There\'s no running from a trainer battle!', 'Carl checked. It\'s in the bylaws.'); continue; }
      S.sfx('door');
      yield* S.say('Got away safely!', { auto: 50 });
      return end('run');
    }
    if (cmd.kind === 'item') {
      const it = G.items[cmd.item];
      if (it.catch) {
        if (B.trainer) { yield* S.say('You can\'t contain someone else\'s monster!', 'That\'s theft. Legally.'); continue; }
        G.bag[cmd.item]--;
        const caught = yield* throwJar();
        if (caught) return end('caught');
      } else {
        const m = G.party[cmd.i];
        G.bag[cmd.item]--;
        S.sfx('heal');
        if (it.revive) {
          m.hp = Math.floor(m.maxhp / 2);
          yield* S.say(`Carl rewound the {blue}${it.short}{/}. ${nm(m)} is back up!`, { auto: 60 });
        } else {
          m.hp = Math.min(m.maxhp, m.hp + it.heal);
          if (cmd.i === B.mi) yield () => Math.abs(B.hpShown.me - m.hp) < 0.01;
          yield* S.say(`${nm(m)} took a {blue}${it.short}{/}. It feels better!`, { auto: 50 });
        }
      }
    } else if (cmd.kind === 'switch') {
      yield* S.say(`Come back, ${nm(B.me)}!`, { auto: 30 });
      yield* sendOut(cmd.i);
    } else if (cmd.kind === 'fight') myMove = cmd.move;

    // turn order: a switch or item always goes first
    const foeMove = pickFoeMove();
    const order = !myMove ? [['foe', foeMove]]
      : B.me.spd * stageMul(0) >= B.foe.spd ? [['me', myMove], ['foe', foeMove]] : [['foe', foeMove], ['me', myMove]];
    for (const [who, mv] of order) {
      if (B.me.hp <= 0 || B.foe.hp <= 0) continue;
      if (who === 'me') B.me.pp[B.me.moves.indexOf(mv)]--;
      yield* doMove(who, mv);
    }

    if (B.foe.hp <= 0) {
      S.sfx('faint'); B.gone.foe = 1;
      yield 34;
      yield* S.say(`${foeName(B.foe)} fainted!`, { auto: 60 });
      yield* gainExp();
      if (B.fi + 1 < B.foes.length) {
        B.fi++;
        B.gone.foe = 0; B.slideIn.foe = 30; B.hpShown.foe = B.foe.hp; B.st.foe = { atk: 0, def: 0 };
        G.seen.add(B.foe.sp);
        S.sfx('pop');
        yield* S.say(`${B.trainer.name} sent out {red}${B.foe.name}{/}!`, { auto: 50 });
        continue;
      }
      if (B.trainer) {
        S.music('victory');
        yield* S.say(`You defeated {blue}${B.trainer.name}{/}!`);
        if (B.trainer.win) yield* S.say(...[].concat(B.trainer.win), { name: B.trainer.name });
        const prize = B.trainer.money != null ? B.trainer.money
          : Math.max(...B.foes.map(m => m.lv)) * (B.trainer.leader ? 60 : 18);
        if (prize > 0) {
          G.money = (G.money || 0) + prize; S.sfx('coin');
          yield* S.say(`Carl got {yellow}${prize} PROP BUX{/} for winning!`);
        }
      }
      return end('win');
    }
    if (B.me.hp <= 0) {
      S.sfx('faint'); B.gone.me = 1;
      yield 34;
      yield* S.say(`${nm(B.me)} is out of potential!`, { auto: 60 });
      if (!G.party.some(m => m.hp > 0)) {
        if (B.trainer && B.trainer.lose) yield* S.say(...[].concat(B.trainer.lose), { name: B.trainer.name });
        yield* S.say('Carl has no monsters left!', 'Carl panicked and ran!');
        return end('lose');
      }
      S.ui.openDialog(['Who\'s next?'], { keep: true, speed: 2 });
      const c = yield* choose('party', { forced: true });
      S.ui.closeDialog();
      yield* sendOut(c.i);
    }
  }
}

function* sendOut(i) {
  B.gone.me = 40;
  yield 10;
  B.mi = i; B.fought.add(i);
  B.st.me = { atk: 0, def: 0 };
  B.hpShown.me = B.me.hp; B.gone.me = 0; B.slideIn.me = 24;
  S.sfx('pop');
  yield* S.say(`Go! ${nm(B.me)}!`, { auto: 40 });
}

const typeMulOf = (key, sp) => G.species[sp].types.reduce((m, t) => m * (G.types[G.moves[key].type].vs[t] || 1), 1);
function pickFoeMove() {
  const foe = B.foe, mv = foe.moves.filter((k, i) => foe.pp[i] > 0);
  if (!mv.length) return foe.moves[0];
  const hits = mv.filter(k => G.moves[k].power > 0);
  if (!B.trainer) return Math.random() < 0.75 && hits.length ? S.pick(hits) : S.pick(mv);
  // trainers think a little: score each move, then usually take the best
  const score = k => {
    const m = G.moves[k];
    if (m.power === 0) return (m.boost && B.st.foe[m.boost] >= 2) || (m.lower && B.st.me[m.lower] <= -2) || (m.heal && foe.hp > foe.maxhp / 2) ? 0 : 30;
    return m.power * typeMulOf(k, B.me.sp) * (G.species[foe.sp].types.includes(m.type) ? 1.5 : 1);
  };
  const ranked = mv.map(k => [k, score(k) * (0.8 + Math.random() * 0.4)]).sort((a, b) => b[1] - a[1]);
  return ranked[0][0];
}

function* doMove(who, key) {
  const mv = G.moves[key];
  const a = B[who], dk = who === 'me' ? 'foe' : 'me', d = B[dk];
  const label = who === 'me' ? nm(a) : foeName(a);
  yield* S.say(`${label} used {blue}${mv.name}{/}!`, { auto: 34 });
  B.lunge[who] = 14;
  yield 8;
  spawnFx(mv.fx, who, mv.power === 0 && !mv.lower);
  yield mv.fx === 'sparkle' ? 30 : 26;
  if (mv.heal) {
    if (a.hp >= a.maxhp) { yield* S.say('But its HP is already full!', { auto: 44 }); return; }
    a.hp = Math.min(a.maxhp, a.hp + Math.ceil(a.maxhp * mv.heal));
    S.sfx('heal');
    yield () => Math.abs(B.hpShown[who] - a.hp) < 0.01;
    yield* S.say(`${label} rewound its HP!`, { auto: 44 });
    return;
  }
  if (mv.boost) {
    const st = B.st[who];
    if (st[mv.boost] >= 2) { yield* S.say('But nothing happened.', { auto: 40 }); return; }
    st[mv.boost]++; S.sfx('heal');
    yield* S.say(`${label}'s ${mv.boost === 'atk' ? 'ATTACK' : 'DEFENSE'} rose!`, { auto: 50 });
    return;
  }
  if (mv.lower) {
    const st = B.st[dk];
    if (st[mv.lower] <= -2) { yield* S.say('But nothing happened.', { auto: 40 }); return; }
    st[mv.lower]--; S.sfx('cancel'); B.shake[dk] = 10;
    yield* S.say(`${dk === 'me' ? nm(d) : foeName(d)}'s ${mv.lower === 'atk' ? 'ATTACK' : 'DEFENSE'} fell!`, { auto: 50 });
    return;
  }
  const typeMul = typeMulOf(key, d.sp);
  const stab = G.species[a.sp].types.includes(mv.type) ? 1.5 : 1;
  const atk = a.atk * stageMul(B.st[who].atk), def = d.def * stageMul(B.st[dk].def);
  const crit = Math.random() < 1 / 16 ? 1.5 : 1;
  let dmg = Math.floor(((2 * a.lv / 5 + 2) * mv.power * atk / def) / 50 + 2);
  dmg = Math.max(1, Math.floor(dmg * stab * typeMul * crit * (0.85 + Math.random() * 0.15)));
  S.sfx('hit');
  B.blink[dk] = 24; B.shake[dk] = 16; B.flash = 4;
  d.hp = Math.max(0, d.hp - dmg);
  yield () => Math.abs(B.hpShown[dk] - d.hp) < 0.01;
  yield 6;
  if (crit > 1) yield* S.say('A critical hit!', { auto: 40 });
  if (typeMul > 1) yield* S.say('It\'s super effective!', { auto: 44 });
  if (typeMul < 1) yield* S.say('It\'s not very effective...', { auto: 44 });
}

// EXP is shared by every monster that fought this foe and is still standing
function* gainExp() {
  const team = [...B.fought].filter(i => G.party[i] && G.party[i].hp > 0);
  const total = G.species[B.foe.sp].exp * B.foe.lv / 4 * (B.trainer ? 1.5 : 1);
  const gain = Math.max(1, Math.floor(total / team.length));
  for (const i of team) {
    const m = G.party[i];
    yield* S.say(`${nm(m)} gained ${gain} EXP. Points!`, { auto: 50 });
    m.exp += gain;
    while (m.lv < 50 && m.exp >= G.expNeed(m.lv)) {
      m.exp -= G.expNeed(m.lv);
      yield* G.levelUp(m, i === B.mi ? hp => { B.hpShown.me = hp; } : null);
      const evo = G.species[m.sp].evo;
      if (evo && m.lv >= evo[1] && !B.evos.includes(m)) B.evos.push(m);
    }
  }
  B.fought = new Set([B.mi]);
}
G.levelUp = function* (m, onHp) {
  m.lv++;
  const n = G.statsAt(m.sp, m.lv);
  m.hp = Math.max(0, m.hp + n.maxhp - m.maxhp);
  Object.assign(m, n);
  if (onHp) onHp(m.hp);
  S.sfx('levelup');
  yield* S.say(`${nm(m)} grew to Lv. ${m.lv}!`);
  for (const [l, k] of G.species[m.sp].learn) if (l === m.lv) yield* G.learnMove(m, k);
};
G.learnMove = function* (m, key) {
  if (m.moves.includes(key)) return;
  const mv = G.moves[key];
  if (m.moves.length < 4) {
    m.moves.push(key); m.pp.push(mv.pp); S.sfx('levelup');
    yield* S.say(`${nm(m)} learned {blue}${mv.name}{/}!`);
    return;
  }
  yield* S.say(`${nm(m)} wants to learn {blue}${mv.name}{/}.`, `But ${nm(m)} already knows four moves.`);
  for (;;) {
    const opts = m.moves.map(k => G.moves[k].name).concat(['KEEP OLD MOVES']);
    const i = yield* S.ask(`Forget a move to make room for {blue}${mv.name}{/}?`, opts, { cancel: 4 });
    if (i === 4) {
      const sure = yield* S.ask(`Give up on learning {blue}${mv.name}{/}?`, ['Yes', 'No']);
      if (sure === 0) { yield* S.say(`${nm(m)} did not learn {blue}${mv.name}{/}.`); return; }
      continue;
    }
    const old = G.moves[m.moves[i]].name;
    m.moves[i] = key; m.pp[i] = mv.pp;
    yield* S.say('1, 2, and... Poof!', `${nm(m)} forgot {blue}${old}{/}...`);
    S.sfx('levelup');
    yield* S.say(`...and learned {blue}${mv.name}{/}!`);
    return;
  }
};

// throw a jar: arc to the foe, the foe vanishes into it, the jar wobbles, then holds or pops open
function* throwJar() {
  const foe = B.foe;
  yield* S.say(`Carl threw a {blue}CONTAINMENT JAR{/}!`, { auto: 30 });
  B.jar = { t: 0, phase: 'fly', wob: 0 };
  S.sfx('select');
  yield 30;
  B.jar.phase = 'suck'; B.flash = 8; S.sfx('pop');
  B.gone.foe = 99;
  yield 24;
  B.jar.phase = 'drop';
  yield 16;
  const rate = G.species[foe.sp].catch * (1.6 - foe.hp / foe.maxhp);
  const caught = Math.random() < Math.min(0.95, rate) || S.params.has('catchall');   // ?catchall = dev testing
  const wobbles = caught ? 3 : S.rand(0, 2);
  for (let i = 0; i < wobbles; i++) {
    B.jar.phase = 'wobble'; B.jar.t = 0; S.sfx('cursor');
    yield 36;
  }
  if (caught) {
    B.jar.phase = 'done'; S.sfx('levelup');
    for (let i = 0; i < 8; i++) B.fx.push({ kind: 'spark', x: 184 + S.rand(-14, 14), y: 76 + S.rand(-12, 6), vx: 0, vy: -0.6, t: 0, life: 30, delay: i * 3 });
    yield* S.say(`Gotcha! {red}${foe.name}{/} was contained!`);
    const mon = Object.assign({}, foe);
    if (G.party.length < 6) { G.party.push(mon); yield* S.say(`{green}${mon.name}{/} joined Carl's party!`); }
    else { G.box.push(mon); yield* S.say(`The party is full. {green}${mon.name}{/} was sent to the {blue}Lost & Found{/}.`); }
    G.seen.add(foe.sp); G.caught.add(foe.sp);
    return true;
  }
  B.jar = null; B.gone.foe = 0; B.slideIn.foe = 8; S.sfx('door');
  yield* S.say(S.pick(['Oh no! It broke free!', 'Aww! It looked contained, too!', 'Not even close. The lid wasn\'t on.']), { auto: 60 });
  return false;
}

function end(result) {
  B.menu = null;
  const cb = B.onEnd, evos = result === 'lose' ? [] : B.evos;
  for (const m of G.party) m.pp = m.pp.map(p => Math.max(0, p));
  if (evos.length) S.ui.transition('fade', () => G.evolve(evos, () => S.ui.transition('fade', () => cb && cb(result), { out: 20 })), { out: 24 });
  else S.ui.transition('fade', () => cb && cb(result), { out: 24 });
}

// ---------------------------------------------------------------- evolution
// G.evolve([mon, ...], done): one after another, the sprite flickers between old and new, then a flash
let E = null;
const evoScene = {
  enter() {
    S.run(function* () {
      for (const m of E.list) {
        const to = G.species[m.sp].evo[0];
        Object.assign(E, { m, from: m.sp, to, t: 0, show: 'from', white: 0, done: false, flash: 0 });
        S.music('evolve');
        yield 30;
        yield* S.say(`What? ${nm(m)} is evolving!`);
        E.white = 1;
        // flicker: slow, then faster
        for (let gap = 26; gap > 2; gap = Math.floor(gap * 0.82)) {
          E.show = E.show === 'from' ? 'to' : 'from'; S.sfx('cursor');
          yield gap;
        }
        for (let i = 0; i < 12; i++) { E.show = i % 2 ? 'from' : 'to'; yield 2; }
        E.show = 'to'; E.flash = 30; S.sfx('levelup');
        const oldName = G.species[m.sp].name;
        const hpGap = m.maxhp - m.hp;
        m.sp = to; if (m.name === oldName) m.name = G.species[to].name;
        Object.assign(m, G.statsAt(to, m.lv)); m.hp = Math.max(1, m.maxhp - hpGap);
        G.seen.add(to); G.caught.add(to);
        yield 20; E.white = 0;
        S.music('victory');
        yield* S.say(`Congratulations! {green}${oldName}{/} evolved into {green}${G.species[to].name}{/}!`);
        for (const [l, k] of G.species[to].learn) if (l === m.lv) yield* G.learnMove(m, k);
      }
      E.done = true;
      E.after();
    });
  },
  update() { E.t++; if (E.flash > 0) E.flash--; },
  draw(top, bot) {
    // a spotlight on dark velvet
    top.clear('#1a1426');
    for (let r = 120; r > 0; r -= 12) top.alpha(0.08, () => top.ellipse(128, 100, r * 1.3, r * 0.8, '#8a6ad8'));
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2 + E.t / 90, d = 60 + (i % 3) * 18;
      top.px(Math.round(128 + Math.cos(a) * d * 1.4), Math.round(96 + Math.sin(a) * d * 0.7), i % 2 ? '#fff4a0' : '#b49cf0');
    }
    top.ellipse(128, 136, 44, 9, '#2e2244'); top.ellipse(128, 135, 40, 7, '#3e2e5a');
    if (E.m) {
      const sp = (E.show === 'from' ? E.from : E.to) + '_front', bob = 'idle' + (Math.floor(E.t / 22) % 2);
      if (E.white) {
        const ctx = top.ctx;
        ctx.save(); ctx.filter = 'brightness(0) invert(1)';
        top.spr(sp, 'idle0', 128, 136);
        ctx.restore();
      } else top.spr(sp, bob, 128, 136);
    }
    if (E.flash > 0) top.alpha(E.flash / 30, () => top.rect(0, 0, 256, 192, '#ffffff'));
    G.drawPattern(bot, '#2a2040', '#352a50', E.t);
  },
};
G.evolve = function (list, after) { E = { list, after, t: 0 }; S.go(evoScene, 'evolve'); };

// ---------------------------------------------------------------- command input (touch + keys)
const MAIN = [
  { id: 'fight', x: 20, y: 16, w: 216, h: 98, label: 'FIGHT', color: 'red' },
  { id: 'bag', x: 6, y: 132, w: 78, h: 46, label: 'BAG', color: 'yellow' },
  { id: 'run', x: 89, y: 142, w: 78, h: 40, label: 'RUN', color: 'blue' },
  { id: 'party', x: 172, y: 132, w: 78, h: 46, label: 'PARTY', color: 'green' },
];
const MOVEBTN = [[6, 8], [130, 8], [6, 74], [130, 74]];
const NAV_MAIN = { up: [0, 0, 0, 0], down: [2, 2, 2, 2], left: [0, 1, 1, 2], right: [0, 2, 3, 3] };
const NAV_MOVES = { up: [0, 1, 0, 1, 2], down: [2, 3, 4, 4, 4], left: [0, 0, 2, 2, 4], right: [1, 1, 3, 3, 4] };
const bagList = () => Object.keys(G.items).filter(k => G.bag[k] > 0 && !G.items[k].repel);
const partySlot = i => [6 + (i % 2) * 124, 4 + Math.floor(i / 2) * 52, 120, 48];

function pick(i) {
  if (B.menu === 'main') {
    const id = MAIN[i].id;
    S.sfx('select');
    B.menu = id === 'fight' ? 'moves' : id === 'bag' ? 'bag' : id === 'party' ? 'party' : null;
    B.sel = 0; B.forced = false; B.itemKey = null;
    if (B.menu === 'party') B.sel = B.mi;
    if (id === 'run') B.cmd = { kind: 'run' };
  } else if (B.menu === 'moves') {
    if (i === 4) return back();
    if (B.me.pp[i] <= 0) { S.sfx('bump'); return; }
    S.sfx('select'); B.cmd = { kind: 'fight', move: B.me.moves[i] };
  } else if (B.menu === 'bag') {
    const list = bagList();
    if (i >= list.length) return back();
    S.sfx('select');
    if (G.items[list[i]].catch) B.cmd = { kind: 'item', item: list[i] };
    else { B.itemKey = list[i]; B.menu = 'party'; B.sel = B.mi; }   // pills and tape: pick who gets it
  } else if (B.menu === 'party') {
    if (i >= G.party.length) return back();
    const m = G.party[i];
    if (B.itemKey) {
      const it = G.items[B.itemKey];
      const ok = it.revive ? m.hp <= 0 : m.hp > 0 && m.hp < m.maxhp;
      if (!ok) { S.sfx('bump'); return; }
      S.sfx('select'); B.cmd = { kind: 'item', item: B.itemKey, i }; return;
    }
    if (m.hp <= 0 || (i === B.mi && B.me.hp > 0)) { S.sfx('bump'); return; }
    S.sfx('select'); B.cmd = { kind: 'switch', i };
  }
}
function back() {
  if (B.menu === 'party' && B.forced) { S.sfx('bump'); return; }
  if (B.menu === 'party' && B.itemKey) { S.sfx('cancel'); B.menu = 'bag'; B.sel = Math.max(0, bagList().indexOf(B.itemKey)); B.itemKey = null; return; }
  S.sfx('cancel'); B.menu = 'main'; B.sel = 0;
}
function menuInput() {
  const I = S.input;
  if (B.menu === 'main' || B.menu === 'moves') {
    const nav = B.menu === 'main' ? NAV_MAIN : NAV_MOVES;
    for (const d of ['up', 'down', 'left', 'right']) if (I.repeat(d)) { const n = nav[d][B.sel]; if (n !== B.sel) { B.sel = n; S.sfx('cursor'); } }
  } else {
    const n = (B.menu === 'bag' ? bagList().length : G.party.length) + 1;
    const step = B.menu === 'party' ? { up: -2, down: 2, left: -1, right: 1 } : { up: -1, down: 1, left: -1, right: 1 };
    for (const d of ['up', 'down', 'left', 'right']) if (I.repeat(d)) {
      let s = B.sel + step[d];
      if (B.menu === 'party' && B.sel === n - 1 && d === 'up') s = n - 2;
      s = Math.max(0, Math.min(n - 1, s));
      if (s !== B.sel) { B.sel = s; S.sfx('cursor'); }
    }
  }
  if (I.pressed('a')) { I.consume('a'); pick(B.sel); }
  else if (I.pressed('b') && B.menu !== 'main') { I.consume('b'); back(); }
}

// ---------------------------------------------------------------- drawing: top screen (Nevada dusk)
function platform(g, cx, cy, rx, ry) {
  const [rim, base, mid, hi] = B.bg.plat;
  g.ellipse(cx, cy + 2, rx + 2, ry + 2, rim);
  g.ellipse(cx, cy + 1, rx, ry, base);
  g.ellipse(cx, cy - 1, rx - 2, ry - 2, mid);
  g.ellipse(cx - 8, cy - 3, rx - 18, ry - 6, hi);
}
function hpColor(f) { return f > 0.5 ? ['#38b868', '#78e898'] : f > 0.2 ? ['#d8a020', '#f8e070'] : ['#d83838', '#f88888']; }
function hpBar(g, x, y, w, frac) {
  g.rect(x, y, w + 20, 7, '#3a3a4a');
  g.rect(x + 1, y + 1, 17, 5, '#f09028');
  const mini = ['#.#.##.', '#.#.#.#', '###.##.', '#.#.#..', '#.#.#..'];
  mini.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') g.px(x + 6 + i, y + 1 + j, '#fff8e8'); }));
  g.rect(x + 19, y + 1, w, 5, '#5a5a6a');
  const fw = Math.ceil(w * Math.max(0, frac));
  const [c, hi] = hpColor(frac);
  g.rect(x + 19, y + 1, fw, 5, c);
  g.rect(x + 19, y + 2, fw, 1, hi);
}
G.hpBar = hpBar;
function infoBox(g, x, y, w, h, mon, shownHp, me) {
  S.ui.box(g, x, y, w, h, 'info');
  g.text(mon.name, x + 9, y + 5, { color: 'dark' });
  g.text('Lv' + mon.lv, x + w - 9, y + 5, { color: 'dark', align: 'right' });
  if (!me && G.caught.has(mon.sp) && !B.trainer) { g.spr('jar', 0, x + 12, y + 28); }
  hpBar(g, x + w - 88, y + 17, 60, shownHp / mon.maxhp);
  if (me) {
    g.text(`${Math.ceil(shownHp)}/${mon.maxhp}`, x + w - 9, y + 26, { color: 'dark', align: 'right' });
    g.rect(x + 8, y + h - 5, w - 16, 2, '#3a3a4a');
    g.rect(x + 8, y + h - 5, Math.floor((w - 16) * mon.exp / G.expNeed(mon.lv)), 2, '#58a8f0');
  }
}
function drawTop(g) {
  B.bg.draw(g);
  const ease = t => 1 - Math.pow(1 - S.clamp(t, 0, 1), 3);
  const slide = ease(B.intro / 50);
  const fx = Math.round(-80 + (184 + 80) * slide), mx = Math.round(330 - (330 - 72) * slide);
  platform(g, fx, 94, 50, 12);
  platform(g, mx, 132, 66, 15);
  const bob = k => Math.floor(B.t / 22 + (k === 'me' ? 1 : 0)) % 2;
  const vis = k => !(B.blink[k] > 0 && Math.floor(B.blink[k] / 3) % 2 === 0);
  const shx = k => B.shake[k] > 0 ? (B.shake[k] % 4 < 2 ? -2 : 2) : 0;
  const lunge = (k, dir) => B.lunge[k] > 0 ? Math.round(Math.sin(B.lunge[k] / 14 * Math.PI) * 10) * dir : 0;
  const ctx = g.ctx;
  if (vis('foe') && B.gone.foe < 40) {
    const drop = B.gone.foe * 2, sx = B.slideIn.foe * 3;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 256, 96); ctx.clip();
    g.spr(B.foe.sp + '_front', 'idle' + bob('foe'), fx + sx + shx('foe') + lunge('foe', -1), 96 + drop + lunge('foe', 1) / 2);
    ctx.restore();
  }
  if (vis('me') && B.gone.me < 40) {
    const drop = B.gone.me * 2, sx = B.slideIn.me * 4;
    g.spr(B.me.sp + '_back', 'idle' + bob('me'), mx - sx + shx('me') + lunge('me', 1), 152 + drop - lunge('me', 1) / 2);
  }
  if (B.jar) drawJar(g);
  for (const p of B.fx) if (!(p.delay > 0)) drawParticle(g, p);
  const ib = ease((B.intro - 20) / 30);
  infoBox(g, Math.round(-124 + 126 * ib), 10, 120, 30, B.foe, B.hpShown.foe, false);
  infoBox(g, Math.round(256 - 128 * ib), 98, 126, 40, B.me, B.hpShown.me, true);
  if (B.trainer) {   // remaining foe monsters as little jars
    B.foes.forEach((m, i) => { const x = 14 + i * 13, y = 58; g.alpha(m.hp > 0 && i >= B.fi ? 1 : 0.35, () => g.spr('jar', 0, x, y)); });
  }
  if (B.flash > 0) g.alpha(0.5, () => g.rect(0, 0, 256, 192, '#ffffff'));
}
function drawJar(g) {
  const j = B.jar, tx = 184, ty = 86;
  let x = tx, y = ty;
  if (j.phase === 'fly') {
    const p = Math.min(1, j.t / 30);
    x = 40 + (tx - 40) * p; y = 150 + (ty - 40 - 150) * p + 0 - Math.sin(p * Math.PI) * 40 + p * 40 * 0;
    y = 150 * (1 - p) + (ty - 30) * p - Math.sin(p * Math.PI) * 50;
  } else if (j.phase === 'suck') { y = ty - 30; }
  else if (j.phase === 'drop') { const p = Math.min(1, j.t / 12); y = ty - 30 + 30 * p * p; }
  else if (j.phase === 'wobble') { x = tx + (j.t < 24 ? Math.round(Math.sin(j.t / 24 * Math.PI * 3) * 2) : 0); }
  if (j.phase === 'suck') {   // a beam of light pulling the monster in
    g.alpha(0.6, () => { g.rect(tx - 12, ty - 30, 24, 30, '#fff8d0'); g.rect(tx - 7, ty - 30, 14, 30, '#ffffff'); });
  }
  g.spr('jar', 0, Math.round(x), Math.round(y));
}

// ---------------------------------------------------------------- particles
function spawnFx(kind, who, self) {
  const from = who === 'me' ? [84, 104] : [184, 70], to = who === 'me' ? [184, 68] : [76, 104];
  const push = o => B.fx.push(Object.assign({ t: 0, life: 30, vx: 0, vy: 0 }, o));
  const aim = (n, spd, extra) => {
    for (let i = 0; i < n; i++) {
      const sx = from[0] + S.rand(-8, 8), sy = from[1] + S.rand(-8, 8);
      const dx = to[0] + S.rand(-8, 8) - sx, dy = to[1] + S.rand(-8, 8) - sy, L = Math.hypot(dx, dy);
      push(Object.assign({ x: sx, y: sy, vx: dx / L * spd, vy: dy / L * spd, life: Math.floor(L / spd), delay: i * 3 }, extra(i)));
    }
  };
  const at = self ? from : to;
  if (kind === 'zap') for (let i = 0; i < 6; i++) push({ kind: 'zap', x: to[0] + S.rand(-16, 16), y: to[1] - 30 + S.rand(-4, 4), life: 12, delay: i * 3, seed: i });
  else if (kind === 'wisp') aim(6, 4, i => ({ kind: 'wisp', spin: i }));
  else if (kind === 'notes') aim(6, 4, i => ({ kind: 'note', spin: i }));
  else if (kind === 'letter') aim(5, 6, () => ({ kind: 'letter' }));
  else if (kind === 'fluff') aim(7, 4, () => ({ kind: 'fluff', r: S.rand(2, 3) }));
  else if (kind === 'bite') { push({ kind: 'jaw', x: to[0], y: to[1] - 14, life: 16, dir: 1 }); push({ kind: 'jaw', x: to[0], y: to[1] + 10, life: 16, dir: -1 }); }
  else if (kind === 'down') for (let i = 0; i < 6; i++) push({ kind: 'arrow', x: to[0] + S.rand(-18, 18), y: to[1] - 18, vy: 1, life: 24, delay: i * 3 });
  else if (kind === 'sparkle') for (let i = 0; i < 12; i++) push({ kind: 'spark', x: at[0] + S.rand(-26, 26), y: at[1] + S.rand(-14, 30), vy: -1.2, life: 30, delay: i * 2 });
  else if (kind === 'hit') for (let i = 0; i < 5; i++) push({ kind: 'star', x: to[0] + S.rand(-14, 14), y: to[1] + S.rand(-14, 10), life: 14, delay: i * 2 });
}
function drawParticle(g, p) {
  const x = Math.round(p.x), y = Math.round(p.y);
  if (p.kind === 'zap') {
    const c = p.t % 4 < 2 ? '#fff4a0' : '#78d8f8';
    for (let i = 0; i < 6; i++) g.rect(x + (i % 2 ? 1 : -1) * ((i + p.seed) % 3), y + i * 5, 2, 5, c);
  } else if (p.kind === 'wisp') {
    g.ellipse(x, y, 3, 4, '#4cb87a'); g.ellipse(x, y + 1, 2, 2, '#8ae0a0'); g.px(x + (p.t % 6 < 3 ? -1 : 1), y - 5, '#8ae0a0');
  } else if (p.kind === 'note') {
    const c = p.spin % 2 ? '#ecc548' : '#78b8f8';
    g.rect(x, y + 3, 3, 2, c); g.rect(x + 2, y - 3, 1, 6, c); g.rect(x + 3, y - 3, 2, 1, c);
  } else if (p.kind === 'letter') {
    g.rect(x - 4, y - 3, 9, 7, '#3a2a3a'); g.rect(x - 3, y - 2, 7, 5, '#f2ead6'); g.px(x - 2, y - 2, '#b8a890'); g.px(x + 2, y - 2, '#b8a890'); g.px(x, y, '#b8a890');
  } else if (p.kind === 'fluff') {
    g.ellipse(x, y, p.r + 1, p.r + 1, '#7c58b0'); g.ellipse(x, y, p.r, p.r, '#f8f0d8');
  } else if (p.kind === 'jaw') {
    const k = Math.min(1, p.t / 8), yy = y + Math.round(k * 8) * p.dir;
    g.rect(x - 12, yy, 24, 3, '#ffffff');
    for (let i = 0; i < 5; i++) g.rect(x - 11 + i * 5, yy + (p.dir > 0 ? 3 : -3), 3, 3, '#ffffff');
  } else if (p.kind === 'arrow') {
    g.rect(x, y - 4, 2, 6, '#5a7ae0'); g.rect(x - 2, y + 1, 6, 1, '#5a7ae0'); g.rect(x - 1, y + 2, 4, 1, '#5a7ae0');
  } else if (p.kind === 'spark') {
    const c = p.t % 6 < 3 ? '#fff8a0' : '#ffffff';
    g.rect(x, y - 2, 1, 5, c); g.rect(x - 2, y, 5, 1, c);
  } else if (p.kind === 'star') {
    const s = p.t < 7 ? 4 : 2;
    g.rect(x - s, y, s * 2 + 1, 1, '#fff0a0'); g.rect(x, y - s, 1, s * 2 + 1, '#fff0a0'); g.rect(x, y, 1, 1, '#ffffff');
  }
}

// ---------------------------------------------------------------- drawing: bottom screen
G.drawPattern = function (g, a, b, t = 0) {
  g.clear(a);
  const o = Math.floor(t / 4) % 32;
  for (let y = -32; y < 192; y += 16) for (let x = -32; x < 256; x += 16) {
    if (((x + y) / 16) % 2 !== 0) continue;
    const xx = x + o, yy = y + o;
    g.rect(xx + 7, yy + 5, 2, 6, b); g.rect(xx + 5, yy + 7, 6, 2, b);
  }
};
// one party member as a touch button (used in battle and on the overworld pad)
G.drawMonSlot = function (g, x, y, w, h, m, opts = {}) {
  const fainted = m.hp <= 0;
  const draw = (gg, bx, by) => {
    // window showing the monster's face
    S.ui.box(gg, bx + 4, by + 4, 40, h - 8, { r: 3, bands: ['#3e4a62'], fill: opts.active ? '#fff4c0' : '#e8f0f8' });
    const ctx = gg.ctx;
    ctx.save(); ctx.beginPath(); ctx.rect(bx + 5, by + 5, 38, h - 10); ctx.clip();
    if (fainted) gg.alpha(0.4, () => gg.spr(m.sp + '_front', 'idle0', bx + 24, by + h + 10));
    else gg.spr(m.sp + '_front', 'idle' + (Math.floor(S.frame / 22) % 2), bx + 24, by + h + 10);
    ctx.restore();
    let name = m.name; while (S.font.width(name) > w - 52) name = name.slice(0, -1);
    gg.text(name, bx + 48, by + 6, { color: 'white', shadow: '#1f2a5a' });
    gg.text('Lv' + m.lv, bx + w - 6, by + 18, { color: 'white', align: 'right', shadow: '#1f2a5a' });
    G.hpBar(gg, bx + 48, by + 30, w - 76, m.hp / m.maxhp);
    gg.text(fainted ? 'OUT' : `${m.hp}/${m.maxhp}`, bx + 48, by + 18, { color: fainted ? 'red' : 'white', shadow: '#1f2a5a' });
  };
  return S.ui.button(g, x, y, w, h, null, fainted ? 'gray' : opts.active ? 'green' : 'blue', { selected: opts.selected, draw });
};

function drawBottom(g) {
  G.drawPattern(g, '#3a2a3e', '#46324a', B.t);
  if (!B.menu) { g.alpha(0.5, () => g.rect(0, 0, 256, 192, '#1a1220')); return; }
  if (B.menu === 'main') {
    MAIN.forEach((b, i) => {
      const opts = { selected: i === B.sel };
      if (b.id === 'fight') opts.draw = (gg, x, y, w, h) => {
        const ctx = gg.ctx;
        ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y + 4, w - 8, h - 24); ctx.clip();
        gg.spr(B.me.sp + '_front', 'idle' + (Math.floor(B.t / 22) % 2), x + w / 2, y + 74);
        ctx.restore();
        gg.text('FIGHT', x + w / 2, y + h - 18, { color: 'white', align: 'center', shadow: '#5a1f2e' });
      };
      if (b.id === 'run' && B.trainer) opts.disabled = true;
      if (S.ui.button(g, b.x, b.y, b.w, b.h, b.label, b.color, opts)) pick(i);
    });
  } else if (B.menu === 'moves') {
    B.me.moves.forEach((k, i) => {
      const mv = G.moves[k], [x, y] = MOVEBTN[i];
      const col = G.types[mv.type].color, ramp = S.ui.buttons[col];
      const pp = B.me.pp[i];
      const draw = (gg, bx, by, w) => {
        gg.text(mv.name, bx + w / 2, by + 13, { color: 'white', align: 'center', shadow: ramp[0] });
        S.ui.box(gg, bx + 9, by + 32, w - 18, 17, { r: 2, bands: [ramp[0]], fill: ramp[4] });
        gg.text(mv.type.toUpperCase(), bx + 15, by + 36, { color: 'dark', shadow: false });
        gg.text(`PP ${pp}`, bx + w - 15, by + 36, { color: pp > 0 ? 'dark' : 'red', align: 'right', shadow: false });
      };
      if (S.ui.button(g, x, y, 120, 60, null, col, { selected: i === B.sel, draw, disabled: pp <= 0 })) pick(i);
    });
    if (S.ui.button(g, 6, 144, 244, 40, 'CANCEL', 'gray', { selected: B.sel === 4 })) pick(4);
  } else if (B.menu === 'bag') {
    const list = bagList();
    const rh = list.length > 2 ? 32 : 56;
    list.forEach((k, i) => {
      const it = G.items[k];
      const draw = (gg, bx, by, w, h) => {
        gg.spr(G.itemSprite(k), 0, bx + 18, by + h - (h > 40 ? 10 : 5));
        gg.text(it.name, bx + 34, by + 7, { color: 'white', shadow: '#5a3a1f' });
        gg.text('x' + G.bag[k], bx + w - 10, by + 7, { color: 'white', align: 'right', shadow: '#5a3a1f' });
        (h > 40 ? S.font.wrap(it.desc, w - 44).slice(0, 2) : [it.info]).forEach((ln, j) => gg.text(ln, bx + 34, by + 20 + j * 11, { color: 'dark', shadow: false }));
      };
      if (S.ui.button(g, 6, 4 + i * (rh + 4), 244, rh, null, 'yellow', { selected: i === B.sel, draw })) pick(i);
    });
    if (!list.length) g.text('The bag is empty.', 128, 60, { align: 'center', color: 'white' });
    if (S.ui.button(g, 6, 150, 244, 36, 'CANCEL', 'gray', { selected: B.sel === list.length })) pick(list.length);
  } else if (B.menu === 'party') {
    G.party.forEach((m, i) => {
      const [x, y, w, h] = partySlot(i);
      if (G.drawMonSlot(g, x, y, w, h, m, { selected: i === B.sel, active: i === B.mi })) pick(i);
    });
    const n = G.party.length;
    if (!B.forced && S.ui.button(g, 6, 160, 244, 28, B.itemKey ? `USE ${G.items[B.itemKey].short} ON? (CANCEL)` : 'CANCEL', 'gray', { selected: B.sel === n })) pick(n);
  }
}
})();
