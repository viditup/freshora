# Freshora - PART 9 (Orders + Profile)

Scope: order success / tracking, the Orders list, and the Profile screen. Parts 1-8 preserved.
**Frontend only**: no backend change, no new npm packages, no re-seed needed.

## 1. Order Success (`screens/OrderSuccess.js`)
- Animated check (built-in `Animated` spring), "Order Placed Successfully!".
- **ETA banner** (`Arriving in ~N min / Expected by 6:42 PM`), order summary card, and a **Tracking** card
  with the step timeline. Primary button is now **Track Order** (opens Order Details).
- Wrapped in a `ScrollView` so it fits small phones.

## 2. Tracking steps + ETA (`components/OrderStatus.js`, `orderUtils.js`)
- `OrderStatus` takes `order` (still accepts `status`). Steps: Order Placed > Confirmed > Packed > Shipped > Delivered.
  Placed shows the real time; upcoming steps show `Est. hh:mm`; done steps `Done`; current `In progress`.
- `EtaBanner` counts down (refreshes every 30 s) and says "Arriving any moment" once past the ETA.
  It renders nothing for delivered / cancelled orders.
- **Estimates, not facts**: the backend stores no per-step timestamps, so step times are derived from
  `created_at + eta_minutes` (Confirmed 10%, Packed 40%, Shipped 65%, Delivered 100%). The real status still
  comes from the server (admin panel).
- `OrderDetails` shows the banner + timeline in an **Order Tracking** card and re-fetches every 20 s
  while the order is still active.

## 3. Orders list (`screens/Orders.js`)
- Filter chips: **All / To Deliver / Delivered / Returns**; empty state per filter.
- Active orders show a compact ETA banner.
- Accepts `route.params.filter` (+ `ts`) so Profile can open it pre-filtered.

## 4. Profile (`screens/Profile.js`)
- **Avatar header**: dark green band, gold-ringed avatar (profile image or initial), name / email / phone, edit button.
- **Gold Member card**: member-since (`user.created_at`), **Orders** and **Total saved** (sum of real order
  discounts, cancelled orders excluded). The "Gold" tier and its perks text are **display only** - nothing in the
  backend enforces them.
- **Quick row**: To Deliver (pending / confirmed / packed / shipped, red count badge), Delivered, Returns.
  Counts come from `GET /api/orders`; tapping opens My Orders with that filter.
  There is no returns flow in the backend, so **Returns = cancelled / refunded orders**.
- Menu: My Orders, Addresses, **Payment Methods, Wallet, Wishlist, Refer & Earn**, Edit Profile, Change Password, **Help, Settings**, Logout (see section 5).

## 5. Profile menu screens (all frontend, no backend, no new packages)
Registered in `PROFILE_ONLY` in `navigation/MainTabs.js`. Wishlist reuses the existing Part 7 screen.
- **Payment Methods** (`PaymentMethods.js`): save / remove UPI IDs and cards, with validation. Only the last 4 card
  digits + holder name + expiry are stored; the full number is never kept and no CVV is collected. Demo only.
- **Wallet** (`Wallet.js`): demo balance, add-money presets (max Rs 10,000), transaction list. Play money on the device;
  **not** deducted at checkout and not linked to the server.
- **Refer & Earn** (`ReferEarn.js`): per-user code (`FRESH` + name + id tail), native Share, how-it-works steps.
  Referrals and rewards are **not tracked** by the backend.
- **Help** (`Help.js`): FAQ accordion (matches the app's real cancel / delivery / payment rules), Email Support
  (`mailto:`), shortcut to My Orders. `SUPPORT_EMAIL` is a placeholder: change it.
- **Settings** (`Settings.js`): notification switches (saved on device, no push wiring), links to Change Password /
  Addresses, "Clear saved data on this device", About / version.
- `storage.js`: `useStored(name, default)` keeps wallet / saved payments / settings per user id in AsyncStorage.
  New shared bits: `components/Demo.js` (`DemoNote`, `Section`).

## Files
New: `mobile/src/orderUtils.js`, `storage.js`, `components/Demo.js`, `screens/PaymentMethods.js`, `Wallet.js`, `ReferEarn.js`, `Help.js`, `Settings.js`, this doc. Changed: `theme.js` (`toMonthYear`), `components/OrderStatus.js`,
`screens/OrderSuccess.js`, `OrderDetails.js`, `Orders.js`, `Profile.js`, `navigation/MainTabs.js`, `README.md`.

## Verified / not verified
Parsed all changed files with the TypeScript compiler (JSX syntax OK). Not run in Metro or on a device/emulator
(no npm access in the build sandbox).
