// Sprout Town — game entry point: title screen, overworld + bottom-screen "Sprout Pad", story flags.
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;

// ---------------------------------------------------------------- save data
G.party = [];
G.newGame = () => {
  S.state = { flags: {}, party: [G.makeMon('sprig', 5)] };
  G.party = S.state.party;
};
G.saveGame = () => {
  const p = S.world.player;
  Object.assign(S.state, { map: S.world.map.name, x: p.x, y: p.y, dir: p.dir, party: G.party });
  return S.save();
};
G.loadGame = () => {
  if (!S.load() || !S.state.party) return false;
  G.party = S.state.party;
  return true;
};
G.hasSave = () => { try { return !!localStorage.getItem('sprout-save'); } catch (e) { return false; } };

// ---------------------------------------------------------------- world setup
function setupWorld() {
  S.world.player = new S.Actor({ id: 'player', sprite: 'player' });
  S.world.follower = new S.Actor({
    id: 'sprig', name: 'Sprig', sprite: 'sprig_ow', shadowW: 4,
    talk: function* (a) {
      a.hop = { t: 0, d: 14, h: 5 }; S.sfx('pop');
      const m = G.party[0];
      yield* S.say(S.pick([
        'Sprig wiggles its leafy ears happily!',
        'Sprig is sniffing the air. Something smells green.',
        'Sprig looks up at you and chirps!',
        m.hp < m.maxhp ? 'Sprig looks a little tired...' : 'Sprig is full of energy!',
      ]));
    },
  });
  S.world.encounter = (w, cell) => {
    if (!w.map.encounters || S.params.has('noenc')) return;
    if (Math.random() < 0.12) G.startBattle('puffmoth', S.rand(2, 4));
  };
}
G.backToWorld = (map, x, y, dir) => {
  S.go(overworld);
  if (map) S.world.load(map, x, y, dir);
  else S.music(S.world.map.music);
};

// ---------------------------------------------------------------- story
G.goal = () => {
  const f = F();
  if (!f.questGiven && !f.wonBattle) return 'Find {green}Grandpa Moss{/} by the pond.';
  if (!f.wonBattle) return 'Win a battle in the {green}tall grass{/} up north.';
  if (!f.badge) return 'Tell {green}Grandpa Moss{/} how it went!';
  return 'Demo complete! Thanks for playing ♥';
};
G.mossTalk = function* () {
  const f = F(), name = { name: 'Grandpa Moss' };
  if (!f.questGiven && !f.wonBattle) {
    f.questGiven = true;
    yield* S.say('Ah, good morning! And Sprig too, I see.',
      'I\'ve been watching the {blue}Puffmoths{/} flutter about in the tall grass up north.',
      'Why don\'t you and Sprig try a friendly battle with one?',
      'Walk through the {green}tall grass{/} past the hedge, then come tell me how it went!', name);
  } else if (!f.wonBattle) {
    yield* S.say(S.pick([
      'The tall grass is just north, past the hedge. Puffmoths love it there.',
      'If Sprig gets tired, you can always rest at home.',
      'Try {blue}DEWDROP{/} on a Puffmoth. Wet fluff is heavy fluff!',
    ]), name);
  } else if (!f.badge) {
    yield* S.say('You won a battle? Splendid, splendid!', 'Sprig looks prouder than a sunflower.', 'Here. I want you two to have this.', name);
    S.sfx('levelup');
    yield* S.say('You received the {green}LEAF BADGE{/}!');
    f.badge = true;
    yield* S.say('That\'s the whole demo for now!', 'Thanks for playing {green}Sprout Town{/}. More adventures are on the way ♥', name);
  } else {
    yield* S.say(S.pick([
      'That badge suits you.',
      'In my day we battled with nothing but a stick and a good attitude.',
      'The pond is lovely this time of day.',
    ]), name);
  }
};

