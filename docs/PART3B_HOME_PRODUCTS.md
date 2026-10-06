# Freshora – PART 3B (Home product sections)

Scope: Featured + Popular product sections on Home only. No backend / admin / navigation-structure / package changes.

## What changed
- NEW `mobile/src/components/HomeProducts.js`
  - `HomeProductCard` (internal, memoized): rounded 18px card, tinted square image area, `xx% OFF` badge (only when `discount > 0`), 2-line name (fixed height so cards align), unit text, price + struck-through `original_price` (only when higher), compact `+ ADD` button.
  - Add button: calls existing `CartContext.add(id)` (-> `/cart/items`); shows a small spinner while the request runs (prevents double taps); disabled "SOLD" + "Out of stock" strip when `stock <= 0`. Cart toast is still CartContext's.
  - `HomeProductSection` (default export): heading + subtitle + `See All` + horizontal FlatList (`getItemLayout`, `removeClippedSubviews`, windowed rendering). Card width is responsive (~2.35 cards visible, clamped 136-172px) so the next card peeks in.
  - Section treatment: Fresh Picks sits on a soft green full-width band; Best Selling uses the page background with a hairline divider.
- `mobile/src/screens/Home.js`: replaced the old Featured/Popular blocks with two `HomeProductSection`s; removed the now-unused `ProductCard` import and `products()` helper.

## Data / navigation (unchanged)
- Data: `/home` -> `featured_products` ("Fresh Picks for You"), `popular_products` ("Best Selling"). No new fields.
- Card tap -> `ProductDetails { id }` (same as before). Add -> `useCart().add`.
- `See All` (both sections) -> `Products { title: 'All Products' }`. Popular had no See All before; it reuses the existing Products route (the Products screen has no sort param, so it shows the default list).

## Untouched
Header, Search, Hero, Categories, Offers (3A); shared `ProductCard` / `ProductGrid` (Products, Search); ProductDetails, Cart, Checkout, Orders, Profile; CartContext; backend; admin.
