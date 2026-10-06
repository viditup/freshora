# PART 32 (includes PART 30 + 31) - apply only this zip. Not verified on a phone.
- AppHeader.js: scan icon now drawn exactly like the design (4 rounded corner brackets + thick rounded square with a dot), no icon font.
- HomeProducts.js: OFF badge has its own strip above the photo; product photo starts below it (no touching).
- HomeOffers.js + offer_*_art.png: background removed (flood-fill) + 4x upscale + sharpen; shown whole (contain) bottom-right, no fade, below the title block. 10-min strip fades 22/30% -> 8/10%.
- HomeBanners.js / HomeBottom.js / ReadLearn.js: photo fades much narrower (left 14%, right 20%, plane/phone/learn ~10%), text column no longer extends under photos.
- Banner art (kitchen, celebration, green, fresh choices, membership, newsletter, phone mockup, learn_*) upscaled 3x + sharpened (same file names).
- homeSections.js: Snacks and Personal Care rows are topped up to 4 products (similar by name from /products, then any in-stock product). Real fix = seed 4+ products per category.
- Limit: source pictures are 100-400 px crops; upscaling cannot invent detail. Use PART31_image_prompts.md for truly crisp pictures (drop in with same names).
