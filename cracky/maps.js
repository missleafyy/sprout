// Cracky — maps, people and events.
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const CARL = { name: 'Carl', nameColor: 'green' };

S.recolor('rock_d', 'rock', { s: 'sd2' });
S.prop('rock_d', { sprite: 'rock_d', talk: 'A desert rock. Warm on one side.' });
S.recolor('sign_d', 'sign', { s: 'sd2' });
S.prop('sign_d', { sprite: 'sign_d' });
S.prop('ship', { sprite: 'ship', fw: 5, fh: 2 });

const LOT = {
  '.': 'sand', '"': 'scrub',
  '=': { terrain: 'lot', under: 'sand' }, '|': { terrain: 'lotV', under: 'sand' }, '!': { terrain: 'lotE', under: 'sand' },
  'A': { prop: 'ship' }, 'L': { prop: 'lamp' }, 'C': { prop: 'cactus' }, 'R': { prop: 'rock_d' }, 'S': { prop: 'sign_d' },
  'c': { prop: 'cart', terrain: 'lot', under: 'sand' },
};

S.map('lot', {
  name: 'The Lot',
  music: 'lot',
  base: 'sand',
  legend: LOT,
  encounters: true,
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
    'R...=!=!=!=!======!=!=!=!=...R',
    'R...======================...R',
    'R...======================...R',
    'R...=|=|=|=|===c==|=|=|=|=...R',
    'R...=!=!=!=!======!=!=!=!=...R',
    'R..L=====================L...R',
    'R............................R',
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
    { id: 'suit', name: 'White Suit', sprite: 'suit', x: 14, y: 1, dir: 'down',
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
    { id: 'human', name: 'HU-MAN', sprite: 'human', x: 14, y: 15, dir: 'down', if: () => F().starter && !F().beatHuman,
      talk: function* () { yield* G.humanRematch(); } },
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
          'I think I saw your parents\' car once. Big, beige? No? Okay.',
        ]), n);
      } },
  ],
  events: [
    { x: 11, y: 17, dir: 'up', talk: function* () { yield* G.shipTalk(); } },
    { x: 13, y: 1, talk: ['{blue}MALL OF THE FUTURE{/}  (north)', '"Outside of time and space. Free parking."'] },
  ],
});
})();
