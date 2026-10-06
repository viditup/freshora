# Profile screen - copy of the design (v2)

Files (copy over the project, same folder layout):
- mobile/src/screens/Profile.js                      (rewritten)
(no image in this zip on purpose: do not overwrite your banner picture)

Changes in v2:
- Header is now the same <AppHeader scaled /> as Home (Delivering to + real address, bell, cart). My own guessed header/endpoints are removed.
- Whole screen background is white (avatar / name / Edit Profile part too).
- Gold Member: gold crown on the left + big faint crown behind on the right (clipped by the card), as in the design.
- My Orders tiles: smaller circle (34 dp), smaller labels, spacing measured from the design.
- Menu rows: separate light-bordered rows, dark line icons without circle, smaller title/subtitle, pill style as in the design. My Offers has the badge-% icon.
- Logout: smaller (33 dp), same pink/red style.
- Banner (v3): only the picture is shown, no text/button drawn on it. An invisible tap area sits over the picture's own Shop Now button and opens Home. Picture file = line 19 `BANNER = require(...)` in Profile.js (default assets/design/os_banner_goodfood.jpg); change that line if your full banner has another file name. Height follows the picture's own proportions. Tap area: left 3.5%, top 66%, width 23%, height 25% of the banner - adjust if your picture's button sits elsewhere.

Notes:
- Sizes are measured from the 257 px wide design image and scaled from a 390 dp phone (u()/T() helper). Smallest text is 7.5-8 dp as in the design.
- Still not in the design, so not shown: Change Password row, version footer, Wishlist count. Bell/cart route names now come from AppHeader.
- My Offers has no "3 new" pill (no offers-count source). Wallet pill shows the real on-device balance.
- If the Profile header shows an extra search bar, AppHeader has one - send AppHeader.js and I will hide it for Profile.
Not verified: could not run Expo here (syntax check only).
