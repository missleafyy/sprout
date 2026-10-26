// Cracky — Route 45, Garf's (diner, the Litter Box = gym 2, Little Green Inn) and the E.T. Highway.
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const CARL = G.CARL, BOO = G.BOO;
const { grid, put, box, rows } = G;
const GARF = { name: 'JB Garfield', nameColor: 'red' };

const L = {
  '.': 'sand', '"': 'scrub',
  'M': { terrain: 'dz_mesa', under: 'sand' },
  '-': { terrain: 'dz_road', under: 'sand' }, '=': { terrain: 'dz_roadH', under: 'sand' }, '|': { terrain: 'dz_roadV', under: 'sand' },
  'p': { terrain: 'lot', under: 'sand' },
  'D': { prop: 'dz_diner' }, 'B': { prop: 'dz_litterbox' }, 'I': { prop: 'dz_inn' }, 'U': { prop: 'dz_bus' },
  'W': { prop: 'dz_watertower' }, '4': { prop: 'dz_sign45' }, 'E': { prop: 'dz_signet' }, 't': { prop: 'dz_tumbleweed' },
  'f': { prop: 'dz_fence' }, 'K': { prop: 'dz_car' }, 'L': { prop: 'lamp' }, 'C': { prop: 'cactus' }, 'R': { prop: 'rock_d' },
};
const edge = (xs, y, to, tx, ty, face, cond) => xs.map(x => ({ x, y, to, tx, ty, face, if: cond }));
const edgeY = (x, ys, to, tx, ty, face, cond) => ys.map(y => ({ x, y, to, tx, ty: ty + (y - ys[0]), face, if: cond }));

// ---------------------------------------------------------------- Route 45
const r = grid(40, 16, '.');
box(r, 0, 0, 40, 2, 'M'); box(r, 0, 14, 40, 2, 'M');
box(r, 0, 6, 40, 1, '-'); box(r, 0, 7, 40, 1, '='); box(r, 0, 8, 40, 1, '-');
box(r, 4, 2, 7, 3, '"'); box(r, 22, 2, 6, 3, '"'); box(r, 31, 3, 6, 2, '"');
box(r, 6, 10, 9, 3, '"'); box(r, 19, 11, 6, 2, '"'); box(r, 29, 10, 8, 3, '"');
put(r, 18, 4, 'UUUUU'); put(r, 18, 5, 'UUUUU');
put(r, 2, 5, '4'); put(r, 2, 2, 'C'); put(r, 15, 3, 'C'); put(r, 29, 2, 'R'); put(r, 37, 11, 'C'); put(r, 16, 12, 'R'); put(r, 27, 9, 't');
S.map('route45', {
  name: 'Route 45', music: 'route', base: 'sand', battleBg: 'road', legend: L, rows: rows(r),
  encounters: true, rate: 0.11,
  wild: [['cactus', 32, 7, 10], ['pigeon', 25, 7, 10], ['spam', 20, 7, 9], ['rat', 13, 7, 9], ['lamb', 4, 8, 9], ['sock', 3, 8, 9], ['mite', 3, 8, 9]],
  boo: ['That bus has been "on schedule" for eleven years. It just never stops.', 'If you see a STATIC LAMB, LOST SOCK or CASSETTE MITE out here... they\'re rare. Jar them!'],
  actors: [
    G.trainerActor({ id: 'kevin', sprite: 'inspector', x: 12, y: 4, dir: 'down' }, {
      id: 'r45a', name: 'Postal Inspector Kevin', sight: 3, party: [['pigeon', 9], ['pigeon', 10]],
      intro: ['Routine inspection. Do you have anything to declare?', 'Declare it with monsters.'], win: 'Your package passes inspection. It\'s still lost, though.', after: 'We inspect everything. Except the bus. Nobody can catch the bus.' }),
    G.trainerActor({ id: 'greg', sprite: 'inspector', x: 26, y: 10, dir: 'up' }, {
      id: 'r45b', name: 'Postal Inspector Greg', sight: 3, party: [['spam', 10], ['pigeon', 10], ['spam', 11]],
      intro: ['Kevin let you through? Kevin lets EVERYONE through.'], win: 'I\'m filing a complaint about Kevin.', after: 'Do you know what STATUS: STILL IN TRANSIT means? Neither do we. It\'s not in the manual.' }),
    G.trainerActor({ id: 'tour', sprite: 'tourist', x: 34, y: 5, dir: 'down' }, {
      id: 'r45c', name: 'Road Tripper', sight: 2, party: [['cactus', 11], ['mite', 10]],
      intro: ['I\'m driving coast to coast! The coast is very far. Battle while I wait.'], win: 'I\'ll put this in my travel blog. Nobody reads it.', after: 'Garf\'s is just ahead. Get the lasagna. Don\'t mention the cat.' }),
    G.npc({ id: 'busdriver', name: 'Bus Driver', sprite: 'oldman', x: 23, y: 5, dir: 'down' }, [
      ['This is the Desert Bus. Eleven years on schedule.', 'We never stop. I\'m not here. You\'re imagining me.'],
      ['Next stop: also not stopping.'],
    ]),
    G.item('r45a', 5, 12, 'jar', 3),
    G.item('r45b', 36, 3, 'pill', 2),
  ],
  warps: [
    ...edgeY(-1, [6, 7, 8], 'lot', 28, 14, 'left'),
    ...edgeY(40, [6, 7, 8], 'garf', 0, 9, 'right'),
  ],
  events: [{ x: 2, y: 5, dir: 'up', talk: ['ROUTE 45', 'THE LOT  ←      → GARF\'S'] }],
});

