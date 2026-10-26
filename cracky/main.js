// Cracky: Still in Transit — save data, encounters, trainers, shops, the Lost & Found, the Boo Pad,
// the title screen and boot. Story scenes live in story.js; maps in maps*.js.
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const BOO = G.BOO = { name: 'Boo', nameColor: 'green' };
G.CARL = { name: 'Carl', nameColor: 'green' };
const SAVE_KEY = 'sprout-save';   // S.save/S.load key (shared with Sprout Town, so keep a game tag in the data)

// ---------------------------------------------------------------- save data
G.party = []; G.box = []; G.bag = {}; G.seen = new Set(); G.caught = new Set();
G.newGame = () => {
  S.state = {
    game: 'cracky', flags: {}, party: [], box: [], bag: { pill: 0, pillmax: 0, tape: 0, jar: 0, chalk: 0 },
    seen: [], caught: [], money: 300, stamps: [], repel: 0, time: 0,
    heal: { map: 'lot', x: 11, y: 18, dir: 'down', where: 'the A.S.S.' },
  };
  bind();
};
function bind() {
  G.party = S.state.party; G.box = S.state.box; G.bag = S.state.bag;
  for (const k of Object.keys(G.items)) G.bag[k] = G.bag[k] || 0;
  G.seen = new Set(S.state.seen); G.caught = new Set(S.state.caught);
}
Object.defineProperty(G, 'money', { get: () => S.state.money || 0, set: v => { S.state.money = Math.max(0, Math.min(999999, v)); } });
G.saveGame = () => {
  const p = S.world.player;
  Object.assign(S.state, { map: S.world.mapId, x: p.x, y: p.y, dir: p.dir, seen: [...G.seen], caught: [...G.caught] });
  return S.save();
};
G.loadGame = () => {
  if (!S.load() || S.state.game !== 'cracky') return false;
  // saves from the demo build lack the newer fields
  S.state = Object.assign({ money: 300, stamps: [], repel: 0, time: 0, heal: { map: 'lot', x: 11, y: 18, dir: 'down', where: 'the A.S.S.' } }, S.state);
  bind();
  return true;
};
G.hasSave = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}').game === 'cracky'; } catch (e) { return false; } };
G.stamps = () => (S.state.stamps || []);
G.hasStamp = id => G.stamps().includes(id);

// ---------------------------------------------------------------- encounters
// a map's wild table: wild: [[species, weight, minLv, maxLv], ...], rate (per step), encounters: true (grass) | 'floor'
function setupWorld() {
  S.world.player = new S.Actor({ id: 'player', sprite: 'carl' });
  S.world.follower = new S.Actor({
    id: 'boo', name: 'Boo', sprite: 'boo_ow', float: 2, shadowW: 4,
    talk: function* (a) {
      a.hop = { t: 0, d: 16, h: 6 }; S.sfx('pop');
      const map = S.world.map;
      const lines = [].concat(typeof map.boo === 'function' ? map.boo() : map.boo || [], [
        'I\'m not haunting you. I\'m {green}following{/} you. Totally different.',
        'Carl, your human disguise is slipping again. It\'s the eyes. And the green.',
        G.party.some(m => m.hp < m.maxhp) ? 'Your monsters look tired. Find somewhere to rest!' : 'Boo-tiful day for a delivery.',
      ]);
      yield* S.say(S.pick(lines), BOO);
    },
  });
  S.world.encounter = w => tryEncounter(w);
  S.world.stepHooks = [onStep];
}
function tryEncounter(w) {
  const map = w.map;
  if (!map.wild || G.spot || S.params.has('noenc') || !G.party.some(m => m.hp > 0)) return;
  if (Math.random() >= (map.rate || 0.1)) return;
  let r = Math.random() * map.wild.reduce((a, e) => a + e[1], 0), e = map.wild[0];
  for (const x of map.wild) { if ((r -= x[1]) < 0) { e = x; break; } }
  const lv = S.rand(e[2], e[3]);
  const lead = G.party.find(m => m.hp > 0);
  if (S.state.repel > 0 && lv < lead.lv) return;
  G.startBattle({ wild: [e[0], lv] }, afterWild);
}
function afterWild(result) {
  if (result === 'lose') return G.blackout();
  G.backToWorld();
}
function onStep(p, c) {
  G.spot = false;
  S.state.time = (S.state.time || 0) + 1;
  if (S.state.repel > 0 && --S.state.repel === 0) S.run(function* () { yield* S.say('The {blue}SIGIL CHALK{/} circle wore off.'); });
  // trainers who can see Carl walk over and challenge him
  if (S.busy()) return;
  for (const a of S.world.actors) {
    if (!a.trainer || G.beaten(a.trainer)) continue;
    const d = sightDist(a);
    if (d) { G.spot = true; S.run(() => spotted(a, d)); return; }
  }
  if (S.world.map.encounters === 'floor' && c && !(c.tile && c.tile.grass)) tryEncounter(S.world);
}
function sightDist(a) {
  const p = S.world.player, [dx, dy] = S.DIRV[a.dir];
  for (let i = 1; i <= (a.trainer.sight || 4); i++) {
    const x = a.x + dx * i, y = a.y + dy * i;
    if (x === p.x && y === p.y) return i;
    if (S.world.blocked(x, y, { ghost: true })) return 0;
  }
  return 0;
}
G.bang = (a, life = 50) => S.world.effect({ life, key: 99998, draw(g, e) {
  const x = Math.round(a.px) + 8, y = Math.round(a.py) - 22 - (e.t < 6 ? 6 - e.t : 0);
  g.rect(x - 4, y - 1, 9, 13, '#3a2230'); g.rect(x - 3, y, 7, 11, '#fbf8ea');
  g.rect(x - 1, y + 1, 3, 6, '#e0403a'); g.rect(x - 1, y + 8, 3, 2, '#e0403a');
} });
function* spotted(a, d) {
  const p = S.world.player;
  S.sfx('exclaim'); G.bang(a);
  yield 44;
  for (let i = 1; i < d; i++) { a.go(a.dir, 1, true); yield () => !a.moving; }
  p.faceToward(a);
  yield 8;
  yield* G.trainerBattle(a.trainer, a);
}
G.beaten = t => !!F()['t_' + t.id];

