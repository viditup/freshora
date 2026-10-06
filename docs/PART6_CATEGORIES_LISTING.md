# Freshora – PART 6 (Categories + Product Listing)

Scope: the Categories tab and the product listing screen only. Parts 1–5 are preserved
(Home, auth, navigation, cart/checkout/orders, admin). No new npm packages, no UI library.

## 1. Categories tab (`mobile/src/screens/Categories.js` + `components/CategoryCard.js`)
Top to bottom, matching the design sheet:
1. **Shop by Categories** hero strip: category count + total product count.
2. **Shop by Categories** tile grid — 3 per row, rounded tiles with emoji/image + item count
   (`CategoryTile`).
3. **Featured Categories** — 2 per row cards, the 4 shelves with the most products, with a
   `Shop →` link (`FeaturedCategoryCard`).
4. **All Categories** list — one row per category with the live item count and description
   (`CategoryRow`), tap → that category's listing.

## 2. Product listing (`mobile/src/screens/Products.js`)
- **Sub-category chips** at the top (`All` + every sub-category of the open category with its
  product count). With no category open the same row shows the categories instead, and tapping
  one switches the listing to it.
- **Filter bar**: `Filters (n)` · `Price` · `Brand` · `Organic` · `Sort`. Active facets turn
  green, `Filters` shows a count badge, and `Clear all` appears once anything is applied.
- **Grid** — 2 columns, every card has a **quantity stepper**: `ADD` → `[− qty +]`; `−` at 1
  removes the line from the cart. The stepper is driven by the real cart (CartContext), so it
  stays in sync with the Cart screen, Home "ADD" buttons and the header badge.
- Result line shows `N products · page x/y`; empty state offers `Clear filters`.

## 3. Filter sheets (`mobile/src/components/FilterSheet.js`)
Reusable bottom sheets (no extra dependency — RN `Modal`):
- `FilterSheet` — Sort / Price / Brand / Organic toggle / Rating / Availability, with
  `Clear all` + `Apply`.
- `OptionSheet` — single-select list (Sort, Price).
- `MultiSheet` — multi-select with counts (Brand).
Sort options: Newest first, Price: Low to High, Price: High to Low, Top rated, Most popular.
Price bands: Any price, Under ₹50, ₹50–₹100, ₹100–₹200, Above ₹200.

## 4. Backend (FastAPI + MongoDB)
- `GET /api/products` gained `subcategory`, `brand` (comma separated), `organic`, `min_rating`
  and `in_stock` query params, combined with the existing `category`, `search`, `sort`,
  `min_price`, `max_price`, `page`, `limit`.
- **NEW** `GET /api/products/facets?category=` returns `subcategories[]`, `brands[]` (with
  counts), `categories[]`, `price {min,max}`, `organic` count and `total` for the listing.
  Declared **before** `/products/{product_id}` so the path is never parsed as a product id.
- `GET /api/categories` now returns a live `product_count` per category (and `/categories/{id}`
  returns it too).
- `ProductIn` schema gained optional `subcategory`, `brand`, `organic`; `product_doc` stores
  `subcategory_slug` alongside the name (the same pattern as `category_slug`).
- Seed data now carries a sub-category, a brand and an organic flag per product (32 products,
  20 sub-categories, 8 brands) so chips and facets are populated out of the box.

## 5. Cart sync
`components/ProductGrid.js` reads `cart.items` and passes `qty` plus `onInc`/`onDec` to
`ProductCard`, so the stepper reflects the server cart after every mutation.

## Run it
```bash
cd backend && python -m seed.seed_data && uvicorn app.main:app --reload   # re-seed to get facets
cd mobile  && npm install && npx expo start
```
Re-run the seed script once: existing documents do not have `subcategory` / `brand` / `organic`,
so the chip row and Brand facet would be empty until you re-seed.
