# Checkout - exact copy of the PDF "Checkout" screen

Changed file (copy over the project, same folder layout):
- src/screens/Checkout.js   (rewritten as ONE scrolling page, like the PDF)

Not touched: MainTabs.js (the native header is hidden from inside Checkout.js), CheckoutParts.js (now unused by Checkout, left in place),
PriceSummary.js, AddressCard.js, OrderItem.js (Order Details etc. still use them), backend, Home.

Same logic: /addresses, /orders, server-computed totals, delivery option from CartContext, demo-only payments, OrderSuccess navigation.

Deliberate differences from the old screen / things to know:
- The old 3-step wizard (Address -> Payment -> Review) is gone; the PDF shows everything on one page.
- Default payment is UPI (as in the PDF); it used to be Cash on Delivery. Still demo only.
- Removed (not in the PDF): "Add a new address" link and the pink "Demo checkout" note. Change -> Addresses screen can still add an address.
- "Today, 5 PM - 8 PM" is computed from the backend ETA (next full hour, 3-hour window), not hard-coded.
- Struck-out Rs 40 next to FREE delivery comes from the standard option's fee in the cart response.

Not verified: could not run Expo here - on-device look, text wrapping with the real fonts, status-bar spacing.

Update 2: text sizes now follow the design proportion exactly (no big minimum sizes), line heights follow the font (no more overlapping/clipped lines), header subtitle and 'Order Placed' no longer truncated, more space under the stepper, 3-line address allowed.