// trainer def: { id, name, party: [[sp, lv]], intro, win, after, money, leader, sight, bg, music, pre, onWin }
G.trainerActor = (o, t) => Object.assign({
  name: t.name, trainer: t,
  talk: function* (a) {
    if (!G.beaten(t)) { yield* G.trainerBattle(t, a); return; }
    yield* S.say(...[].concat(typeof t.after === 'function' ? t.after() : t.after || t.win), { name: t.name });
  },
}, o);
G.trainerBattle = function* (t, a) {
  if (t.pre) yield* t.pre(a);
  if (t.intro) yield* S.say(...[].concat(t.intro), { name: t.name });
  const opts = { trainer: Object.assign({}, t, { intro: null }) };
  if (t.bg) opts.bg = t.bg;
  if (t.music) opts.music = t.music;
  yield* G.battle(opts, result => {
    if (result !== 'win') return G.blackout();
    F()['t_' + t.id] = true;
    G.backToWorld();
    if (t.onWin) S.run(function* () { yield 20; yield* t.onWin(a); });
  });
};
// start a battle from inside a script
G.battle = function* (opts, cb) {
  S.sfx('encounter');
  yield 10;
  G.startBattle(opts, cb);
};

// ---------------------------------------------------------------- healing, blackout
G.blackout = () => {
  const lost = Math.floor(G.money / 2);
  G.money -= lost; G.healAll();
  const h = S.state.heal;
  G.backToWorld(h.map, h.x, h.y, h.dir);
  S.run(function* () {
    yield 24;
    yield* S.say('Carl panicked and ran all the way back to ' + h.where + '.', lost ? `He dropped {yellow}${lost} PROP BUX{/} on the way.` : 'His pockets were already empty.');
    yield* S.say('Everyone took a nap. Nobody talks about it.');
  });
};
// a rest stop: heals, and becomes the place Carl runs back to
G.rest = function* (spot, lines, who) {
  if (lines) yield* S.say(...[].concat(lines), who || {});
  yield* S.wipe('fade', () => G.healAll(), { out: 30 });
  S.sfx('heal');
  if (spot) S.state.heal = spot;
  yield* S.say('Carl\'s monsters are fully rested!');
};

G.backToWorld = (map, x, y, dir) => {
  S.go(overworld);
  if (map) S.world.load(map, x, y, dir);
  else S.music(S.world.map.music);
};
G.battleBg = () => S.world.map && S.world.map.battleBg;

