// Cracky — the Mall of the Future: plaza, Prop Shop, Food Court, Lost & Found, LINDA CORP. (gym 1),
// and the Residences at Tomorrow (two floors + Yoko's penthouse, gym 4).
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const CARL = G.CARL, BOO = G.BOO;

// build rows from a blank fill, then stamp strings at (x, y)
G.grid = (w, h, ch) => Array.from({ length: h }, () => ch.repeat(w).split(''));
G.put = (g, x, y, s) => { for (let i = 0; i < s.length; i++) if (s[i] !== ' ') g[y][x + i] = s[i]; };
G.box = (g, x, y, w, h, ch) => { for (let j = 0; j < h; j++) G.put(g, x, y + j, ch.repeat(w)); };
G.rows = g => g.map(r => r.join(''));
const { grid, put, box, rows } = G;

// apartment doors are scenery here (solid, with a line each)
const DOORTALK = {
  aptdoor1: ['Unit 1A. A sticky note: "GONE TO THE FUTURE. BACK YESTERDAY."'],
  aptdoor2: ['Unit 2B. Someone inside is vacuuming the same spot. They have been at it for a while.'],
  aptdoor3: ['Unit 2C. The peephole is looking at Carl.'],
};
for (const k of Object.keys(DOORTALK)) S.prop(k, Object.assign({}, S.props[k], { solid: ['x'], talk: DOORTALK[k] }));
S.prop('escalator', Object.assign({}, S.props.escalator, { talk: null }));

const LINDA = { name: 'CEO Linda', nameColor: 'red' };
const YOKO = { name: 'Yoko', nameColor: 'blue' };
const COP = { name: 'Mall Cop' };

// ---------------------------------------------------------------- the plaza
const PLAZA = {
  '.': 'plaza', 't': 'plaza_teal', '#': 'mwall', 'b': 'mwallb', '~': 'void',
  '=': { terrain: 'runway', under: 'plaza' },
  'P': { prop: 'store_prop', under: 'mwallb' }, 'F': { prop: 'store_food', under: 'mwallb' }, 'L': { prop: 'linda_corp', under: 'mwallb' },
  'O': { prop: 'store_lost', under: 'mwallb' }, 'R': { prop: 'res_door', under: 'mwallb' },
  'f': { prop: 'fountain' }, 's': { prop: 'statue' }, 'B': { prop: 'bench' }, 'e': { prop: 'escalator' },
  'd': { prop: 'directory' }, 'p': { prop: 'planter' },
};
const pz = grid(34, 20, '.');
put(pz, 0, 0, '~'.repeat(34));
put(pz, 0, 1, '#'.repeat(34));
for (const y of [2, 3, 4]) { const w = y === 4 ? 'b' : '#'; put(pz, 0, y, w + 'PPPPP' + w + 'FFFFF' + w + 'LLLLLLL' + w + 'OOOOO' + w + 'RRRRR' + w + w); }
box(pz, 15, 5, 3, 14, '=');
box(pz, 2, 7, 30, 1, 't');
for (const x of [3, 9, 23, 29]) box(pz, x, 5, 1, 2, 't');
box(pz, 15, 7, 3, 1, '=');
put(pz, 6, 11, 'fff'); put(pz, 6, 12, 'fff');
put(pz, 25, 11, 'fff'); put(pz, 25, 12, 'fff');
put(pz, 19, 13, 'ss'); put(pz, 19, 14, 'ss');
put(pz, 12, 9, 'd');
put(pz, 3, 16, 'BB'); put(pz, 9, 16, 'BB'); put(pz, 23, 16, 'BB');
put(pz, 30, 14, 'ee'); put(pz, 30, 15, 'ee'); put(pz, 30, 16, 'ee');
for (const [x, y] of [[1, 5], [32, 5], [13, 5], [19, 5], [1, 18], [32, 18], [13, 18], [19, 18]]) put(pz, x, y, 'p');
put(pz, 0, 19, '#'.repeat(15) + '...' + '#'.repeat(16));

