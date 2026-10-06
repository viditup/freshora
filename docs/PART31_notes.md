# PART 31 (includes PART 30) - apply this ONE zip; it already contains every Part 30 file.
Not verified on a phone (sandbox cannot render the app). Check with new screenshots.

## Code
- AppHeader.js: bell / cart = Material "bell-outline" / "cart-outline", near-black (#16241C), slightly bigger. Search-bar right icon = Material "scan-helper"
  (corners + centre square like the design). Each falls back to the old Ionicons if the name is missing in the installed glyph map.
- HomeBanner.js (hero): paragraph is exactly 3 lines ("Groceries, daily essentials / and more - delivered fresh / and fast."), smaller (21.5) and dark slate (#44524B);
  headline colour #072B1C, "doorstep" #62A82F, Shop Now pill smaller (66 units high), medium weight. Art container 722 units wide; only the new plain strip is faded.
- HomeProducts.js: OFF badge smaller; top 24 units of the photo area are reserved for it, so the badge no longer covers the product.
- HomeOffers.js: offer photos are PNGs with soft left/top edges (no visible photo box), bigger, flush bottom-right.
- Part 30 files: Handwritten.js (new), HomeBanners.js, HomeBottom.js, HomeOffers.js, ReadLearn.js.

## Assets (mobile/assets/design) - replace the old files
- hero_home_bag.jpg: 2x upscale + sharpen, 100px extra background strip on the left (so the lettuce is no longer faded/blurred) + mirrored leaf bottom-left.
- offer_fresh_deals_art.png, offer_top_brands_art.png, offer_healthy_art.png: 3x, sharpened, alpha-feathered. index.js now points to .png.
  (the old offer_*.jpg files can be deleted.)
- promo_10min_art.jpg: 3x upscale + sharpen. This is only a softer-looking stand-in: the source is 280x160, real sharpness needs a new image (see PART31_image_prompts.md).
