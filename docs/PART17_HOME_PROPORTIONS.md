# Freshora - PART 17 (Home looks like the design on every phone) - includes Part 16

## Why Home looked too big / needed scrolling
The design screenshot was measured: every element is a FRACTION of the screen width (banner = 93% wide and 59% as tall, category tile = 12.9% of width, product card = 22.7% of width -> 4 cards per row, "Fresh Picks" heading = 30% of width, ...).
The app used fixed dp sizes (heading 20, tile 64, card 124, ...), so on a phone the text and cards were up to 1.8x bigger relative to the screen.
Now `mobile/src/scale.js` converts design measurements to dp for the current screen width: `u(n)` (size) and `f(n, min)` (font, never below `min`).

## Files
| File | Change |
|---|---|
| `mobile/src/scale.js` (new) | `useDesign()` -> `{ width, u, f }`. `DESIGN_ZOOM = 1` = exactly like design; change it to make all of Home slightly bigger/smaller. |
| `components/HomeBanner.js` | card height = 59% of width, headline / subtitle / Shop Now / art position as in the design. Also used by Offers screen. |
| `components/AppHeader.js` | new prop `scaled` (Home only) -> location, bell, cart, search bar in design proportions. Other screens unchanged. |
| `components/CategoryCard.js` | tiles take `fs` / `gap` props; corner radius like the design. |
| `components/HomeOffers.js` | "10 Minutes" strip and the 3 offer cards in design proportions. |
| `components/HomeProducts.js` | card = 22.7% of width, FOUR cards in one row, photo area 1.4:1, price row at the bottom of equal-height cards. Also used by "You May Also Like" on Products. |
| `screens/Home.js` | gaps between sections as in the design, banner dots float over the banner (no extra height), "Offers for You" heading in the same style. |
| Part 16 files | `backend/app/db/database.py`, `mobile/src/components/Img.js`, `mobile/assets/products/*` (69 JPG + index.js) - bundled product photos. |

## Readable minimums (the only deliberate difference from the design)
The design's smallest text would be 7-9 dp on a 360 dp phone. These minimums are used instead: headings 14, product name 10.5, unit 9.5, price 12, category label 10, sub-text 9.5. Change the second number of `f(n, min)` in the files if you want them smaller.

## Not verified
Not run on a phone. All 7 changed JS files compile (Babel / babel-preset-expo). Measurements come from the 262 px reference screenshot, so +-1-2 dp differences are possible.