S.map('plaza', {
  name: 'Mall of the Future', music: 'mall', base: 'plaza', bg: '#241a3c', battleBg: 'mall', legend: PLAZA, rows: rows(pz),
  boo: ['This mall is outside of time. That\'s why the pretzels never go cold. Or stale. Or eaten.', 'The Residences door is on the far right. "HUMAN OCCUPANCY ONLY." Rude.'],
  actors: [
    G.npc({ id: 'cop', name: 'Mall Cop', sprite: 'mallcop', x: 29, y: 15, dir: 'right' }, [
      ['UP ONLY! CAN\'T YOU READ?', 'The escalator. It goes up. Only up. I\'ve been watching it since the mall opened.'],
      ['Nobody has ever come DOWN this escalator.', 'Think about that. I do. Every day.'],
    ]),
    G.npc({ id: 'shopper', name: 'Shopper', sprite: 'shopper', x: 8, y: 9, dir: 'down', wander: 3 }, [
      'I came here for one sock. That was a while ago. My parking ticket says "FOREVER".',
      'Have you seen the statue? It used to be someone else. Now it\'s Linda.',
      'The Lost & Found has a terminal. They keep extra monsters in cubbies. Very humane. Very small.',
    ]),
    G.npc({ id: 'shopper2', name: 'Shopper', sprite: 'shopper2', x: 24, y: 9, dir: 'left', wander: 2 }, [
      'CEO Linda gives out the {blue}LIGHT STAMP{/}. You just have to sit through the entrance.',
      'LIGHT monsters hate DARK and CURSE ones. Or the other way round. I sell shoes.',
      'The Residences at Tomorrow only let in humans. Real ones. With stamps.',
    ]),
    G.npc({ id: 'tourist', name: 'Tourist', sprite: 'tourist', x: 21, y: 16, dir: 'up' }, [
      'Excuse me, is this the Mall of the Future? My guidebook says it hasn\'t been built yet.',
      'I took a picture of the fountain. The picture took a picture of me.',
    ]),
    G.item('mall1', 32, 17, 'pill', 2),
  ],
  warps: [
    { x: 3, y: 4, to: 'shop', tx: 4, ty: 7, face: 'up' },
    { x: 9, y: 4, to: 'food', tx: 6, ty: 8, face: 'up' },
    { x: 16, y: 4, to: 'gym1', tx: 6, ty: 14, face: 'up' },
    { x: 23, y: 4, to: 'lost', tx: 3, ty: 6, face: 'up' },
    { x: 29, y: 4, to: 'res1', tx: 11, ty: 9, face: 'up', if: () => G.stamps().length >= 3 },
    { x: 15, y: 19, to: 'lot', tx: 14, ty: 1, face: 'down' },
    { x: 16, y: 19, to: 'lot', tx: 14, ty: 1, face: 'down' },
    { x: 17, y: 19, to: 'lot', tx: 14, ty: 1, face: 'down' },
  ],
  events: [
    { x: 29, y: 4, if: () => G.stamps().length < 3, step: function* () {
      yield* S.say('A brass plaque: {blue}RESIDENCES AT TOMORROW{/}.', '"HUMAN OCCUPANCY ONLY. Proof of humanity: THREE (3) Delivery Stamps."', `Carl has ${G.stamps().length}.`);
      yield* S.say('I\'m human. I have a hoodie.', CARL);
      const p = S.world.player; p.go('down', 1, true); yield () => !p.moving;
    } },
    { x: 12, y: 9, dir: 'up', talk: ['MALL DIRECTORY', 'PROP SHOP, FOOD COURT, LINDA CORP., LOST & FOUND, RESIDENCES AT TOMORROW', 'YOU ARE HERE. YOU HAVE ALWAYS BEEN HERE.'] },
  ],
});

