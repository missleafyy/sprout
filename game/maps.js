// Sprout Town — maps, people and events. Town layout drafted with tools/gen_town.py.
(function () {
const S = Sprout;
const F = () => S.state.flags;

// legend shared by outdoor maps
const OUT = {
  '.': 'grass', '"': 'tallgrass', '*': 'flowers', '+': 'flowers_y',
  '#': { terrain: 'path' }, '~': { terrain: 'water' },
  'T': { prop: 'tree' }, 'B': { prop: 'bush' }, 'R': { prop: 'rock' }, 'F': { prop: 'fence' },
  'H': { prop: 'house' }, 'G': { prop: 'house_teal' }, 'M': { prop: 'mailbox' }, 'S': { prop: 'sign' },
};

S.map('town', {
  name: 'Sprout Town',
  music: 'town',
  legend: OUT,
  encounters: true,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT......................TTTT',
    'TTTT"""""""".##.."""""""""TTTT',
    'TT.""""""""".##S."""""""""..TT',
    'TT.""""""""".##.."""""""""..TT',
    'TT.""""""""".##.."""""""""..TT',
    'TT.""""""""".##.."""""""""..TT',
    'TT...........##.............TT',
    'TTBBBBBBBBBBB##BBBBBBBBBBBBBTT',
    'TT...........##.............TT',
    'TT.........B.##.B...........TT',
    'TT..HHHHH....##....GGGGG....TT',
    'TT..HHHHH....##....GGGGG....TT',
    'TT..HHHHHM...##...MGGGGG....TT',
    'TT.########################.TT',
    'TT.########################.TT',
    'TT..........S##.............TT',
    'TT.FFFFFFFF..##..R...~~~....TT',
    'TT.*++*****..##....~~~~~~~..TT',
    'TT.*****++*..##...~~~~~~~~~.TT',
    'TT...........##..~~~~~~~~~~~TT',
    'TT."""""""TT......~~~~~~~~~.TT',
    'TT."""""""TT.......~~~~~~~..TT',
    'TT."""""""TT.........~~~..R.TT',
    'TT........TT................TT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  actors: [
    { id: 'ivy', name: 'Ivy', sprite: 'girl', x: 7, y: 17, dir: 'down', wander: 2,
      talk: function* () {
        if (!F().metIvy) {
          F().metIvy = true;
          yield* S.say('Oh, hi! I planted this whole garden myself.', 'The red ones are called Sunpetals. They turn to follow you around!', { name: 'Ivy' });
        } else yield* S.say(S.pick([
          'Have you seen the Puffmoths up north? They\'re SO fluffy.',
          'If you hold {blue}B{/} you can run! My mom says not to run in the garden though.',
          'Sprig looks really happy following you around.',
        ]), { name: 'Ivy' });
      } },
    { id: 'moss', name: 'Grandpa Moss', sprite: 'oldman', x: 16, y: 21, dir: 'right',
      talk: function* () { yield* S.game.mossTalk(); } },
    { id: 'boo', name: 'Boo', sprite: 'boo', x: 25, y: 11, anim: 'idle', idleRate: 24, float: 2, shadowW: 4,
      talk: function* (a) {
        if (!F().metBoo) {
          F().metBoo = true;
          a.hop = { t: 0, d: 16, h: 6 }; S.sfx('pop');
          yield* S.say('BOO!', '...', 'Did I scare you? No?', 'Hmph. I\'ll practice more. Ghosts have standards, you know.', { name: 'Boo', nameColor: 'green' });
        } else yield* S.say(S.pick([
          'I\'m not haunting this house. I\'m house-sitting. Totally different.',
          'Leafy says I\'m the friendliest ghost in town. I\'m the ONLY ghost in town.',
          'Boo-tiful day, isn\'t it? ...Heh. I\'ve been saving that one.',
        ]), { name: 'Boo', nameColor: 'green' });
      } },
    { id: 'cat', name: 'Cat', sprite: 'cat', x: 10, y: 13, anim: 'idle', idleRate: 50, shadowW: 4, turnToTalk: false,
      talk: function* () { S.sfx('pop'); yield* S.say(S.pick(['Mrrp?', 'Mrrrrow.', '...purrrrr...', 'The cat stares at Sprig. Sprig stares back.'])); } },
  ],
  warps: [
    { x: 6, y: 14, to: 'home', tx: 5, ty: 8, dir: 'up', face: 'up' },
  ],
  events: [
    { x: 15, y: 4, talk: ['{blue}NORTH: MOSSY WOODS{/}', 'The path is overgrown. Maybe in the full game...'] },
    { x: 12, y: 17, talk: ['{green}SPROUT TOWN{/}', '"Where little things grow."'] },
    { x: 21, y: 14, dir: 'up', talk: ['It\'s locked.', 'A note on the door says: "Gone mushroom hunting! Back whenever." '] },
  ],
});

S.map('home', {
  name: 'Your House',
  music: 'town',
  base: 'floor',
  bg: '#0c0c12',
  run: false,
  legend: {
    'A': 'wallA', 'W': 'window', 'B': 'wallB', '.': 'floor', 'm': 'mat',
    'r': { terrain: 'rug', under: 'floor' },
    'b': { prop: 'bed' }, 'v': { prop: 'tv' }, 'k': { prop: 'shelf' }, 'p': { prop: 'plant' }, 't': { prop: 'table' },
  },
  rows: [
    'AAWAAAAAWAA',
    'BBBBBBBBBBB',
    'b.v.kk...p.',
    'b..........',
    '..rrrrr.tt.',
    '..rrrrr....',
    '..rrrrr....',
    '...........',
    '.....m.....',
  ],
  warps: [
    { x: 5, y: 9, to: 'town', tx: 6, ty: 15, dir: 'down', face: 'down' },
  ],
  events: [],
});
})();
