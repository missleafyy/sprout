# Sprout style card

The look we're going for is **Pokémon on the DS** (Platinum / HeartGold era): bright, soft, readable, with dark coloured outlines on characters and calmer, outline-free ground. Every new piece of art should match this card. If something needs to break a rule, say so.

## Screen and scale
- Two screens, **256×192 each**. The top screen shows the world; the bottom one is the touch screen (menus, buttons, info).
- **16×16 tiles**, giving 16×12 tiles on screen.
- Everything is drawn at 1x and scaled up only by whole numbers. The only exception is the title logo, which is drawn at 2x.

## Palette (`game/palette.js`)
- Colours are named ramps numbered dark → light (`gr0..gr5`, `lf0..lf5`, `wa0..wa5`, …).
- **Hue shift**: shadows lean blue/violet, highlights lean warm yellow.
- Outlines are never pure black. Use `ink` (#2b2134, deep plum) for characters and the darkest step of a ramp for objects (`lf0` for trees, `st0` for rocks).
- Leafy's greens (`mint`, `tea`, `olive`, `palm`, `palm2`, `dusty`) are the UI accents and Boo's colours.

## Light
- One light source for everything: **upper-left, slightly in front**.
- Round things get a highlight at the upper-left and a darker crescent at the lower-right (see `ball()` in `tools/pxgen.py`).

## Outlines
| Thing | Outline |
|---|---|
| Characters, creatures, NPCs | full 1px outline (`ink` or a dark ramp colour) |
| Props (trees, houses, signs) | full 1px outline in their own darkest colour |
| Ground (grass, path, water) | no outline; the edges come from terrain bands |
| UI boxes | rounded, 2–4 bands from dark outside to light inside |

## Sizes and proportions
| Thing | Canvas | Notes |
|---|---|---|
| Overworld person | 16×24 | feet on row 22, origin `[8, 23]`; head ≈ rows 2–12, body rows 13–22 |
| Overworld creature (follower) | 16×16 | origin `[8, 16]`; walk = 1px hop |
| Tree | 32×40 | 2×2 footprint; canopy made of 7 shaded clumps |
| House | 80×80 | 5×3 footprint; door in the middle of the bottom row |
| Battle back sprite | 64×64 | seen from behind, bottom is hidden by the text box |
| Battle front sprite | 56×56 | 2 idle frames |
| Font | 8px caps, 2px descenders | always drawn with the DS drop shadow |

- People reuse the player's body (`person()` in `game/art_chars.js`). New NPCs only need a new head (rows 0–12) and a recolour.
- Eyes are 1×2 dark pixels, set wide apart; creatures get a 1px white shine on the same side for both eyes.

## Shading depth
- Characters: 2–3 steps per material (base, shadow, sometimes a highlight).
- Props and creatures: 4–5 steps.
- No dithering, no semi-transparent pixels in sprites. Character shadows are the one exception: a soft translucent ellipse drawn by the engine.

## Animation timing
- Walking: 16 frames per tile (8 when running). Step frames alternate left and right foot.
- Idle loops: 20–50 frames per pose; tall grass and flowers sway at 40.
- Battle: creatures bob every 22 frames; hits blink and shake for about 24 frames.