// ---------------------------------------------------------------- shop / lost & found / food court
const SHOP = {
  '.': 'plaza', 't': 'plaza_teal', '#': 'mwall', 'b': 'mwallb', 'C': { prop: 'counter', counter: true }, 'T': { prop: 'terminal' },
  'H': { prop: 'ftable' }, 'p': { prop: 'planter' }, 'q': { prop: 'sadplant_m' }, 'B': { prop: 'bench' }, '=': { terrain: 'runway', under: 'plaza' },
};
S.map('shop', {
  name: 'PROP SHOP', music: 'mall', base: 'plaza', bg: '#0c0c12', run: false, legend: SHOP, rows: [
    '##########', 'bbbbbbbbbb', 'p........p', '.CCC......', '..........', '......BB..', '....tt....', '....tt....',
  ],
  actors: [
    { id: 'clerk', name: 'Clerk', sprite: 'shopper2', x: 2, y: 2, dir: 'down',
      talk: function* () { yield* G.shop(['pill', 'pillmax', 'jar', 'chalk', 'tape'], { name: 'Clerk', hello: ['Welcome to the PROP SHOP!', 'Everything here is a prop. The pills work anyway. We don\'t know why.'], bye: 'Come again! Or don\'t. Time is a flat circle here.' }); } },
    G.npc({ id: 'kid', name: 'Pee Kid', sprite: 'peekid', x: 7, y: 3, dir: 'left' }, [
      ['I\'m not buying anything. I\'m INSPECTING.', 'This jar has a jar in it. That\'s a jar.'],
      ['Sigil Chalk keeps weak monsters away. Draw the circle. Stand in the circle. Be the circle.'],
    ]),
  ],
  warps: [{ x: 4, y: 8, to: 'plaza', tx: 3, ty: 5, face: 'down' }, { x: 5, y: 8, to: 'plaza', tx: 3, ty: 5, face: 'down' }],
});
S.map('lost', {
  name: 'LOST & FOUND', music: 'mall', base: 'plaza', bg: '#0c0c12', run: false, legend: SHOP, rows: [
    '########', 'bbbbbbbb', 'q.T..T.q', '........', '..CCC...', '........', '...tt...',
  ],
  actors: [
    G.npc({ id: 'lfclerk', name: 'Attendant', sprite: 'shopper', x: 3, y: 3, dir: 'down' }, [
      ['Use the terminals to store or collect monsters.', 'Everything that gets lost ends up here eventually. Socks. Umbrellas. Parents.', '...That was a joke. Probably.'],
      ['We also have a package for you, Carl. Oh wait. No. It says STILL IN TRANSIT. Sorry.'],
    ]),
  ],
  warps: [{ x: 3, y: 7, to: 'plaza', tx: 23, ty: 5, face: 'down' }, { x: 4, y: 7, to: 'plaza', tx: 23, ty: 5, face: 'down' }],
  events: [
    { x: 2, y: 2, talk: function* () { yield* G.lostAndFound(); } },
    { x: 5, y: 2, talk: function* () { yield* G.lostAndFound(); } },
  ],
});
S.map('food', {
  name: 'FOOD COURT', music: 'mall', base: 'plaza', bg: '#0c0c12', run: false, legend: SHOP, rows: [
    '############', 'bbbbbbbbbbbb', 'p..........p', '....CCC.....', '.HH.....HH..', '............', '.HH.=====HH.', '....=====...', '.....tt.....',
  ],
  actors: [
    { id: 'pretzel2', name: 'Pretzel Guy (Mall)', sprite: 'oldman', x: 5, y: 2, dir: 'down',
      talk: function* () {
        yield* G.rest({ map: 'food', x: 5, y: 4, dir: 'up', where: 'the Food Court' },
          [S.pick(['Pretzel? Warm since 1998. My cousin in the parking lot says hi.', 'Sit. Eat. Your monsters look like they need a pretzel and a nap.'])], { name: 'Pretzel Guy (Mall)' });
      } },
    G.npc({ id: 'eater', name: 'Diner', sprite: 'tourist', x: 9, y: 5, dir: 'up' }, [
      'Every table in this food court faces the pretzel stand. That\'s not an accident.',
      'I ordered a lasagna here once. A fat orange cat in a hat appeared and ate it. Something about Garf\'s.',
    ]),
  ],
  warps: [{ x: 5, y: 9, to: 'plaza', tx: 9, ty: 5, face: 'down' }, { x: 6, y: 9, to: 'plaza', tx: 9, ty: 5, face: 'down' }],
});