// ---------------------------------------------------------------- Garf's
S.map('garf', {
  name: 'Garf\'s', music: 'garf', base: 'sand', battleBg: 'road', legend: L,
  boo: ['Garf\'s has a diner, an inn and a bar called the Litter Box. Guess who runs the bar.', 'The E.T. Highway goes north from here. Aliens drive it. Real ones. Not like you, Carl.'],
  rows: [
    'MMMMMMMMMMMMMM|||MMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMM|||MMMMMMMMMMMMMM',
    'M..W.....C....|||E...""""...C.M',
    'M..W..........|||...""""""....M',
    'M.DDDDDD.BBBBB|||.IIIIII.....RM',
    'M.DDDDDD.BBBBB|||.IIIIII......M',
    'M.DDDDDD.BBBBB|||.IIIIII.L....M',
    'M...pppp...pp.|||....pp.......M',
    'M.L.pppp...pp.|||....pp..t....M',
    '-------------------------------',
    '===============================',
    '-------------------------------',
    'M....4....UUUUU.....ffffff....M',
    'M..C......UUUUU.....KKK.......M',
    'M....""""...........KKK...C...M',
    'M...""""""....R.........""""..M',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
  ],
  actors: [
    { id: 'etguard', name: 'Postal Inspector', sprite: 'inspector', x: 15, y: 2, dir: 'down', if: () => !G.hasStamp('dark'),
      talk: function* () { yield* S.say('E.T. Highway checkpoint.', 'Two stamps minimum. Aliens need paperwork too. Especially aliens.', 'Get JB Garfield to stamp you. He\'s in the Litter Box. He\'s always in the Litter Box.', { name: 'Postal Inspector' }); } },
    G.npc({ id: 'peekid2', name: 'Pee Kid', sprite: 'peekid', x: 8, y: 13, dir: 'up', wander: 2 }, [
      ['ASK. PERFORM. INSPECT.', 'I inspected the bus. It\'s a bus.'],
      ['JB Garfield is DARK type. Hit him with LIGHT or SOUND.', 'I\'m not helping. I\'m INSPECTING out loud.'],
    ]),
    G.npc({ id: 'garftour', name: 'Tourist', sprite: 'shopper2', x: 24, y: 8, dir: 'left' }, [
      'The Little Green Inn has the softest beds in Nevada. They\'re green. Everything is green.',
      'I asked the cat for a stamp. He said "the night is long and so is my tab." What does that mean?',
    ]),
    G.item('garf1', 29, 14, 'chalk', 2),
  ],
  warps: [
    ...edgeY(-1, [9, 10, 11], 'route45', 39, 6, 'left'),
    { x: 5, y: 6, to: 'diner', tx: 6, ty: 7, face: 'up' },
    { x: 11, y: 6, to: 'litterbox', tx: 6, ty: 7, face: 'up' },
    { x: 19, y: 6, to: 'inn', tx: 6, ty: 6, face: 'up' },
    ...edge([14, 15, 16], -1, 'ethwy', 10, 38, 'up', () => G.hasStamp('dark')),
  ],
  events: [{ x: 5, y: 12, dir: 'up', talk: ['GARF\'S', 'Pop. 4 (and a cat)'] }],
});

