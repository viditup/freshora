import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Img from './Img';
import { C, FS, R, RAD, S, shadow, FONT } from '../theme';
import { catBigSource, catTileSource } from '../designImages';

// Emoji per category (matched on name/slug) so tiles look right even when the backend only has placeholder images.
const EMOJI = [
  [/baby/, '🍼'], [/pet/, '🐾'], [/healthy/, '🥜'], [/fruit/, '🍎'], [/veg/, '🍅'], [/dairy|milk/, '🥛'], [/bakery|bread/, '🍞'], [/bever|juice/, '🧃'], [/snack/, '🍿'],
  [/grocery|staple|atta|rice/, '🌾'], [/organic/, '🌿'], [/personal|care/, '🧴'], [/house|clean/, '🧼'],
];
export const catEmoji = (c) => {
  const k = `${c.slug || ''} ${c.name || ''}`.toLowerCase();
  return (EMOJI.find(([rx]) => rx.test(k)) || [null, '🥬'])[1];
};
const realImage = (u) => !!u && !/placehold\.co/i.test(u);
const TILE = 72;
export const countLabel = (c) => `${c.product_count || 0} item${(c.product_count || 0) === 1 ? '' : 's'}`;

// PART 15: `itemWidth` / `tile` let Home fit every tile in one row (design: 5 categories + All Categories, no sideways scroll).
export const AllCategoriesTile = ({ onPress, itemWidth, tile, fs, gap }) => {
  const t = tile || TILE;
  const size = fs || 11.5;
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel="All categories" style={{ width: itemWidth || TILE + 8, alignItems: 'center', marginRight: itemWidth ? 0 : 10 }}>
      <View style={{ width: t, height: t, borderRadius: Math.round(t * 0.24), backgroundColor: '#E3F1DA', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="grid" size={Math.round(t * 0.42)} color={C.dark} />
      </View>
      <Text maxFontSizeMultiplier={1} numberOfLines={2} style={{ fontSize: size, lineHeight: Math.round(size * 1.25), fontFamily: FONT.bodyMedium, color: C.text, textAlign: 'center', marginTop: gap || 6 }}>All{'\n'}Categories</Text>
    </TouchableOpacity>
  );
};

// compact = rounded tile for the Home carousel; otherwise a grid tile.
function CategoryCard({ category: c, onPress, compact, style, label, itemWidth, tile, fs, gap }) {
  if (compact) {
    const t = tile || TILE;
    return (
      <TouchableOpacity onPress={() => onPress(c)} accessibilityLabel={label || c.name} style={{ width: itemWidth || TILE + 8, alignItems: 'center', marginRight: itemWidth ? 0 : 10 }}>
        <View style={{ width: t, height: t, borderRadius: Math.round(t * 0.24), backgroundColor: C.tile, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {realImage(c.image)
            ? <Img fit="contain" uri={c.image} emoji={catEmoji(c)} style={{ width: Math.round(t * 0.67), height: Math.round(t * 0.67), borderRadius: 14 }} />
            : catTileSource(c)
              ? <Img source={catTileSource(c)} style={{ width: t, height: t }} />
              : <Text style={{ fontSize: Math.round(t * 0.47) }}>{catEmoji(c)}</Text>}
        </View>
        <Text maxFontSizeMultiplier={1} numberOfLines={2} style={{ fontSize: fs || 11.5, lineHeight: Math.round((fs || 11.5) * 1.25), fontFamily: FONT.bodyMedium, color: C.text, textAlign: 'center', marginTop: gap || 6 }}>{label || c.name}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={() => onPress(c)} style={[{ backgroundColor: C.card, borderRadius: R, padding: 12, alignItems: 'center', ...shadow }, style]}>
      {!realImage(c.image) && catBigSource(c)
        ? <Img source={catBigSource(c)} style={{ width: '100%', aspectRatio: 1.3, borderRadius: 10 }} />
        : <Img uri={c.image} emoji="🥬" style={{ width: '100%', aspectRatio: 1.3, borderRadius: 10 }} />}
      <Text numberOfLines={1} style={{ fontFamily: FONT.heading, color: C.text, marginTop: 8 }}>{c.name}</Text>
      <Text numberOfLines={1} style={{ color: C.muted, fontSize: 12 }}>{c.description}</Text>
    </TouchableOpacity>
  );
}
export default memo(CategoryCard);

/* ---------------- PART 6: Categories screen building blocks ---------------- */

// Small tile for the "Shop by Categories" grid (3 per row).
export const CategoryTile = ({ category: c, onPress, width }) => (
  <TouchableOpacity onPress={() => onPress(c)} activeOpacity={0.9} accessibilityLabel={c.name} style={{ width, marginBottom: S.md, alignItems: 'center' }}>
    <View style={{ width: width - 12, height: width - 12, borderRadius: 20, backgroundColor: '#EAF5E4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {realImage(c.image)
        ? <Img uri={c.image} emoji={catEmoji(c)} style={{ width: '100%', height: '100%' }} />
        : catBigSource(c)
          ? <Img source={catBigSource(c)} style={{ width: '100%', height: '100%' }} />
          : <Text style={{ fontSize: 30 }}>{catEmoji(c)}</Text>}
    </View>
    <Text numberOfLines={2} style={{ fontSize: FS.sm, fontFamily: FONT.heading, color: C.text, textAlign: 'center', marginTop: 6, minHeight: 32 }}>{c.name}</Text>
    <Text style={{ fontSize: FS.xs, color: C.muted }}>{countLabel(c)}</Text>
  </TouchableOpacity>
);

// Big card for the "Featured Categories" section (2 per row).
export const FeaturedCategoryCard = ({ category: c, onPress, width }) => (
  <TouchableOpacity onPress={() => onPress(c)} activeOpacity={0.9} accessibilityLabel={c.name}
    style={{ width, backgroundColor: C.card, borderRadius: RAD.lg, padding: S.sm, marginBottom: S.md, ...shadow }}>
    <View style={{ borderRadius: RAD.md, backgroundColor: '#F3F8EE', overflow: 'hidden' }}>
      {realImage(c.image)
        ? <Img uri={c.image} emoji={catEmoji(c)} style={{ width: '100%', aspectRatio: 1.5 }} />
        : catBigSource(c)
          ? <Img source={catBigSource(c)} style={{ width: '100%', aspectRatio: 1.5 }} />
          : <View style={{ aspectRatio: 1.5, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 46 }}>{catEmoji(c)}</Text></View>}
    </View>
    <Text numberOfLines={1} style={{ fontFamily: FONT.headingBold, color: C.text, marginTop: S.sm }}>{c.name}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
      <Text style={{ color: C.muted, fontSize: FS.sm }}>{countLabel(c)}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: C.green, fontFamily: FONT.heading, fontSize: FS.sm }}>Shop</Text>
        <Ionicons name="arrow-forward" size={13} color={C.green} style={{ marginLeft: 2 }} />
      </View>
    </View>
  </TouchableOpacity>
);

// One row of the "All Categories" list, with the item count.
export const CategoryRow = ({ category: c, onPress }) => (
  <TouchableOpacity onPress={() => onPress(c)} activeOpacity={0.9} accessibilityLabel={c.name}
    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: R, padding: S.md, marginBottom: S.sm, ...shadow }}>
    <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#EAF5E4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {realImage(c.image)
        ? <Img uri={c.image} emoji={catEmoji(c)} style={{ width: 48, height: 48 }} />
        : catBigSource(c)
          ? <Img source={catBigSource(c)} style={{ width: 48, height: 48 }} />
          : <Text style={{ fontSize: 24 }}>{catEmoji(c)}</Text>}
    </View>
    <View style={{ flex: 1, marginLeft: S.md }}>
      <Text numberOfLines={1} style={{ fontFamily: FONT.heading, color: C.text }}>{c.name}</Text>
      <Text numberOfLines={1} style={{ color: C.muted, fontSize: FS.sm, marginTop: 1 }}>{c.description || countLabel(c)}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={C.muted} />
  </TouchableOpacity>
);

