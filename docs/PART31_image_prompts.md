# Freshora - image prompts (Home screen), in parts
Why: most Home pictures are tiny crops (100-400 px wide) of the design image, so they look blurry on a phone. Code cannot add detail; new images can.
How: generate each image with any image AI (ChatGPT / Gemini / Midjourney / Firefly), save it with the SAME FILE NAME into freshora/mobile/assets/design/ (products: assets/products/),
restart Expo with `npx expo start -c`. Layout does not depend on pixel size, so a bigger image drops in without code changes.
Tip: first send PART 0 once ("style guide") and then each part as a separate message in the same chat, so all pictures match.

## PART 0 - style guide (paste first, applies to all)
"I am making pictures for a grocery delivery app called Freshora. Style for ALL images: premium, fresh, photorealistic food photography with soft natural window light,
clean 'Indian modern grocery' look, brand colours: deep green #0B3D2A, fresh green #1B7F3B, lime #7DBE3C, soft mint #E2F4DC, cream #FFF3D0. Very sharp, high resolution, no blur, no watermark,
no text unless I ask for it, no logos of real brands, no people unless I ask. Do not add borders or frames. Keep the requested aspect ratio exactly."

## PART 1 - hero (hero_home_bag.jpg) - 1600 x 1275 px (ratio 1.255:1)
"Kraft paper grocery bag, three-quarter front view, overflowing with fresh lettuce, broccoli, yellow bell pepper, red tomatoes, carrots, baguette, a glass bottle of milk with a green cap and coriander.
On the bag, handwritten dark-green marker text: 'Good Food / Happier / You' with a small heart under it. Top right: a soft light-green circle with handwritten dark-green text 'A Brighter Day Awaits' and two tiny sparkle strokes.
Background: very light green gradient (#DCEFCB to #EBF6E0) with blurred green leaves in BOTH bottom corners (left and right). Keep 8% empty plain background on the left edge. Bag bottom is cut by the bottom edge."

## PART 2 - 10 Minutes strip (promo_10min_art.jpg) - 1400 x 800 px (ratio 1.75:1)
"Glossy 3D red stopwatch (white dial, hand at about 12:05) with two yellow lightning bolts on its left, a ripe tomato with green leaves in front-left bottom and a bunch of green leaves behind the stopwatch on the right.
Background: flat very light pink #FEEDED, no gradient at the edges (it will blend into a pink card). Left 15% of the image must be empty pink."

## PART 3 - Offers for You (3 images, TRANSPARENT PNG, no background)
3a offer_fresh_deals_art.png - 800 x 700 px: "Wicker basket full of leafy greens, tomatoes, bell peppers, onions, carrots; cut out on a transparent background; basket bottom touches the bottom edge, produce touches the right edge."
3b offer_top_brands_art.png - 1000 x 630 px: "Three generic snack/milk packets standing together: a golden-yellow chips packet, a blue-and-white milk pouch, a red/orange biscuit packet. Use invented brand names (NOT real brands). Transparent background, packs touch the bottom edge."
3c offer_healthy_art.png - 640 x 540 px: "White ceramic bowl of colourful salad (tomato, lettuce, corn, carrot, chickpeas), a few cherry tomatoes beside it, top-down 3/4 view, transparent background, bowl touches the bottom and right edges."

## PART 4 - Promo banners (art on the RIGHT part of the card; leave ~20% plain colour on the left edge so it blends)
4a banner_kitchen_art.jpg - 1200 x 717: glass jars of pulses and spices, wooden chopping board, olive-oil bottle, herb pot, tomatoes, garlic; bg soft green #E2F0D6.
4b banner_celebration_art.jpg - 1100 x 660: red-gold Indian festive box, brass diya lamp (lit), bowl of oranges/sweets, marigold flowers; bg soft pink #FDE6E8.
4c banner_green_art.jpg - 900 x 585: two hands holding soil with a small green seedling; bg #E4F4EC.
4d banner_fresh_choices_art.jpg - 1100 x 695: basket of vegetables (peppers, tomatoes, broccoli, carrots); bg #E3F1DA; vegetables must NOT touch the right edge.
4e banner_membership_art.jpg - 800 x 1000 (portrait): green gift box with gold ribbon, small confetti; bg #FFF3D0.
4f banner_newsletter_art.jpg - 1000 x 590: green paper plane with dashed flight path and a few floating leaves, bg #E7F5E4, plane on the right half.
4g app_phone_mockup.jpg - 1240 x 900: smartphone showing a green app screen with a shopping cart and handwritten 'Good Food Happier You', green leaves around, white bg.

## PART 5 - Read & Learn and category tiles
5a learn_salad.jpg - 840 x 700: bowl of fresh salad. 5b learn_nutrition.jpg - 1050 x 700: nutrition-label theme: apple, avocado, oats, notepad with a pen; light blue bg #D5E6F5.
5c cat_tile_fruits / dairy / snacks / household / personal (.jpg) - 500 x 487 each: single hero object centred on soft mint #E6F2E6 background:
apple+banana, milk bottle+glass, chips packet (generic), cleaning spray bottle, pink pump bottle (lotion).

## PART 6 - Product photos (assets/products/<slug>.jpg) - 800 x 800, pure WHITE background, soft shadow, product centred, filling ~80% of the frame
Ones missing from the design: banana (bunch), tomato (3), eggs-in-tray (6), milk pouch 500 ml (generic blue-white 'Taaza'-style pouch, invented name), potato-chips packet (generic, invented name), kurkure-style masala snack packet (generic).
Use the slugs your DB uses (for example bananas-robusta.jpg, farm-eggs.jpg, full-cream-milk.jpg).

## PART 7 - People and footer
7a testimonial faces (3 files, 400 x 400, circular crop later): friendly Indian woman ~30, Indian man ~30, Indian woman ~28; natural smile, soft light, plain mint background. Name them avatar_priya.jpg, avatar_rahul.jpg, avatar_neha.jpg.
7b footer_leaf_left.png / footer_leaf_right.png - 600 x 600 transparent PNG: soft green leaves cluster for the page corners (bottom-left / bottom-right), slightly blurred edges.
