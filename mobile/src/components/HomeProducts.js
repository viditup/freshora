import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Img from './Img';
import { C, rs, FONT } from '../theme';
import { useDesign } from '../scale';

// PART 3B: Home-only product UI (PDF "Fresh Picks for You" / best sellers).
// The shared ProductCard (Products / Search grids) is intentionally left untouched.

// PART 17: card size / gap / side padding are fractions of the screen width measured from the design
// (card = 238 of 1048 units wide, gap 14, side 42), so FOUR cards fit in one row on every phone, like the design.
// The design's tiny text is raised to a readable minimum (see f(.., min) below).
export const useHomeCardWidth = () => {
  const { u } = useDesign();
  return Math.round(u(238));
};

function HomeProductCard({ product: p, width, onPress, onAdd }) {
  const { u, f } = useDesign();
  const out = p.stock <= 0;
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const add = async () => {
    if (busy || out) return;
    setBusy(true);
    try { await onAdd(p); } finally { if (alive.current) setBusy(false); }
  };

  const btn = Math.max(21, u(52));
  const pad = Math.max(4, u(12));
  const photoW = Math.round(width - 2 * pad - 2); // card inner width (2 = border)
  const photoH = Math.round(photoW * 0.9);        // PART 31: 0.8 -> 0.9: the top strip below is reserved for the small OFF badge
  // PART 31b: the OFF badge lives in its OWN strip above the photo (strip height = badge height + margins), so it can never touch the product.
  const badgeFs = f(13, 7);
  const badgeStrip = Math.ceil(u(7) + badgeFs * 1.2 + 3 + 3);
  // PART 21: text sizes follow the design (name 21, unit 19, price 26 units); the readable minimums were lowered a little.
  const nameFs = f(21, 10), nameLH = f(25, 11.5), unitFs = f(19, 9), priceFs = f(24, 10.5), strikeFs = f(17, 8);
  const nameTop = u(10);
  const nameBlockH = nameLH * 2 + unitFs + 2 + nameTop; // name (max 2 lines) + unit line
  const priceH = Math.max(btn, priceFs * 1.3);          // price and the struck-out price now sit on ONE line, as in the design
  // PART 28: the struck-out price is shown only when it really fits next to the price and the + button (no more "₹..." cut-off).
  const priceW = String(rs(p.price)).length * priceFs * 0.64;
  const strikeW = String(rs(p.original_price || 0)).length * strikeFs * 0.56 + u(10);
  const showStrike = p.original_price > p.price && priceW + strikeW <= photoW - btn - 6;
  const cardH = Math.ceil(2 + 2 * pad + photoH + nameBlockH + u(8) + priceH + 2);
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={() => onPress(p)} accessibilityLabel={p.name}
      style={{ width, height: cardH, backgroundColor: C.card, borderRadius: u(30), padding: pad, borderWidth: 1, borderColor: '#E8EFE1', overflow: 'hidden' }}>
      {/* white photo area (design): product photos are shot on white, so no grey/green box behind them */}
      <View style={{ width: photoW, height: photoH, borderRadius: u(22), backgroundColor: '#fff', overflow: 'hidden' }}>
        <Img fit="contain" uri={p.images?.[0]} style={{ position: 'absolute', left: 0, bottom: 0, width: photoW, height: photoH - badgeStrip }} />
        {p.discount > 0 && (
          <View style={{ position: 'absolute', top: u(8), left: u(8), backgroundColor: C.green, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1.5 }}>
            <Text maxFontSizeMultiplier={1} style={{ color: '#fff', fontSize: f(13, 7), fontFamily: FONT.headingBold }}>{Math.round(p.discount)}% OFF</Text>
          </View>
        )}
        {out && (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(29,58,39,0.72)', paddingVertical: 2, alignItems: 'center' }}>
            <Text maxFontSizeMultiplier={1} style={{ color: '#fff', fontSize: 9, fontFamily: FONT.heading }}>Out of stock</Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 1 }}>
        <View style={{ minHeight: nameBlockH }}>
          <Text maxFontSizeMultiplier={1} numberOfLines={2} style={{ fontSize: nameFs, fontFamily: FONT.heading, color: C.text, marginTop: nameTop, lineHeight: nameLH }}>{p.name}</Text>
          {!!p.unit && <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontSize: unitFs, color: C.muted, marginTop: 1 }}>{p.unit}</Text>}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: u(8) }}>
          <View style={{ flex: 1, marginRight: 3, flexDirection: 'row', alignItems: 'baseline', flexWrap: 'nowrap' }}>
            <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontSize: priceFs, fontFamily: FONT.headingBold, color: C.text }}>{rs(p.price)}</Text>
            {showStrike && (
              <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ marginLeft: u(10), fontSize: strikeFs, color: C.muted, textDecorationLine: 'line-through' }}>{rs(p.original_price)}</Text>
            )}
          </View>
          <TouchableOpacity disabled={out || busy} onPress={add} accessibilityLabel={`Add ${p.name} to cart`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: btn, height: btn, borderRadius: Math.round(btn * 0.3), alignItems: 'center', justifyContent: 'center', backgroundColor: out ? '#F1F3F0' : C.green }}>
            {busy
              ? <ActivityIndicator size="small" color="#fff" />
              : out
                ? <Text maxFontSizeMultiplier={1} style={{ color: C.muted, fontFamily: FONT.headingBold, fontSize: 8 }}>SOLD</Text>
                : <Ionicons name="add" size={Math.round(btn * 0.7)} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const Card = memo(HomeProductCard);
export { Card as HomeCard }; // used by the Offers screen deals grid

// Section = heading row (+ optional subtitle / See All) and a horizontal product carousel.
// tint: soft green full-width band (PDF section background); otherwise plain with a hairline divider on top.
export default function HomeProductSection({ title, subtitle, products, onAll, onProduct, onAdd, tint, first, allLabel = 'See All', allArrow = true }) {
  const { u, f } = useDesign();
  const w = useHomeCardWidth();
  const GAP = Math.round(u(14));
  const SIDE = Math.round(u(42));
  const keyEx = useCallback((p) => String(p.id), []);
  const layout = useCallback((_, i) => ({ length: w + GAP, offset: (w + GAP) * i, index: i }), [w, GAP]);
  const render = useCallback(({ item }) => (
    <View style={{ marginRight: GAP }}><Card product={item} width={w} onPress={onProduct} onAdd={onAdd} /></View>
  ), [w, GAP, onProduct, onAdd]);

  if (!products || !products.length) return null;
  return (
    <View style={[
      { marginTop: u(36), paddingTop: tint ? u(30) : 0, paddingBottom: tint ? u(30) : 0 },
      tint ? { backgroundColor: '#EEF6E8' } : null,
    ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE, marginBottom: u(22) }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text maxFontSizeMultiplier={1.1} numberOfLines={1} style={{ fontSize: f(32, 14), fontFamily: FONT.headingBold, color: C.text }}>{title}</Text>
          {!!subtitle && <Text numberOfLines={1} style={{ fontSize: f(24, 11), color: C.muted, marginTop: 2 }}>{subtitle}</Text>}
        </View>
        {onAll && (
          <TouchableOpacity onPress={onAll} accessibilityLabel={`${allLabel} ${title}`} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text maxFontSizeMultiplier={1.1} style={{ color: C.green, fontFamily: FONT.heading, fontSize: f(28, 12) }}>{allLabel}</Text>
            {allArrow && <Ionicons name="arrow-forward" size={f(30, 13)} color={C.green} style={{ marginLeft: 3 }} />}
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        horizontal data={products} keyExtractor={keyEx} renderItem={render} getItemLayout={layout}
        showsHorizontalScrollIndicator={false} nestedScrollEnabled decelerationRate="fast"
        initialNumToRender={5} maxToRenderPerBatch={5} windowSize={5} removeClippedSubviews
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: SIDE, paddingBottom: 2, alignItems: 'flex-start' }}
      />
    </View>
  );
}