// ---------------------------------------------------------------- shops and the Lost & Found
G.shop = function* (stock, who) {
  yield* S.say(...[].concat(who.hello || 'Welcome! What do you need?'), who);
  for (;;) {
    const opts = stock.map(k => `${G.items[k].name}  ${G.items[k].price}`).concat(['DONE']);
    const i = yield* S.ask(`You have {yellow}${G.money} PROP BUX{/}. Buy what?`, opts);
    if (i >= stock.length) break;
    const it = G.items[stock[i]];
    yield* S.say(it.desc);
    const qty = [1, 3, 5, 10];
    const q = yield* S.ask(`How many? ({yellow}${it.price}{/} each)`, qty.map(n => `x${n}   ${n * it.price}`).concat(['NONE']));
    if (q >= qty.length) continue;
    const cost = qty[q] * it.price;
    if (cost > G.money) { S.sfx('bump'); yield* S.say('You don\'t have enough PROP BUX.', who); continue; }
    G.money -= cost; G.bag[stock[i]] += qty[q]; S.sfx('coin');
    yield* S.say(`Carl bought ${qty[q]} {blue}${it.name}{/}.`, S.pick(['Thank you!', 'Pleasure doing business.', 'No refunds. Ever.']));
  }
  yield* S.say(...[].concat(who.bye || 'Come again!'), who);
};
G.lostAndFound = function* () {
  yield* S.say('The {blue}LOST & FOUND{/} terminal.', 'Extra monsters wait in cubbies labelled "CARL".');
  for (;;) {
    const i = yield* S.ask(`Party ${G.party.length}/6   Stored ${G.box.length}`, ['TAKE OUT', 'PUT IN', 'DONE']);
    if (i === 2) return;
    if (i === 0) {
      if (!G.box.length) { yield* S.say('The cubbies are empty.'); continue; }
      if (G.party.length >= 6) { yield* S.say('Carl\'s party is full. Put someone in first.'); continue; }
      const k = yield* pickMon(G.box, 'Take out who?');
      if (k < 0) continue;
      const m = G.box.splice(k, 1)[0]; G.party.push(m); S.sfx('pop');
      yield* S.say(`{green}${m.name}{/} rejoined the party!`);
    } else {
      if (G.party.length <= 1) { yield* S.say('Carl can\'t travel without a monster.'); continue; }
      const k = yield* pickMon(G.party, 'Put in who?');
      if (k < 0) continue;
      if (G.party.filter((m, j) => j !== k && m.hp > 0).length === 0) { yield* S.say('Then nobody could fight! Keep one that can.'); continue; }
      const m = G.party.splice(k, 1)[0]; m.hp = m.maxhp; m.pp = m.moves.map(x => G.moves[x].pp); G.box.push(m); S.sfx('pop');
      yield* S.say(`{green}${m.name}{/} is resting in the Lost & Found.`);
    }
  }
};
function* pickMon(list, q) {
  for (let page = 0; ;) {
    const slice = list.slice(page * 5, page * 5 + 5);
    const more = list.length > 5;
    const opts = slice.map(m => `${m.name}  Lv${m.lv}`).concat(more ? ['MORE...', 'CANCEL'] : ['CANCEL']);
    const i = yield* S.ask(q, opts);
    if (i < slice.length) return page * 5 + i;
    if (more && i === slice.length) { page = (page + 1) * 5 >= list.length ? 0 : page + 1; continue; }
    return -1;
  }
}

// ---------------------------------------------------------------- Delivery Stamps
G.STAMPS = [
  { id: 'light', name: 'LIGHT STAMP', who: 'CEO Linda', c: ['#5a1f4a', '#e872aa', '#ffe0f0'], icon: [
    '....#....', '.#..#..#.', '..#####..', '..#####..', '#########', '..#####..', '..#####..', '.#..#..#.', '....#....'] },
  { id: 'dark', name: 'DARK STAMP', who: 'JB Garfield', c: ['#3a1a10', '#d87a30', '#ffe0b0'], icon: [
    '#.......#', '##.....##', '#########', '#.##.##.#', '#########', '#########', '.#######.', '..#####..', '.........'] },
  { id: 'curse', name: 'CURSE STAMP', who: 'Spooky Ghost', c: ['#2e1f5a', '#8a6ad8', '#ece0ff'], icon: [
    '..#####..', '.#######.', '##.###.##', '##.###.##', '#########', '#########', '#########', '#.##.##.#', '.........'] },
  { id: 'sound', name: 'SOUND STAMP', who: 'Yoko', c: ['#1f2a5a', '#4a8ae8', '#d0ecff'], icon: [
    '....####.', '....#..##', '....#....', '....#....', '....#....', '..###....', '.####....', '.####....', '..##.....'] },
];
G.drawStamp = (g, st, x, y, has) => {
  const [dk, mid, lt] = has ? st.c : ['#2a2a3a', '#4a4a5e', '#5a5a70'];
  g.ellipse(x, y, 12, 12, dk); g.ellipse(x, y, 11, 11, mid); g.ellipse(x, y, 9, 9, lt); g.ellipse(x, y, 8, 8, mid);
  st.icon.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') g.px(x - 4 + i, y - 4 + j, has ? lt : '#3a3a4e'); }));
};
let stampShow = null;
G.giveStamp = function* (id, who) {
  const st = G.STAMPS.find(s => s.id === id);
  if (!G.stamps().includes(id)) S.state.stamps.push(id);
  S.sfx('stamp');
  stampShow = { st, t: 0 };
  yield 20;
  S.music('victory');
  yield* S.say(`${who || st.who} stamped Carl's manifest!`, `Carl got the {blue}${st.name}{/}!  (${G.stamps().length}/4)`);
  stampShow = null;
  S.music(S.world.map.music);
};

