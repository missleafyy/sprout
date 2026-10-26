// Cracky — Rhyolite Springs (ghost town at night), the Chapel (gym 3, CURSE) and the Old Hotel.
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const CARL = G.CARL, BOO = G.BOO;
const GHOST = { name: 'Spooky Ghost', nameColor: 'purple' };
const PILOT = { name: 'Pilot X', nameColor: 'red' };

// moonlight wash so the street reads as night; sprites stay legible
const night = g => { g.camera(0, 0); g.alpha(0.16, () => g.rect(0, 0, 256, 192, '#141a3a')); };

S.map('rhyolite', {
  name: 'Rhyolite Springs', music: 'ghost', base: 'gt_dust', battleBg: 'night', encounters: true, drawOver: night, rate: 0.11,
  wild: [['sock', 32, 16, 19], ['echo', 25, 16, 19], ['sheet', 20, 16, 19], ['cactus', 13, 16, 18], ['wraith', 5, 19, 20]],
  boo: ['A ghost town! Finally, some of MY people.', 'Everyone here is dead. They\'re very relaxed about it.'],
  legend: {
    '.': 'gt_dust', '"': 'gt_scrub',
    '=': { terrain: 'gt_boardwalk', under: 'gt_dust' }, '#': { terrain: 'gt_road', under: 'gt_dust' },
    'H': { prop: 'gt_hotel' }, 'C': { prop: 'gt_chapel' }, 'S': { prop: 'gt_saloon' },
    'W': { prop: 'gt_wagon' }, 'P': { prop: 'gt_post' }, 'L': { prop: 'gt_lamp' }, 'O': { prop: 'gt_well' },
    'g': { prop: 'gt_grave' }, '+': { prop: 'gt_cross' }, 'T': { prop: 'gt_tumble' },
  },
  rows: [
    '""""""""..........""""""""""',
    '""""""............."""""""""',
    '""".........................',
    '............................',
    '..HHHHHH....CCCCC...SSSSS...',
    '..HHHHHH....CCCCC...SSSSS...',
    '..HHHHHH....CCCCC...SSSSS...',
    '.L======...L=====L..=====L..',
    '..======....=====...=====...',
    '############################',
    '############################',
    '...WWW..PP..................',
    '...WWW.......OO...T...g.+.g.',
    '.............OO.............',
    '..L...................+.g.+.',
    '..."""""".........."".......',
    '..""""""""........""""""""""',
    '""""""""""""....""""""""""""',
  ],
  actors: [
    { id: 'pilotx', name: 'Pilot X', sprite: 'pilotx', x: 9, y: 12, dir: 'left',
      talk: function* () {
        if (!F().metPilot) {
          F().metPilot = true;
          yield* S.say('Little brother.', PILOT);
          yield* S.say('I\'m not your little brother. I\'m a normal human only child.', CARL);
          yield* S.say('Sure.', 'You\'re looking for a package. Below Nevada. I know what\'s in it.', PILOT);
          yield* S.say('You do? What is it?', CARL);
          yield* S.say('Spoilers.', PILOT);
          yield* S.say('...', 'I hate him.', BOO);
          yield* S.say('Get the Ghost\'s stamp. Then the Residences will open for you. Yoko lives at the top.', 'I\'ll be around. I\'m always around. It\'s a whole thing.', PILOT);
        } else yield* S.say(S.pick([['Spoilers.'], ['CURSE beats SOUND and LIGHT. SOUND beats STATIC and DARK. You figure out the rest, little brother.'], ['When you go Below... look down. Then look further down.']]), PILOT);
      } },
    G.npc({ id: 'cowboy1', name: 'Ghost Cowboy', sprite: 'cowboy', x: 21, y: 12, dir: 'down', float: 2, wander: 2 }, [
      'Howdy. I died in 1907. Best decision I ever made. No more rent.',
      'Spooky Ghost does a show in the Chapel every night. Same trick every time. Still gets me.',
      'That Ghost owes alimony to half the graveyard. Don\'t lend him money. He\'ll make it disappear.',
    ]),
    G.item('rh1', 26, 3, 'pillmax', 2),
    G.item('rh2', 1, 13, 'jar', 3),
  ],
  warps: [
    { x: 4, y: 6, to: 'hotel', tx: 4, ty: 7, face: 'up' },
    { x: 14, y: 6, to: 'chapel', tx: 6, ty: 11, face: 'up' },
    ...[12, 13, 14, 15].map(x => ({ x, y: 18, to: 'ethwy', tx: 10, ty: 1, face: 'down' })),
  ],
});

