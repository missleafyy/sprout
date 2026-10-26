// Cracky — map helpers + The Lot (start town). Other areas: maps_mall.js, maps_desert.js, maps_ghost.js,
// maps_res.js, maps_below.js.
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const CARL = G.CARL, BOO = G.BOO;

S.recolor('rock_d', 'rock', { s: 'sd2' });
S.prop('rock_d', { sprite: 'rock_d', talk: 'A desert rock. Warm on one side.' });
S.recolor('sign_d', 'sign', { s: 'sd2' });
S.prop('sign_d', { sprite: 'sign_d' });
S.prop('ship', { sprite: 'ship', fw: 5, fh: 2 });

// ---------------------------------------------------------------- helpers shared by every map file
// a Containment Jar lying on the ground: walk up and press A to take what's inside
G.item = (id, x, y, item, n = 1) => ({
  id: 'item_' + id, sprite: 'jar', x, y, shadowW: 4, turnToTalk: false, if: () => !F()['i_' + id],
  talk: function* (a) {
    F()['i_' + id] = true;
    S.world.actors = S.world.actors.filter(o => o !== a);
    G.bag[item] += n; S.sfx('levelup');
    yield* S.say(`Carl found ${n > 1 ? n + ' ' : 'a '}{blue}${G.items[item].name}{/}!`);
  },
});
// scripted move between maps (stairs, elevators, ladders)
G.goto = function* (map, x, y, dir) {
  S.sfx('door');
  yield* S.wipe('fade', () => S.world.load(map, x, y, dir));
};
G.npc = (o, lines) => Object.assign({ talk: function* () { yield* S.say(...[].concat(typeof lines === 'function' ? lines() : S.pick(lines)), { name: o.name }); } }, o);
G.walkOff = function* (a, dir, n, speed = 1) {
  for (let i = 0; i < n; i++) { a.go(dir, speed, true); yield () => !a.moving; }
  S.world.actors = S.world.actors.filter(o => o !== a);
};

// ---------------------------------------------------------------- The Lot
const LOT = {
  '.': 'sand', '"': 'scrub',
  '=': { terrain: 'lot', under: 'sand' }, '|': { terrain: 'lotV', under: 'sand' }, '!': { terrain: 'lotE', under: 'sand' },
  'A': { prop: 'ship' }, 'L': { prop: 'lamp' }, 'C': { prop: 'cactus' }, 'R': { prop: 'rock_d' }, 'S': { prop: 'sign_d' },
  'c': { prop: 'cart', terrain: 'lot', under: 'sand' }, 'H': { prop: 'bn_hatch' },
};