const IL = {
  'c': 'dz_checker', 'w': 'dz_wood', 'k': 'dz_carpet', 'm': 'dz_mat',
  'A': 'dz_dwallA', 'a': 'dz_dwallB', 'n': 'dz_dwin', 'Q': 'dz_bwallA', 'q': 'dz_bwallB', 'G': 'dz_iwallA', 'g': 'dz_iwallB',
  'b': { prop: 'dz_booth', under: 'dz_checker' }, 'r': { prop: 'dz_counter', under: 'dz_checker', counter: true }, 's': { prop: 'dz_stool', under: 'dz_checker' },
  'j': { prop: 'dz_jukebox', under: 'dz_checker' },
  'X': { prop: 'dz_bar', under: 'dz_wood', counter: true }, 'Y': { prop: 'dz_backbar', under: 'dz_wood' }, 'P': { prop: 'dz_pool', under: 'dz_wood' },
  'N': { prop: 'dz_neoncat', under: 'dz_bwallB' }, 'l': { prop: 'dz_lamp', under: 'dz_wood' }, 'v': { prop: 'dz_stool', under: 'dz_wood' },
  'd': { prop: 'dz_desk', under: 'dz_carpet', counter: true }, 'o': { prop: 'dz_poster', under: 'dz_iwallB' },
};
const STOCK = ['pill', 'pillmax', 'jar', 'chalk', 'tape'];
S.map('diner', {
  name: 'Garf\'s Diner', music: 'garf', base: 'dz_checker', bg: '#0c0c12', run: false, legend: IL, rows: [
    'AAAAAAAAAAAAAA',
    'annaanjaannaan',
    'cccccccccccccc',
    'bbcccrrrrrrccc',
    'bbcccccccccccc',
    'cccccccccccccc',
    'bbcccccccccbbc',
    'bbcccccccccbbc',
    'ccccccmccccccc',
  ],
  actors: [
    { id: 'garf', name: 'Garf', sprite: 'garf', x: 7, y: 2, dir: 'down',
      talk: function* () {
        const n = { name: 'Garf' };
        const i = yield* S.ask(S.pick(['Welcome to Garf\'s. I\'m Garf. This is my diner. The cat is not my cat.', 'What\'ll it be? The usual? You don\'t have a usual. You do now.']), ['REST', 'SHOP', 'CHAT', 'BYE'], { name: 'Garf' });
        if (i === 0) yield* G.rest({ map: 'diner', x: 7, y: 4, dir: 'up', where: 'Garf\'s Diner' }, 'Sit down. Have some pie. The monsters can have the crust.', n);
        if (i === 1) yield* G.shop(STOCK, { name: 'Garf', hello: 'Prop Pills, jars, chalk. I also sell pie, but not to you. You\'d spill it.', bye: 'Drive safe. Or don\'t drive. Walk safe.' });
        if (i === 2) yield* S.say(S.pick([
          ['JB Garfield runs the Litter Box next door. Noir type. Talks in voiceover.', 'He owes me for four hundred lasagnas.'],
          ['The Desert Bus came through once. Didn\'t stop. Left a smell of eleven years.'],
          ['Some pilot with goggles came in asking about you. Called you "little brother." Paid in exact change.'],
        ]), n);
      } },
    G.npc({ id: 'dinerkid', name: 'Pee Kid', sprite: 'peekid', x: 12, y: 5, dir: 'left' }, [['I\'m PERFORMING eating pie.', 'It\'s going very well.']]),
  ],
  warps: [{ x: 6, y: 9, to: 'garf', tx: 5, ty: 7, face: 'down' }],
});

