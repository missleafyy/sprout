// Cracky — the hatch in the Lot (final HU-MAN fight), Below Nevada B1 + B2, the Head of Containment,
// the ending, the credits, and THE BEHOLDEN (post-game).
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const CARL = G.CARL, BOO = G.BOO, HUMAN = G.HUMAN;
const { grid, put, box, rows } = G;
const HEAD = { name: 'Head of Containment', nameColor: 'red' };
const SUIT = 'White Suit';
const PILOT = { name: 'Pilot X', nameColor: 'red' };

// ---------------------------------------------------------------- the hatch + HU-MAN, one last time
G.hatchTalk = function* () {
  const n = G.stamps().length;
  if (n < 4) {
    yield* S.say('A metal hatch, half-buried in the sand.', `Four stamp-shaped slots. ${n} of them glow.`);
    return;
  }
  if (!F().humanAtHatch) {
    F().humanAtHatch = true;
    S.sfx('exclaim');
    const pl = S.world.player;
    const hu = new S.Actor({ id: 'humanHatch', name: 'HU-MAN', sprite: 'human', x: 6, y: 9, dir: 'left' });
    S.world.actors.push(hu);
    G.bang(hu);
    yield* S.say('BY THE POWER OF NEVADA!', HUMAN);
    while (Math.abs(hu.x - pl.x) + Math.abs(hu.y - pl.y) > 1 && hu.x > 3) { hu.go('left', 1, true); yield () => !hu.moving; }
    pl.faceToward(hu);
    yield* S.say('Four stamps. The Committee said you\'d never get four.', 'The Committee is also never wrong. So this is awkward for them.', HUMAN);
    yield* S.say('Let me through, HU-MAN. My parents\' package is down there.', CARL);
    yield* S.say('Your "parents." Do you even remember them?', 'I tested better with audiences who didn\'t ask that question.', HUMAN);
    yield* S.say('...No. I don\'t remember them.', 'That\'s why I have to deliver it.', CARL);
    yield* S.say('...', 'That\'s a terrible reason. It\'s also the best one I\'ve ever heard.', 'BATTLE ME, CARL. One last time. Full budget.', HUMAN);
  } else yield* S.say('Back again? The sequel always gets a rematch.', HUMAN);
  yield* G.humanFinal();
};
G.humanFinal = function* () {
  const ace = G.species[G.COUNTER[F().starter]].evo[0];
  yield* G.battle({ music: 'final', bg: 'desert', trainer: {
    name: 'HU-MAN', money: 2000, party: [['pizzapigeon', 26], ['phishking', 26], ['saguaro', 27], [ace, 29]],
    win: ['...I lost. To you. The original.', 'The focus group is going to hate this.'],
    lose: ['Nobody clips that. Ever.'],
  } }, result => {
    if (result !== 'win') return G.blackout();
    F().beatHumanFinal = true;
    G.backToWorld();
    S.run(function* () {
      yield 24;
      const h = S.world.actors.find(a => a.id === 'humanHatch');
      yield* S.say('You know what, Carl? I was made to be a better you.', 'Turns out the job was already taken.', HUMAN);
      yield* S.say('Be yourself.', '...That\'s my killphrase. I\'m allowed to say it this once.', HUMAN);
      if (h) yield* G.walkOff(h, 'right', 8, 2);
      S.sfx('door');
      yield* S.say('*KA-CHUNK*', 'The hatch hisses open. A ladder goes down into the dark.');
      yield* S.say('Below Nevada. Carl... you sure?', BOO);
      yield* S.say('No. But I\'m a courier. Couriers deliver.', CARL);
    });
  });
};

