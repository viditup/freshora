# Freshora - PART 26 (chunk 6: Stay Updated, Get Our App, footer)
Apply on top of Part 25 (your current project). Copy the 2 files below over the old ones.
Files:
- NEW  src/components/HomeBottom.js : StayUpdated + GetOurApp + HomeFooter drawn in the design proportions (u()/f() units from scale.js)
- EDIT src/screens/Home.js          : imports those 3 from HomeBottom.js (was HomeLower.js); footer: "Help & Support" opens the Help screen, social icons show "Coming soon"
HomeLower.js is NOT changed (its old StayUpdated / GetOurApp / HomeFooter are now unused). No new assets: uses banner_newsletter_art + app_phone_mockup already in assets/design.
Stay Updated: light-green card, round mail icon, title + 2-line text, email field + dark "Subscribe ->" pill, paper-plane art top right, handwritten "Good Things In Your Inbox" (Caveat font). Same local email check as before, nothing is sent.
Get Our App: title + grey text, white Google Play / App Store buttons with thin border, phone picture bottom right.
Footer: divider, 4 links with "|" between (About Us, Help & Support, Terms & Conditions, Privacy Policy), 4 round social icons (facebook, instagram, youtube, linkedin; no links), copyright (year from device date) + "A healthier you, a brighter tomorrow. heart".
Known differences from the design: Google Play logo is one colour (icon font), the faint leaf pictures in the footer corners are not added (no asset), footer text sizes were measured from a small screenshot.
STATUS: babel-parsed OK, icon names checked in the installed icon set (FontAwesome5 brand icons use the `brand` prop). NOT rendered on a phone.
