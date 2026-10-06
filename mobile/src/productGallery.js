/*
 * Local product galleries (images bundled inside the app).
 *
 * Put the files in:   assets/products/<product>/
 * This file lives in: src/productGallery.js
 *
 * The key is the product name in lowercase (or its slug).
 * The FIRST image is the main one. Add more products the same way:
 *   apples: [ require('../assets/products/apples/apples_1.png'), ... ],
 */
export const LOCAL_GALLERY = {
  tomato: [
    require('../assets/products/tomato/tomato_1_whole.png'),
    require('../assets/products/tomato/tomato_2_single.png'),
    require('../assets/products/tomato/tomato_3_transverse.png'),
    require('../assets/products/tomato/tomato_4_longitudinal.png'),
  ],
};

export const galleryFor = (p) => {
  if (!p) return null;
  const keys = [p.slug, p.name]
    .filter(Boolean)
    .map((k) => String(k).toLowerCase().trim());
  const hit = keys.find((k) => LOCAL_GALLERY[k]);
  return hit ? LOCAL_GALLERY[hit] : null;
};