// ---------------------------------------------------------------- Below Nevada
const BL = {
  '.': 'bn_floor', ',': 'bn_floorPlain', 'A': 'bn_wallA', 'B': 'bn_wallB', 'Y': 'bn_wallW', '#': 'bn_void',
  '/': { terrain: 'bn_stripe', under: 'bn_floor' }, '%': { terrain: 'bn_grate', under: 'bn_floor' },
  't': { prop: 'bn_tube' }, 'u': { prop: 'bn_tube2' }, 'c': { prop: 'bn_console' }, 'r': { prop: 'bn_rack' },
  'x': { prop: 'bn_crate' }, 'e': { prop: 'bn_elevator' }, 'D': { prop: 'bn_bossdoor' },
  'G': { prop: 'bn_generator', terrain: 'bn_grate', under: 'bn_floor' }, 'n': { prop: 'bn_banner', under: 'bn_wallB' },
  'h': { prop: 'bn_chair' }, 'H': { prop: 'bn_hatchOpen' },
};
const WILD = [['drone', 30, 26, 29], ['sheet', 25, 26, 29], ['grey', 20, 26, 29], ['wardrone', 12, 28, 30], ['pizzapigeon', 13, 26, 28]];
const grunt = (id, x, y, dir, sight, party, intro, win, after) => G.trainerActor({ id, sprite: 'suit', x, y, dir }, {
  id, name: SUIT, sight, party, intro, win, after, bg: 'facility' });

const b1 = grid(22, 14, '.');
box(b1, 0, 0, 22, 2, 'A'); box(b1, 0, 2, 22, 1, 'B');
put(b1, 2, 2, 'nn'); put(b1, 7, 2, 'Y'); put(b1, 14, 2, 'Y'); put(b1, 19, 2, 'ee');
put(b1, 9, 3, 'HH'); put(b1, 9, 4, 'HH');
box(b1, 2, 6, 6, 4, '%'); put(b1, 3, 7, 'GGGG'); put(b1, 3, 8, 'GGGG');
put(b1, 11, 7, 'cc'); put(b1, 11, 8, 'h');
for (let y = 4; y <= 10; y++) { put(b1, 0, y, y % 2 ? 't' : 'u'); put(b1, 21, y, y % 2 ? 'u' : 't'); }
for (let y = 3; y <= 9; y++) put(b1, 15, y, 'x');
put(b1, 16, 3, 'r'); put(b1, 21, 3, 'r');
box(b1, 0, 13, 22, 1, '/');
S.map('below1', {
  name: 'Below Nevada B1', music: 'below', base: 'bn_floor', bg: '#0c0c12', battleBg: 'facility', legend: BL, rows: rows(b1),
  encounters: 'floor', wild: WILD, rate: 0.07,
  boo: ['It smells like a hospital and a server room had a baby.', 'Carl... you escaped from here once. Do you remember any of it?'],
  actors: [
    grunt('w1', 13, 11, 'left', 4, [['drone', 27], ['sheet', 27]], ['Halt! Unauthorized human!', '...Wait. You have four stamps. Ugh. Then it\'s a battle. Rules are rules.'],
      'I\'ll need you to file a form about this loss.', 'Form 27-B. In triplicate. The third copy is for the Sequel Committee.'),
    grunt('w2', 18, 5, 'down', 5, [['grey', 28], ['wardrone', 28]], ['Containment protocol 9: battle anything green.'],
      'Protocol 10: file a form.', 'The Head is on B2. Behind the big door. He loves the big door.'),
    { id: 'pilotb1', name: 'Pilot X', sprite: 'pilotx', x: 8, y: 11, dir: 'up', if: () => !F().beatHead,
      talk: function* () {
        yield* S.say('Little brother. You made it down.', PILOT);
        yield* S.say('What\'s in the package, Pilot X?', CARL);
        yield* S.say('...', 'Not spoilers. Not this time. I honestly don\'t know.', 'But the last time I saw this facility, the Head was "containing" something precious. Go find out.', PILOT);
        G.bag.pillmax += 2; G.bag.tape += 1; S.sfx('levelup');
        yield* S.say('Pilot X gave Carl 2 {blue}PILLS MAX{/} and a {blue}REVIVE TAPE{/}.');
      } },
    G.item('b1a', 1, 12, 'pillmax', 1),
    G.item('b1b', 20, 12, 'jar', 3),
  ],
  warps: [
    { x: 20, y: 2, to: 'below2', tx: 20, ty: 3, face: 'down' },
    ...[[9, 3], [10, 3], [9, 4], [10, 4]].map(([x, y]) => ({ x, y, to: 'lot', tx: 3, ty: 10, face: 'right' })),
  ],
});

