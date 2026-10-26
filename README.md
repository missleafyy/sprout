# Sprout — a DS-style pixel art game engine

A small engine for making games that look and feel like Pokémon on the Nintendo DS: two screens (the bottom one is touch), 16×16 tiles, chunky outlined sprites, typewriter dialog boxes, chiptune music and turn-based battles.

It's plain JavaScript with no build step and no dependencies. Open `index.html` and it runs.

```
./play.sh             # opens the game in its own window
./play.sh '?map=town' # jump straight into the town (skips the title)
```

**Controls:** arrows/WASD to move · **Z** = A (talk/confirm) · **X** = B (back, hold to run) · **Enter** = Start (menu) · **Shift** = Select · **mouse** = stylus on the bottom screen · **M** = mute. Gamepads work too.

## The demo: *Sprout Town*

You wake up at home with your partner Sprig. Head outside, find Grandpa Moss by the pond, win a battle against a wild Puffmoth in the tall grass up north, and earn the Leaf Badge. Along the way: Ivy and her garden, an orange cat, a locked house, and Boo the ghost, who is definitely house-sitting and not haunting.

## The second game: *Cracky: Still in Transit*

```
./play.sh cracky
```

The Cracky universe (Pretend Co.) as a full monster-catching game. You play Carl, a perfectly normal human courier, with Boo floating along as his partner. Carl's one undeliverable package, "TO: CARL'S PARENTS. STATUS: STILL IN TRANSIT", was last scanned Below Nevada, and the White Suits won't let anyone down without four Delivery Stamps.

- **Route:** The Lot → Mall of the Future (CEO Linda, LIGHT) → Route 45 → Garf's (JB Garfield, DARK) → E.T. Highway → Rhyolite Springs (Spooky Ghost, CURSE) → Residences at Tomorrow (Yoko, SOUND) → the hatch (HU-MAN, one last time) → Below Nevada → the Head of Containment → ending and credits. Post-game: THE BEHOLDEN.
- **Systems:** 23 monsters with evolutions, 7 types, about 40 moves, learnsets with a forget-a-move prompt, trainers with line of sight, gym stamps, PROP BUX and shops, the Lost & Found (PC box), the Boo-dex, a courier license, Sigil Chalk repel, Revive Tape, a battle background for each area, and blackouts back to the last rest stop.

Story and design: `cracky/DESIGN.md`. Lore notes: `cracky/LORE.md`.

Dev shortcuts: `cracky.html?map=garf&x=15&y=10&lv=20&starter=sock&party=rat,spam&stamps=2` · `?battle=pigeon&foelv=8&bg=mall` · `?rival` · `?evolve&lv=15` · `?credits` · `?catchall` · `?noenc` · `?mute`. `tools/checkmaps.html` checks every map (row widths, legend, warps, actors in walls).

## Folder layout

```
engine/          the reusable engine (no game content in here)
  core.js        screens, drawing (Gfx), main loop, scenes, script tasks
  input.js       keyboard/gamepad → DS buttons, mouse → touch screen
  art.js         palette, text-grid sprites, recolours, autotiling terrains
  font.js        the pixel font (hand-drawn glyphs + DS drop shadow)
  audio.js       chip synth: sound effects + a music sequencer
  ui.js          boxes, dialog, choice menus, touch buttons, transitions
  world.js       tile maps, props, actors, grid movement, y-sorting, warps
game/            the Sprout Town demo
  palette.js     every colour, as named ramps
  art_*.js       all the sprites, as text grids
  maps.js        the maps, NPCs and events
  battle.js      the battle system
  music.js       songs
  main.js        title screen, bottom-screen "Sprout Pad", story
cracky/          Cracky: Still in Transit (art, monsters, data, battle, story, main, maps per area, music)
tools/
  gallery.html   shows every sprite (?only=player,tree  ?scale=6  ?bg=%23333  ?load=cracky/palette.js,cracky/art_mons.js)
  shot.sh        headless screenshot + console errors (how Claude checks its work)
  pxgen.py       helpers for drafting art in Python (shaded balls, outlines…)
  gen_*.py       the drafts the props, interior, creatures and town layout came from
STYLE.md         the style card: palette, light, outlines, sizes. Read this before drawing.
```

## How the pieces work

### Sprites are text grids
Each character is one pixel and `.` is transparent. The legend maps characters to palette names:

```js
S.sprite('cat', { w: 16, h: 16, origin: [8, 15],
  legend: { o: 'ink', c: 'ct2', C: 'ct1', w: 'ct3' },
  frames: {
    idle0: [ '................', /* 16 rows */ ],
    idle1: { from: 'idle0', edits: [[3, 5, 'C']] },            // copy + change pixels
    walk:  { from: 'idle0', parts: [{ x: 0, y: 12, rows: [...] }] }, // stamp a patch ('_' erases)
    hop:   { from: 'idle0', shift: [0, -1] },
  } });
S.recolor('cat_black', 'cat', { c: '#3a3a4a', C: '#2a2a34' });   // same art, new colours
```

### Terrains autotile
Paths, ponds and rugs are one tileable 16×16 fill plus edge "bands". The engine builds the rounded corners and wobbly hand-drawn edges for every neighbour combination by itself.

### Maps are text too

```js
S.map('town', {
  legend: { '.': 'grass', '#': { terrain: 'path' }, 'T': { prop: 'tree' } },
  rows: [ 'TTTT', 'T..T', 'T##T', 'TTTT' ],
  actors: [{ id: 'ivy', sprite: 'girl', x: 7, y: 17, wander: 2, talk: 'Hi!' }],
  warps:  [{ x: 6, y: 14, to: 'home', tx: 5, ty: 8, dir: 'up' }],
  events: [{ x: 12, y: 17, talk: ['{green}SPROUT TOWN{/}', 'Where little things grow.'] }],
});
```

Multi-tile props (a 2×2 tree, a 5×3 house) are written as blocks of their letter. Solid masks and doors are set on the prop (`solid: ['xxxxx','xxxxx','xxDxx']`).

### Cutscenes are coroutines

```js
S.run(function* () {
  yield* S.say('Hello!', 'Second page.', { name: 'Ivy' });
  const pick = yield* S.ask('Want to battle?', ['YES', 'NO']);
  yield 30;                           // wait 30 frames
  yield () => !player.moving;         // wait until something is true
  if (pick === 0) S.game.startBattle('puffmoth', 4);
});
```

Text can be coloured with `{red}…{/}`, `{blue}`, `{green}`. Pages break automatically, and `{p}` forces a new page.

### The bottom screen
Buttons are immediate-mode: `if (S.ui.button(bot, x, y, w, h, 'SAVE', 'blue')) …`. They respond to both mouse taps and keyboard selection.

## How we'll make games together

1. **You describe it.** A place, a character, a creature, a feeling.
2. **I draw it** as grids that match `STYLE.md`, render it with `tools/gallery.html` and `tools/shot.sh`, look at the result, and fix it before showing you.
3. **You react.** "Bigger eyes," "warmer roof," "this town needs a bakery."

Anything you want to draw yourself works too: draw at 1x with only palette colours, and I'll turn it into a grid.

### Dev shortcuts
`index.html?map=town&x=13&y=16` (start anywhere) · `?battle=puffmoth` · `?noenc` (no random battles) · `?quest` · `?mute` · `?skip=300&keys=R16,A` (fast-forward with scripted input; used for testing).