// ---------------------------------------------------------------- the overworld scene
let banner = null, lastMap = null;
const overworld = {
  t: 0,
  update() {
    this.t++;
    S.world.update();
    if (S.world.map !== lastMap) { lastMap = S.world.map; banner = { text: S.world.map.name, t: 0 }; }
    if (banner && ++banner.t > 170) banner = null;
    if (!S.busy() && S.input.pressed('start')) { S.input.consume('start'); S.run(startMenu); }
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
  S.ui.box(g, 4, y, w, 22, { r: 3, bands: ['#3a2a22', '#c08a50', '#e8b878'], fill: '#f8e4c0' });
  g.text(banner.text, 16, y + 7, { color: '#5a3a22', shadow: '#e8c898' });
}

function* startMenu() {
  const opts = ['SPRIG', 'SAVE', 'SOUND: ' + (S.audio.muted ? 'OFF' : 'ON'), 'CLOSE'];
  const i = yield* S.ask(null, opts, { cancel: 3 });
  if (i === 0) yield* partnerInfo();
  if (i === 1) yield* saveFlow();
  if (i === 2) S.audio.setMute(!S.audio.muted);
}
function* partnerInfo() {
  const m = G.party[0];
  yield* S.say(`{green}SPRIG{/}   Lv.${m.lv}   HP ${m.hp}/${m.maxhp}`, `ATK ${m.atk}   DEF ${m.def}   SPD ${m.spd}`, 'A leafy little creature that loves sunshine and naps.');
}
function* saveFlow() {
  const i = yield* S.ask('Save your progress?', ['YES', 'NO']);
  if (i === 0) { const ok = G.saveGame(); S.sfx(ok ? 'save' : 'cancel'); yield* S.say(ok ? 'Your progress was saved!' : 'Saving isn\'t available in this browser.'); }
}

// bottom screen: location + clock bar, partner card, current goal, touch buttons
function drawPad(g, t) {
  G.drawPattern(g, '#cfe1b9', '#c2d8aa', t);
  g.rect(0, 0, 256, 18, '#4f6a3a'); g.rect(0, 18, 256, 1, '#2f4028');
  g.text(S.world.map.name, 8, 5, { color: 'white', shadow: '#2f4028' });
  const d = new Date(), hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  g.text(hh + (Math.floor(t / 30) % 2 ? ' ' : ':') + mm, 248, 5, { color: 'white', align: 'right', shadow: '#2f4028' });
  if (S.ui.button(g, 0, 0, 0, 0, null)) {}  // (keeps tap state tidy)

  // partner card
  const m = G.party[0];
  S.ui.box(g, 8, 26, 240, 50, 'panel');
  S.ui.box(g, 16, 33, 36, 36, { r: 3, bands: ['#3e4a62'], fill: '#e8f4d8' });
  g.spr('sprig_ow', Math.floor(t / 20) % 2 ? 'down1' : 'down0', 34, 63);
  g.text('SPRIG', 62, 34, { color: 'dark' });
  g.text('Lv' + m.lv, 160, 34, { color: 'dark', align: 'right' });
  g.rect(62, 50, 98, 7, '#3a3a4a'); g.rect(63, 51, 96, 5, '#5a5a6a');
  const f = m.hp / m.maxhp, fw = Math.ceil(96 * f);
  g.rect(63, 51, fw, 5, f > 0.5 ? '#38b868' : f > 0.2 ? '#d8a020' : '#d83838');
  g.rect(63, 52, fw, 1, f > 0.5 ? '#78e898' : f > 0.2 ? '#f8e070' : '#f88888');
  g.text(`${m.hp}/${m.maxhp}`, 160, 59, { color: 'dark', align: 'right' });
  // badge case
  g.text('BADGE', 206, 34, { color: 'gray', align: 'center' });
  S.ui.box(g, 192, 46, 28, 22, { r: 3, bands: ['#8a8aa8'], fill: '#e8e8f0' });
  if (F().badge) drawBadge(g, 206, 57, t);

  // goal
  S.ui.box(g, 8, 82, 240, 42, 'panel');
  g.text('GOAL', 18, 88, { color: 'blue' });
  S.font.wrap(G.goal(), 210).slice(0, 2).forEach((ln, i) => g.text(ln, 18, 100 + i * 12 - (S.font.wrap(G.goal(), 210).length > 1 ? 4 : 0), { color: 'normal' }));

  // buttons
  const busy = S.busy();
  if (S.ui.button(g, 8, 134, 76, 50, 'SPRIG', 'green') && !busy) S.run(partnerInfo);
  if (S.ui.button(g, 90, 134, 76, 50, 'SAVE', 'blue') && !busy) S.run(saveFlow);
  if (S.ui.button(g, 172, 134, 76, 50, S.audio.muted ? 'SOUND OFF' : 'SOUND ON', 'yellow') && !busy) { S.audio.setMute(!S.audio.muted); S.sfx('select'); }
}
function drawBadge(g, cx, cy, t) {
  // a little leaf badge, with a glint
  const rows = ['...oo...', '..oLlo..', '.oLlllo.', 'oLllllgo', 'oLlllggo', '.ollggo.', '..oggo..', '...oo...'];
  const col = { o: '#1f3a2a', L: '#c6ec8c', l: '#76c25e', g: '#3f8a4e' };
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') g.px(cx - 4 + x, cy - 4 + y, col[c]); }));
  if (Math.floor(t / 8) % 20 === 0) g.px(cx - 1, cy - 2, '#ffffff');
}

// ---------------------------------------------------------------- title screen
let logo = null;
function makeLogo() {
  const text = 'SPROUT TOWN', w = S.font.width(text) + 4, h = 13;
  const c = S.canvas(w, h), x = c.getContext('2d');
  const wrap = { img: (im, px, py) => x.drawImage(im, px, py) };
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, 2], [1, 2], [-1, 2]]) S.font.draw(wrap, text, 2 + dx, 1 + dy, { color: '#1f3a2a', shadow: false });
  S.font.draw(wrap, text, 2, 1, { color: '#e9f5db', shadow: false });
  x.save(); x.beginPath(); x.rect(0, 5, w, h); x.clip();
  S.font.draw(wrap, text, 2, 1, { color: '#97d070', shadow: false });
  x.restore();
  const big = S.canvas(w * 2, h * 2), bx = big.getContext('2d');
  bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, w * 2, h * 2);
  return big;
}
const title = {
  t: 0, sel: 0,
  enter() { this.t = 0; this.sel = G.hasSave() ? 1 : 0; S.music('title'); logo = logo || makeLogo(); },
  update() {
    this.t++;
    if (S.busy()) return;
    const I = S.input;
    if (G.hasSave() && (I.repeat('up') || I.repeat('down'))) { this.sel = 1 - this.sel; S.sfx('cursor'); }
    if (I.pressed('a') || I.pressed('start')) { I.consume('a', 'start'); begin(this.sel === 1 ? 'continue' : 'new'); }
  },
  draw(top, bot) {
    const t = this.t;
    // sky + clouds + hills
    ['#7cc0f0', '#8cc8f2', '#9cd0f4', '#acd8f6', '#bce0f8', '#cce8fa', '#dcf0fc'].forEach((c, i) => top.rect(0, i * 20, 256, 20, c));
    for (const [x, y, s] of [[40, 70, 1], [170, 58, 1.4], [250, 80, 0.9]]) {
      const xx = ((x + t / 12) % 300) - 22;
      top.ellipse(xx, y + 4, Math.round(13 * s), 3, '#f4fbff');
      top.ellipse(xx + Math.round(6 * s), y + 1, Math.round(8 * s), 4, '#ffffff');
      top.ellipse(xx - Math.round(6 * s), y + 2, Math.round(6 * s), 3, '#ffffff');
    }
    top.ellipse(60, 150, 90, 34, 'olive'); top.ellipse(210, 156, 100, 36, 'palm');
    top.ellipse(60, 152, 88, 32, 'tea'); top.ellipse(210, 158, 98, 34, 'olive');
    // ground made of real game tiles
    for (let x = 0; x < 16; x++) for (let y = 0; y < 3; y++) {
      const tile = y === 0 && (x === 3 || x === 12) ? 'flower' + (Math.floor(t / 40) % 2) : ['grass0', 'grass1', 'grass2', 'grass3'][Math.floor(S.hash(x, y) * 4)];
      top.spr('tiles', tile, x * 16, 144 + y * 16);
    }
    top.spr('tree', 0, -8, 160); top.spr('tree', 0, 228, 164);
    // cast
    const sh = (x, y, w) => top.alpha(0.28, () => top.rect(x - w, y - 1, w * 2, 3, '#10202a'));
    sh(112, 173, 6); top.spr('player', 'down0', 112, 174);
    const hop = Math.floor(t / 24) % 4 === 0 ? 3 : 0;
    sh(136, 173, 5); top.spr('sprig_ow', 'down0', 136, 175 - hop);
    sh(196, 170, 4); top.spr('boo', 'idle' + (Math.floor(t / 24) % 2), 196, 150 + Math.round(Math.sin(t / 20) * 3));
    // logo
    const ly = 22 + Math.round(Math.sin(t / 40) * 2);
    top.img(logo, 128 - logo.width / 2, ly);
    top.text('a Sprout Engine demo', 128, ly + 32, { color: '#3a5a8a', shadow: '#d8ecfa', align: 'center' });

    // bottom: menu
    G.drawPattern(bot, '#cfe1b9', '#c2d8aa', t);
    if (S.ui.button(bot, 40, 36, 176, 44, 'NEW GAME', 'green', { selected: this.sel === 0 }) && !S.busy()) begin('new');
    const hs = G.hasSave();
    if (S.ui.button(bot, 40, 92, 176, 44, 'CONTINUE', 'blue', { selected: this.sel === 1, disabled: !hs }) && !S.busy()) begin('continue');
    if (Math.floor(t / 30) % 2) bot.text('Touch a button or press START', 128, 160, { align: 'center', color: '#4f6a3a', shadow: '#e9f5db' });
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
      S.world.load('home', 1, 4, 'down');
      S.run(intro);
    }
  }, { out: 24 });
}
function* intro() {
  yield 40;
  yield* S.say('...', 'Something leafy is nudging your hand.', 'It\'s {green}Sprig{/}! Morning already?');
  yield* S.say('{green}Welcome to Sprout Town!{/}', 'Move with the {blue}arrow keys{/}. Talk and confirm with {blue}Z{/}. Hold {blue}X{/} to run.',
    'The {blue}bottom screen{/} is a touch screen. Click it with your mouse!', 'Press {blue}Enter{/} for the menu. Now, let\'s head outside!');
}

// ---------------------------------------------------------------- boot
addEventListener('keydown', e => { if (e.code === 'KeyM') S.audio.setMute(!S.audio.muted); });
S.boot(() => {
  // dev shortcuts:  ?map=town&x=13&y=16   ?battle=puffmoth
  if (S.params.get('map') || S.params.get('battle')) {
    setupWorld(); G.newGame();
    S.state.flags.questGiven = S.params.has('quest');
    S.go(overworld);
    S.world.load(S.params.get('map') || 'town', +(S.params.get('x') || 13), +(S.params.get('y') || 16), S.params.get('dir') || 'down');
    if (S.params.get('battle')) G.startBattle(S.params.get('battle'), 3);
  } else S.go(title);
});
})();
