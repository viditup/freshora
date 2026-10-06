# Categories page - exact copy of the PDF screen "Shop by Categories"

Changed files only (copy over the project, same folder layout):
- src/screens/Categories.js          (rewritten; same API call, same navigation targets)
- src/components/AppHeader.js        (4 OPTIONAL props added: deliveringTo, placeholder, tint, metrics - Home does not pass them, so Home is unchanged)
- assets/design/cs_*.jpg + index.js  (13 new images cropped from the PDF, 2x upscaled; the old cat_* images are NOT used by this page any more)

Not touched: Home, CategoryCard.js, AllCategories.js, bottom tab bar, backend.

Knobs in Categories.js:
- USE_DESIGN_COUNTS = true  -> "500+ items" style labels like the PDF; false -> real product_count from the backend.
- REF_W = 850               -> every size is in PDF units (u(n)); change nothing unless the PDF changes.

Not verified (could not run Expo here): on-device look, text wrapping with the real fonts, Android vs iOS status-bar spacing.