S.map('lot', {
  name: 'The Lot',
  music: 'lot',
  base: 'sand',
  battleBg: 'desert',
  legend: LOT,
  encounters: true,
  wild: [['rat', 40, 3, 6], ['pigeon', 35, 3, 6], ['spam', 25, 3, 6]], rate: 0.12,
  boo: () => [G.stamps().length === 4 ? 'The hatch, Carl. By the north-west lamp post. I can feel it humming.' : 'The hatch by the north-west lamp post is sealed tight. Four stamp-shaped slots...'],
  rows: [
    'RRRRRRRRRRRRRR.RRRRRRRRRRRRRRR',
    'R..C.........S...........C...R',
    'R....""""".......""""""".....R',
    'R...""""""".....""""""""".C..R',
    'R..."""""""....."""""""""....R',
    'R.....""""........""""".....RR',
    'R............................R',
    'R..L=====================L...R',
    'R...=|=|=|=|======|=|=|=|=...R',
    'RH..=!=!=!=!======!=!=!=!=...R',
    'R...======================...R',
    'R...======================...R',
    'R...=|=|=|=|===c==|=|=|=|=...R',
    'R...=!=!=!=!======!=!=!=!=...R',
    'R..L=====================L....',
    'R.............................',
    'R..C.....AAAAA......C.....R..R',
    'R........AAAAA...............R',
    'R...R........................R',
    'R.......""""".......""""""...R',
    'R......"""""""".....""""""...R',
    'R.......""""".........C......R',
    'R............................R',
    'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
  ],
  actors: [
    { id: 'oldface', name: 'Old Face', sprite: 'oldface', x: 7, y: 18, dir: 'right',
      talk: function* () { yield* G.oldFaceTalk(); } },
    { id: 'suit', name: 'White Suit', sprite: 'suit', x: 14, y: 1, dir: 'down', if: () => !F().beatHuman,
      talk: function* () {
        const n = { name: 'White Suit' };
        if (!F().metSuit) {
          F().metSuit = true;
          yield* S.say('Halt. The Mall of the Future is closed.', 'CEO Linda is making an entrance.', 'It has been going on for six hours.', n);
          yield* S.say('...', 'You look familiar. Have we contained you before?', n);
          yield* S.say('No. I\'m a normal human.', 'Nobody clip that.', CARL);
        } else yield* S.say(S.pick([
          'The entrance is still going. There are fireworks now.',
          'Please fill out form 27-B if you would like to be contained.',
          'Move along, citizen. Citizen-shaped person.',
        ]), n);
      } },
    { id: 'suit2', name: 'White Suit', sprite: 'suit', x: 16, y: 1, dir: 'left', if: () => F().beatHuman,
      talk: function* () {
        yield* S.say(S.pick([
          'The entrance is finally over. You may proceed. Do not run. Do not enjoy yourself.',
          'Four Delivery Stamps and you may go Below. That is the rule. We love rules.',
          `I count ${G.stamps().length} stamp${G.stamps().length === 1 ? '' : 's'}. I counted twice. I always count twice.`,
        ]), { name: 'White Suit' });
      } },
    { id: 'gatekeeper', name: 'Postal Inspector', sprite: 'inspector', x: 29, y: 15, dir: 'left', if: () => !G.hasStamp('light'),
      talk: function* () {
        yield* S.say('Route 45 is closed for a routine delivery audit.', 'Couriers need at least one {blue}Delivery Stamp{/} to pass. CEO Linda gives them out. In the mall. Eventually.', { name: 'Postal Inspector' });
      } },
    { id: 'human', name: 'HU-MAN', sprite: 'human', x: 14, y: 15, dir: 'down', if: () => F().starter && !F().beatHuman,
      talk: function* () { yield* G.humanRematch(); } },
    { id: 'humanHatch', name: 'HU-MAN', sprite: 'human', x: 2, y: 8, dir: 'down', if: () => F().humanAtHatch && !F().beatHumanFinal,
      talk: function* () { yield* G.humanFinal(); } },
    { id: 'pretzel', name: 'Pretzel Guy', sprite: 'oldman', x: 22, y: 15, dir: 'down',
      talk: function* () {
        const n = { name: 'Pretzel Guy' };
        if (!F().pretzel) {
          F().pretzel = true;
          yield* S.say('Pretzels. Free if you never leave.', 'Warm since 1998.', n);
          yield* S.say('...You\'re leaving, though. I can tell.', 'Here. Take these instead. They fell off a Prop Pills truck.', n);
          G.bag.pill += 3; S.sfx('levelup');
          yield* S.say('Carl got 3 {blue}PROP PILLS{/}!');
        } else yield* S.say(S.pick([
          'The pretzels are warm. They have always been warm. Don\'t ask how.',
          'If your monsters get tired, take a nap in your ship. Works for me, and I don\'t even have a ship.',
          'I have a cousin at the Food Court in the mall. Same pretzels. Same warmth. Same 1998.',
        ]), n);
      } },
    G.item('lot1', 26, 21, 'jar', 2),
  ],
  warps: [
    { x: 14, y: 0, to: 'plaza', tx: 16, ty: 18, face: 'up', if: () => !!F().beatHuman },
    { x: 29, y: 14, to: 'route45', tx: 1, ty: 7, face: 'right', if: () => G.hasStamp('light') },
    { x: 29, y: 15, to: 'route45', tx: 1, ty: 8, face: 'right', if: () => G.hasStamp('light') },
    ...[[1, 9], [2, 9], [1, 10], [2, 10]].map(([x, y]) => ({ x, y, to: 'below1', tx: 9, ty: 5, face: 'down', if: () => !!F().beatHumanFinal })),
  ],
  events: [
    { x: 11, y: 17, dir: 'up', talk: function* () { yield* G.shipTalk(); } },
    { x: 13, y: 1, talk: ['{blue}MALL OF THE FUTURE{/}  (north)', '"Outside of time and space. Free parking."'] },
    ...[[1, 9], [2, 9], [1, 10], [2, 10]].map(([x, y]) => ({ x, y, if: () => !F().beatHumanFinal, step: function* () { yield* G.hatchTalk(); } })),
  ],
});
})();
