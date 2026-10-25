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
    st: { me: { atk: 0, def: 0 }, foe: { atk: 0, def: 0 } }, jar: null, fought: new Set(),
  };
  Object.defineProperty(B, 'me', { get: () => G.party[B.mi] });
  Object.defineProperty(B, 'foe', { get: () => B.foes[B.fi] });
  B.hpShown.me = B.me.hp; B.hpShown.foe = B.foe.hp;
  B.fought.add(B.mi);
  S.music(B.trainer ? 'trainer' : 'battle');
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
        const m = B.me;
        if (m.hp >= m.maxhp) { yield* S.say(`${nm(m)} is already at full HP.`, 'The pill stays in the bottle.'); continue; }
        G.bag[cmd.item]--;
        m.hp = Math.min(m.maxhp, m.hp + it.heal);
        S.sfx('heal');
        yield () => Math.abs(B.hpShown.me - m.hp) < 0.01;
        yield* S.say(`${nm(m)} took a {blue}PROP PILL{/}. It feels better!`, { auto: 50 });
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
        S.sfx('pop');
        yield* S.say(`${B.trainer.name} sent out {red}${B.foe.name}{/}!`, { auto: 50 });
        continue;
      }
      if (B.trainer) {
        S.music('victory');
        yield* S.say(`You defeated {blue}${B.trainer.name}{/}!`);
        if (B.trainer.win) yield* S.say(...[].concat(B.trainer.win), { name: B.trainer.name });
      }
      return end('win');
    }
    if (B.me.hp <= 0) {
      S.sfx('faint'); B.gone.me = 1;
      yield 34;
      yield* S.say(`${nm(B.me)} is out of potential!`, { auto: 60 });
      if (!G.party.some(m => m.hp > 0)) {
        if (B.trainer && B.trainer.lose) yield* S.say(...[].concat(B.trainer.lose), { name: B.trainer.name });
        yield* S.say('Carl has no monsters left!', 'Carl panicked and ran back to the A.S.S.!');
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

function pickFoeMove() {
  const mv = B.foe.moves, hits = mv.filter(k => G.moves[k].power > 0);
  return Math.random() < 0.75 && hits.length ? S.pick(hits) : S.pick(mv);
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
  const typeMul = G.species[d.sp].types.reduce((m, t) => m * (G.types[mv.type].vs[t] || 1), 1);
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

function* gainExp() {
  const me = B.me;
  const gain = Math.floor(G.species[B.foe.sp].exp * B.foe.lv / 3 * (B.trainer ? 1.5 : 1));
  yield* S.say(`${nm(me)} gained ${gain} EXP. Points!`, { auto: 60 });
  me.exp += gain;
  while (me.exp >= G.expNeed(me.lv)) {
    me.exp -= G.expNeed(me.lv);
    me.lv++;
    const n = G.makeMon(me.sp, me.lv);
    const hpUp = n.maxhp - me.maxhp;
    Object.assign(me, { maxhp: n.maxhp, atk: n.atk, def: n.def, spd: n.spd });
    me.hp += hpUp; B.hpShown.me = me.hp;
    S.sfx('levelup');
    yield* S.say(`${nm(me)} grew to Lv. ${me.lv}!`);
  }
}

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
  const cb = B.onEnd;
  for (const m of G.party) m.pp = m.pp.map(p => Math.max(0, p));
  S.ui.transition('fade', () => cb && cb(result), { out: 24 });
}

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
const bagList = () => Object.keys(G.items).filter(k => G.bag[k] > 0);
const partySlot = i => [6 + (i % 2) * 124, 4 + Math.floor(i / 2) * 52, 120, 48];

function pick(i) {
  if (B.menu === 'main') {
    const id = MAIN[i].id;
    S.sfx('select');
    B.menu = id === 'fight' ? 'moves' : id === 'bag' ? 'bag' : id === 'party' ? 'party' : null;
    B.sel = 0; B.forced = false;
    if (B.menu === 'party') B.sel = B.mi;
    if (id === 'run') B.cmd = { kind: 'run' };
  } else if (B.menu === 'moves') {
    if (i === 4) return back();
    if (B.me.pp[i] <= 0) { S.sfx('bump'); return; }
    S.sfx('select'); B.cmd = { kind: 'fight', move: B.me.moves[i] };
  } else if (B.menu === 'bag') {
    const list = bagList();
    if (i >= list.length) return back();
    S.sfx('select'); B.cmd = { kind: 'item', item: list[i] };
  } else if (B.menu === 'party') {
    if (i >= G.party.length) return back();
    const m = G.party[i];
    if (m.hp <= 0 || (i === B.mi && B.me.hp > 0)) { S.sfx('bump'); return; }
    S.sfx('select'); B.cmd = { kind: 'switch', i };
  }
}
function back() {
  if (B.menu === 'party' && B.forced) { S.sfx('bump'); return; }
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
function drawBackground(g) {
  ['#f6c08a', '#f4b07e', '#f0a07a', '#e88e78', '#d97e7c', '#c47080'].forEach((c, i) => g.rect(0, i * 10, 256, 10, c));
  g.ellipse(196, 34, 9, 9, '#ffe0a8'); g.ellipse(196, 34, 7, 7, '#fff2d0');
  // distant mesas
  const mesa = (x, w, h, c, top) => { g.rect(x, 60 - h, w, h, c); g.rect(x + 3, 60 - h - 2, w - 6, 2, c); g.rect(x + 4, 60 - h - 2, w - 10, 1, top); };
  mesa(-4, 60, 16, '#a85e6a', '#c47a7e'); mesa(78, 34, 10, '#a85e6a', '#c47a7e'); mesa(150, 70, 20, '#9a5464', '#b86e78'); mesa(228, 40, 12, '#a85e6a', '#c47a7e');
  // a far road sign and power line
  for (let x = 0; x < 256; x += 64) { g.rect(x + 20, 38, 1, 24, '#7a4a5a'); g.rect(x + 16, 40, 9, 1, '#7a4a5a'); }
  g.rect(0, 41, 256, 1, '#9a6070');
  // sand with soft bands
  g.rect(0, 60, 256, 132, 'sd3');
  g.rect(0, 60, 256, 2, 'sd1'); g.rect(0, 62, 256, 1, 'sd2');
  for (let y = 72, i = 0; y < 192; y += 10 + i * 2, i++) g.rect(0, y, 256, 1, 'sd4');
}
function platform(g, cx, cy, rx, ry) {
  g.ellipse(cx, cy + 2, rx + 2, ry + 2, 'sd0');
  g.ellipse(cx, cy + 1, rx, ry, 'sd1');
  g.ellipse(cx, cy - 1, rx - 2, ry - 2, 'sd2');
  g.ellipse(cx - 8, cy - 3, rx - 18, ry - 6, 'sd4');
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
  drawBackground(g);
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
    list.forEach((k, i) => {
      const it = G.items[k];
      const draw = (gg, bx, by, w, h) => {
        gg.spr(k === 'jar' ? 'jar' : 'pill', 0, bx + 18, by + h - 10);
        gg.text(it.name, bx + 34, by + 9, { color: 'white', shadow: '#5a3a1f' });
        gg.text('x' + G.bag[k], bx + w - 10, by + 9, { color: 'white', align: 'right', shadow: '#5a3a1f' });
        S.font.wrap(it.desc, w - 44).slice(0, 2).forEach((ln, j) => gg.text(ln, bx + 34, by + 22 + j * 11, { color: 'dark', shadow: false }));
      };
      if (S.ui.button(g, 6, 6 + i * 62, 244, 56, null, 'yellow', { selected: i === B.sel, draw })) pick(i);
    });
    if (!list.length) g.text('The bag is empty.', 128, 60, { align: 'center', color: 'white' });
    if (S.ui.button(g, 6, 150, 244, 36, 'CANCEL', 'gray', { selected: B.sel === list.length })) pick(list.length);
  } else if (B.menu === 'party') {
    G.party.forEach((m, i) => {
      const [x, y, w, h] = partySlot(i);
      if (G.drawMonSlot(g, x, y, w, h, m, { selected: i === B.sel, active: i === B.mi })) pick(i);
    });
    const n = G.party.length;
    if (!B.forced && S.ui.button(g, 6, 160, 244, 28, 'CANCEL', 'gray', { selected: B.sel === n })) pick(n);
  }
}
})();
