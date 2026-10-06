# Freshora - PART 24 (chunk 4: design-size banners + Membership)
Apply on top of Part 23 (this zip's Home.js REPLACES the Part 23 Home.js; it contains all Part 23 changes + the new import).
Files:
- NEW  src/components/HomeBanners.js  : PromoBanner (variants kitchen / festival / green / fresh) + MembershipBanner, sized with useDesign() (units of 1048 = screen width)
- EDIT src/screens/Home.js            : imports the two banners from HomeBanners.js (not HomeLower.js), passes variant + multi-line titles
- src/scale.js                        : same file as Part 17-20 (included only in case it is missing)
HomeLower.js is NOT changed. Its old PromoBanner / MembershipBanner are now unused (left in place, harmless).
Measured from the design (min heights, units): Kitchen 287, Festival 224, Green 172, Fresh Choices 250, Membership 317; side margin 37.
STATUS: babel-parsed OK (syntax + imports resolve to existing icon names). NOT rendered on a phone/emulator.
NOT DONE here (next chunks): Read & Learn (2 cards + See All), Why Shop With Us (1 row of 4), What Our Customers Say, Stay Updated, Get Our App, footer; handwritten notes ("Good Food Happier You", "Eat Good Live Better") on banners - no art for them.
