# Freshora - PART 8 (Cart + Checkout)

Scope: the Cart screen and the Checkout flow only. Parts 1-7 are preserved. No new npm
packages - the steps, radio rows and progress bar are plain React Native views, and the
payment list is UI + validation only (**no gateway, no real money**).

This part closes the two PART 1 audit gaps: *Cart (free-delivery bar, upsell, sticky actions)*
and *Checkout (3-step Address > Payment > Review, delivery options, UPI/Card/Wallet/COD)*.

## 1. Cart (`mobile/src/screens/Cart.js` + `components/CartParts.js`)
Top to bottom:
1. **Free-delivery progress bar** (`FreeDeliveryBar`) - `Add Rs x more for FREE delivery` with a
   progress fill, or `You've unlocked FREE delivery` once the threshold is met. Shows the ETA.
2. **Item lines** - image, name, pack, price, **inline quantity stepper** (`QtyStepper`), line
   subtotal and a trash button. The stepper is wired to the real server cart.
3. **Upsell strip** (`UpsellRow`) - "Frequently bought together", same-category add-ons returned
   by the backend with a one-tap **ADD**.
4. **Bill details** (`BillDetails`) - item total, discount, delivery fee (labelled with the
   chosen option) and **To Pay**.
5. **Sticky bottom bar** - **Proceed to Checkout** with the live total.

## 2. Checkout (`mobile/src/screens/Checkout.js` + `components/CheckoutParts.js`)
A **3-step wizard** with a `StepIndicator` (Address -> Payment -> Review). A sticky bottom bar
carries `Back` + the primary action (`Continue` / `Place Order`).

- **Step 1 - Address**: the selected/default address with `Change` (opens the address picker) and
  `Add a new address`.
- **Step 2 - Payment**: **Delivery options** (Standard - free above Rs 499, else Rs 40; Express -
  Rs 79 flat, priority) and the **payment list** (UPI / Card / Wallet / Cash on Delivery), each
  marked demo, with a no-real-money notice. Changing the delivery option reprices the cart.
- **Step 3 - Review**: address, delivery + payment summary, order items and the price breakdown,
  then **Place Order**.

## 3. Order display
- `mobile/src/payments.js` - the payment method list + `payLabel()` (also maps legacy `online`).
- Order Success, Order Details and the Orders list now show the real payment label and the chosen
  **delivery option + ETA** (`OrderSuccess.js`, `OrderDetails.js`, `Orders.js`).
- `PriceSummary` labels the delivery line with the option used.

## 4. Backend (FastAPI + MongoDB)
- `settings`: **NEW** `express_delivery_fee` (env `EXPRESS_DELIVERY_FEE`, default 79) and
  `express_eta_minutes` (default 5). `delivery_fee` / `free_delivery_above` / `delivery_eta_minutes`
  now describe the **standard** option.
- `build_cart(uid, delivery)` prices the fee + ETA for the option and returns extra summary fields:
  `delivery_option`, `free_delivery_above`, `amount_for_free_delivery`, `eta_minutes`. Standard is
  free at/above the threshold; express is always charged.
- Every cart route accepts `?delivery=standard|express` (`422` otherwise) and the response carries a
  `delivery` block (`option`, `free_above`, `options[]`) so the app renders the bar and the picker
  from server numbers.
- **NEW `GET /api/cart/upsell`** - same-category add-ons first, then top-discounted picks, always
  excluding what is already in the cart (declared before `/items/{product_id}`).
- `OrderIn` gained `delivery_option: "standard" | "express"`; `payment_method` is now
  `"COD" | "upi" | "card" | "wallet"`. COD stays `pending`; the demo online methods settle `paid`.
  The order stores its `delivery_option` and `eta_minutes`.
- `backend/tests/test_cart.py` - unit tests for the delivery fee/ETA rules and option validation.
- `backend/tests/smoke_test.py` - extended with the Part 8 flow (options, prices, upsell, express
  order, invalid method/option).

## Run it
```bash
cd backend && python -m seed.seed_data && uvicorn app.main:app --reload
cd mobile  && npm install && npx expo start
```
Re-seeding is not required for Part 8 (no document shape changed), but it is harmless.