// ---------------------------------------------------------------- the overworld scene
let banner = null, lastMap = null;
const overworld = {
  t: 0,
  update() {
    this.t++;
    S.world.update();
    if (S.world.map !== lastMap) { lastMap = S.world.map; if (S.world.map.name) banner = { text: S.world.map.name, t: 0 }; }
    if (banner && ++banner.t > 170) banner = null;
    if (stampShow) stampShow.t++;
    if (pad.mode !== 'home') padKeys();
    else if (!S.busy() && S.input.pressed('start')) { S.input.consume('start'); S.run(startMenu); }
  },
  draw(top, bot) {
    S.world.draw(top);
    if (banner) drawBanner(top);
    if (stampShow) {
      const s = Math.min(1, stampShow.t / 12);
      top.alpha(0.5 * s, () => top.rect(0, 0, 256, 192, '#14101a'));
      G.drawStamp(top, stampShow.st, 128, 70 + Math.round((1 - s) * 20), true);
    }
    drawPad(bot, this.t);
  },
};
G.overworld = overworld;
function drawBanner(g) {
  const t = banner.t, w = S.font.width(banner.text) + 24;
  const y = t < 14 ? -24 + t * 2 : t > 150 ? 4 - (t - 150) * 2 : 4;
  S.ui.box(g, 4, y, w, 22, { r: 3, bands: ['#3a2230', '#c0705a', '#eab88a'], fill: '#f8e2c8' });
  g.text(banner.text, 16, y + 7, { color: '#5a2a2a', shadow: '#eac0a0' });
}

function* startMenu() {
  const opts = ['PARTY', 'BAG', 'BOO-DEX', 'CARD', 'SAVE', 'SOUND: ' + (S.audio.muted ? 'OFF' : 'ON'), 'CLOSE'];
  const i = yield* S.ask(null, opts, { cancel: 6 });
  if (i <= 3) yield* openPad(['party', 'bag', 'dex', 'card'][i]);
  if (i === 4) yield* saveFlow();
  if (i === 5) S.audio.setMute(!S.audio.muted);
}
function* saveFlow() {
  const i = yield* S.ask('Save your progress?', ['YES', 'NO']);
  if (i === 0) { const ok = G.saveGame(); S.sfx(ok ? 'save' : 'cancel'); yield* S.say(ok ? 'Your progress was saved!' : 'Saving isn\'t available in this browser.'); }
}

