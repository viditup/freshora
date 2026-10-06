# Freshora – PART 3A (Home top UI)

Scope: top portion of Home only. No backend / admin / navigation-structure changes, no new packages.

- Header (`AppHeader.js`, shared): pin + "Home ⌄" with address line below (real default address), plain bell and cart icons, live cart badge, safe-area aware.
- Search bar (`SearchBar` in `AppHeader.js`): 48px rounded white bar, search + scan icons; still opens the existing `Search` screen.
- Hero (`HomeBanner.js`): green card, text + "Shop Now" CTA left, rounded photo right, dots indicator on Home. Uses `/home` banners. Placeholder (`placehold.co`) images are swapped for a grocery photo URL; image failure falls back to an emoji.
  Tap: category banner -> Products(category); other banners -> all products.
- Shop by Categories: rounded tiles + "All Categories" tile and "See All" -> Categories tab. Uses `/home` categories; emoji icons are matched by category name when the backend image is a placeholder.
- Offers: `HomeOffers.js` -> "10 Minutes" strip (UI only) and "Offers for You" cards (first card shows the real max discount from `/home` offers; rest are demo copy).
- Existing Featured/Popular product sections are untouched (PART 3B).
