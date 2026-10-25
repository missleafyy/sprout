// Cracky: Still in Transit — title screen, story, overworld + the bottom-screen "Boo Pad".
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const BOO = { name: 'Boo', nameColor: 'green' };
const CARL = { name: 'Carl', nameColor: 'green' };
const FACE = { name: 'Old Face' };
const HUMAN = { name: 'HU-MAN', nameColor: 'red' };
const SAVE_KEY = 'sprout-save';   // S.save/S.load key (shared with Sprout Town, so keep a game tag in the data)

// ---------------------------------------------------------------- save data
G.party = []; G.box = []; G.bag = {}; G.seen = new Set(); G.caught = new Set();
G.newGame = () => {
  S.state = { game: 'cracky', flags: {}, party: [], box: [], bag: { pill: 0, jar: 0 }, seen: [], caught: [] };
  bind();
};
function bind() {
  G.party = S.state.party; G.box = S.state.box; G.bag = S.state.bag;
  G.seen = new Set(S.state.seen); G.caught = new Set(S.state.caught);
}
G.saveGame = () => {
  const p = S.world.player;
  Object.assign(S.state, { map: S.world.map.name, x: p.x, y: p.y, dir: p.dir, seen: [...G.seen], caught: [...G.caught] });
  return S.save();
};
G.loadGame = () => {
  if (!S.load() || S.state.game !== 'cracky') return false;
  bind();
  return true;
};
G.hasSave = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}').game === 'cracky'; } catch (e) { return false; } };

// ---------------------------------------------------------------- world setup
const WILD = [['rat', 45], ['pigeon', 35], ['spam', 20]];
function setupWorld() {
  S.world.player = new S.Actor({ id: 'player', sprite: 'carl' });
  S.world.follower = new S.Actor({
    id: 'boo', name: 'Boo', sprite: 'boo_ow', float: 2, shadowW: 4,
    talk: function* (a) {
      a.hop = { t: 0, d: 16, h: 6 }; S.sfx('pop');
      yield* S.say(S.pick([
        'I\'m not haunting you. I\'m {green}following{/} you. Totally different.',
        'Carl, your human disguise is slipping again. It\'s the eyes. And the green.',
        'Leafy says hi! ...What do you mean, "who is Leafy"?',
        G.party.some(m => m.hp < m.maxhp) ? 'Your monsters look tired. Naps in the A.S.S. fix everything.' : 'Boo-tiful day for a delivery.',
      ]), BOO);
    },
  });
  S.world.encounter = (w) => {
    if (!w.map.encounters || S.params.has('noenc') || !G.party.length) return;
    if (!G.party.some(m => m.hp > 0)) return;
    if (Math.random() < 0.12) {
      let r = Math.random() * 100, sp = WILD[0][0];
      for (const [k, wgt] of WILD) { if ((r -= wgt) < 0) { sp = k; break; } }
      G.seen.add(sp);
      G.startBattle({ wild: [sp, S.rand(2, 4)] }, afterBattle);
    }
  };
}
function afterBattle(result) {
  if (result === 'lose') {
    G.healAll();
    G.backToWorld('lot', 11, 18, 'down');
    S.run(function* () { yield 24; yield* S.say('Carl took a nap in the A.S.S.', 'Everyone feels better. Nobody talks about it.'); });
  } else G.backToWorld();
  if (result === 'caught' && G.caught.size >= 2 && !F().demoDone) S.run(demoEnd);
}
G.backToWorld = (map, x, y, dir) => {
  S.go(overworld);
  if (map) S.world.load(map, x, y, dir);
  else S.music(S.world.map.music);
};

// ---------------------------------------------------------------- story
G.goal = () => {
  const f = F();
  if (!f.starter) return 'Find {green}Old Face{/} next to the ship. He said something about jars.';
  if (!f.beatHuman) return 'Deal with {red}HU-MAN{/}.';
  if (G.caught.size < 2) return `Contain monsters in the {green}dry scrub{/}! (${G.caught.size}/2)`;
  return 'Demo complete! Explore, battle, contain everything ♥';
};

