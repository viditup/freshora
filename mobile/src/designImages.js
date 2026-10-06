// PART 3C: local design art used when the backend has only placeholder images.
import D from '../assets/design';

const norm = (c) => `${c.slug || ''} ${c.name || ''}`.toLowerCase();

// Small rounded tiles (Home category row).
const TILE = [[/fruit|veg/, 'cat_tile_fruits'], [/dairy|milk/, 'cat_tile_dairy'], [/snack|bever/, 'cat_tile_snacks'],
  [/house|clean/, 'cat_tile_household'], [/personal/, 'cat_tile_personal']];
// Bigger photos (Shop by Categories / All Categories / Featured).
// order matters (first match wins): specific names before generic ones
const BIG = [[/healthy/, 'feat_healthy_snacks'], [/clean/, 'feat_cleaning'], [/organic/, 'feat_organic'], [/baby/, 'cat_baby_care'], [/pet/, 'cat_pet_care'],
  [/fruit|veg/, 'cat_fruits_veg'], [/dairy|milk/, 'cat_dairy'], [/snack/, 'cat_snacks'], [/bever|juice/, 'feat_beverages'],
  [/grocery|staple|atta|rice/, 'cat_atta_rice'], [/personal|care/, 'cat_personal_care'], [/house/, 'cat_household']];

const pick = (list, c) => { const k = norm(c); const hit = list.find(([rx]) => rx.test(k)); return hit ? D[hit[1]] : null; };
export const catTileSource = (c) => pick(TILE, c);
export const catBigSource = (c) => pick(BIG, c);
export default D;