const ghostT = {
  id: 'spooky', name: 'Spooky Ghost', leader: true, bg: 'chapel', sight: 0,
  party: [['sheet', 20], ['sock', 21], ['wraith', 23]],
  win: ['Ta-daaa... I lost?', 'That\'s not the trick. The trick is I make the stamp APPEAR.'],
  after: ['Next show is at midnight. Every night is midnight here.', 'If you see my ex, I\'m not here. I\'m a ghost. I\'m never here.'],
  pre: function* () {
    if (F().ghostIntro) { yield* S.say('Back for an encore? I love an encore.', GHOST); return; }
    F().ghostIntro = true;
    yield* S.say('Ladies and gentlemen! Ghouls and ghosts! Small green... whatever you are!', GHOST);
    yield* S.say('Normal human.', CARL);
    yield* S.say('Sure, buddy!', 'Welcome to the greatest show in Rhyolite Springs! I am the one, the only, {purple}SPOOKY GHOST{/}!', GHOST);
    yield* S.say('For my next trick, I will make your monsters... DISAPPEAR!', '...Into the Lost & Found. Mostly. Okay, let\'s go!', GHOST);
  },
  onWin: function* () {
    yield* S.say('And now, for my final trick...', '*waves sheet*', GHOST);
    yield* G.giveStamp('curse');
    yield* S.say('Three stamps! The Residences at Tomorrow will open up for you now. They\'re picky about who counts as human.', GHOST);
    yield* S.say('Hey, kid. Your package. I got a letter from Below once. Same label. Same "STILL IN TRANSIT."', 'Some things don\'t get lost, kid. They get kept.', GHOST);
    yield* S.say('...Kept by who?', CARL);
    yield* S.say('Wouldn\'t be much of a show if I told you!', GHOST);
  },
};
S.map('chapel', {
  name: 'The Chapel', music: 'ghost', base: 'gt_cfloor', bg: '#0c0c12', run: false, battleBg: 'chapel',
  legend: {
    '.': 'gt_cfloor', 'A': 'gt_cwallA', 'B': 'gt_cwallB', 'w': 'gt_cwin', '#': 'gt_edge',
    '|': { terrain: 'gt_aisle', under: 'gt_cfloor' },
    'p': { prop: 'gt_pew', under: 'gt_cfloor' }, 's': { prop: 'gt_stage' }, 'c': { prop: 'gt_candle' },
  },
  rows: [
    '#AwAAAAAAAwA#',
    '#BBBBBBBBBBB#',
    '#.c.sssss.c.#',
    '#...sssss...#',
    '#.....|.....#',
    '#.pp..|..pp.#',
    '#.....|.....#',
    '#.pp..|..pp.#',
    '#.....|.....#',
    '#.pp..|..pp.#',
    '#c....|....c#',
    '#.....|.....#',
  ],
  actors: [
    G.trainerActor({ id: 'spooky', sprite: 'ghost', x: 6, y: 4, dir: 'down', float: 2 }, ghostT),
    G.trainerActor({ id: 'ch1', sprite: 'cowboy', x: 4, y: 8, dir: 'right', float: 2 }, {
      id: 'ch1', name: 'Phantom Usher', sight: 3, party: [['sock', 18], ['sheet', 18]],
      intro: ['Tickets, please. You don\'t have a ticket. That\'s a battle.'], win: 'Enjoy the show.', after: 'Front row\'s reserved for the dead. You can stand.' }),
    G.trainerActor({ id: 'ch2', sprite: 'cowboy', x: 8, y: 6, dir: 'left', float: 2 }, {
      id: 'ch2', name: 'Heckler Ghost', sight: 3, party: [['echo', 19], ['wraith', 19]],
      intro: ['BOOOO! Not you. The show. Okay, also you. Battle!'], win: 'Boo. (Affectionate.)', after: 'CURSE moves barely tickle other CURSE monsters. Use SOUND? No wait. That\'s backwards. Use STATIC.' }),
  ],
  warps: [{ x: 6, y: 12, to: 'rhyolite', tx: 14, ty: 7, face: 'down' }],
});

S.map('hotel', {
  name: 'Old Hotel', music: 'ghost', base: 'gt_cfloor', bg: '#0c0c12', run: false,
  legend: {
    '.': 'gt_cfloor', 'A': 'gt_hwallA', 'B': 'gt_hwallB', '#': 'gt_edge',
    'r': { terrain: 'gt_rug', under: 'gt_cfloor' },
    'd': { prop: 'gt_desk', counter: true }, 'k': { prop: 'gt_clock' }, 'f': { prop: 'gt_deadplant' },
  },
  rows: [
    '#AAAAAAA#',
    '#BBBBBBB#',
    '#k.....f#',
    '#..ddd..#',
    '#..rrr..#',
    '#f.rrr..#',
    '#..rrr..#',
    '#.......#',
  ],
  actors: [
    { id: 'clerk', name: 'Night Clerk', sprite: 'cowboy', x: 4, y: 2, dir: 'down', float: 2,
      talk: function* () {
        const n = { name: 'Night Clerk' };
        const i = yield* S.ask('Checking in? Checking out? Nobody checks out. Ha. Ha. (That\'s a ghost joke.)', ['REST', 'SHOP', 'LOST & FOUND', 'BYE'], n);
        if (i === 0) yield* G.rest({ map: 'hotel', x: 4, y: 4, dir: 'up', where: 'the Old Hotel' }, 'Room 13. It\'s the only room. Sleep tight.', n);
        if (i === 1) yield* G.shop(['pill', 'pillmax', 'jar', 'chalk', 'tape'], { name: 'Night Clerk', hello: 'The gift shop. Everything here is haunted. Which is to say, free shipping.', bye: 'Rest in peace. Or just rest.' });
        if (i === 2) yield* G.lostAndFound();
      } },
  ],
  warps: [{ x: 4, y: 8, to: 'rhyolite', tx: 4, ty: 7, face: 'down' }],
});
})();