const STARTERS = [
  { sp: 'lamb', line: 'A sheep made of dead channels. It crackles when it is happy.' },
  { sp: 'sock', line: 'A lost sock, back from wherever socks go. Its pair is still out there.' },
  { sp: 'mite', line: 'A cassette that grew legs. It only knows one song, and it\'s great.' },
];
const COUNTER = { lamb: 'mite', sock: 'lamb', mite: 'sock' };   // HU-MAN picks the one that beats yours

G.oldFaceTalk = function* () {
  const f = F();
  if (!f.starter) {
    yield* S.say('Carl. Little courier. You came.', 'Those are the connections.', FACE);
    yield* S.say('I am Old Face. I backed you up once. Or you backed me up. The logs disagree.', FACE);
    yield* S.say('The desert is full of {blue}monsters{/} now. Junk mail with wings. Rats from the mall.',
      'A courier needs protection. And a courier\'s ghost needs... well. I don\'t know what ghosts need.', FACE);
    yield* S.say('Snacks.', BOO);
    yield* S.say('Choose one of these {blue}Containment Jars{/}. Each one holds a friend.', FACE);
    for (;;) {
      const i = yield* S.ask('Which jar will Carl take?', ['STATIC LAMB', 'LOST SOCK', 'CASSETTE MITE'], { cancel: null });
      const st = STARTERS[i];
      yield* S.say(st.line, FACE);
      const ok = yield* S.ask(`Take {green}${G.species[st.sp].name}{/}?`, ['YES', 'NO']);
      if (ok !== 0) continue;
      G.party.push(G.makeMon(st.sp, 5));
      G.seen.add(st.sp); G.caught.add(st.sp);
      f.starter = st.sp;
      S.sfx('levelup');
      yield* S.say(`Carl got {green}${G.species[st.sp].name}{/}!`);
      break;
    }
    G.bag.jar += 5;
    yield* S.say('Take these as well. Five empty jars. Weaken a monster first, then throw.', FACE);
    yield* S.say('Carl got 5 {blue}CONTAINMENT JARS{/}!');
    yield* S.say('Thanks, Old Face. I\'ll use them like a normal human would.', CARL);
    yield* S.say('Of course. A normal human.', '...', 'Spoilers.', FACE);
    yield* humanArrives();
  } else if (!f.beatHuman) {
    yield* S.say('The focus-tested one is here. Be careful. He has had notes.', FACE);
  } else {
    yield* S.say(S.pick([
      'Weaken them, then jar them. Like backups.',
      'I am exactly four shades of green. Always have been. Don\'t look it up.',
      'Your parents? Still in transit, I\'m afraid. The tracking number changes every time I look.',
      'The mall is outside time. The parking lot is just outside the mall. Think about it. Or don\'t.',
    ]), FACE);
  }
};

function* humanArrives() {
  yield 20;
  S.sfx('exclaim');
  const pl = S.world.player;
  const hu = new S.Actor({ id: 'human', name: 'HU-MAN', sprite: 'human', x: pl.x, y: 14, dir: 'down' });
  S.world.actors.push(hu);
  yield* S.say('HOLD IT!', HUMAN);
  while (hu.y < pl.y - 1) { hu.go('down', 1, true); yield () => !hu.moving; }
  pl.dir = 'up';
  yield* S.say('BY THE POWER OF NEVADA!', 'I am {red}HU-MAN{/}. Carl, but focus-tested.', 'Square jaw. Sunglasses. Ninety-two percent approval with ages 18 to 34.', HUMAN);
  yield* S.say('...Is that what I look like?', CARL);
  yield* S.say('It\'s what you SHOULD look like. The Sequel Committee had notes.', HUMAN);
  const mine = G.species[COUNTER[F().starter]].name;
  yield* S.say(`I also got a jar. I picked {red}${mine}{/}. It's statistically better than yours.`, 'Let\'s settle this. Battle me!', HUMAN);
  G.humanBattle();
}