const b2 = grid(22, 16, '.');
box(b2, 0, 0, 22, 2, 'A'); box(b2, 0, 2, 22, 1, 'B');
put(b2, 9, 2, 'DDD'); put(b2, 4, 2, 'nn'); put(b2, 15, 2, 'nn'); put(b2, 19, 2, 'ee');
box(b2, 8, 3, 5, 2, '/');
for (const x of [16, 19]) { put(b2, x, 6, 't'); put(b2, x, 9, 'u'); }
for (let y = 3; y <= 12; y++) put(b2, 14, y, 'x');
box(b2, 0, 7, 14, 1, 'x'); put(b2, 10, 7, '..');
for (const x of [2, 5]) { put(b2, x, 5, 't'); put(b2, x, 10, 'u'); }
put(b2, 3, 12, 'cc'); put(b2, 16, 11, 'cc'); put(b2, 0, 4, 'r'); put(b2, 21, 4, 'r');
box(b2, 0, 15, 22, 1, '#'); box(b2, 0, 14, 22, 1, '/');
S.map('below2', {
  name: 'Below Nevada B2', music: 'below', base: 'bn_floor', bg: '#0c0c12', battleBg: 'facility', legend: BL, rows: rows(b2),
  encounters: 'floor', wild: WILD, rate: 0.07,
  boo: () => F().beatHead ? ['Something big is in the corner, Carl. It\'s been staring at your wallet.'] : ['That big door. That\'s where they keep the important stuff. Probably the package.'],
  actors: [
    grunt('w3', 8, 9, 'right', 5, [['pizzapigeon', 29], ['wardrone', 29], ['sheet', 28]], ['I am the last line of defense. I am also the first line. Staff shortage.'],
      'Go ahead. He\'s in a mood.', 'Please don\'t tell the Head I lost. He keeps a list. The list is contained.'),
    grunt('w4', 4, 4, 'right', 6, [['grey', 29], ['drone', 29]], ['You\'re the escaped one! Subject C-4-R-L!'],
      'Subject C-4-R-L is... very good at this.', 'We never knew what to call you. We went with "Carl".'),
    { id: 'beholden', name: 'THE BEHOLDEN', sprite: 'beholden_front', anim: 'idle', idleRate: 28, x: 19, y: 12, dir: 'down', shadowW: 14,
      if: () => F().beatHead && !F().beatBeholden,
      talk: function* () {
        yield* S.say('An enormous eye. Every stalk holds an unpaid bill.', 'It has been watching Carl since his first late fee.');
        const i = yield* S.ask('Face THE BEHOLDEN?', ['YES', 'NO']);
        if (i !== 0) return;
        yield* G.battle({ wild: ['beholden', 40], music: 'final', bg: 'facility' }, result => {
          if (result === 'lose') return G.blackout();
          if (result === 'run') { G.backToWorld(); return; }
          F().beatBeholden = true;
          G.backToWorld();
          S.run(function* () {
            yield 20;
            if (result === 'caught') yield* S.say('THE BEHOLDEN closed its eye. Its debts are settled.', 'Carl, you just jarred a legend. And all its bills.', BOO);
            else yield* S.say('THE BEHOLDEN blinked, and was gone.', 'Its bills fluttered to the floor. They were all addressed to the Sequel Committee.');
          });
        });
      } },
    G.item('b2a', 1, 13, 'pillmax', 2),
  ],
  warps: [
    { x: 20, y: 2, to: 'below1', tx: 20, ty: 3, face: 'down' },
    { x: 10, y: 2, to: 'core', tx: 6, ty: 10, face: 'up' },
  ],
});