// ---------------------------------------------------------------- Boo Pad (bottom screen)
// modes: home (Boo + goal + buttons), party, bag, dex (Boo-dex grid), card (courier license: money, stamps)
const pad = { mode: 'home', sel: 0, use: null };
const bagKeys = () => Object.keys(G.items).filter(k => G.bag[k] > 0);
function* openPad(mode) {
  if (mode === 'party' && !G.party.length) { yield* S.say('Carl doesn\'t have any monsters yet.', BOO); return; }
  pad.mode = mode; pad.sel = 0; pad.use = null;
  yield () => pad.mode === 'home';
}
const say = (...lines) => S.run(function* () { yield* S.say(...lines); }, { block: false });
function padPick(i) {
  if (S.ui.blocking()) return;
  if (pad.mode === 'party') {
    if (i >= G.party.length) { S.sfx('cancel'); pad.mode = pad.use ? 'bag' : 'home'; pad.use = null; pad.sel = 0; return; }
    const m = G.party[i];
    S.sfx('select');
    if (pad.use) {
      const it = G.items[pad.use];
      if (it.revive) {
        if (m.hp > 0) return say(`${m.name} doesn't need rewinding.`);
        m.hp = Math.floor(m.maxhp / 2);
      } else {
        if (m.hp <= 0) return say(`${m.name} is out of potential. Pills won't fix that. Try a {blue}REVIVE TAPE{/} or a nap.`);
        if (m.hp >= m.maxhp) return say(`${m.name} is already at full HP.`);
        m.hp = Math.min(m.maxhp, m.hp + it.heal);
      }
      G.bag[pad.use]--; S.sfx('heal');
      if (!G.bag[pad.use]) { pad.use = null; pad.mode = 'bag'; pad.sel = 0; }
      return;
    }
    // tap a monster: info, moves, or move it to the front
    S.run(function* () {
      const s = G.species[m.sp];
      const c = yield* S.ask(`{green}${m.name}{/}  Lv.${m.lv}  ${s.types[0].toUpperCase()}`, ['INFO', 'MOVES', i ? 'MAKE LEADER' : 'LEADER', 'BACK'], { cancel: 3 });
      if (c === 0) yield* S.say(`HP ${m.hp}/${m.maxhp}   ATK ${m.atk}   DEF ${m.def}   SPD ${m.spd}`, `EXP ${m.exp}/${G.expNeed(m.lv)}` + (s.evo ? `   Evolves at Lv.${s.evo[1]}` : ''), s.dex);
      if (c === 1) yield* S.say(...m.moves.map((k, j) => { const mv = G.moves[k]; return `{blue}${mv.name}{/}  ${mv.type.toUpperCase()}  ${mv.power ? 'POW ' + mv.power : 'STATUS'}  PP ${m.pp[j]}/${mv.pp}`; }));
      if (c === 2 && i) { G.party.splice(i, 1); G.party.unshift(m); S.sfx('pop'); }
    }, { block: false });
  } else if (pad.mode === 'bag') {
    const list = bagKeys();
    if (i >= list.length) { S.sfx('cancel'); pad.mode = 'home'; return; }
    S.sfx('select');
    const k = list[i], it = G.items[k];
    if (it.catch) return say('Containment Jars are for wild monsters, during battle.', 'Throwing one at a cactus would be weird.');
    if (it.repel) {
      if (S.state.repel > 0) return say('Carl is already standing in a chalk circle.');
      G.bag[k]--; S.state.repel = it.repel; S.sfx('heal');
      return say('Carl drew a {blue}SIGIL CHALK{/} circle around himself.', 'Weak monsters will keep their distance for a while.');
    }
    if (!G.party.length) return say('There\'s nobody to give it to.');
    pad.use = k; pad.mode = 'party'; pad.sel = 0;
  } else if (pad.mode === 'dex') {
    if (i >= G.dexOrder.length) { S.sfx('cancel'); pad.mode = 'home'; return; }
    const sp = G.dexOrder[i], s = G.species[sp], no = 'No.' + String(i + 1).padStart(2, '0');
    S.sfx('select');
    if (G.caught.has(sp)) say(`${no} {green}${s.name}{/}  ${s.types[0].toUpperCase()}`, s.dex);
    else if (G.seen.has(sp)) say(`${no} {green}${s.name}{/}`, 'Seen, but not contained. Boo is dying to know more. (Boo is already dead.)');
    else say(`${no} ???`, 'Nobody has seen this one yet.');
  } else if (pad.mode === 'card') {
    if (i === 0) { S.sfx('select'); S.run(saveFlow); return; }
    S.sfx('cancel'); pad.mode = 'home';
  }
}
function padCount() {
  return pad.mode === 'party' ? G.party.length + 1 : pad.mode === 'bag' ? bagKeys().length + 1
    : pad.mode === 'dex' ? G.dexOrder.length + 1 : 2;
}
function padKeys() {
  const I = S.input;
  if (S.ui.blocking()) return;
  const n = padCount();
  const step = pad.mode === 'party' ? { up: -2, down: 2, left: -1, right: 1 } : pad.mode === 'dex' ? { up: -6, down: 6, left: -1, right: 1 } : { up: -1, down: 1, left: -1, right: 1 };
  for (const d of ['up', 'down', 'left', 'right']) if (I.repeat(d)) {
    const s = S.clamp(pad.sel + step[d], 0, n - 1);
    if (s !== pad.sel) { pad.sel = s; S.sfx('cursor'); }
  }
  if (I.pressed('a')) { I.consume('a'); padPick(pad.sel); }
  else if (I.pressed('b') || I.pressed('start')) { I.consume('b', 'start'); padPick(n - 1); }
}