// ---------------------------------------------------------------- LINDA CORP. (gym 1, LIGHT)
const GYM = {
  '.': 'marble', '#': 'gwall', '=': { terrain: 'runway', under: 'marble' }, 'I': { prop: 'pillar' }, 'p': { prop: 'planter_g', under: 'marble' }, '+': 'marble_inlay',
};
const gy = grid(13, 15, '.');
put(gy, 0, 0, '#'.repeat(13)); put(gy, 0, 1, '#'.repeat(13));
box(gy, 5, 2, 3, 13, '=');
for (const y of [4, 7, 10, 13]) { put(gy, 4, y, '+'); put(gy, 8, y, '+'); }
for (const y of [3, 6, 9, 12]) { put(gy, 2, y, 'I'); put(gy, 10, y, 'I'); }
put(gy, 0, 2, 'p'); put(gy, 12, 2, 'p');

const lindaT = {
  id: 'linda', name: 'CEO Linda', leader: true, bg: 'lindacorp', sight: 0,
  party: [['mannequin', 10], ['spam', 10], ['mannequin', 12]],
  win: ['...', 'Fine. FINE. The data says you won. I respect data.'],
  after: ['The LIGHT STAMP is real. It\'s also trademarked. Don\'t photocopy it.', 'Now get out of my lobby, green idiot. Respectfully.'],
  onWin: function* () {
    yield* S.say('You beat me. In my own lobby. During my entrance.', 'Do you know how long this entrance took to plan? SIX HOURS. It has a sequel.', LINDA);
    yield* G.giveStamp('light');
    yield* S.say('There. Now Route 45 will let you through. The inspectors love a stamp.', 'Go east from the Lot. JB Garfield\'s at Garf\'s. Tell him he still owes the mall for that lasagna.', LINDA);
    yield* S.say('She was kind of nice? In a scary way.', BOO);
  },
  pre: function* () {
    if (F().lindaIntro) { yield* S.say('Back for a rematch of my entrance? No. Battle me.', LINDA); return; }
    F().lindaIntro = true;
    yield* S.say('*fanfare*', '*more fanfare*', '*a smoke machine, briefly*');
    yield* S.say('Welcome to LINDA CORP., where the future is already for sale.', 'I am {red}CEO Linda{/}. Chief Executive. Of Everything in this building.', LINDA);
    yield* S.say('Hi. I\'m Carl. I\'m a normal human courier. I need a Delivery Stamp.', CARL);
    yield* S.say('Shut up, green idiot.', 'A stamp from LINDA CORP. is a premium product. Premium products are earned.', LINDA);
    yield* S.say('My monsters are LIGHT. Bright. Shiny. Excellent at retail.', 'Show me you\'re worth the ink.', LINDA);
  },
};
S.map('gym1', {
  name: 'LINDA CORP.', music: 'mall', base: 'marble', bg: '#0c0c12', run: false, battleBg: 'lindacorp', legend: GYM, rows: rows(gy),
  actors: [
    G.trainerActor({ id: 'linda', sprite: 'linda', x: 6, y: 3, dir: 'down' }, lindaT),
    G.trainerActor({ id: 'gcop', sprite: 'mallcop', x: 4, y: 11, dir: 'right' }, {
      id: 'gym1a', name: 'Mall Cop Dale', sight: 3, party: [['rat', 7], ['rat', 8]],
      intro: ['HALT! No running on the runway!', 'Also no walking. Battle me.'], win: 'I\'ve been demoted to escalator duty again.', after: 'UP ONLY. That\'s all I know now.' }),
    G.trainerActor({ id: 'gshop', sprite: 'shopper', x: 8, y: 7, dir: 'left' }, {
      id: 'gym1b', name: 'Brand Ambassador', sight: 3, party: [['mannequin', 8], ['spam', 9]],
      intro: ['Have you heard about our loyalty program? You have now! Battle!'], win: 'You\'re not loyal. I respect that.', after: 'LIGHT moves hit DARK and CURSE monsters hard. Free tip. Next one costs.' }),
  ],
  warps: [5, 6, 7].map(x => ({ x, y: 15, to: 'plaza', tx: 16, ty: 5, face: 'down' })),
});

