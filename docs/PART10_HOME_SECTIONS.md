# Freshora - PART 10 (Home: remaining sections)

Scope: the Home rows that Part 3C left out. **Frontend only**: no backend change, no new npm packages, no re-seed.

## Order on Home (after Best Selling)
1. **Seasonal Specials** (green band) - Fresh Fruits category, newest first.
2. **Recently Viewed** - products you opened, newest first; header action is **Clear**.
3. **Best of Snacks** - Snacks category, most-reviewed first.
4. **Kitchen Essentials** banner - opens the Household category.
5. **Atta, Rice & Staples** (green band) - Grocery category, most-reviewed first.
6. **Personal Care Essentials** - Personal Care category, most-reviewed first.
7. **A Greener Tomorrow** banner - opens the Organic category.
8. **Read & Learn** - article cards.
Then the existing Membership, Celebration, Why Shop, Testimonials ... sections as before.

## How the product rows get data (`mobile/src/homeSections.js`)
- Each row finds its category in the `/home` categories list (by slug / name regex, same way the Organic shortcut works)
  and calls the existing `GET /api/products?category=<id>&sort=...&in_stock=true&limit=10`.
- If the category does not exist (e.g. renamed in the admin panel) or the request fails, that row stays hidden.
  The banners fall back to "All Products" when their category is missing.
- "See All" opens Products for that category with the same sort.
- Rows reuse `HomeProductSection` / `HomeProductCard` (Part 3B), so Add-to-cart, OFF badge and stock state behave the same.
  `HomeProductSection` gained two optional props: `allLabel` and `allArrow`.

## Recently Viewed (`mobile/src/recent.js`)
- `ProductDetails` records the product id when it loads (max 10, de-duplicated, per user, on device via AsyncStorage).
- Home reloads the row each time it regains focus and renders it from `GET /api/products/by-ids`, so price and stock are
  current. Deleted / inactive products drop out automatically.
- **Clear** wipes the list. Settings > "Clear saved data on this device" also clears it.

## Read & Learn
- `content/articles.js` (4 articles), `components/ReadLearn.js` (card row), `screens/Article.js` (reader, registered as
  `Article` in the shared stack screens).
- **The articles are static content written for the app** - there is no blog backend. Edit the file to change them.
  Each article has a **Shop related products** button that opens a matching category.

## Files
New: `homeSections.js`, `recent.js`, `content/articles.js`, `components/ReadLearn.js`, `screens/Article.js`, this doc.
Changed: `screens/Home.js`, `screens/ProductDetails.js`, `components/HomeProducts.js`, `navigation/MainTabs.js`,
`storage.js` (`recent_viewed` added to the clear list), `README.md`.

## Verified / not verified
All changed files parse (TypeScript compiler, JSX). Not run in Metro or on a device (no npm access in the build sandbox).