function drawPad(g, t) {
  G.drawPattern(g, '#3a2a3e', '#46324a', t);
  g.rect(0, 0, 256, 18, '#2a1e30'); g.rect(0, 18, 256, 1, '#14101a');
  const title = { party: pad.use ? 'USE ' + (pad.use && G.items[pad.use].short) + ' ON...' : 'PARTY', bag: 'BAG', dex: `BOO-DEX  ${G.caught.size}/${G.dexOrder.length}`, card: 'COURIER LICENSE' }[pad.mode] || S.world.map.name || '';
  g.text(title, 8, 5, { color: 'white', shadow: '#14101a' });
  g.text(`${G.money} PB`, 248, 5, { color: '#f8d860', align: 'right', shadow: '#14101a' });

  if (pad.mode === 'party') {
    G.party.forEach((m, i) => {
      const x = 6 + (i % 2) * 124, y = 24 + Math.floor(i / 2) * 50;
      if (G.drawMonSlot(g, x, y, 120, 46, m, { selected: i === pad.sel })) { pad.sel = i; padPick(i); }
    });
    if (S.ui.button(g, 6, 172, 244, 18, 'BACK', 'gray', { selected: pad.sel === G.party.length, r: 4, labelDy: 1 })) padPick(G.party.length);
    return;
  }
  if (pad.mode === 'bag') {
    const list = bagKeys();
    list.forEach((k, i) => {
      const it = G.items[k];
      const draw = (gg, bx, by, w, h) => {
        gg.spr(G.itemSprite(k), 0, bx + 16, by + h - 4);
        gg.text(it.name, bx + 30, by + 4, { color: 'white', shadow: '#5a3a1f' });
        gg.text('x' + G.bag[k], bx + w - 8, by + 4, { color: 'white', align: 'right', shadow: '#5a3a1f' });
        gg.text(it.info, bx + 30, by + 15, { color: 'dark', shadow: false });
      };
      if (S.ui.button(g, 6, 22 + i * 30, 244, 28, null, 'yellow', { selected: i === pad.sel, draw, r: 4 })) { pad.sel = i; padPick(i); }
    });
    if (!list.length) g.text('The bag is empty.', 128, 80, { align: 'center', color: 'white' });
    if (S.ui.button(g, 6, 174, 244, 16, 'BACK', 'gray', { selected: pad.sel === list.length, r: 4, labelDy: 1 })) padPick(list.length);
    return;
  }
  if (pad.mode === 'dex') {
    G.dexOrder.forEach((sp, i) => {
      const x = 8 + (i % 6) * 40, y = 22 + Math.floor(i / 6) * 37;
      const caught = G.caught.has(sp), seen = G.seen.has(sp);
      const draw = (gg, bx, by, w, h) => {
        const ctx = gg.ctx;
        ctx.save(); ctx.beginPath(); ctx.rect(bx + 2, by + 2, w - 4, h - 4); ctx.clip();
        if (caught) gg.spr(sp + '_front', 'idle' + (Math.floor((t + i * 5) / 22) % 2), bx + w / 2, by + h + 12);
        else if (seen) { ctx.filter = 'brightness(0)'; gg.alpha(0.55, () => gg.spr(sp + '_front', 'idle0', bx + w / 2, by + h + 12)); ctx.filter = 'none'; }
        else gg.text('?', bx + w / 2, by + h / 2 - 5, { color: 'white', align: 'center', shadow: '#1f2a5a' });
        ctx.restore();
        gg.text(String(i + 1).padStart(2, '0'), bx + 3, by + 2, { color: caught ? 'dark' : 'white', shadow: false });
      };
      if (S.ui.button(g, x, y, 38, 35, null, caught ? 'green' : seen ? 'blue' : 'gray', { selected: i === pad.sel, draw, r: 3 })) { pad.sel = i; padPick(i); }
    });
    if (S.ui.button(g, 6, 172, 244, 18, 'BACK', 'gray', { selected: pad.sel === G.dexOrder.length, r: 4, labelDy: 1 })) padPick(G.dexOrder.length);
    return;
  }
  if (pad.mode === 'card') {
    S.ui.box(g, 8, 24, 240, 114, { r: 4, bands: ['#173a35', '#7cd472', '#d4f8b8'], fill: '#f0fbe8' });
    g.rect(14, 30, 228, 14, '#46b05a');
    g.text('PROP PILLS CO.  COURIER LICENSE', 128, 33, { color: 'white', align: 'center', shadow: '#173a35' });
    S.ui.box(g, 16, 50, 40, 48, { r: 3, bands: ['#3e4a62'], fill: '#cfe8f4' });
    g.spr('carl', 'down0', 36, 92);
    g.text('NAME   CARL', 64, 52, { color: 'dark' });
    g.text('SPECIES   HUMAN (normal)', 64, 64, { color: 'dark' });
    g.text(`PROP BUX   ${G.money}`, 64, 76, { color: 'dark' });
    g.text(`BOO-DEX   ${G.caught.size} caught`, 64, 88, { color: 'dark' });
    G.STAMPS.forEach((st, i) => G.drawStamp(g, st, 44 + i * 56, 118, G.hasStamp(st.id)));
    if (S.ui.button(g, 8, 144, 116, 42, 'SAVE', 'blue', { selected: pad.sel === 0 })) padPick(0);
    if (S.ui.button(g, 132, 144, 116, 42, 'BACK', 'gray', { selected: pad.sel === 1 })) padPick(1);
    return;
  }

  // home: Boo with the current goal in a speech bubble
  S.ui.box(g, 8, 24, 240, 60, 'panel');
  S.ui.box(g, 16, 31, 40, 46, { r: 3, bands: ['#3e4a62'], fill: '#e8f4d8' });
  g.spr('boo', 'idle' + (Math.floor(t / 24) % 2), 36, 71 + Math.round(Math.sin(t / 20) * 2));
  g.text('BOO', 64, 31, { color: 'green' });
  const lines = S.font.wrap(G.goal(), 172);
  lines.slice(0, 3).forEach((ln, i) => g.text(ln, 64, 44 + i * 11, { color: 'normal' }));

  // party strip: little windows with each monster's face
  S.ui.box(g, 8, 88, 240, 40, 'dark');
  for (let i = 0; i < 6; i++) {
    const x = 14 + i * 39, y = 93, m = G.party[i];
    S.ui.box(g, x, y, 35, 30, { r: 3, bands: ['#1e1f2c'], fill: m ? '#e8f0f8' : '#3a3e56' });
    if (!m) continue;
    const ctx = g.ctx;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 1, y + 1, 33, 24); ctx.clip();
    g.spr(m.sp + '_front', 'idle' + (Math.floor((t + i * 7) / 22) % 2), x + 17, y + 46);
    ctx.restore();
    const f = m.hp / m.maxhp;
    g.rect(x + 3, y + 25, 29, 3, '#3a3a4a');
    g.rect(x + 3, y + 25, Math.ceil(29 * f), 3, f > 0.5 ? '#38b868' : f > 0.2 ? '#d8a020' : '#d83838');
  }

  const busy = S.busy();
  [['PARTY', 'green', 'party'], ['BAG', 'yellow', 'bag'], ['DEX', 'red', 'dex'], ['CARD', 'blue', 'card']].forEach(([label, col, mode], i) => {
    if (S.ui.button(g, 8 + i * 61, 134, 57, 52, label, col) && !busy) S.run(() => openPad(mode));
  });
}