// ---------------------------------------------------------------- Residences at Tomorrow
const APT = {
  '.': 'carpet', '#': 'awall', 'b': 'awallb',
  '1': { prop: 'aptdoor1', under: 'awallb' }, '2': { prop: 'aptdoor2', under: 'awallb' }, '3': { prop: 'aptdoor3', under: 'awallb' },
  '4': { prop: 'aptdoor3f', under: 'awallb' }, 'l': { prop: 'lamp_in' }, 'q': { prop: 'sadplant' }, 'e': { prop: 'escalator' },
  '=': { terrain: 'runway', under: 'carpet' }, '~': 'void',
};
const RES_WILD = [['echo', 30, 20, 23], ['mannequin', 25, 20, 23], ['rat', 20, 20, 22], ['mite', 15, 20, 23], ['ratmanager', 10, 22, 23]];
const r1 = grid(24, 11, '.');
put(r1, 0, 0, '#'.repeat(24));
put(r1, 0, 1, 'bb1bbb2bbb3bbbb2bbbbbbbb');
put(r1, 20, 2, 'ee'); put(r1, 20, 3, 'ee'); put(r1, 20, 4, 'ee');
put(r1, 0, 2, 'l'); put(r1, 17, 2, 'q');
put(r1, 0, 6, 'bbbbbbbbbbbbbbbb');
put(r1, 23, 9, 'q'); put(r1, 0, 9, 'l');
put(r1, 0, 10, '###########..###########');
S.map('res1', {
  name: 'Residences at Tomorrow 1F', music: 'residences', base: 'carpet', bg: '#0c0c12', battleBg: 'apartment', legend: APT, rows: rows(r1),
  encounters: 'floor', wild: RES_WILD, rate: 0.07,
  boo: ['The carpet is humming. Carpets shouldn\'t hum.', 'Nobody has lived here since tomorrow.'],
  actors: [
    G.trainerActor({ id: 'res1a', sprite: 'shopper', x: 17, y: 8, dir: 'left' }, {
      id: 'res1a', name: 'Resident Pam', sight: 5, party: [['echo', 21], ['mannequin', 22]],
      intro: ['Are you a resident? You have to be a resident. Residents are human. Are you human?'], win: 'You fight like a human. A weird one.', after: 'Yoko lives at the top. She helps. She doesn\'t obey.' }),
    G.trainerActor({ id: 'res1b', sprite: 'shopper2', x: 5, y: 3, dir: 'right' }, {
      id: 'res1b', name: 'Resident Hal', sight: 6, party: [['rat', 21], ['ratmanager', 22]],
      intro: ['You stepped on my hallway. My hallway steps back.'], win: 'Please wipe your feet on the way out of my life.', after: 'The escalator goes up. Of course it does.' }),
    G.item('res1', 1, 8, 'pillmax', 1),
  ],
  warps: [11, 12].map(x => ({ x, y: 11, to: 'plaza', tx: 29, ty: 5, face: 'down' })),
  events: [20, 21].map(x => ({ x, y: 4, dir: 'up', talk: function* () { yield* G.goto('res2', 20, 5, 'down'); } })),
});
const r2 = grid(24, 11, '.');
put(r2, 0, 0, '#'.repeat(24));
put(r2, 0, 1, 'bbbbbbbbb3bbbb4bbbb1bbbb');
put(r2, 1, 2, 'ee'); put(r2, 1, 3, 'ee'); put(r2, 1, 4, 'ee');
put(r2, 20, 2, 'ee'); put(r2, 20, 3, 'ee'); put(r2, 20, 4, 'ee');
put(r2, 8, 6, 'bbbbbbbbbbbbbbbb');
put(r2, 0, 10, '#'.repeat(24));
put(r2, 23, 2, 'l'); put(r2, 6, 2, 'q'); put(r2, 0, 9, 'q'); put(r2, 23, 9, 'l');
S.map('res2', {
  name: 'Residences at Tomorrow 2F', music: 'residences', base: 'carpet', bg: '#0c0c12', battleBg: 'apartment', legend: APT, rows: rows(r2),
  encounters: 'floor', wild: RES_WILD, rate: 0.07,
  actors: [
    G.trainerActor({ id: 'res2a', sprite: 'tourist', x: 12, y: 8, dir: 'right' }, {
      id: 'res2a', name: 'Subletter Ray', sight: 6, party: [['mite', 22], ['echo', 22], ['masterdeck', 23]],
      intro: ['I sublet from a guy who sublets from Yoko. Nobody here has a lease. Battle!'], win: 'I\'m going to have to sublet my loss.', after: 'SOUND hits STATIC and DARK hard. Yoko knows. Yoko always knows.' }),
    G.trainerActor({ id: 'res2b', sprite: 'peekid', x: 4, y: 5, dir: 'down' }, {
      id: 'res2b', name: 'Hall Monitor', sight: 4, party: [['echo', 23], ['rat', 22]],
      intro: ['Hall pass. Do you have one. No. Then battle.'], win: 'Your hall pass is... valid.', after: 'Yoko\'s up the escalator. She\'s nice. Scary nice.' }),
    G.item('res2', 22, 9, 'tape', 1),
  ],
  events: [
    ...[20, 21].map(x => ({ x, y: 4, dir: 'up', talk: function* () {
      yield* S.say('This one says DOWN. It doesn\'t move. Carl takes the stairs hidden behind it.');
      yield* G.goto('res1', 20, 5, 'down');
    } })),
    ...[1, 2].map(x => ({ x, y: 4, dir: 'up', talk: function* () { yield* G.goto('penthouse', 6, 9, 'up'); } })),
  ],
});