// the rival fight (again from his spot in the lot if Carl lost)
G.humanBattle = () => G.startBattle({ trainer: {
  name: 'HU-MAN', party: [[COUNTER[F().starter], 3]],
  win: ['Impossible. I tested so well.', 'BE YOURSELF, Carl. ...Wait, that\'s my line. That\'s MY killphrase!'],
  lose: ['As expected. The data never lies.'],
} }, result => {
  if (result !== 'win') {
    G.healAll(); G.backToWorld('lot', 11, 18, 'down');
    S.run(function* () { yield 24; yield* S.say('Carl took a nap in the A.S.S.', 'HU-MAN is still out there, being approved of. Talk to him for a rematch.'); });
    return;
  }
  F().beatHuman = true;
  G.backToWorld();
  S.run(function* () {
    yield 30;
    const h = S.world.actors.find(a => a.id === 'human');
    yield* S.say('I\'ll be back. With a sequel.', HUMAN);
    if (h) { for (let i = 0; i < 3; i++) { h.go('up', 2, true); yield () => !h.moving; } S.world.actors = S.world.actors.filter(a => a !== h); }
    yield* S.say('Carl! That was amazing. You were very... yourself.', 'Let\'s go {green}contain some monsters{/} in the dry scrub. Weaken them first, then throw a jar!', BOO);
  });
});
G.humanRematch = function* () {
  yield* S.say(S.pick(['Back for more data, Carl?', 'My focus group says you\'re due for a loss. Again.']), HUMAN);
  const i = yield* S.ask('Battle HU-MAN?', ['YES', 'NO']);
  if (i === 0) G.humanBattle();
};

G.shipTalk = function* () {
  yield* S.say('The {green}A.S.S.{/} (Alien StarShip).', 'Carl\'s home, office and only possession.');
  if (!G.party.length) { yield* S.say('No time for naps, Carl. Old Face is waiting.', BOO); return; }
  const i = yield* S.ask('Take a nap inside?', ['YES', 'NO']);
  if (i !== 0) return;
  yield* S.wipe('fade', () => G.healAll(), { out: 30 });
  S.sfx('heal');
  yield* S.say('Carl took a nap in the A.S.S.', 'Your monsters are fully rested!');
};

function* demoEnd() {
  yield 40;
  F().demoDone = true;
  yield* S.say('Two monsters contained! Carl, you\'re a natural.', 'A natural human. Obviously.', BOO);
  yield* S.say('That\'s the end of this little demo!', 'Leafy and Claude are building the rest: the Mall of the Future, the Litter Box, Below Nevada...', 'Keep exploring as long as you like ♥', BOO);
}

// ---------------------------------------------------------------- the overworld scene
let banner = null, lastMap = null;
const overworld = {
  t: 0,
  update() {
    this.t++;
    S.world.update();
    if (S.world.map !== lastMap) { lastMap = S.world.map; banner = { text: S.world.map.name, t: 0 }; }
    if (banner && ++banner.t > 170) banner = null;
    if (pad.mode !== 'home') padKeys();
    else if (!S.busy() && S.input.pressed('start')) { S.input.consume('start'); S.run(startMenu); }
  },
  draw(top, bot) {
    S.world.draw(top);
    if (banner) drawBanner(top);
    drawPad(bot, this.t);
  },
};
function drawBanner(g) {
  const t = banner.t, w = S.font.width(banner.text) + 24;
  const y = t < 14 ? -24 + t * 2 : t > 150 ? 4 - (t - 150) * 2 : 4;
  S.ui.box(g, 4, y, w, 22, { r: 3, bands: ['#3a2230', '#c0705a', '#eab88a'], fill: '#f8e2c8' });
  g.text(banner.text, 16, y + 7, { color: '#5a2a2a', shadow: '#eac0a0' });
}