// ---------------------------------------------------------------- title screen
let logo = null;
function makeLogo(text, ink, fill, shine) {
  const w = S.font.width(text) + 4, h = 13;
  const c = S.canvas(w, h), x = c.getContext('2d');
  const wrap = { img: (im, px, py) => x.drawImage(im, px, py) };
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, 2], [1, 2], [-1, 2]]) S.font.draw(wrap, text, 2 + dx, 1 + dy, { color: ink, shadow: false });
  S.font.draw(wrap, text, 2, 1, { color: shine, shadow: false });
  x.save(); x.beginPath(); x.rect(0, 5, w, h); x.clip();
  S.font.draw(wrap, text, 2, 1, { color: fill, shadow: false });
  x.restore();
  const big = S.canvas(w * 2, h * 2), bx = big.getContext('2d');
  bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, w * 2, h * 2);
  return big;
}
G.logo = () => (logo = logo || makeLogo('CRACKY', '#1c4644', '#47a283', '#b6ecbc'));
G.drawDusk = function (top, t) {
  ['#2a2440', '#3a2a50', '#58325c', '#7a3e62', '#a85068', '#d0706a', '#f0a07a'].forEach((c, i) => top.rect(0, i * 20, 256, i === 6 ? 24 : 20, c));
  for (let i = 0; i < 30; i++) { const x = (i * 83) % 256, y = (i * 37) % 70; if ((t / 30 + i) % 7 > 1) top.px(x, y, i % 3 ? '#f2dcff' : '#ffffff'); }
  const mesa = (x, w, h, c) => { top.rect(x, 144 - h, w, h, c); top.rect(x + 3, 142 - h, w - 6, 2, c); };
  mesa(-6, 70, 22, '#7a3e5a'); mesa(170, 90, 30, '#6a3454'); mesa(96, 40, 12, '#7a3e5a');
  for (let x = 0; x < 16; x++) for (let y = 0; y < 3; y++) top.spr('lot_tiles', ['sand0', 'sand1', 'sand3', 'sand4'][Math.floor(S.hash(x, y) * 4)], x * 16, 144 + y * 16);
};
const title = {
  t: 0, sel: 0,
  enter() { this.t = 0; this.sel = G.hasSave() ? 1 : 0; S.music('crackyTitle'); G.logo(); },
  update() {
    this.t++;
    if (S.busy()) return;
    const I = S.input;
    if (G.hasSave() && (I.repeat('up') || I.repeat('down'))) { this.sel = 1 - this.sel; S.sfx('cursor'); }
    if (I.pressed('a') || I.pressed('start')) { I.consume('a', 'start'); begin(this.sel === 1 ? 'continue' : 'new'); }
  },
  draw(top, bot) {
    const t = this.t;
    G.drawDusk(top, t);
    top.spr('ship', 0, 150, 180);
    top.spr('cactus', 0, 18, 176);
    const sh = (x, y, w) => top.alpha(0.28, () => top.rect(x - w, y - 1, w * 2, 3, '#3a1a2a'));
    sh(118, 173, 6); top.spr('carl', 'down0', 118, 174);
    sh(96, 172, 4); top.spr('boo', 'idle' + (Math.floor(t / 24) % 2), 96, 168 + Math.round(Math.sin(t / 20) * 2));
    const ly = 18 + Math.round(Math.sin(t / 40) * 2);
    top.img(logo, 128 - logo.width / 2, ly);
    top.text('STILL IN TRANSIT', 128, ly + 32, { color: '#f8d8ae', shadow: '#3a1a2a', align: 'center' });
    top.text('a Pretend Co. adventure', 128, ly + 46, { color: '#c8a8d8', shadow: '#2a1a30', align: 'center' });

    G.drawPattern(bot, '#3a2a3e', '#46324a', t);
    if (S.ui.button(bot, 40, 36, 176, 44, 'NEW GAME', 'green', { selected: this.sel === 0 }) && !S.busy()) begin('new');
    const hs = G.hasSave();
    if (S.ui.button(bot, 40, 92, 176, 44, 'CONTINUE', 'blue', { selected: this.sel === 1, disabled: !hs }) && !S.busy()) begin('continue');
    if (Math.floor(t / 30) % 2) bot.text('Touch a button or press START', 128, 160, { align: 'center', color: '#f8d8ae', shadow: '#1a1220' });
  },
};
G.title = title;

