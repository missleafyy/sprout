// Sprout Town — turn-based creature battles (Platinum-style layout: action on top, touch commands below).
(function () {
const S = Sprout;
const G = S.game = S.game || {};

// ---------------------------------------------------------------- data
G.moves = {
  leafflick: { name: 'LEAF FLICK', type: 'grass', power: 40, pp: 25, fx: 'leaves' },
  tackle: { name: 'TACKLE', type: 'normal', power: 35, pp: 35, fx: 'hit' },
  dewdrop: { name: 'DEWDROP', type: 'water', power: 30, pp: 20, fx: 'drops' },
  sproutup: { name: 'SPROUT UP', type: 'grass', power: 0, pp: 20, fx: 'sparkle', boost: 'atk' },
  fluffpuff: { name: 'FLUFF PUFF', type: 'fluff', power: 30, pp: 30, fx: 'fluff' },
  gust: { name: 'GUST', type: 'wind', power: 35, pp: 35, fx: 'gust' },
};
G.types = {   // button colour, effectiveness vs defender types
  grass: { color: 'green', vs: { water: 2, fluff: 1 } },
  water: { color: 'blue', vs: { fluff: 2, grass: 0.5 } },
  normal: { color: 'gray', vs: {} },
  fluff: { color: 'pink', vs: {} },
  wind: { color: 'purple', vs: { grass: 2 } },
};
G.species = {
  sprig: { name: 'SPRIG', back: 'sprig_back', icon: 'sprig_ow', types: ['grass'], hp: 20, atk: 10, def: 9, spd: 11,
    moves: ['leafflick', 'tackle', 'dewdrop', 'sproutup'] },
  puffmoth: { name: 'PUFFMOTH', front: 'puffmoth', types: ['fluff'], hp: 22, atk: 11, def: 9, spd: 9, exp: 34,
    moves: ['fluffpuff', 'gust', 'tackle'] },
};
G.makeMon = (sp, lv) => {
  const s = G.species[sp];
  const st = k => Math.floor(s[k] + (lv - 5) * (k === 'hp' ? 3 : 1.4));
  const m = { sp, name: s.name, lv, maxhp: st('hp'), atk: st('atk'), def: st('def'), spd: st('spd'), moves: s.moves.slice(), exp: 0, boost: 0 };
  m.hp = m.maxhp;
  return m;
};
G.expNeed = lv => lv * 6;

// ---------------------------------------------------------------- battle scene
let B = null;

G.startBattle = function (sp, lv) {
  const me = G.party[0];
  me.boost = 0;
  B = {
    me, foe: G.makeMon(sp, lv),
    t: 0, intro: 0, menu: null, sel: 0, cmd: null,
    fx: [], shake: { me: 0, foe: 0 }, blink: { me: 0, foe: 0 }, lunge: { me: 0, foe: 0 },
    hpShown: { me: me.hp, foe: 0 }, gone: { me: 0, foe: 0 }, flash: 0,
  };
  B.hpShown.foe = B.foe.hp;
  S.music('battle');
  S.go(battleScene, 'battle');
};

const battleScene = {
  enter() {
    B.t = 0;
    S.run(flow);
  },
  update() {
    B.t++;
    if (B.intro < 60) B.intro++;
    for (const k of ['me', 'foe']) {
      const mon = B[k], target = mon.hp;
      if (B.hpShown[k] > target) B.hpShown[k] = Math.max(target, B.hpShown[k] - Math.max(0.2, mon.maxhp / 70));
      if (B.hpShown[k] < target) B.hpShown[k] = Math.min(target, B.hpShown[k] + mon.maxhp / 70);
      if (B.shake[k] > 0) B.shake[k]--;
      if (B.blink[k] > 0) B.blink[k]--;
      if (B.lunge[k] > 0) B.lunge[k]--;
      if (B.gone[k] > 0 && B.gone[k] < 99) B.gone[k]++;
    }
    if (B.flash > 0) B.flash--;
    for (const p of B.fx) { if (p.delay > 0) { p.delay--; continue; } p.t++; p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; }
    B.fx = B.fx.filter(p => p.t < p.life);
    if (B.menu) menuInput();
  },
  draw(top, bot) { drawTop(top); drawBottom(bot); },
};

// ---------------------------------------------------------------- flow (a script task)
function* flow() {
  const { me, foe } = B;
  yield 56;
  yield* S.say(`A wild {red}${foe.name}{/} appeared!`, { auto: 70 });
  for (;;) {
    S.ui.openDialog([`What will {green}${me.name}{/} do?`], { keep: true, speed: 2 });
    B.menu = 'main'; B.sel = 0; B.cmd = null;
    yield () => B.cmd;
    const cmd = B.cmd;
    B.menu = null;
    S.ui.closeDialog();
    if (cmd.kind === 'run') {
      S.sfx('door');
      yield* S.say('Got away safely!', { auto: 50 });
      return end('run');
    }
    if (cmd.kind === 'bag') { yield* S.say('Your bag only has a {green}shiny pebble{/}.', 'It doesn\'t do anything... yet.'); continue; }
    if (cmd.kind === 'party') {
      yield* S.say(`{green}${me.name}{/}  Lv.${me.lv}   HP ${me.hp}/${me.maxhp}`, `ATK ${me.atk}  DEF ${me.def}  SPD ${me.spd}`, 'It\'s rustling its leaves, ready to go!');
      continue;
    }
    const foeMove = S.pick(foe.moves);
    const order = me.spd >= foe.spd ? [['me', cmd.move], ['foe', foeMove]] : [['foe', foeMove], ['me', cmd.move]];
    for (const [who, mv] of order) {
      const a = B[who], d = B[who === 'me' ? 'foe' : 'me'];
      if (a.hp <= 0 || d.hp <= 0) continue;
      yield* doMove(who, mv);
    }
    if (foe.hp <= 0) {
      S.sfx('faint');
      B.gone.foe = 1;
      yield 34;
      yield* S.say(`The wild {red}${foe.name}{/} fainted!`, { auto: 60 });
      S.music('victory');
      const gain = Math.floor(G.species[foe.sp].exp * foe.lv / 3);
      yield* S.say(`{green}${me.name}{/} gained ${gain} EXP. Points!`, { auto: 60 });
      me.exp += gain;
      while (me.exp >= G.expNeed(me.lv)) {
        me.exp -= G.expNeed(me.lv);
        me.lv++;
        const n = G.makeMon(me.sp, me.lv);
        const hpUp = n.maxhp - me.maxhp;
        Object.assign(me, { maxhp: n.maxhp, atk: n.atk, def: n.def, spd: n.spd });
        me.hp += hpUp; B.hpShown.me = me.hp;
        S.sfx('levelup');
        yield* S.say(`{green}${me.name}{/} grew to Lv. ${me.lv}!`);
      }
      S.state.flags.wonBattle = true;
      return end('win');
    }
    if (me.hp <= 0) {
      S.sfx('faint');
      B.gone.me = 1;
      yield 34;
      yield* S.say(`{green}${me.name}{/} is too tired to go on!`, 'You scooped up Sprig and hurried home...');
      return end('lose');
    }
  }
}

function* doMove(who, key) {
  const mv = G.moves[key];
  const a = B[who], d = B[who === 'me' ? 'foe' : 'me'];
  const dk = who === 'me' ? 'foe' : 'me';
  const label = who === 'me' ? `{green}${a.name}{/}` : `The wild {red}${a.name}{/}`;
  yield* S.say(`${label} used {blue}${mv.name}{/}!`, { auto: 34 });
  B.lunge[who] = 14;
  yield 8;
  spawnFx(mv.fx, who);
  yield mv.fx === 'sparkle' ? 30 : 24;
  if (mv.boost) {
    a.boost = Math.min(3, a.boost + 1);
    S.sfx('heal');
    yield* S.say(`${label}'s ATTACK rose!`, { auto: 50 });
    return;
  }
  const typeMul = G.types[mv.type].vs[G.species[d.sp].types[0]] || 1;
  const stab = G.species[a.sp].types.includes(mv.type) ? 1.5 : 1;
  const atk = a.atk * (1 + a.boost * 0.5);
  const crit = Math.random() < 1 / 16 ? 1.5 : 1;
  let dmg = Math.floor(((2 * a.lv / 5 + 2) * mv.power * atk / d.def) / 50 + 2);
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

function end(result) {
  B.menu = null;
  S.ui.transition('fade', () => {
    if (result === 'lose') {
      G.party[0].hp = G.party[0].maxhp;
      G.backToWorld('home', 1, 4, 'down');
      S.run(function* () { yield 24; yield* S.say('Sprig had a good nap and feels much better!'); });
    } else G.backToWorld();
  }, { out: 24 });
}

// ---------------------------------------------------------------- command input (touch + keys)
const MAIN = [
  { id: 'fight', x: 20, y: 16, w: 216, h: 98, label: 'FIGHT', color: 'red' },
  { id: 'bag', x: 6, y: 132, w: 78, h: 46, label: 'BAG', color: 'yellow' },
  { id: 'run', x: 89, y: 142, w: 78, h: 40, label: 'RUN', color: 'blue' },
  { id: 'party', x: 172, y: 132, w: 78, h: 46, label: 'SPRIG', color: 'green' },
];
const MOVEBTN = [[6, 8], [130, 8], [6, 74], [130, 74]];
const KEYNAV = {
  main: { up: [0, 0, 0, 0], down: [2, 2, 2, 2], left: [0, 1, 1, 2], right: [0, 2, 3, 3] },
  moves: { up: [0, 1, 0, 1, 2], down: [2, 3, 4, 4, 4], left: [0, 0, 2, 2, 4], right: [1, 1, 3, 3, 4] },
};

function choose(i) {
  if (B.menu === 'main') {
    const id = MAIN[i].id;
    S.sfx('select');
    if (id === 'fight') { B.menu = 'moves'; B.sel = 0; }
    else B.cmd = { kind: id };
  } else if (B.menu === 'moves') {
    if (i === 4) { S.sfx('cancel'); B.menu = 'main'; B.sel = 0; return; }
    S.sfx('select');
    B.cmd = { kind: 'fight', move: B.me.moves[i] };
  }
}
function menuInput() {
  const I = S.input;
  const nav = KEYNAV[B.menu];
  for (const d of ['up', 'down', 'left', 'right']) if (I.repeat(d)) { const n = nav[d][B.sel]; if (n !== B.sel) { B.sel = n; S.sfx('cursor'); } }
  if (I.pressed('a')) { I.consume('a'); choose(B.sel); }
  else if (I.pressed('b') && B.menu === 'moves') { I.consume('b'); choose(4); }
}

// ---------------------------------------------------------------- drawing: top screen
function drawBackground(g) {
  ['#80c4f0', '#90ccf2', '#a0d4f4', '#b0dcf6', '#c0e4f8', '#d0ecfa'].forEach((c, i) => g.rect(0, i * 10, 256, 10, c));
  // clouds drift slowly
  const cx = (B.t / 10) % 320;
  for (const [x, y, s] of [[30, 12, 1], [150, 6, 1.3], [240, 20, 0.8]]) {
    const xx = ((x + cx) % 320) - 32;
    g.ellipse(xx, y + 4, Math.round(12 * s), 3, '#f4fbff');
    g.ellipse(xx + Math.round(6 * s), y + 1, Math.round(7 * s), 4, '#ffffff');
    g.ellipse(xx - Math.round(5 * s), y + 2, Math.round(5 * s), 3, '#ffffff');
  }
  // distant tree line
  for (let i = 0; i < 15; i++) {
    const x = i * 19 - 6, h = 9 + ((i * 7) % 5);
    g.ellipse(x + 9, 62 - h + 6, 12, h, 'lf1');
  }
  for (let i = 0; i < 15; i++) {
    const x = i * 19 + 3, h = 6 + ((i * 5) % 4);
    g.ellipse(x + 2, 64 - h + 4, 10, h, 'lf2');
    g.rect(x - 3, 58 - h + 4, 3, 1, 'lf3');
  }
  // field with soft rows
  g.rect(0, 64, 256, 128, 'gr3');
  g.rect(0, 64, 256, 2, 'gr1'); g.rect(0, 66, 256, 1, 'gr2');
  for (let y = 76, i = 0; y < 192; y += 10 + i * 2, i++) g.rect(0, y, 256, 1, 'gr4');
}
function platform(g, cx, cy, rx, ry) {
  g.ellipse(cx, cy + 2, rx + 2, ry + 2, 'tg0');
  g.ellipse(cx, cy + 1, rx, ry, 'tg1');
  g.ellipse(cx, cy - 1, rx - 2, ry - 2, 'tg2');
  g.ellipse(cx - 8, cy - 3, rx - 18, ry - 6, 'tg3');
}
function hpColor(f) { return f > 0.5 ? ['#38b868', '#78e898'] : f > 0.2 ? ['#d8a020', '#f8e070'] : ['#d83838', '#f88888']; }
function hpBar(g, x, y, w, frac) {
  g.rect(x, y, w + 20, 7, '#3a3a4a');
  g.rect(x + 1, y + 1, 17, 5, '#f09028');
  // tiny 3x5 "HP" lettering, like the handhelds
  const mini = ['#.#.##.', '#.#.#.#', '###.##.', '#.#.#..', '#.#.#..'];
  mini.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') g.px(x + 6 + i, y + 1 + j, '#fff8e8'); }));
  g.rect(x + 19, y + 1, w, 5, '#5a5a6a');
  const fw = Math.ceil(w * Math.max(0, frac));
  const [c, hi] = hpColor(frac);
  g.rect(x + 19, y + 1, fw, 5, c);
  g.rect(x + 19, y + 2, fw, 1, hi);
}
function infoBox(g, x, y, w, h, mon, shownHp, me) {
  S.ui.box(g, x, y, w, h, 'info');
  g.text(mon.name, x + 9, y + 5, { color: 'dark' });
  g.text('Lv' + mon.lv, x + w - 9, y + 5, { color: 'dark', align: 'right' });
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
    const drop = B.gone.foe * 2;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 256, 96); ctx.clip();
    g.spr('puffmoth', bob('foe') ? 'idle1' : 'idle0', fx + shx('foe') + lunge('foe', -1), 96 + drop + lunge('foe', 1) / 2);
    ctx.restore();
  }
  if (vis('me') && B.gone.me < 40) {
    const drop = B.gone.me * 2;
    g.spr('sprig_back', bob('me') ? 'idle1' : 'idle0', mx + shx('me') + lunge('me', 1), 152 + drop - lunge('me', 1) / 2);
  }
  for (const p of B.fx) if (!(p.delay > 0)) drawParticle(g, p);
  const ib = ease((B.intro - 20) / 30);
  infoBox(g, Math.round(-124 + 126 * ib), 10, 120, 30, B.foe, B.hpShown.foe, false);
  infoBox(g, Math.round(256 - 128 * ib), 98, 126, 40, B.me, B.hpShown.me, true);
  if (B.flash > 0) g.alpha(0.5, () => g.rect(0, 0, 256, 192, '#ffffff'));
}

// ---------------------------------------------------------------- particles
function spawnFx(kind, who) {
  const from = who === 'me' ? [84, 104] : [184, 70], to = who === 'me' ? [184, 68] : [76, 104];
  const push = o => B.fx.push(Object.assign({ t: 0, life: 30, vx: 0, vy: 0 }, o));
  const aim = (n, spd, extra) => {
    for (let i = 0; i < n; i++) {
      const sx = from[0] + S.rand(-8, 8), sy = from[1] + S.rand(-8, 8);
      const dx = to[0] + S.rand(-8, 8) - sx, dy = to[1] + S.rand(-8, 8) - sy, L = Math.hypot(dx, dy);
      push(Object.assign({ x: sx, y: sy, vx: dx / L * spd, vy: dy / L * spd, life: Math.floor(L / spd), delay: i * 3 }, extra(i)));
    }
  };
  if (kind === 'leaves') aim(7, 7, i => ({ kind: 'leaf', spin: i }));
  else if (kind === 'drops') aim(8, 6, () => ({ kind: 'drop' }));
  else if (kind === 'fluff') aim(7, 4, () => ({ kind: 'fluff', r: S.rand(2, 4) }));
  else if (kind === 'gust') for (let i = 0; i < 6; i++) push({ kind: 'gust', x: to[0] - 50, y: to[1] - 24 + i * 9, vx: 6, life: 18, len: S.rand(14, 26), delay: i * 2 });
  else if (kind === 'sparkle') for (let i = 0; i < 12; i++) push({ kind: 'spark', x: from[0] + S.rand(-26, 26), y: from[1] + S.rand(-14, 30), vy: -1.2, life: 30, delay: i * 2 });
  else if (kind === 'hit') for (let i = 0; i < 5; i++) push({ kind: 'star', x: to[0] + S.rand(-14, 14), y: to[1] + S.rand(-14, 10), life: 14, delay: i * 2 });
}
function drawParticle(g, p) {
  const x = Math.round(p.x), y = Math.round(p.y);
  if (p.kind === 'leaf') {
    if (Math.floor(p.t / 3 + p.spin) % 2) { g.rect(x - 1, y - 3, 3, 6, 'lf0'); g.rect(x, y - 2, 1, 4, 'lf4'); }
    else { g.rect(x - 3, y - 1, 6, 3, 'lf0'); g.rect(x - 2, y, 4, 1, 'lf4'); }
  } else if (p.kind === 'drop') {
    g.rect(x - 1, y - 2, 3, 4, 'wa1'); g.rect(x, y - 3, 1, 1, 'wa1'); g.rect(x, y - 1, 1, 1, 'wa4');
  } else if (p.kind === 'fluff') {
    g.ellipse(x, y, p.r + 1, p.r + 1, 'ds2'); g.ellipse(x, y, p.r, p.r, '#ffffff');
  } else if (p.kind === 'gust') {
    g.rect(x, y, p.len, 1, '#ffffff'); g.rect(x + 4, y + 1, p.len - 8, 1, 'wa4');
  } else if (p.kind === 'spark') {
    const c = p.t % 6 < 3 ? '#fff8a0' : '#ffffff';
    g.rect(x, y - 2, 1, 5, c); g.rect(x - 2, y, 5, 1, c);
  } else if (p.kind === 'star') {
    const s = p.t < 7 ? 4 : 2;
    g.rect(x - s, y, s * 2 + 1, 1, '#fff0a0'); g.rect(x, y - s, 1, s * 2 + 1, '#fff0a0'); g.rect(x, y, 1, 1, '#ffffff');
  }
}

// ---------------------------------------------------------------- drawing: bottom screen
// DS-style tiled background: small plus shapes, slowly scrolling
G.drawPattern = function (g, a, b, t = 0) {
  g.clear(a);
  const o = Math.floor(t / 4) % 32;
  for (let y = -32; y < 192; y += 16) for (let x = -32; x < 256; x += 16) {
    if (((x + y) / 16) % 2 !== 0) continue;
    const xx = x + o, yy = y + o;
    g.rect(xx + 7, yy + 5, 2, 6, b); g.rect(xx + 5, yy + 7, 6, 2, b);
  }
};
function drawBottom(g) {
  G.drawPattern(g, '#232a40', '#2c3552', B.t);
  if (!B.menu) { g.alpha(0.5, () => g.rect(0, 0, 256, 192, '#141826')); return; }
  if (B.menu === 'main') {
    MAIN.forEach((b, i) => {
      const opts = { selected: i === B.sel };
      if (b.id === 'fight') opts.draw = (gg, x, y, w, h) => {
        gg.text('FIGHT', x + w / 2, y + 62, { color: 'white', align: 'center', shadow: '#5a1f2e' });
        gg.spr('sprig_ow', Math.floor(B.t / 16) % 2 ? 'down1' : 'down0', x + w / 2, y + 52);
      };
      if (S.ui.button(g, b.x, b.y, b.w, b.h, b.label, b.color, opts)) choose(i);
    });
  } else if (B.menu === 'moves') {
    B.me.moves.forEach((k, i) => {
      const mv = G.moves[k], [x, y] = MOVEBTN[i];
      const col = G.types[mv.type].color, ramp = S.ui.buttons[col];
      const draw = (gg, bx, by, w) => {
        gg.text(mv.name, bx + w / 2, by + 13, { color: 'white', align: 'center', shadow: ramp[0] });
        S.ui.box(gg, bx + 9, by + 32, w - 18, 17, { r: 2, bands: [ramp[0]], fill: ramp[4] });
        gg.text(mv.type.toUpperCase(), bx + 15, by + 36, { color: 'dark', shadow: false });
        gg.text(`PP ${mv.pp}`, bx + w - 15, by + 36, { color: 'dark', align: 'right', shadow: false });
      };
      if (S.ui.button(g, x, y, 120, 60, null, col, { selected: i === B.sel, draw })) choose(i);
    });
    if (S.ui.button(g, 6, 144, 244, 40, 'CANCEL', 'gray', { selected: B.sel === 4 })) choose(4);
  }
}
})();
