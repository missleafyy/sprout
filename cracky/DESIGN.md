# Cracky: Still in Transit — full game design (v1.0)

Read cracky/LORE.md (tone rules) and STYLE.md (art rules) first. Everything here is the plan of record.

## Story in one breath
Carl, a Prop Pills courier who insists he is a normal human, has one package he has never been able to deliver:
**"TO: CARL'S PARENTS. STATUS: STILL IN TRANSIT."** The tracking says it was last scanned *Below Nevada*, in the
facility Carl escaped. The White Suits (the Sequel Committee's enforcers) won't let anyone in without four
**Delivery Stamps**. Four famous locals can sign a courier's manifest: CEO Linda, JB Garfield, Spooky Ghost and Yoko.
Carl collects the stamps (gyms), beats HU-MAN one last time at the facility gate, goes Below Nevada, defeats the
**Head of Containment**, and opens the package's last known location: a claim ticket and two sets of footprints
heading further down. "STILL IN TRANSIT." Sad, warm, open: Boo says they'll find them in the sequel.
Never show or name the parents. Never settle Carl's name.

## Route (linear, with a loop back)
1. **The Lot** (start). North gate → Mall of the Future (closed by a White Suit until HU-MAN is beaten). East → Route 45.
   Hidden facility hatch by the north-west lamp post (opens with 4 stamps) → Below Nevada.
2. **Mall of the Future** (town, indoors-feeling plaza): Food Court (Pretzel Guy heals), Prop Shop (shop),
   Lost & Found (PC box), **LINDA CORP.** (Gym 1, CEO Linda, LIGHT). East wing: **Residences at Tomorrow**
   (locked: "HUMAN OCCUPANCY ONLY" until 3 stamps).
3. **Route 45** (desert highway east of the Lot): Desert Bus parked "eleven years on schedule", scrub, trainers
   (Postal Inspectors Kevin and Greg, a tourist). Leads to:
4. **Garf's** (desert stop town): Garf's Diner (heal + shop counter), The Litter Box (Gym 2, JB Garfield, DARK),
   Little Green Inn, Pee Kid. North → E.T. Highway.
5. **E.T. Highway** (route): scrub + rocks, trainers (Linda Lite on her break, a cryptid hunter), → Rhyolite Springs.
6. **Rhyolite Springs** (ghost town, night): Old hotel (heal), the Chapel (Gym 3, Spooky Ghost, CURSE).
   Pilot X hangs around ("spoilers.").
7. **Residences at Tomorrow** (2 floors, dungeon-like, encounters inside): Gym 4 at the top, Yoko (SOUND).
8. **Below Nevada** (2 floors): White Suit grunts, Pilot X hint, HU-MAN final rival at the gate (in the Lot, before the hatch),
   **Head of Containment** boss (GATE). Then the ending + credits. Post-game: THE BEHOLDEN waits in Below Nevada B2.

## Types (7)
normal, static, curse, sound, dark, gate, light.
- static: 2x curse, gate · ½ static, sound
- curse: 2x sound, light · ½ curse, static, dark
- sound: 2x static, dark · ½ sound, curse
- dark: 2x curse, light · ½ dark, gate
- gate: 2x dark, sound · ½ static, gate
- light: 2x curse, dark · ½ light, gate
- normal: neutral

## Monsters (23 species). id → evolves at level
| id | name | type | notes / look |
|---|---|---|---|
| lamb | STATIC LAMB | static | (done) TV-static sheep, CRT face, rabbit-ear antenna → thunderram @16 |
| thunderram | THUNDER RAM | static | big storm-cloud ram, dark blue-grey wool with yellow lightning, curled horns made of coiled antenna cable, bigger CRT face with confident eyes |
| sock | LOST SOCK | curse | (done) floating striped sock → wraith @16 |
| wraith | LAUNDRY WRAITH | curse | floating laundry-pile ghost: a sheet body with sock-striped arms, clothespin on its head, hollow glowing eyes, green wisps |
| mite | CASSETTE MITE | sound | (done) cassette bug → masterdeck @16 |
| masterdeck | MASTER DECK | sound | boombox beast: double tape deck body, two big speaker "eyes", carry handle like horns, six stubby legs, notes |
| rat | MALL RAT | dark | (done) → ratmanager @14 |
| ratmanager | RAT MANAGER | dark | bigger rat in a short-sleeve shirt + tie + MANAGER badge, clipboard, unimpressed |
| pigeon | COURIER PIGEON | gate | (done) → pizzapigeon @14 |
| pizzapigeon | PIZZA PIGEON | gate | chunkier pigeon, teal delivery cap, balancing a pizza box, one slice missing |
| spam | SPAM | static | (done) → phishking @18 |
| phishking | PHISHING KING | static | regal envelope with a crown of fishhooks, a junk-mail cape, a hook tail, sly eyes |
| mannequin | MANNEQUIN | light | cute faceless mall mannequin bust on a stand, pastel SALE scarf, price tag, glint → storespirit @18 |
| storespirit | STORE SPIRIT | light | glowing floating mannequin with a halo of shopping bags, gold and pink |
| cactus | JUMPER CACTUS | normal | round hopping cactus ball, tiny pink flower, big eyes → saguaro @16 |
| saguaro | OLD MAN SAGUARO | normal | tall grumpy saguaro, white spine beard, cowboy hat, arms up |
| echo | ECHO | sound | small translucent cyan blob made of ripple rings, round mouth → choir @20 |
| choir | THE CHOIR | sound | three echo heads in a robe, stacked, singing, violet-blue, notes |
| drone | LEMON DRONE | gate | lemon-yellow quadcopter with one camera eye, rotor blur → wardrone @22 |
| wardrone | WAR DRONE | gate | red armoured drone, siren light, antennas, angrier eye |
| sheet | SHEET | curse | a fake-ghost hologram bedsheet: cyan/magenta scanlines, glitch offsets, neon-on-dark |
| grey | GREY | light | classic grey alien visitor: big black almond eyes, thin, holding a little probe/clipboard. (Not Carl: Carl is teal.) |
| beholden | THE BEHOLDEN | dark | legendary: a giant eye with stalks, each stalk holding an unpaid bill; purple + gold |

Sprites: `<id>_front` 56x56 origin [28,56], `<id>_back` 64x64 origin [32,64], frames idle0/idle1. Evolutions reuse the
pre-evolution's palette family so they read as the same line, but bigger and more detailed.

## People (overworld 16x24, frames down/up/left 0-2, origin [8,23])
linda (CEO Linda: pink rolled ponytail with side curls, black high-collar jacket, pink pinstripe shirt + pink tie) ·
garfield (JB Garfield: fat orange cat, grey fedora, tan trenchcoat) · ghost (Spooky Ghost: white sheet ghost, black oval eyes,
fanged grin, faint purple glow, floats) · yoko (brown bob, lavender sleeveless turtleneck, white belt, gold pendant) ·
headofc (Head of Containment: tall, white suit, white visor helmet, grey moustache) · mallcop (blue cap + uniform, badge,
moustache) · inspector (postal inspector: navy jacket, cap, satchel) · pilotx (spiky black hair, red headband, yellow ring
goggles, pale teal coat) · peekid (dark bowl cut, white sailor shirt, blue collar, brown neckerchief) · shopper / shopper2
(generic mall NPCs) · cowboy (ghost-town ghost: translucent pale-blue cowboy) · lindalite (waitress Linda: pink diner
uniform, pink ponytail) · garf (diner owner: big guy, white apron, paper hat) · tourist (hawaiian shirt, camera).

## Systems
Evolution (flash + "What? X is evolving!"), learnsets (new moves at levels; 5th move asks which to forget),
trainers with line of sight (! then walk up), gym leaders give Delivery Stamps, money (PROP BUX), shop
(Prop Pills 100, Prop Pills MAX 300, Containment Jar 200, Sigil Chalk 250 = repel 100 steps, Revive Tape 600),
Lost & Found PC (swap box ↔ party), Boo-dex (seen/caught), per-area battle backgrounds, blackout returns to last heal spot.