function begin(mode) {
  S.sfx('select');
  S.ui.transition('fade', () => {
    setupWorld();
    if (mode === 'continue' && G.loadGame() && S.maps[S.state.map]) {
      S.go(overworld);
      S.world.load(S.state.map, S.state.x, S.state.y, S.state.dir);
    } else {
      G.newGame();
      S.go(overworld);
      S.world.load('lot', 11, 18, 'down');
      S.run(G.intro);
    }
  }, { out: 24 });
}

// ---------------------------------------------------------------- boot
addEventListener('keydown', e => { if (e.code === 'KeyM') S.audio.setMute(!S.audio.muted); });
addEventListener('load', () => S.boot(() => {
  // dev shortcuts:  ?map=garf&x=10&y=8   ?starter=lamb&lv=20&party=rat,pigeon   ?stamps=2   ?flags=beatHuman,metSuit
  //                 ?battle=rat&foelv=3&bg=mall   ?trainer   ?rival   ?evolve
  const P = S.params;
  if (P.get('map') || P.get('battle') || P.has('trainer') || P.has('rival') || P.has('evolve') || P.has('credits')) {
    setupWorld(); G.newGame();
    const lv = +(P.get('lv') || 5);
    const st = P.get('starter') || 'lamb';
    G.party.push(G.makeMon(st, lv)); F().starter = st; G.caught.add(st); G.seen.add(st);
    F().beatHuman = !P.has('rival');
    G.bag.jar = 5; G.bag.pill = 3;
    if (P.get('party')) for (const sp of P.get('party').split(',')) { G.party.push(G.makeMon(sp, lv)); G.caught.add(sp); G.seen.add(sp); }
    for (const f of (P.get('flags') || '').split(',').filter(Boolean)) F()[f] = true;
    S.state.stamps = G.STAMPS.slice(0, +(P.get('stamps') || 0)).map(s => s.id);
    if (P.get('money')) G.money = +P.get('money');
    S.go(overworld);
    S.world.load(P.get('map') || 'lot', +(P.get('x') || 11), +(P.get('y') || 18), P.get('dir') || 'down');
    if (P.get('battle')) G.startBattle({ wild: [P.get('battle'), +(P.get('foelv') || 3)], bg: P.get('bg') }, afterWild);
    if (P.has('rival')) G.humanBattle();
    else if (P.has('trainer')) G.startBattle({ trainer: { name: 'HU-MAN', party: [['mite', 5], ['spam', 4]], intro: 'BY THE POWER OF NEVADA!' }, bg: P.get('bg') }, afterWild);
    if (P.has('credits')) S.go(G.credits);
    if (P.has('stampshow')) S.run(() => G.giveStamp('light'));
    if (P.has('evolve')) { G.party[0].exp = G.expNeed(G.party[0].lv) - 1; G.startBattle({ wild: ['rat', 3] }, afterWild); }
  } else S.go(title);
}));   // after every script (maps load after this file)
})();
