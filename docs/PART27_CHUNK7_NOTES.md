# Freshora - PART 27 (chunk 7: handwritten notes on banners)
Apply on top of Part 26. Copy the 2 files over the old ones.
Files:
- EDIT src/components/HomeBanners.js : new `Note` (Caveat script text on top of the banner photo). PromoBanner gets props note / noteColor / notePos ({top,right,w,fs,lh,rot} in design units). MembershipBanner shows "Good Food Happier You" by default.
- EDIT src/screens/Home.js           : passes the notes - Kitchen "Good Food Happier You", Festival "Traditions Bring Us Closer", Green "Small Choices Big Change", Fresh Choices "Eat Good Live Better".
Hero ("A Brighter Day Awaits", "Good Food Happier You" on the bag) needs nothing: it is already inside hero_home_bag.jpg.
Positions/sizes are first guesses from the small design screenshot. The note sits OVER the right edge of the photo, so on some phones it can touch the picture - tell me which banner and I will shift/shrink it (notePos in Home.js).
NOT DONE: "A Brighter Day Awaits" note on the 10-Minutes / Offers strip (not clearly visible in the design), leaf decorations.
STATUS: babel-parsed OK. NOT rendered on a phone.
