# Freshora - PART 28 (fixes from the real phone screenshots)
Apply on top of Part 27: copy these files over the old ones. Then restart Metro with a cleared cache (`npx expo start -c`) so the changed product photos are picked up.
Files:
- EDIT components/HomeProducts.js : photo area taller (square photos were tiny), price/+ button no longer collide, struck-out price only shown when it fits (no "Rs..." cut-off)
- EDIT components/HomeOffers.js   : Offers cards - photo smaller, softly faded, sits under the lower half; texts slightly smaller, so title/offer text never run over the photo
- EDIT components/HomeBanners.js  : Kitchen/Festival/Green/Fresh/Membership banners = [text | photo | free strip for the note]. Text can no longer run into the photo; the note sits on plain banner colour; heart is a real icon (was a red emoji on Android)
- EDIT components/HomeBottom.js   : Stay Updated picture edges faded (no lighter box), note moved off the plane, heart icon; Get Our App buttons wider (no clipped "Google Play"), taller section, phone picture edges faded (no white box)
- EDIT components/HomeInfo.js     : "Secure Payments" no longer breaks as "Paymen ts" (smaller circle, title shrinks to fit)
- EDIT components/ReadLearn.js    : photo narrower, text column narrower, so title/pill do not run under the photo
- EDIT screens/Home.js            : 4-line notes for Kitchen / Green banners, note positions
- assets/products/*.jpg (24 files): off-white photo backgrounds (grey boxes around Spinach, Bath Soap, Pav Buns...) brightened to pure white. Same file names.
The blue gear / "Tools" bubble in the screenshots is the Expo developer menu, not part of the app.
STATUS: babel-parsed OK. NOT rendered on a phone - send new screenshots.