// the Head of Containment's office
const co = grid(13, 12, '.');
box(co, 0, 0, 13, 2, 'A'); box(co, 0, 2, 13, 1, 'B'); put(co, 3, 2, 'nn'); put(co, 8, 2, 'nn');
box(co, 3, 3, 7, 3, '%'); put(co, 4, 4, 'GGGG'); put(co, 4, 5, 'GGGG');
for (const y of [4, 7]) { put(co, 0, y, 't'); put(co, 12, y, 'u'); }
put(co, 1, 9, 'cc'); put(co, 10, 9, 'cc');
box(co, 0, 11, 13, 1, '/');
const headT = {
  id: 'head', name: 'Head of Containment', leader: true, bg: 'facility', music: 'final', sight: 0, money: 5000,
  party: [['wardrone', 31], ['grey', 30], ['pizzapigeon', 31], ['sheet', 31], ['wardrone', 34]],
  win: ['Unacceptable. Uncontainable.', '...Unprecedented.'],
  after: ['Head of Content. We rebranded. It didn\'t help.'],
  pre: function* () {
    if (F().headIntro) { yield* S.say('Subject C-4-R-L. Again. Containment resumes.', HEAD); return; }
    F().headIntro = true;
    yield* S.say('Subject C-4-R-L.', 'You escaped. You came BACK. Nobody comes back. It\'s in the brochure.', HEAD);
    yield* S.say('I\'m here for a package. "TO: CARL\'S PARENTS." It was last scanned here.', CARL);
    yield* S.say('Yes. We contained it.', 'We contain everything. Monsters. Couriers. Sequels. Hope.', 'Mostly hope. It\'s very leaky.', HEAD);
    yield* S.say('Give it back.', CARL);
    yield* S.say('Request denied. Form 27-B is closed for renovations.', 'GATE monsters, Carl. They open doors. They also close them. Forever.', HEAD);
  },
  onWin: function* () { yield* ending(); },
};
S.map('core', {
  name: 'Containment Core', music: 'below', base: 'bn_floor', bg: '#0c0c12', run: false, battleBg: 'facility', legend: BL, rows: rows(co),
  actors: [G.trainerActor({ id: 'head', sprite: 'headofc', x: 6, y: 7, dir: 'down' }, headT)],
  warps: [5, 6, 7].map(x => ({ x, y: 12, to: 'below2', tx: 10, ty: 3, face: 'down' })),
});

// ---------------------------------------------------------------- the ending
function* ending() {
  F().beatHead = true;
  yield* S.say('...Fine. FINE.', 'Behind the generator. Shelf C. It\'s been waiting for you.', HEAD);
  const head = S.world.actors.find(a => a.id === 'head');
  if (head) yield* G.walkOff(head, 'right', 7, 1);
  yield* S.say('Carl looked behind the generator.', 'On Shelf C, there was no package.', 'Just a claim ticket.');
  yield* S.say('"PACKAGE RELEASED TO RECIPIENTS."', '"STATUS: STILL IN TRANSIT."');
  yield* S.say('And on the floor, in the dust...', 'Two sets of footprints. Walking side by side.', 'Further down.');
  yield 30;
  yield* S.say('...They were here.', 'They came for it themselves.', CARL);
  yield* S.say('Carl...', BOO);
  yield* S.say('It\'s okay, Boo.', 'For the first time, I know which way they went.', CARL);
  yield* S.say('Then we\'ll find them. In the sequel.', 'Don\'t tell the Committee.', BOO);
  yield* S.say('Nobody clip that.', CARL);
  yield 20;
  yield* S.wipe('fade', () => S.go(credits), { out: 60 });
}

