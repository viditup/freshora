# Freshora – PART 1 Audit (inspection + small fixes only)

## Stack
- mobile: Expo SDK 51 / RN 0.74, React Navigation v6 (bottom tabs + a native stack per tab), Axios, AsyncStorage, inline styles (no UI lib)
- backend: FastAPI + MongoDB (JWT). Endpoints: auth, users/me, categories, products (list/search/category/featured/:id), /home, cart, addresses, orders (+cancel). Not touched.
- admin: React (Vite). Not touched.

## Current flow (all wired to real API)
Splash > Onboarding (3 slides, saved flag) > Login/Signup > MainTabs
Tabs: Home | Categories | Search | Cart | Profile
Home > Products > ProductDetails > Cart > Checkout (address pick/add, COD / demo online) > OrderSuccess > OrderDetails (timeline, cancel)
Profile > Orders, Addresses (CRUD, default), Edit Profile, Change Password, Logout.

## Static verification done
- All 34 JS files parse (JSX syntax check), 0 unresolved relative imports, every navigate()/replace() target is registered.
- Could NOT run `npm install` / Expo / backend here (sandbox has no package registry access) -> run on your PC: `cd mobile && npm install && npx expo install --fix && npx expo start`.

## Fixes made in Part 1
1. package.json: added `@babel/core` devDependency (needed by babel-preset-expo; missing in manifest).
2. AuthContext: saved token was deleted on ANY startup error (e.g. backend offline) -> user logged out. Now only removed on 401/403.
3. OrderDetails: "Cancel Order" showed for packed/shipped orders although backend only allows pending/confirmed. Button now matches backend rule.

## Differences vs client PDF (to do in later parts)
Global / navigation (PART 2)
- PDF bottom tabs: Home, Categories, Orders, Offers, Profile. App: Home, Categories, Search, Cart, Profile. Orders + Offers tabs missing; cart/search must move to header icons.
- PDF has global header: delivery address + bell + cart badge + always-visible search bar. App header is minimal.
- Tab bar ignores safe-area insets (fixed height 62).
- Branding: PDF has logo, soft green gradient bg, leaf watermark; app uses plain text "freshora".
Auth / onboarding
- PDF Login/Signup: hero image, +91 phone field, show/hide password, terms checkbox, Google/Apple/WhatsApp buttons (UI only), full name+phone+email+password. App has plain inputs; login is email-only (PDF shows mobile number).
- Splash/onboarding: PDF has feature chips, "Skip", circular arrow button, "Let's Get Started" – partly present.
Home
- PDF: banner, category icon grid (8), 10-minute delivery card, Fresh Picks, Offers, Best of Snacks, Seasonal Specials, Recently Viewed, membership banner, Read & Learn, Why Shop With Us, testimonials, newsletter, Get App, footer. App: banner, category row, Featured, Popular only.
Categories / listing
- PDF: "Shop by Categories" tiles + Featured Categories, "All Categories" list with item counts, listing with sub-category chip row, filter bar (Filters/Price/Brand/Organic/Sort), grid with qty stepper. App: plain 2-col grid, no filters/sub-categories (backend has no subcategory/brand field; sort + price filters exist in API).
Product details
- PDF: pack-size selector, Add to Cart + Buy Now, delivery ETA, product details, nutrition table, You May Also Like, wishlist/share. App: image carousel, qty, Add to Cart only.
Cart
- PDF: free-delivery progress bar, inline qty stepper, "You might also like", bill details, sticky Continue Shopping + Proceed to Checkout. App: list + bill + checkout (no upsell/progress).
Checkout
- PDF: 3-step progress (Address > Payment > Review), delivery options (standard/express), UPI/Card/Wallet/COD list. App: single scroll, COD + demo online only (no gateway must be added; payment options in PDF can be UI-only/demo).
Order success / orders
- PDF: tracking steps with ETA, items list, View Order Details / Continue Shopping. App has similar basic version; "Orders" tab missing.
Profile
- PDF: avatar header, Gold Member card, orders quick-row (To Deliver/Delivered/Returns), menu: Addresses, Payment Methods, Wallet, Offers, Wishlist, Refer & Earn, Help, Settings, Logout. App: 5 rows.
Not in backend (UI-only/demo or skip): Offers tab data, wallet, wishlist, membership, brands, nutrition, pack sizes, sub-categories.

## Other observations / minor issues (not changed)
- Home banner tap does nothing unless action_type == 'category'.
- Seed product images are placehold.co text placeholders -> replace with real product images in a later part (needs internet; seed data only).
- Wrong password on login triggers the global 401 handler (harmless, just calls logout on a null user).
- app.json has no icon/splash/android package config (fine for Expo Go; needed for a release build).
- Styles are inline everywhere; theme.js has colours only. Part 2 should add shared tokens + reusable Header/SearchBar/Section components.
