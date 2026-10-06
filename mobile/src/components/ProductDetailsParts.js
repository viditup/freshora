import React, { useRef, useState } from 'react';
import { FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Img from './Img';
import ProductCard from './ProductCard';
import { C, FS, R, RAD, S, T, rs, shadow, FONT } from '../theme';

// PART 7: building blocks for the Product Details screen.

const Circle = ({ icon, onPress, active, label }) => (
  <TouchableOpacity onPress={onPress} accessibilityLabel={label} activeOpacity={0.85}
    style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', marginLeft: S.sm, ...shadow }}>
    <Ionicons name={icon} size={19} color={active ? C.red : C.text} />
  </TouchableOpacity>
);

// Floating back / wishlist / share bar over the gallery.
export const TopBar = ({ top, onBack, wishlisted, onWishlist, onShare }) => (
  <View style={{ position: 'absolute', top, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.md, zIndex: 5 }}>
    <Circle icon="arrow-back" label="Back" onPress={onBack} />
    <View style={{ flex: 1 }} />
    <Circle icon={wishlisted ? 'heart' : 'heart-outline'} label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'} active={wishlisted} onPress={onWishlist} />
    <Circle icon="share-social-outline" label="Share product" onPress={onShare} />
  </View>
);

// PART 7A: design gallery - vertical thumbnail strip (max 5) on the left, large image with discount badge and expand icon on the right.
const THUMB = 54;
export const Gallery = ({ images, width, idx, onIdx, off }) => {
  const ref = useRef(null);
  const [full, setFull] = useState(false);
  const thumbs = images.slice(0, 5);
  const mainW = width - S.lg * 2 - (thumbs.length > 1 ? THUMB + S.sm : 0);
  const go = (i) => { onIdx(i); ref.current?.scrollToIndex({ index: i, animated: true }); };
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: S.lg }}>
      {thumbs.length > 1 && (
        <View style={{ width: THUMB, marginRight: S.sm }}>
          {thumbs.map((im, i) => (
            <TouchableOpacity key={i} onPress={() => go(i)} accessibilityLabel={`Photo ${i + 1}`} activeOpacity={0.85}
              style={{ width: THUMB, height: THUMB, borderRadius: 12, borderWidth: 2, borderColor: i === idx ? C.green : C.border, backgroundColor: '#fff', overflow: 'hidden', marginBottom: S.sm }}>
              <Img fit="contain" uri={im} emoji="🥬" style={{ width: '100%', height: '100%' }} />
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ width: mainW, height: mainW, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8EFE1', overflow: 'hidden' }}>
        <FlatList ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} data={images} keyExtractor={(_, i) => String(i)}
          getItemLayout={(_, i) => ({ length: mainW, offset: mainW * i, index: i })}
          onMomentumScrollEnd={(e) => onIdx(Math.round(e.nativeEvent.contentOffset.x / mainW))}
          renderItem={({ item }) => <Img fit="contain" uri={item} style={{ width: mainW, height: mainW }} emoji="🥬" />} />
        {off > 0 && (
          <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: C.green, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontFamily: FONT.headingBold }}>{off}% OFF</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => setFull(true)} accessibilityLabel="View full image" style={{ position: 'absolute', right: 10, bottom: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', ...shadow }}>
          <Ionicons name="expand-outline" size={18} color={C.text} />
        </TouchableOpacity>
      </View>
      <Modal visible={full} transparent animationType="fade" onRequestClose={() => setFull(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setFull(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center' }}>
          <Img fit="contain" uri={images[idx]} emoji="🥬" style={{ width, height: width }} />
          <Text style={{ color: '#fff', marginTop: S.lg, fontFamily: FONT.body }}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Breadcrumb: Category > Sub-category > Product.
export const Breadcrumb = ({ parts }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: S.lg, marginBottom: S.md }}>
    {parts.filter((x) => x && x.label).map((x, i, arr) => (
      <React.Fragment key={`${x.label}-${i}`}>
        <TouchableOpacity disabled={!x.onPress} onPress={x.onPress} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
          <Text numberOfLines={1} style={{ fontSize: FS.sm, color: i === arr.length - 1 ? C.dark2 : C.muted, fontFamily: i === arr.length - 1 ? FONT.bodySemi : FONT.body }}>{x.label}</Text>
        </TouchableOpacity>
        {i < arr.length - 1 && <Ionicons name="chevron-forward" size={12} color={C.muted} style={{ marginHorizontal: 3 }} />}
      </React.Fragment>
    ))}
  </View>
);

// Three trust rows under the description.
const BENEFITS = [
  { icon: 'leaf-outline', t: 'Freshly Sourced', s: 'Straight from trusted farms and suppliers' },
  { icon: 'shield-checkmark-outline', t: 'No Harmful Chemicals', s: 'Handled with care, quality assured' },
  { icon: 'ribbon-outline', t: 'Quality Checked', s: 'Inspected before it reaches your door' },
];
export const BenefitRows = () => (
  <View style={{ marginTop: S.lg }}>
    {BENEFITS.map((b) => (
      <View key={b.t} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: S.md }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={b.icon} size={19} color={C.green} />
        </View>
        <View style={{ flex: 1, marginLeft: S.md }}>
          <Text style={{ fontFamily: FONT.heading, color: C.text, fontSize: FS.md }}>{b.t}</Text>
          <Text style={{ color: C.muted, fontSize: FS.sm, fontFamily: FONT.body }}>{b.s}</Text>
        </View>
      </View>
    ))}
  </View>
);

export const Section = ({ title, right, children, style }) => (
  <View style={{ marginTop: S.xl, ...style }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.sm }}>
      <Text style={T.h3}>{title}</Text>
      {right}
    </View>
    {children}
  </View>
);

// ---- pack sizes ----
// Packs come from the product document: [{ label, price, original_price, discount }].
// The first pack always matches the product's base unit/price.
export const PackSizeSelector = ({ packs, baseUnit, basePrice, selected, onSelect }) => {
  const list = packs?.length ? packs : [{ label: baseUnit || '1 pc', price: basePrice, original_price: null, discount: 0 }];
  const single = list.length === 1;
  return (
    <Section title="Select Quantity" right={<Text style={T.caption}>{single ? 'Single pack available' : `${list.length} options`}</Text>}>
      <View style={{ flexDirection: 'row' }}>
        {list.map((pk, i) => {
          const active = (selected?.label || list[0].label) === pk.label;
          return (
            <TouchableOpacity key={pk.label} onPress={() => !single && onSelect(pk)} activeOpacity={0.85} disabled={single}
              style={{ flex: 1, maxWidth: single ? 140 : undefined, borderRadius: RAD.md, borderWidth: 1.5, paddingVertical: S.sm + 2, paddingHorizontal: 4, marginLeft: i ? S.sm : 0, alignItems: 'center',
                borderColor: active ? C.green : C.border, backgroundColor: active ? C.tint : '#fff' }}>
              <Text numberOfLines={1} style={{ fontFamily: FONT.headingBold, color: active ? C.green : C.text, fontSize: FS.md }}>{pk.label}</Text>
              <Text numberOfLines={1} style={{ color: active ? C.green : C.text, fontSize: FS.sm, fontFamily: FONT.heading, marginTop: 2 }}>{rs(pk.price)}</Text>
              {pk.original_price > pk.price
                ? <Text numberOfLines={1} style={{ color: C.muted, fontSize: FS.xs, textDecorationLine: 'line-through' }}>{rs(pk.original_price)}</Text>
                : <View style={{ height: 14 }} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {!single && <Text style={[T.caption, { marginTop: S.sm }]}>Bigger packs work out cheaper per unit.</Text>}
    </Section>
  );
};

// ---- delivery ETA ----
const DRow = ({ icon, title, sub, tone }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: S.md }}>
    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={17} color={C.green} />
    </View>
    <View style={{ flex: 1, marginLeft: S.md }}>
      <Text style={{ fontFamily: FONT.heading, color: tone || C.text }}>{title}</Text>
      {!!sub && <Text style={T.caption}>{sub}</Text>}
    </View>
  </View>
);

export const DeliveryCard = ({ delivery, pincode }) => (
  <Section title="Delivery">
    <View style={{ backgroundColor: C.card, borderRadius: R, padding: S.lg, ...shadow }}>
      <DRow icon="flash-outline" title={`Delivery in ${delivery?.eta_minutes ?? 10} minutes`}
        sub={pincode ? `To your address · ${pincode}` : 'To your saved address'} />
      <DRow icon="bicycle-outline" title={delivery?.free_above ? `Free delivery above ${rs(delivery.free_above)}` : 'Delivery charges apply'}
        sub={delivery?.fee ? `Otherwise ${rs(delivery.fee)} per order` : 'No delivery fee on this order'} />
      <DRow icon="wallet-outline" title="Cash on Delivery available" sub="Or pay online at checkout" />
    </View>
  </Section>
);

// PART 7B: delivery strip (design): "Get it by Today, 5 PM" / "Free delivery on orders above Rs X" / Check Pincode.
// The time is now + the backend ETA (delivery.eta_minutes). The pincode check is UI-only: it validates 6 digits and
// does not call any serviceability API (there is none).
const clock = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
export const DeliveryStrip = ({ delivery }) => {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [res, setRes] = useState(null);
  const eta = new Date(Date.now() + (delivery?.eta_minutes ?? 10) * 60000);
  const check = () => setRes(/^\d{6}$/.test(pin) ? { ok: true, t: `Delivery available to ${pin}` } : { ok: false, t: 'Enter a valid 6-digit pincode' });
  return (
    <View style={{ marginTop: S.xl, backgroundColor: C.card, borderRadius: R, borderWidth: 1, borderColor: '#E8EFE1', padding: S.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="bicycle-outline" size={20} color={C.green} />
        </View>
        <View style={{ flex: 1, marginLeft: S.md }}>
          <Text style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: FS.md }}>Get it by Today, {clock(eta)}</Text>
          <Text style={{ color: C.muted, fontSize: FS.sm, fontFamily: FONT.body }}>
            {delivery?.free_above ? `Free delivery on orders above ${rs(delivery.free_above)}` : 'Delivery charges apply'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setOpen(!open)} accessibilityLabel="Check pincode" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: C.green, fontFamily: FONT.heading, fontSize: FS.sm }}>Check Pincode</Text>
        </TouchableOpacity>
      </View>
      {open && (
        <View style={{ marginTop: S.md }}>
          <View style={{ flexDirection: 'row' }}>
            <TextInput value={pin} onChangeText={(v) => { setPin(v.replace(/\D/g, '')); setRes(null); }} placeholder="Enter pincode" placeholderTextColor={C.muted}
              keyboardType="number-pad" maxLength={6} onSubmitEditing={check}
              style={{ flex: 1, height: 42, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, color: C.text, fontFamily: FONT.body, backgroundColor: '#fff' }} />
            <TouchableOpacity onPress={check} activeOpacity={0.85} style={{ height: 42, paddingHorizontal: 18, marginLeft: S.sm, borderRadius: 12, backgroundColor: C.dark2, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontFamily: FONT.headingBold, fontSize: FS.sm }}>Check</Text>
            </TouchableOpacity>
          </View>
          {!!res && <Text style={{ marginTop: S.sm, color: res.ok ? C.green : C.red, fontSize: FS.sm, fontFamily: FONT.bodySemi }}>{res.t}</Text>}
        </View>
      )}
    </View>
  );
};

// PART 7B: four stat cards (Calories / Protein / Carbohydrates / Fat) from the product's nutrition rows, shown inline (not behind a tab).
const STATS = [['Calories', /^energy$/i, 'flame-outline', '#FDECEA'], ['Protein', /^protein$/i, 'barbell-outline', '#E3F1DA'],
  ['Carbohydrates', /^carbohydrates$/i, 'nutrition-outline', '#FFF3CF'], ['Fat', /^fat$/i, 'water-outline', '#E6F0FB']];
export const NutritionCards = ({ rows }) => {
  const [full, setFull] = useState(false);
  const cards = STATS.map(([label, rx, icon, bg]) => ({ label, icon, bg, row: (rows || []).find((r) => rx.test(r.label)) })).filter((c) => c.row);
  return (
    <Section title="Nutritional Information" right={<Text style={T.caption}>per 100 g</Text>}>
      {cards.length > 0 && (
        <View style={{ flexDirection: 'row' }}>
          {cards.map((c, i) => (
            <View key={c.label} style={{ flex: 1, backgroundColor: c.bg, borderRadius: 14, paddingVertical: S.md, paddingHorizontal: 4, alignItems: 'center', marginLeft: i ? S.sm : 0 }}>
              <Ionicons name={c.icon} size={18} color={C.dark2} />
              <Text numberOfLines={1} style={{ fontFamily: FONT.headingBold, color: C.dark2, fontSize: FS.md, marginTop: 4 }}>{c.row.value}</Text>
              <Text numberOfLines={1} style={{ color: C.muted, fontSize: 10.5, fontFamily: FONT.bodyMedium, marginTop: 1 }}>{c.label}</Text>
            </View>
          ))}
        </View>
      )}
      {!cards.length && <Text style={{ color: C.muted, fontSize: FS.sm }}>Nutrition information is not available for this product yet.</Text>}
      {(rows || []).length > 0 && (
        <TouchableOpacity onPress={() => setFull(!full)} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginTop: S.md }}>
          <Text style={{ color: C.green, fontFamily: FONT.heading, fontSize: FS.sm }}>{full ? 'Hide full table' : 'View full table'}</Text>
          <Ionicons name={full ? 'chevron-up' : 'chevron-down'} size={14} color={C.green} style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      )}
      {full && <View style={{ marginTop: -S.sm }}><NutritionTable rows={rows} bare /></View>}
    </Section>
  );
};

// ---- specification rows ----
export const DetailRows = ({ rows }) => {
  const list = rows.filter((r) => r && r[1] !== undefined && r[1] !== null && `${r[1]}`.length > 0);
  if (!list.length) return null;
  return (
    <Section title="Specifications">
      <View style={{ backgroundColor: C.card, borderRadius: R, paddingHorizontal: S.lg, ...shadow }}>
        {list.map(([k, v], i) => (
          <View key={k} style={{ flexDirection: 'row', paddingVertical: S.md, borderTopWidth: i ? 1 : 0, borderTopColor: '#F0F4EC' }}>
            <Text style={{ width: 120, color: C.muted, fontSize: FS.sm }}>{k}</Text>
            <Text style={{ flex: 1, color: C.text, fontSize: FS.sm, fontFamily: FONT.bodySemi }}>{v}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
};

// ---- nutrition table ----
export const NutritionTable = ({ rows, bare }) => {
  const Wrap = bare ? ({ children }) => <View>{children}</View> : ({ children }) => <Section title="Nutrition information">{children}</Section>;
  return (
  <Wrap>
    <View style={{ backgroundColor: C.card, borderRadius: R, overflow: 'hidden', ...shadow }}>
      <View style={{ flexDirection: 'row', backgroundColor: C.light, paddingHorizontal: S.lg, paddingVertical: S.sm }}>
        <Text style={{ flex: 1, fontFamily: FONT.headingBold, color: C.dark, fontSize: FS.sm }}>Per 100 g</Text>
        <Text style={{ fontFamily: FONT.headingBold, color: C.dark, fontSize: FS.sm }}>Amount</Text>
      </View>
      {rows?.length ? rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={{ flexDirection: 'row', paddingHorizontal: S.lg, paddingVertical: 11, backgroundColor: i % 2 ? '#FAFCF8' : '#fff' }}>
          <Text style={{ flex: 1, color: C.text, fontSize: FS.sm }}>{r.label}</Text>
          <Text style={{ color: C.text, fontSize: FS.sm, fontFamily: FONT.heading }}>{r.value}</Text>
        </View>
      )) : (
        <Text style={{ padding: S.lg, color: C.muted, fontSize: FS.sm }}>
          Nutrition information is not available for this product yet.
        </Text>
      )}
    </View>
  </Wrap>
  );
};

export const Highlights = ({ items }) => {
  if (!items?.length) return null;
  return (
    <Section title="Highlights">
      <View style={{ backgroundColor: C.card, borderRadius: R, padding: S.lg, ...shadow }}>
        {items.map((h) => (
          <View key={h} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
            <Ionicons name="checkmark-circle" size={16} color={C.green} style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, marginLeft: S.sm, color: C.text, fontSize: FS.md }}>{h}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
};

// ---- you may also like ----
export const YouMayAlsoLike = ({ items, onPress, qtyOf, onAdd, onInc, onDec, wishlistedOf, onWish }) => {
  if (!items?.length) return null;
  return (
    <Section title="You May Also Like" right={<Text style={T.caption}>{items.length} picks</Text>} style={{ marginBottom: S.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: S.lg }}>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} style={{ width: 156, marginRight: S.md }} qty={qtyOf(p.id)}
            wishlisted={wishlistedOf ? wishlistedOf(p.id) : false} onWishlist={onWish ? () => onWish(p) : undefined}
            onPress={() => onPress(p)} onAdd={() => onAdd(p)} onInc={() => onInc(p)} onDec={() => onDec(p)} />
        ))}
      </ScrollView>
    </Section>
  );
};
