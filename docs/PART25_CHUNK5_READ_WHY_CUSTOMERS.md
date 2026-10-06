# Freshora - PART 25 (chunk 5: Read & Learn, Why Shop With Us, What Our Customers Say)
Apply on top of Part 24. Home.js here REPLACES the Part 24 Home.js (it has all Part 23 + 24 changes + the new import).
Files:
- EDIT src/components/ReadLearn.js : design layout - 2 side-by-side coloured cards (476x175 units), dark "Read More" pill, photo right; "See All" expands the other articles below (no new screen), "Show Less" collapses
- NEW  src/components/HomeInfo.js  : WhyShopWithUs (one row of 4: round icon + 2-line title, grey text under, no box) + Testimonials (3 soft-green cards in one row, no sideways scroll, "See All" shows "Coming soon")
- EDIT src/content/articles.js     : NEW first article "5 easy ways to eat healthier everyday" (new text written for the app); "read-labels" retitled "Understanding food labels: a quick guide" (same body); fields `home` (line breaks) and `card` (colour) added. Other articles unchanged.
- EDIT src/screens/Home.js         : imports Testimonials / WhyShopWithUs from HomeInfo.js
HomeLower.js is NOT changed (its old WhyShopWithUs / Testimonials are now unused).
Texts changed to the design: Why Shop = 10 Min Delivery / Quality Assured / Secure Payments / 24/7 Support (+ the 4 grey lines); quotes = Priya S., Rahul K., Neha M. from the design.
Customer avatars are initial letters (design has face photos - no photo assets in the project).
STATUS: babel-parsed OK, icon names verified in the installed icon set. NOT rendered on a phone/emulator.
NOT DONE (chunk 6): Stay Updated, Get Our App, footer, hero/banner handwritten notes.
