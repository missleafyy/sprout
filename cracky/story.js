// Cracky — the main story beats that aren't tied to one map: intro, goals, Old Face, HU-MAN, the A.S.S.
(function () {
const S = Sprout;
const G = S.game;
const F = () => S.state.flags;
const BOO = { name: 'Boo', nameColor: 'green' };
const CARL = { name: 'Carl', nameColor: 'green' };
const FACE = { name: 'Old Face' };
const HUMAN = G.HUMAN = { name: 'HU-MAN', nameColor: 'red' };

// what Boo shows on the bottom screen
G.goal = () => {
  const f = F(), n = G.stamps().length;
  if (!f.starter) return 'Find {green}Old Face{/} next to the ship. He said something about jars.';
  if (!f.beatHuman) return 'Deal with {red}HU-MAN{/}.';
  if (!G.hasStamp('light')) return 'The {blue}Mall of the Future{/} is north. CEO Linda has the first {blue}Delivery Stamp{/}.';
  if (!G.hasStamp('dark')) return 'Take {blue}Route 45{/} east of the Lot to {blue}Garf\'s{/}. JB Garfield runs the Litter Box.';
  if (!G.hasStamp('curse')) return 'Head north up the {blue}E.T. Highway{/} to {blue}Rhyolite Springs{/}. Spooky Ghost is in the Chapel.';
  if (!G.hasStamp('sound')) return 'Three stamps! The {blue}Residences at Tomorrow{/} (Mall, east wing) should let Carl in now. Yoko lives at the top.';
  if (!f.beatHumanFinal) return 'Four stamps! Go back to {blue}the Lot{/}. The hatch is by the north-west lamp post.';
  if (!f.beatHead) return 'Go {blue}Below Nevada{/}. The package was last scanned there.';
  if (!f.beatBeholden) return 'STILL IN TRANSIT. Something is still watching from {blue}Below Nevada B2{/}...';
  return `Boo-dex: ${G.caught.size}/${G.dexOrder.length}. Contain them all, Carl ♥`;
};

G.intro = function* () {
  yield 40;
  yield* S.say('Carl. Carl! Wake up.', 'You fell asleep on the ramp again.', BOO);
  yield* S.say('I wasn\'t asleep. I was doing a normal human thing. With my eyes closed.', CARL);
  yield* S.say('Did the package come back again?', BOO);
  yield* S.say('...Yeah.', '"TO: CARL\'S PARENTS. STATUS: {red}STILL IN TRANSIT{/}."', 'It always comes back.', CARL);
  yield* S.say('Then let\'s deliver it ourselves.', '{green}Old Face{/} is waiting right over there. He said something about jars. And monsters. And "the connections."', BOO);
  yield* S.say('Move with the {blue}arrow keys{/}. Talk with {blue}Z{/}. Hold {blue}X{/} to run.',
    'The {blue}bottom screen{/} is a touch screen. Click it with your mouse! {blue}Enter{/} opens the menu.');
};

const STARTERS = [
  { sp: 'lamb', line: 'A sheep made of dead channels. It crackles when it is happy.' },
  { sp: 'sock', line: 'A lost sock, back from wherever socks go. Its pair is still out there.' },
  { sp: 'mite', line: 'A cassette that grew legs. It only knows one song, and it\'s great.' },
];
const COUNTER = G.COUNTER = { lamb: 'mite', sock: 'lamb', mite: 'sock' };   // HU-MAN picks the one that beats yours

G.oldFaceTalk = function* () {
  const f = F();
  if (!f.starter) {
    yield* S.say('Carl. Little courier. You came.', 'Those are the connections.', FACE);
    yield* S.say('I am Old Face. I backed you up once. Or you backed me up. The logs disagree.', FACE);
    yield* S.say('Your package. It was last scanned {blue}Below Nevada{/}. In the facility you escaped from.', FACE);
    yield* S.say('The {blue}White Suits{/} guard the way down. They let nobody in without four {blue}Delivery Stamps{/}.',
      'Four famous locals can sign a courier\'s manifest. CEO Linda. JB Garfield. Spooky Ghost. And Yoko.', FACE);
    yield* S.say('And the desert is full of {blue}monsters{/} now. A courier needs protection.', FACE);
    yield* S.say('And snacks.', BOO);
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
      `Stamps: ${G.stamps().length} of 4. The White Suits count very carefully. It is the only thing they enjoy.`,
      'The mall is outside time. The parking lot is just outside the mall. Think about it. Or don\'t.',
      'Rest in your ship when your monsters are tired. The A.S.S. remembers how to fix things.',
    ]), FACE);
  }
};

function* humanArrives() {
  yield 20;
  S.sfx('exclaim');
  const pl = S.world.player;
  const hu = new S.Actor({ id: 'human', name: 'HU-MAN', sprite: 'human', x: pl.x, y: 14, dir: 'down' });
  S.world.actors.push(hu);
  G.bang(hu);
  yield* S.say('HOLD IT!', HUMAN);
  while (hu.y < pl.y - 1) { hu.go('down', 1, true); yield () => !hu.moving; }
  pl.dir = 'up';
  yield* S.say('BY THE POWER OF NEVADA!', 'I am {red}HU-MAN{/}. Carl, but focus-tested.', 'Square jaw. Sunglasses. Ninety-two percent approval with ages 18 to 34.', HUMAN);
  yield* S.say('...Is that what I look like?', CARL);
  yield* S.say('It\'s what you SHOULD look like. The Sequel Committee had notes.', 'And THEY want that package to stay lost.', HUMAN);
  const mine = G.species[COUNTER[F().starter]].name;
  yield* S.say(`I also got a jar. I picked {red}${mine}{/}. It's statistically better than yours.`, 'Let\'s settle this. Battle me!', HUMAN);
  G.humanBattle();
}

// the first rival fight (again from his spot in the lot if Carl lost)
G.humanBattle = () => G.startBattle({ trainer: {
  name: 'HU-MAN', party: [[COUNTER[F().starter], 4]], money: 100,
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
    yield* S.say('I\'ll be back. With a sequel.', 'And when you reach that hatch, I\'ll be waiting. Committee orders.', HUMAN);
    if (h) { for (let i = 0; i < 3; i++) { h.go('up', 2, true); yield () => !h.moving; } S.world.actors = S.world.actors.filter(a => a !== h); }
    yield* S.say('Carl! That was amazing. You were very... yourself.', BOO);
    yield* S.say('The {blue}Mall of the Future{/} is north. CEO Linda has the first stamp.', 'And the {green}dry scrub{/} is full of monsters. Weaken them, then throw a jar!', BOO);
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
  yield* G.rest({ map: 'lot', x: 11, y: 18, dir: 'down', where: 'the A.S.S.' });
};
})();