const garfT = {
  id: 'garfield', name: 'JB Garfield', leader: true, bg: 'litterbox', sight: 0,
  party: [['rat', 14], ['pizzapigeon', 14], ['ratmanager', 16]],
  win: ['...', 'The kid was good. Too good. The kind of good that gets you a stamp.'],
  after: ['The night\'s still long, kid. But it\'s a little shorter now.', 'Spooky Ghost runs the Chapel in Rhyolite Springs. North, up the E.T. Highway. Tell him he still owes alimony. He\'ll know.'],
  pre: function* () {
    if (F().garfIntro) { yield* S.say('Back again. The city never sleeps. Neither do I. I nap, though. A lot.', GARF); return; }
    F().garfIntro = true;
    yield* S.say('The desert was quiet that night. Too quiet.', 'Then the door opened, and in walked trouble. Trouble was green. Trouble had a bow tie.', GARF);
    yield* S.say('...Are you narrating?', CARL);
    yield* S.say('Everybody narrates, kid. I just do it out loud.', 'You want a stamp. Everybody wants something. I want lasagna. And a nap.', GARF);
    yield* S.say('My monsters are DARK. Like my coffee. Like my past. Like the inside of this hat.', GARF);
  },
  onWin: function* () {
    yield* G.giveStamp('dark');
    yield* S.say('Two stamps. The E.T. Highway checkpoint will wave you through now.', 'And kid... that package. I\'ve seen that label before. Long time ago. Below.', GARF);
    yield* S.say('Below Nevada? What did you see?', CARL);
    yield* S.say('A case I never closed. Go on. The night\'s not getting any younger.', GARF);
  },
};
S.map('litterbox', {
  name: 'The Litter Box', music: 'garf', base: 'dz_wood', bg: '#0c0c12', run: false, battleBg: 'litterbox', legend: IL, rows: [
    'QQQQQQQQQQQQQQ',
    'qqNNqqYYYqqqqq',
    'wwwwwwwwwwwwww',
    'wwwwwwXXXwwwlw',
    'wwwwvwwwwwvwww',
    'wPPwwwwwwwwwww',
    'wPPwwwwwwwwPPw',
    'lwwwwwwwwwwPPw',
    'wwwwwwmwwwwwww',
  ],
  actors: [
    G.trainerActor({ id: 'garfield', sprite: 'garfield', x: 7, y: 2, dir: 'down' }, garfT),
    G.trainerActor({ id: 'lb1', sprite: 'shopper2', x: 4, y: 6, dir: 'right' }, {
      id: 'lb1', name: 'Pool Shark', sight: 4, party: [['rat', 12], ['sock', 12]],
      intro: ['Eight ball, corner pocket. You\'re the eight ball.'], win: 'Scratch.', after: 'Garfield only drinks milk. From a martini glass.' }),
    G.trainerActor({ id: 'lb2', sprite: 'tourist', x: 12, y: 5, dir: 'left' }, {
      id: 'lb2', name: 'Regular', sight: 4, party: [['ratmanager', 14]],
      intro: ['That\'s my stool. Everything here is my stool.'], win: 'Fine. Sit. It\'s a free country. The stool isn\'t.', after: 'DARK monsters shrug off GATE moves. Remember that if you ever go Below.' }),
  ],
  warps: [{ x: 6, y: 9, to: 'garf', tx: 11, ty: 7, face: 'down' }],
});
S.map('inn', {
  name: 'Little Green Inn', music: 'garf', base: 'dz_carpet', bg: '#0c0c12', run: false, legend: IL, rows: [
    'GGGGGGGGGGGGGG',
    'gggoggggggoggg',
    'kkkkkkkkkkkkkk',
    'kkkkkdddkkkkkk',
    'kkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkk',
    'kkkkkkmkkkkkkk',
  ],
  actors: [
    { id: 'innkeep', name: 'Innkeeper', sprite: 'shopper', x: 6, y: 2, dir: 'down',
      talk: function* () {
        const i = yield* S.ask('Welcome to the Little Green Inn. Everything is green. You\'ll fit right in.', ['REST', 'NO THANKS'], { name: 'Innkeeper' });
        if (i === 0) yield* G.rest({ map: 'inn', x: 6, y: 4, dir: 'up', where: 'the Little Green Inn' }, 'Sweet green dreams.', { name: 'Innkeeper' });
      } },
    G.npc({ id: 'innlost', name: 'Lost & Found Rep', sprite: 'shopper2', x: 11, y: 4, dir: 'left' }, [['The inn has a Lost & Found terminal too. Over by the poster. Same cubbies. Same "CARL" labels.']]),
  ],
  warps: [{ x: 6, y: 8, to: 'garf', tx: 19, ty: 7, face: 'down' }],
  events: [{ x: 10, y: 1, talk: function* () { yield* G.lostAndFound(); } }],
});