/* ---------------- PART 6A: design layouts ---------------- */

// 2-per-row photo card for "Shop by Categories": photo, name, item count.
export const CategoryGridCard = ({ category: c, onPress, width }) => (
  <TouchableOpacity onPress={() => onPress(c)} activeOpacity={0.9} accessibilityLabel={c.name}
    style={{ width, backgroundColor: C.card, borderRadius: RAD.lg, borderWidth: 1, borderColor: '#E8EFE1', padding: S.sm, marginBottom: S.md }}>
    <View style={{ borderRadius: RAD.md, backgroundColor: C.tile, overflow: 'hidden', aspectRatio: 1.35, alignItems: 'center', justifyContent: 'center' }}>
      {realImage(c.image)
        ? <Img uri={c.image} emoji={catEmoji(c)} style={{ width: '100%', height: '100%' }} />
        : catBigSource(c)
          ? <Img source={catBigSource(c)} style={{ width: '100%', height: '100%' }} />
          : <Text style={{ fontSize: 42 }}>{catEmoji(c)}</Text>}
    </View>
    <Text numberOfLines={1} style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: FS.md, marginTop: S.sm }}>{c.name}</Text>
    <Text style={{ color: C.muted, fontSize: FS.sm, fontFamily: FONT.body }}>{countLabel(c)}</Text>
  </TouchableOpacity>
);

// The last cell of that grid: opens the All Categories list.
export const AllCategoriesCard = ({ onPress, width, total }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityLabel="All categories"
    style={{ width, backgroundColor: C.tint, borderRadius: RAD.lg, padding: S.sm, marginBottom: S.md, alignItems: 'center', justifyContent: 'center', minHeight: 150 }}>
    <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="grid" size={28} color={C.dark2} />
    </View>
    <Text style={{ fontFamily: FONT.headingBold, color: C.dark2, fontSize: FS.md, marginTop: S.sm }}>All Categories</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
      <Text style={{ color: C.green, fontFamily: FONT.heading, fontSize: FS.sm }}>{total} items</Text>
      <Ionicons name="arrow-forward" size={13} color={C.green} style={{ marginLeft: 3 }} />
    </View>
  </TouchableOpacity>
);

// 4-per-row small tile for "Featured Categories".
export const FeaturedMini = ({ category: c, onPress, width }) => (
  <TouchableOpacity onPress={() => onPress(c)} activeOpacity={0.9} accessibilityLabel={c.name} style={{ width, alignItems: 'center' }}>
    <View style={{ width: width - 8, height: width - 8, borderRadius: 18, backgroundColor: C.tile, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      {realImage(c.image)
        ? <Img uri={c.image} emoji={catEmoji(c)} style={{ width: '100%', height: '100%' }} />
        : catBigSource(c)
          ? <Img source={catBigSource(c)} style={{ width: '100%', height: '100%' }} />
          : <Text style={{ fontSize: 28 }}>{catEmoji(c)}</Text>}
    </View>
    <Text numberOfLines={2} style={{ fontSize: 11.5, fontFamily: FONT.bodySemi, color: C.text, textAlign: 'center', marginTop: 6, minHeight: 30 }}>{c.name}</Text>
  </TouchableOpacity>
);