// credits: the cast and every monster parade along the dusk, then STILL IN TRANSIT
const CREDITS = [
  ['CRACKY', 'STILL IN TRANSIT'],
  ['Based on the Pretend Co. universe', 'by crackytests'],
  ['Made by', 'Leafy & Claude'],
  ['Engine', 'Sprout'],
  ['Starring', 'Carl, a normal human'],
  ['and', 'Boo, a ghost (normal)'],
  ['with', 'CEO Linda, JB Garfield, Spooky Ghost, Yoko'],
  ['also', 'HU-MAN, Old Face, Pilot X, Garf, Pee Kid'],
  ['and', 'the White Suits (please file a form)'],
  ['Thank you', 'for playing ♥'],
];
const PARADE = ['linda', 'garfield', 'ghost', 'yoko', 'human', 'oldface', 'pilotx', 'garf', 'peekid', 'mallcop', 'headofc'];
const credits = {
  t: 0,
  enter() { this.t = 0; S.music('ending'); },
  update() {
    this.t++;
    const end = CREDITS.length * 300 + 300;
    if (this.t > end && !this.leaving && (S.input.pressed('a') || S.input.pressed('start'))) {
      this.leaving = true;
      S.ui.transition('fade', () => {
        G.healAll();
        S.state.heal = { map: 'lot', x: 11, y: 18, dir: 'down', where: 'the A.S.S.' };
        G.backToWorld('lot', 11, 18, 'down');
        S.run(function* () {
          yield 30;
          yield* S.say('Some time later, back in the Lot...');
          yield* S.say('Carl, I\'ve been thinking. The White Suits left a lot of junk Below.', 'And something big moved in on B2. Something that eats late fees.', BOO);
          yield* S.say('Also, the Boo-dex isn\'t full. Just saying.', BOO);
          yield* S.say('THE END... is STILL IN TRANSIT.', 'Save your game to keep playing!');
        });
      }, { out: 40 });
    }
  },
  draw(top, bot) {
    const t = this.t;
    G.drawDusk(top, t);
    // Carl and Boo walk; everyone they met follows, then every monster
    const walk = Math.floor(t / 10) % 3;
    top.spr('carl', 'left' + walk, 168, 176, true);
    top.spr('boo', 'idle' + (Math.floor(t / 24) % 2), 196, 170 + Math.round(Math.sin(t / 20) * 2));
    PARADE.forEach((sp, i) => {
      const x = Math.round(-40 - i * 30 + ((t * 0.5) % (PARADE.length * 30 + 300)));
      const s = S.sprites[sp];
      if (x > -20 && x < 150 && s) top.spr(sp, s.has('left0') ? 'left' + walk : s.names[0], x, 176, true);
    });
    const page = Math.floor(t / 300), k = t % 300;
    const a = page >= CREDITS.length ? 1 : Math.min(1, k / 40, (300 - k) / 40);
    const [l1, l2] = CREDITS[Math.min(page, CREDITS.length - 1)];
    if (page < CREDITS.length) top.alpha(Math.max(0, a), () => {
      if (page === 0) { top.img(G.logo(), 128 - G.logo().width / 2, 34); top.text(l2, 128, 66, { color: '#f8d8ae', shadow: '#3a1a2a', align: 'center' }); }
      else { top.text(l1, 128, 40, { color: '#c8a8d8', shadow: '#2a1a30', align: 'center' }); top.text(l2, 128, 56, { color: '#f8d8ae', shadow: '#3a1a2a', align: 'center' }); }
    });
    else { top.img(G.logo(), 128 - G.logo().width / 2, 34); top.text('STILL IN TRANSIT', 128, 66, { color: '#f8d8ae', shadow: '#3a1a2a', align: 'center' }); }
    // bottom screen: the Boo-dex marching past
    G.drawPattern(bot, '#2a2040', '#352a50', t);
    G.dexOrder.forEach((sp, i) => {
      const x = Math.round(((i * 64 - t * 0.6) % (G.dexOrder.length * 64)) + G.dexOrder.length * 64) % (G.dexOrder.length * 64) - 32;
      if (x < -40 || x > 300) return;
      const caught = G.caught.has(sp);
      if (caught) bot.spr(sp + '_front', 'idle' + (Math.floor((t + i * 9) / 22) % 2), x, 120);
      else { const c = bot.ctx; c.save(); c.filter = 'brightness(0)'; bot.alpha(0.5, () => bot.spr(sp + '_front', 'idle0', x, 120)); c.restore(); }
    });
    bot.text(`BOO-DEX  ${G.caught.size} / ${G.dexOrder.length}`, 128, 140, { color: 'white', align: 'center', shadow: '#14101a' });
    if (page >= CREDITS.length && Math.floor(t / 30) % 2) bot.text('Press A to continue', 128, 164, { color: '#f8d8ae', align: 'center', shadow: '#14101a' });
  },
};
G.credits = credits;
})();
