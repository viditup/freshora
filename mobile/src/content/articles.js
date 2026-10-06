// PART 10: "Read & Learn" articles. Static, written for the app (there is no blog backend yet).
// `cat` is matched against category slug/name so "Shop related" opens the right category when it exists.
export const ARTICLES = [
  {
    // PART 25: design card "5 Easy Ways to Eat Healthier Everyday" (Home first card). `home` = the design's line breaks, `card` = card colour on Home.
    id: 'eat-healthier', emoji: '🥗', tag: 'Healthy living', title: '5 easy ways to eat healthier everyday', home: '5 Easy Ways\nto Eat Healthier\nEveryday', card: '#DCEFD9', cat: /fruit|vegetable/i, bg: '#E3F1DA',
    body: [
      'Fill half of your plate with vegetables and fruit. Colourful produce such as tomatoes, spinach, carrots and cucumber is an easy way to add fibre, vitamins and minerals to everyday meals.',
      'Swap refined staples for whole grains where you can, drink water instead of sugary drinks, and keep a bowl of fruit or roasted snacks within reach instead of fried ones.',
      'Plan your meals, read the nutrition label, and cook at home more often. Small changes you can keep up work better than a strict plan you drop after a week.',
    ],
  },
  {
    id: 'fresh-longer', emoji: '🍅', tag: 'Storage', title: 'Keep fruits and vegetables fresh for longer', cat: /vegetable/i, bg: '#FDECEA',
    body: [
      'Moisture is the enemy of fresh produce. Wash fruits and vegetables just before you use them, not when you bring them home, and dry leafy greens well before storing.',
      'Keep onions and potatoes in a cool, dark, airy place, and store them apart from each other. Wrap leafy greens in a dry cloth or paper towel and keep them in the fridge.',
      'Ripe bananas give off a gas that can make nearby fruit ripen faster. If you want your apples to last, keep them away from your fruit bowl\'s banana corner.',
    ],
  },
  {
    id: 'store-staples', emoji: '🌾', tag: 'Staples', title: 'Atta, rice and dal: store them the right way', cat: /grocery|staple/i, bg: '#FFF3CF',
    body: [
      'Staples last longest in airtight containers kept in a cool, dry spot away from sunlight. Avoid storing them next to the stove or a sink where heat and steam can reach them.',
      'Always use a dry spoon. Even a little moisture can cause lumps and spoilage. Atta is best used within a few months, while whole grains and pulses usually keep longer.',
      'If a container smells musty or you see tiny insects, do not use it. Buy pack sizes you will actually finish and check the best-before date on every pack.',
    ],
  },
  {
    id: 'read-labels', emoji: '🏷️', tag: 'Healthy living', title: 'Understanding food labels: a quick guide', home: 'Understanding\nFood Labels\nA Quick Guide', card: '#D5E6F5', cat: /snack|organic/i, bg: '#D5E6F5',
    body: [
      'Start with the serving size, then compare products using the "per 100 g" column, which puts different pack sizes on the same footing. Every Freshora product page shows this table.',
      'Ingredients are listed from the largest amount to the smallest. If sugar or salt appears near the top, the product is mostly that.',
      'Look at sugar, salt and fat first, and pick the option that fits your own needs. A short ingredient list with names you recognise is usually a good sign.',
    ],
  },
  {
    id: 'greener-kitchen', emoji: '🌍', tag: 'Sustainability', title: 'Small swaps for a greener kitchen', cat: /organic/i, bg: '#E4F4EC',
    body: [
      'Food waste is one of the easiest things to cut. Plan a few meals before you shop, buy what you will use, and use the older items in your kitchen first.',
      'Carry a reusable bag for your shopping and reuse jars and containers for storage. Choosing organic and seasonal produce is another simple way to shop with the planet in mind.',
      'You do not need to change everything at once. One or two habits you can keep up make more difference than a big plan you drop after a week.',
    ],
  },
];
export const readMinutes = (a) => Math.max(1, Math.round(a.body.join(' ').split(/\s+/).length / 180));
