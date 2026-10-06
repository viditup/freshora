# Freshora - PART 15 (product photos not showing, hero banner cut off, Home gaps)

Base: `freshora.zip` (Part 14). Only the files listed below changed. No new npm packages, no API/route/navigation changes.

## Why product photos were missing (from your 3 screenshots)
1. The database still stored the old **green text-only placehold.co** URLs ("Fresh Apples" written on a green box) - the seed ran before the photos existed - or the old PC address. `fix_image_urls.py` had to be run by hand and was easy to forget / go stale when the Wi-Fi IP changes.
2. Each photo was ~1 MB (1254x1254 PNG, 77 MB in total), so boxes stayed empty for a long time on Wi-Fi.

## Why the hero banner was cut off
The card had a **fixed height** (64% of width). The text column (4-line headline + 3-line subtitle + button) was taller than that, especially because the phone's **system "Large font"** setting made all text ~30% bigger, so the headline lost its top ("Freshness") and the "Shop Now" button lost its bottom.

## Changes
| File | Change |
|---|---|
| `backend/app/db/database.py` | `ser()` now builds image URLs when the API answers: host = the address the phone used to reach the server; file = the photo that really exists in `backend/static/<kind>/<slug>.(jpg/jpeg/webp/png)`. Placeholder / old-IP / old-extension URLs are corrected automatically. **No database repair or reseed is needed any more.** Also applied to category, banner and order-line images. |
| `backend/app/main.py` | small middleware that remembers the request host for the above. |
| `backend/app/routes/cart.py` | cart line image uses the corrected URL. |
| `backend/static/products/*.jpg` (69, new) | the same photos resized to 600 px JPG: **77 MB -> 2.1 MB**. The old `.png` files can stay (the lighter `.jpg` is chosen first) or be deleted. |
| `backend/static/banners/*.jpg` (3, new) | 1.4-2.1 MB PNG -> small JPG. |
| `mobile/src/fonts.js` | global cap on system font scaling (max 110%) so Large-font phones keep the design proportions. Change `MAX_FONT_SCALE` to allow more. |
| `mobile/src/components/Img.js` | placehold.co URLs are treated as "no photo" (neutral placeholder, no fake text); retries when the URL changes. |
| `mobile/src/components/HomeBanner.js` | height = minimum only, text decides the real height (cannot clip); design line breaks (Freshness / at your / doorstep / in minutes.) and design subtitle copy. |
| `mobile/src/components/AppHeader.js` | header = location + bell + cart like the PDF (the extra heart icon removed; Wishlist is still in Profile > Wishlist). |
| `mobile/src/components/CategoryCard.js`, `screens/Home.js` | the 5 category tiles + All Categories fit **in one row** like the PDF (before: 4 tiles, rest scrolled away). |
| `mobile/src/components/HomeOffers.js` | "10 Minutes" strip: PDF layout (subtitle "Fresh. Fast. Hassle-free.", white red "Order Now" pill), colour matched to its art (no visible lighter rectangle). "Offers for You": PDF layout (title top-left, offer line bottom-left, photo right, chevron top-right), shorter cards. |
| `mobile/src/components/HomeProducts.js` | smaller PDF-style cards, white photo area, no hairline between sections. `CARDS_VISIBLE = 3.3` (see below). |

## What you must do
1. Copy the files from the patch zip over your project (same paths).
2. Restart the backend (`start-backend.bat`). Then reload the app. Nothing else.
3. Test in the phone browser: `http://<PC-IP>:8000/static/products/bananas-robusta.jpg` must show a banana photo. If it does not, the phone cannot reach the PC (Wi-Fi / firewall port 8000) - that is a network problem, not an app problem.

## Verified here
- Resolver logic run against sample documents (placeholder -> photo, old 10.0.2.2 host + .png -> current host + .jpg, product with no photo left alone, banner, category, order line, user doc untouched, no-request fallback).
- All 77 mobile JS files parse; a real Metro/Hermes Android bundle compiles (`expo export --platform android`, 1057 modules).

## NOT verified
- Not run on a phone/emulator, so spacing was matched from the PDF by measurement, not by looking at the running app. Please send a new screenshot of Home.
- Backend not started here (no MongoDB / Python packages installed), so the middleware + `ser()` change was tested only with stubs. `tests/smoke_test.py` was not run.

## Honest differences from the PDF that are still left (Home)
| Screen / part | Matches PDF? | What is still different |
|---|---|---|
| Home header | yes | - |
| Hero banner | mostly | grows to ~233 dp tall (PDF ~215) so text can never be cut; carousel dots under it are kept (PDF shows none, needed to swipe 3 banners) |
| Category row | yes | - |
| 10 Minutes strip | mostly | art is a small 280x160 image, slightly soft |
| Fresh Picks / product rows | partly | PDF shows 4 cards per row, app shows ~3.3. 4 across needs ~7 dp text. Set `CARDS_VISIBLE = 4` in `HomeProducts.js` to force it |
| Offers for You | mostly | card colours sampled from the art, not from the PDF |
| Everything below Offers on Home, and all other screens | not re-audited in this part | Categories, Product Details, Cart, Checkout, Orders, Profile still need the same screenshot comparison |

## PART 16 (follow-up): onion, apples, bananas, pomegranate, green grapes, tomato, potato still had no photo
Real cause: your database was seeded with the SHORT names ("Fresh Apples", "Bananas", "Tomato", "Onion", "Potato", "Pomegranate", "Green Grapes") but the photo files are named `fresh-apples-shimla`, `bananas-robusta`, `tomato-hybrid` ... The exact-name lookup never found them.
- `backend/app/db/database.py`: if there is no photo with the exact slug, the photo whose name starts with it is used (fresh-apples -> fresh-apples-shimla.jpg).
- `mobile/assets/products/` (new, 69 JPG, 1.1 MB) + `index.js`: product photos are now BUNDLED in the app; `components/Img.js` uses the bundled copy for any `/static/products/<slug>` URL and, for an old green placehold.co URL, finds the photo from the product name inside that URL. So these photos show even with the old backend and without a network connection to the PC.
- Verified: slug matching tested for the 7 names + carrot/kiwi/unknown; Android bundle compiles. Not verified: on a phone.