// ---------------------------------------------------------------- E.T. Highway (north from Garf's to Rhyolite Springs)
const e = grid(20, 40, '.');
box(e, 0, 0, 1, 40, 'M'); box(e, 19, 0, 1, 40, 'M');
box(e, 9, 0, 3, 40, '|');
box(e, 2, 3, 5, 5, '"'); box(e, 13, 6, 5, 4, '"'); box(e, 1, 14, 7, 4, '"'); box(e, 12, 17, 6, 6, '"');
box(e, 2, 25, 6, 5, '"'); box(e, 13, 28, 5, 4, '"'); box(e, 3, 34, 5, 3, '"');
put(e, 12, 3, 'E'); put(e, 7, 11, 'C'); put(e, 15, 13, 'R'); put(e, 3, 21, 'KKK'); put(e, 3, 22, 'KKK');
put(e, 15, 24, 'C'); put(e, 8, 31, 'R'); put(e, 14, 35, 'C'); put(e, 2, 38, 'R'); put(e, 16, 38, 't'); put(e, 6, 9, 't');
S.map('ethwy', {
  name: 'E.T. Highway', music: 'route', base: 'sand', battleBg: 'road', legend: L, rows: rows(e),
  encounters: true, rate: 0.11,
  wild: [['cactus', 28, 13, 16], ['drone', 25, 13, 16], ['echo', 20, 13, 16], ['pigeon', 15, 14, 16], ['grey', 6, 15, 16], ['saguaro', 3, 16, 17]],
  boo: ['Extraterrestrial Highway. Every sign has an alien on it. You\'d think they\'d have asked first.', 'GREYS live out here. Rare. Very rare. They take notes about you.'],
  actors: [
    G.trainerActor({ id: 'lindalite', sprite: 'lindalite', x: 6, y: 12, dir: 'right' }, {
      id: 'et1', name: 'Linda Lite', sight: 3, party: [['mannequin', 15], ['rat', 15], ['mannequin', 16]],
      intro: ['I\'m on my break. Ten minutes. I am going to use all ten of them on you.'], win: 'Break\'s over. I\'m going back to Garf\'s.', after: 'No relation to CEO Linda. I\'m Linda LITE. Half the calories, all the attitude.' }),
    G.trainerActor({ id: 'cryptid', sprite: 'tourist', x: 13, y: 24, dir: 'left' }, {
      id: 'et2', name: 'Cryptid Hunter', sight: 4, party: [['drone', 16], ['echo', 16], ['cactus', 17]],
      intro: ['Shh! I\'m tracking a GREY.', '...Wait. You\'re green. Are you a cryptid?'], win: 'Definitely a cryptid. A fast one.', after: 'I\'ve got six blurry photos of you now. Science!' }),
    G.trainerActor({ id: 'etinsp', sprite: 'inspector', x: 12, y: 33, dir: 'left' }, {
      id: 'et3', name: 'Postal Inspector Lou', sight: 3, party: [['pizzapigeon', 17], ['spam', 16]],
      intro: ['Highway inspection! Aliens to the left, humans to the right!', 'You\'re in the middle. Battle.'], win: 'Okay, you\'re human. Probably.', after: 'Rhyolite Springs is up ahead. It\'s a ghost town. Literally.' }),
    G.item('et1', 2, 4, 'pillmax', 1),
    G.item('et2', 17, 20, 'jar', 3),
    G.item('et3', 1, 36, 'tape', 1),
  ],
  warps: [
    ...edge([9, 10, 11], 40, 'garf', 15, 1, 'down'),
    ...edge([9, 10, 11], -1, 'rhyolite', 13, 16, 'up'),
  ],
  events: [{ x: 12, y: 3, dir: 'up', talk: ['EXTRATERRESTRIAL HIGHWAY', '"Watch for Visitors." Someone has scratched out "Visitors" and written "Carl".'] }],
});
})();