// Yoko's penthouse (gym 4, SOUND)
const ph = grid(13, 11, '.');
put(ph, 0, 0, '~~~~~~~~~~~~~'); put(ph, 0, 1, '#############'); put(ph, 0, 2, 'bbbbbbbbbbbbb');
box(ph, 5, 3, 3, 7, '=');
put(ph, 1, 3, 'l'); put(ph, 11, 3, 'l'); put(ph, 0, 8, 'q'); put(ph, 12, 8, 'q');
const yokoT = {
  id: 'yoko', name: 'Yoko', leader: true, bg: 'penthouse', sight: 0,
  party: [['echo', 24], ['masterdeck', 25], ['choir', 27]],
  win: ['That was a good song.', 'You didn\'t win because I let you. You won because you listened.'],
  after: ['Helping you doesn\'t mean doing what you say. But I\'ll tell you this: the hatch is in the Lot. North-west lamp post.', 'Someone in sunglasses is waiting there. He\'s been waiting since you left.'],
  pre: function* () {
    if (F().yokoIntro) { yield* S.say('Ready to listen this time?', YOKO); return; }
    F().yokoIntro = true;
    yield* S.say('Carl. I wondered when you\'d come up.', 'You have three stamps. Linda\'s, Garfield\'s, Ghost\'s. Impressive.', YOKO);
    yield* S.say('Yoko! Can you stamp my manifest? Please?', CARL);
    yield* S.say('Helping you doesn\'t mean doing what you say.', 'But I\'ll help. If you can keep up with the music.', YOKO);
    yield* S.say('She\'s cool. I\'m scared. Both at once.', BOO);
  },
  onWin: function* () {
    yield* G.giveStamp('sound');
    yield* S.say('Four stamps. The White Suits will have to let you in now.', 'Whatever\'s down there, Carl... it might not be what the label says.', YOKO);
    yield* S.say('It says "STILL IN TRANSIT".', CARL);
    yield* S.say('Then go find out where it\'s going.', YOKO);
  },
};
S.map('penthouse', {
  name: 'The Penthouse', music: 'residences', base: 'carpet', bg: '#0c0c12', run: false, battleBg: 'penthouse', legend: APT, rows: rows(ph),
  actors: [G.trainerActor({ id: 'yoko', sprite: 'yoko', x: 6, y: 4, dir: 'down' }, yokoT)],
  warps: [5, 6, 7].map(x => ({ x, y: 11, to: 'res2', tx: 1, ty: 5, face: 'down' })),
});
})();