function* startMenu() {
  const opts = ['PARTY', 'BAG', 'SAVE', 'SOUND: ' + (S.audio.muted ? 'OFF' : 'ON'), 'CLOSE'];
  const i = yield* S.ask(null, opts, { cancel: 4 });
  if (i === 0) yield* openPad('party');
  if (i === 1) yield* openPad('bag');
  if (i === 2) yield* saveFlow();
  if (i === 3) S.audio.setMute(!S.audio.muted);
}
function* saveFlow() {
  const i = yield* S.ask('Save your progress?', ['YES', 'NO']);
  if (i === 0) { const ok = G.saveGame(); S.sfx(ok ? 'save' : 'cancel'); yield* S.say(ok ? 'Your progress was saved!' : 'Saving isn\'t available in this browser.'); }
}

// ---------------------------------------------------------------- Boo Pad (bottom screen)
// modes: home (Boo + goal + buttons), party (monsters; tap for info, or to use an item), bag
const pad = { mode: 'home', sel: 0, use: null };
function* openPad(mode) {
  if (mode === 'party' && !G.party.length) { yield* S.say('Carl doesn\'t have any monsters yet.', BOO); return; }
  pad.mode = mode; pad.sel = 0; pad.use = null;
  yield () => pad.mode === 'home';
}
function padPick(i) {
  if (S.ui.blocking()) return;
  if (pad.mode === 'party') {
    if (i >= G.party.length) { S.sfx('cancel'); pad.mode = pad.use ? 'bag' : 'home'; pad.use = null; pad.sel = 0; return; }
    const m = G.party[i];
    S.sfx('select');
    if (pad.use) {
      const it = G.items[pad.use];
      if (m.hp >= m.maxhp || m.hp <= 0) { S.run(function* () { yield* S.say(m.hp <= 0 ? `${m.name} is out of potential. A pill won't fix that. A nap will.` : `${m.name} is already at full HP.`); }, { block: false }); return; }
      G.bag[pad.use]--; m.hp = Math.min(m.maxhp, m.hp + it.heal); S.sfx('heal');
      if (!G.bag[pad.use]) { pad.use = null; pad.mode = 'bag'; }
      return;
    }
    const s = G.species[m.sp];
    S.run(function* () {
      yield* S.say(`{green}${m.name}{/}  Lv.${m.lv}  ${s.types[0].toUpperCase()}  HP ${m.hp}/${m.maxhp}`,
        `ATK ${m.atk}   DEF ${m.def}   SPD ${m.spd}`, s.dex);
    }, { block: false });
  } else if (pad.mode === 'bag') {
    const list = Object.keys(G.items).filter(k => G.bag[k] > 0);
    if (i >= list.length) { S.sfx('cancel'); pad.mode = 'home'; return; }
    S.sfx('select');
    const k = list[i];
    if (G.items[k].catch) { S.run(function* () { yield* S.say('Containment Jars are for wild monsters, during battle.', 'Throwing one at a cactus would be weird.'); }, { block: false }); return; }
    if (!G.party.length) { S.run(function* () { yield* S.say('There\'s nobody to give it to.'); }, { block: false }); return; }
    pad.use = k; pad.mode = 'party'; pad.sel = 0;
  }
}
function padKeys() {
  const I = S.input;
  if (S.ui.blocking()) return;
  const n = (pad.mode === 'party' ? G.party.length : Object.keys(G.items).filter(k => G.bag[k] > 0).length) + 1;
  const step = pad.mode === 'party' ? { up: -2, down: 2, left: -1, right: 1 } : { up: -1, down: 1, left: -1, right: 1 };
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
  const title = pad.mode === 'party' ? (pad.use ? 'USE ' + G.items[pad.use].short + ' ON...' : 'PARTY') : pad.mode === 'bag' ? 'BAG' : S.world.map.name;
  g.text(title, 8, 5, { color: 'white', shadow: '#14101a' });
  const d = new Date(), hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  g.text(hh + (Math.floor(t / 30) % 2 ? ' ' : ':') + mm, 248, 5, { color: 'white', align: 'right', shadow: '#14101a' });

  if (pad.mode === 'party') {
    G.party.forEach((m, i) => {
      const x = 6 + (i % 2) * 124, y = 24 + Math.floor(i / 2) * 50;
      if (G.drawMonSlot(g, x, y, 120, 46, m, { selected: i === pad.sel })) { pad.sel = i; padPick(i); }
    });
    if (S.ui.button(g, 6, 172, 244, 18, 'BACK', 'gray', { selected: pad.sel === G.party.length, r: 4, labelDy: 1 })) padPick(G.party.length);
    return;
  }
  if (pad.mode === 'bag') {
    const list = Object.keys(G.items).filter(k => G.bag[k] > 0);
    list.forEach((k, i) => {
      const it = G.items[k];
      const draw = (gg, bx, by, w, h) => {
        gg.spr(k === 'jar' ? 'jar' : 'pill', 0, bx + 18, by + h - 10);
        gg.text(it.name, bx + 34, by + 9, { color: 'white', shadow: '#5a3a1f' });
        gg.text('x' + G.bag[k], bx + w - 10, by + 9, { color: 'white', align: 'right', shadow: '#5a3a1f' });
        S.font.wrap(it.desc, w - 44).slice(0, 2).forEach((ln, j) => gg.text(ln, bx + 34, by + 22 + j * 11, { color: 'dark', shadow: false }));
      };
      if (S.ui.button(g, 6, 26 + i * 62, 244, 56, null, 'yellow', { selected: i === pad.sel, draw })) { pad.sel = i; padPick(i); }
    });
    if (!list.length) g.text('The bag is empty.', 128, 80, { align: 'center', color: 'white' });
    if (S.ui.button(g, 6, 160, 244, 28, 'BACK', 'gray', { selected: pad.sel === list.length })) padPick(list.length);
    return;
  }

  // home: Boo with the current goal in a speech bubble
  S.ui.box(g, 8, 26, 240, 58, 'panel');
  S.ui.box(g, 16, 33, 40, 44, { r: 3, bands: ['#3e4a62'], fill: '#e8f4d8' });
  g.spr('boo', 'idle' + (Math.floor(t / 24) % 2), 36, 71 + Math.round(Math.sin(t / 20) * 2));
  g.text('BOO', 64, 33, { color: 'green' });
  const lines = S.font.wrap(G.goal(), 172);
  lines.slice(0, 3).forEach((ln, i) => g.text(ln, 64, 46 + i * 11, { color: 'normal' }));

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
  if (S.ui.button(g, 8, 134, 76, 50, 'PARTY', 'green') && !busy) S.run(() => openPad('party'));
  if (S.ui.button(g, 90, 134, 76, 50, 'BAG', 'yellow') && !busy) S.run(() => openPad('bag'));
  if (S.ui.button(g, 172, 134, 76, 50, 'SAVE', 'blue') && !busy) S.run(saveFlow);
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
const title = {
  t: 0, sel: 0,
  enter() { this.t = 0; this.sel = G.hasSave() ? 1 : 0; S.music('crackyTitle'); logo = logo || makeLogo('CRACKY', '#1c4644', '#47a283', '#b6ecbc'); },
  update() {
    this.t++;
    if (S.busy()) return;
    const I = S.input;
    if (G.hasSave() && (I.repeat('up') || I.repeat('down'))) { this.sel = 1 - this.sel; S.sfx('cursor'); }
    if (I.pressed('a') || I.pressed('start')) { I.consume('a', 'start'); begin(this.sel === 1 ? 'continue' : 'new'); }
  },
  draw(top, bot) {
    const t = this.t;
    // dusk sky, stars, mesas
    ['#2a2440', '#3a2a50', '#58325c', '#7a3e62', '#a85068', '#d0706a', '#f0a07a'].forEach((c, i) => top.rect(0, i * 20, 256, i === 6 ? 24 : 20, c));
    for (let i = 0; i < 30; i++) { const x = (i * 83) % 256, y = (i * 37) % 70; if ((t / 30 + i) % 7 > 1) top.px(x, y, i % 3 ? '#f2dcff' : '#ffffff'); }
    const mesa = (x, w, h, c) => { top.rect(x, 144 - h, w, h, c); top.rect(x + 3, 142 - h, w - 6, 2, c); };
    mesa(-6, 70, 22, '#7a3e5a'); mesa(170, 90, 30, '#6a3454'); mesa(96, 40, 12, '#7a3e5a');
    for (let x = 0; x < 16; x++) for (let y = 0; y < 3; y++) top.spr('lot_tiles', ['sand0', 'sand1', 'sand3', 'sand4'][Math.floor(S.hash(x, y) * 4)], x * 16, 144 + y * 16);
    top.spr('ship', 0, 150, 180);
    top.spr('cactus', 0, 18, 176);
    // cast
    const sh = (x, y, w) => top.alpha(0.28, () => top.rect(x - w, y - 1, w * 2, 3, '#3a1a2a'));
    sh(118, 173, 6); top.spr('carl', 'down0', 118, 174);
    sh(96, 172, 4); top.spr('boo', 'idle' + (Math.floor(t / 24) % 2), 96, 168 + Math.round(Math.sin(t / 20) * 2));
    // logo
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

function begin(mode) {
  S.sfx('select');
  S.ui.transition('fade', () => {
    setupWorld();
    if (mode === 'continue' && G.loadGame()) {
      S.go(overworld);
      S.world.load(S.state.map, S.state.x, S.state.y, S.state.dir);
    } else {
      G.newGame();
      S.go(overworld);
      S.world.load('lot', 11, 18, 'down');
      S.run(intro);
    }
  }, { out: 24 });
}
function* intro() {
  yield 40;
  yield* S.say('Carl. Carl! Wake up.', 'You fell asleep on the ramp again.', BOO);
  yield* S.say('I wasn\'t asleep. I was doing a normal human thing. With my eyes closed.', CARL);
  yield* S.say('Sure. {green}Old Face{/} is waiting right over there.', 'He said something about jars. And monsters. And "the connections."', BOO);
  yield* S.say('Move with the {blue}arrow keys{/}. Talk with {blue}Z{/}. Hold {blue}X{/} to run.',
    'The {blue}bottom screen{/} is a touch screen. Click it with your mouse! {blue}Enter{/} opens the menu.');
}

// ---------------------------------------------------------------- boot
addEventListener('keydown', e => { if (e.code === 'KeyM') S.audio.setMute(!S.audio.muted); });
S.boot(() => {
  // dev shortcuts:  ?map=lot&x=11&y=18   ?starter=lamb   ?battle=rat   ?trainer
  if (S.params.get('map') || S.params.get('battle') || S.params.has('trainer') || S.params.has('rival')) {
    setupWorld(); G.newGame();
    const st = S.params.get('starter') || (S.params.get('battle') || S.params.has('trainer') || S.params.has('rival') ? 'lamb' : null);
    if (st) { G.party.push(G.makeMon(st, 5)); F().starter = st; F().beatHuman = !S.params.has('trainer'); G.bag.jar = 5; G.bag.pill = 3; G.caught.add(st); }
    if (S.params.get('party')) for (const sp of S.params.get('party').split(',')) { G.party.push(G.makeMon(sp, 4)); G.caught.add(sp); }
    S.go(overworld);
    S.world.load(S.params.get('map') || 'lot', +(S.params.get('x') || 11), +(S.params.get('y') || 18), S.params.get('dir') || 'down');
    if (S.params.get('battle')) G.startBattle({ wild: [S.params.get('battle'), 3] }, afterBattle);
    if (S.params.has('rival')) { F().beatHuman = false; S.world.actors.push(new S.Actor({ id: 'human', sprite: 'human', x: 11, y: 16, dir: 'down' })); G.humanBattle(); }
    else if (S.params.has('trainer')) G.startBattle({ trainer: { name: 'HU-MAN', party: [['mite', 5], ['spam', 4]], intro: 'BY THE POWER OF NEVADA!' } }, afterBattle);
  } else S.go(title);
});
})();
