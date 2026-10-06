# Freshora - PART 7 (Product Details)

Scope: the Product Details screen plus the wishlist and share flows. Parts 1-6 preserved.
No new npm packages: sharing uses React Native's built-in `Share`, sheets are plain `Modal`s.

## 1. Product Details (`mobile/src/screens/ProductDetails.js`)
- Gallery with page dots + floating bar: back, **wishlist heart** (filled when saved), **share**.
- Name, pack/unit line, rating + review count, stock state, price with MRP, `% OFF`, `Save Rs x`.
- Share row: WhatsApp / Message / Email / More.
- **Pack-size selector**: chips with price (and struck-through MRP) per pack; changing the pack
  re-prices the page and resets quantity. A single-pack product shows one chip.
- **Delivery card**: `Delivery in 10 minutes`, free-delivery threshold / fee, Cash on Delivery.
- **Details | Nutrition tabs**: highlights, spec rows (brand, category, sub-category, net quantity,
  shelf life, storage, country of origin, type) and a striped nutrition table (per 100 g).
- **You May Also Like**: horizontal cards - same sub-category first, then the same category - each
  with the cart stepper and a heart.
- **Sticky bottom bar**: pack line, `qty x price` total, quantity stepper, **Add to Cart** (outline)
  and **Buy Now** (filled). Buy Now syncs the chosen quantity into the cart then opens Checkout.

## 2. Wishlist
- `mobile/src/context/WishlistContext.js` - device-local product ids (AsyncStorage): `has / toggle / remove / clear`.
- `mobile/src/screens/Wishlist.js` - saved items fetched fresh from **`GET /api/products/by-ids`**.
- Header gained a heart button with the saved count; `ProductCard` accepts an optional `onWishlist` heart.

## 3. Share
- `mobile/src/screens/ShareProduct.js` shows the exact message, then channel buttons that call `Share.share`.

## 4. Backend
- `GET /api/products/{id}` now also returns `pack_sizes`, `delivery {eta_minutes, fee, free_above}`,
  `shelf_life`, `storage`, `country_of_origin`, `highlights[]`, `nutrition[]`, `related[]`.
- **NEW `GET /api/products/by-ids?ids=a,b,c`** for the wishlist (declared before `/{product_id}`).
- Pack sizes are derived from the unit price (1 kg at Rs 149 -> 500 g Rs 74.50, 1 kg Rs 149,
  2 kg Rs 283.10, 5 kg Rs 670.50); an admin can override them per product with `pack_sizes`.
- Cart lines remember the chosen **pack label** and `build_cart` prices the line from that pack.
- `settings.delivery_eta_minutes` (env `DELIVERY_ETA_MINUTES`, default 10) drives the ETA copy.
- `backend/tests/test_details.py` - unit tests for the pack-size / details / nutrition helpers.

## Run it
```bash
cd backend && python -m seed.seed_data && uvicorn app.main:app --reload
cd mobile  && npm install && npx expo start
```
