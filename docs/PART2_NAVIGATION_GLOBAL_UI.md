# Freshora – PART 2 (Navigation + Global UI)

## Navigation
- Bottom tabs now: Home | Categories | Orders | Offers | Profile (`mobile/src/navigation/MainTabs.js`).
- Search, Cart, Notifications, Products, ProductDetails, Checkout, Addresses, AddressForm, OrderSuccess, OrderDetails are registered in
  EVERY tab stack, so they open from any tab with the tab bar still visible (`navigate('Cart')`, `navigate('Search')`, ...).
- Orders = tab root (existing list + OrderDetails + API unchanged). Profile > "My Orders" jumps to the Orders tab.
- Offers = new tab, built only from existing `/home` data (banners + `offers` discounted products, fallback to `/products`).
  Coupon cards are DEMO placeholders (not applied at checkout). No backend change.

## Global UI
- `components/AppHeader.js`: delivery address (real default address via `/addresses`), bell, cart icon + live item badge, tappable search bar.
  `title` prop switches to title mode (used by Orders), `search={false}` hides the search bar. Handles top safe-area itself.
- `components/Chip.js`: shared filter pill.
- `theme.js`: added tokens `S` (spacing), `RAD`, `FS`, `T` (typography), `TAB_H`, `card`, extra colours. Existing exports untouched.
- Bottom tab bar height/padding use `useSafeAreaInsets()`, hide on keyboard. Cart toast offset also respects the inset.

## Not changed (later parts)
Home sections, Product Details, Cart redesign, Checkout, Profile redesign, backend, admin.
