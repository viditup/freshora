import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { C } from '../theme';
import LOCAL_PRODUCTS from '../../assets/products';

// Image with safe fallback: missing URL or load failure shows a placeholder instead of breaking the screen.
// uri    = remote photo URL;  source = local require() image (design assets).
// fit    = 'cover' (banners, avatars) or 'contain' (product photos on white, whole product visible).
// PART 15: old database rows still hold green text-only placehold.co images ("Fresh Apples" written on a green box).
// Those are treated as "no photo" so the neutral placeholder shows instead of fake text.
// PART 16: a product photo URL (.../static/products/<slug>.<ext>) is shown from the copy BUNDLED in the app (assets/products),
// so product photos appear even if the phone cannot download from the PC. Gallery photos (-2, -3 ...) still load from the server.
const isPlaceholder = (u) => /placehold\.co/i.test(u || '');
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const KEYS = Object.keys(LOCAL_PRODUCTS);
// exact slug first, then the bundled photo whose name starts with it ("fresh-apples" -> "fresh-apples-shimla"):
// products seeded earlier have shorter names than the photo files.
const bySlug = (slug) => LOCAL_PRODUCTS[slug] || LOCAL_PRODUCTS[KEYS.find((k) => slug && k.startsWith(slug + '-'))];
const localProduct = (u) => {
  if (!u) return undefined;
  const m = /\/static\/products\/([^/?#]+?)\.(?:jpe?g|png|webp)(?:[?#].*)?$/i.exec(u);
  if (m) return bySlug(m[1].toLowerCase());
  // old green placehold.co image: the product name is in its ?text= part ("Fresh Apples" -> fresh-apples)
  const t = /placehold\.co\/.*[?&]text=([^&#]*)/i.exec(u);
  if (t) { try { return bySlug(slugify(decodeURIComponent(t[1].replace(/\+/g, ' ')))); } catch (e) { return undefined; } }
  return undefined;
};

export default function Img({ uri, source, style, emoji = '\uD83D\uDED2', fit = 'cover' }) {
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); }, [uri]);
  if (source) return <Image source={source} style={style} resizeMode={fit} />;
  const local = localProduct(uri);
  if (local) return <Image source={local} style={style} resizeMode={fit} />;
  if (!uri || bad || isPlaceholder(uri))
    return <View style={[style, { backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 30 }}>{emoji}</Text></View>;
  return <Image source={{ uri }} style={style} resizeMode={fit} fadeDuration={120} onError={() => setBad(true)} />;
}
