import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { trackViewed } from '../recent';
import AppHeader from '../components/AppHeader'; // same header as Home (location + search bar)
import Img from '../components/Img';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import ProductCard from '../components/ProductCard';
import { NutritionCards } from '../components/ProductDetailsParts';
import { C, FONT, rs } from '../theme';

/*
 * ============================================================
 * PRODUCT DETAILS  (matches the target design)
 *
 *  Home header (delivering-to + search bar)
 *  breadcrumb
 *  [thumbs + main image]  |  title / rating / price / benefits
 *  Select Quantity (pack chips)
 *  Add to Cart | Buy Now
 *  Delivery strip
 *  Product Details + 100% Farm Fresh card
 *  Nutritional Information
 *  You May Also Like  (4 compact cards per row)
 * ============================================================
 */

/*
 * Local galleries (images bundled in the app).
 * Files go in:  assets/products/<product>/   (project root, next to App.js)
 * Key = product name or slug in lowercase. First image = main image.
 */
const LOCAL_GALLERY = {
  tomato: [
    require('../../assets/products/tomato/tomato_1_whole.png'),
    require('../../assets/products/tomato/tomato_2_single.png'),
    require('../../assets/products/tomato/tomato_3_transverse.png'),
    require('../../assets/products/tomato/tomato_4_longitudinal.png'),
  ],
};

const galleryFor = (p) => {
  if (!p) return null;
  const hit = [p.slug, p.name]
    .filter(Boolean)
    .map((k) => String(k).toLowerCase().trim())
    .find((k) => LOCAL_GALLERY[k]);
  return hit ? LOCAL_GALLERY[hit] : null;
};

const PAD = 12;
const THUMB_SHIFT = 0.16; // left thumbnails: move down by 10% of the box height (0 = top aligned)
const IMG_SHIFT = 0.12; // 0 = no shift, 0.1 = move image down by 10% of the box height
const GAP = 5;

/* ---------- small helpers ---------- */

// shows a bundled image (require -> number) or a remote url
const Pic = ({ src, style, mode = 'contain' }) =>
  typeof src === 'number'
    ? <Image source={src} resizeMode={mode} style={style} />
    : <Img fit="contain" uri={src} style={style} />;


const Title = ({ children, right, onRight }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 6,
    }}
  >
    <Text style={{ fontFamily: FONT.headingBold, fontSize: 13, color: C.dark2 }}>
      {children}
    </Text>
    {!!right && (
      onRight ? (
        <TouchableOpacity
          onPress={onRight}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ fontFamily: FONT.heading, fontSize: 9, color: C.green }}>{right}</Text>
          <Ionicons name="arrow-forward" size={10} color={C.green} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      ) : (
        <Text style={{ fontFamily: FONT.body, fontSize: 9, color: C.muted }}>{right}</Text>
      )
    )}
  </View>
);

const Benefit = ({ icon, title }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: C.tint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={10} color={C.green} />
    </View>
    <Text
      numberOfLines={1}
      style={{ flex: 1, marginLeft: 6, fontFamily: FONT.heading, fontSize: 9, color: C.dark2 }}
    >
      {title}
    </Text>
  </View>
);

// nutrition rows can arrive as an array of objects, an object map, or pairs
const nutriRows = (n) => {
  if (!n) return [];
  const arr = Array.isArray(n)
    ? n
    : Array.isArray(n.rows)
      ? n.rows
      : Object.entries(n).map(([k, v]) => ({ label: k, value: v }));
  const rows = arr
    .map((r) => {
      if (Array.isArray(r)) return { label: String(r[0]), value: String(r[1]) };
      if (!r || typeof r !== 'object') return null;
      const label = r.label || r.name || r.key;
      let value = r.display ?? r.value;
      if (!label || value == null) return null;
      value = String(value);
      if (r.unit && !value.includes(r.unit)) value += ` ${r.unit}`;
      const l = String(label);
      return { label: l.charAt(0).toUpperCase() + l.slice(1), value };
    })
    .filter(Boolean);

  // design order: Calories, Protein, Carbohydrates, Fat
  const want = [
    [/cal|energy/i, 'Calories'],
    [/protein/i, 'Protein'],
    [/carb/i, 'Carbohydrates'],
    [/^fat|total fat/i, 'Fat'],
  ];
  const picked = [];
  want.forEach(([rx, name]) => {
    const r = rows.find((x) => rx.test(x.label) && !picked.includes(x));
    if (r) picked.push({ ...r, label: name });
  });
  rows.forEach((r) => {
    if (picked.length < 4 && !picked.some((x) => x.value === r.value && x.label === r.label)
      && !picked.some((x) => x.label.toLowerCase() === r.label.toLowerCase())) picked.push(r);
  });
  return picked.slice(0, 4);
};

// "Get it by Today, 5:09 PM" from the delivery ETA (minutes)
const etaText = (mins) => {
  const d = new Date(Date.now() + (mins || 10) * 60000);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const sameDay = d.toDateString() === new Date().toDateString();
  return `${sameDay ? 'Today' : 'Tomorrow'}, ${h}:${String(m).padStart(2, '0')} ${ap}`;
};

/* ============================================================
 * SCREEN
 * ============================================================ */

export default function ProductDetails({ route, navigation }) {
  const { id } = route.params;
  const { add, cart, updateQuantity, removeFromCart, notify } = useCart();
  const wish = useWishlist();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [p, setP] = useState(null);
  const [err, setErr] = useState(null);
  const [idx, setIdx] = useState(0);
  const [pack, setPack] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(null); // 'cart' | 'buy'
  const [extra, setExtra] = useState([]);

  // Home's AppHeader is rendered inside this screen, so hide the stack header.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      // make the navigator's own background white too (it is greenish by default)
      contentStyle: { backgroundColor: '#FFFFFF' },
      cardStyle: { backgroundColor: '#FFFFFF' },
    });
  }, [navigation]);

  const load = useCallback(async () => {
    setErr(null);
    try { setP((await api.get(`/products/${id}`)).data.data); } catch (e) { setErr(errMsg(e)); }
  }, [id]);
  useEffect(() => { setP(null); setIdx(0); setPack(null); setQty(1); load(); }, [load]);

  // featured products fill the "You May Also Like" grid when p.related has fewer than 4
  useEffect(() => {
    let alive = true;
    api.get('/products/featured', { params: { limit: 12 } })
      .then(({ data }) => { if (alive) setExtra(data.data || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // remember this product for the Home "Recently Viewed" row.
  useEffect(() => { if (p?.id) trackViewed(user.id, p.id); }, [p?.id, user.id]);

  const packs = p?.pack_sizes || [];
  const baseLabel = String(p?.unit || '').trim();
  const active = pack || packs.find((x) => x.label === baseLabel) || packs[0] || null;
  const price = active?.price ?? p?.price ?? 0;
  const mrp = active?.original_price ?? p?.original_price ?? 0;
  const off = active?.discount ?? p?.discount ?? 0;
  const unit = active?.label || p?.unit || '';

  const out = !!p && p.stock <= 0;
  const local = galleryFor(p);
  const images = local || (p?.images?.length ? p.images : [null]);
  const saved = p ? wish.has(p.id) : false;
  const qtyOf = (pid) => cart.items.find((i) => i.product_id === pid)?.quantity || 0;

  const addNow = async () => { setBusy('cart'); await add(p.id, qty, unit); setBusy(null); };
  const buyNow = async () => {
    setBusy('buy');
    try {
      const line = cart.items.find((i) => i.product_id === p.id);
      const ok = !line ? await add(p.id, qty, unit)
        : (line.quantity === qty && line.unit === unit) ? true
          : await updateQuantity(p.id, qty, unit);
      if (ok) navigation.navigate('Checkout');
    } finally { setBusy(null); }
  };

  const shareText = () => [
    `${p.name}${unit ? ` (${unit})` : ''}`,
    `Price: ${rs(price)}${off > 0 ? `  (${off}% off)` : ''}`,
    `Delivery in ${p.delivery?.eta_minutes ?? 10} minutes`,
    '', 'Order fresh on Freshora 🥬',
  ].join('\n');
  const onShare = () => navigation.navigate('ShareProduct', { name: p.name, text: shareText() });
  const onWish = () => notify(wish.toggle(p.id) ? 'Saved to wishlist' : 'Removed from wishlist');

  if (err) return <ErrorState message={err} onRetry={load} />;
  if (!p) return <Loading />;

  /* ---------- derived ---------- */
  const reviews = p.review_count >= 1000 ? `${(p.review_count / 1000).toFixed(1)}K` : p.review_count;
  const nutri = nutriRows(p.nutrition);

  const related = [
    ...(p.related || []),
    ...extra.filter((x) => x.id !== p.id && !(p.related || []).some((r) => r.id === x.id)),
  ].filter((x) => x.id !== p.id).slice(0, 8);

  // gallery
  const inner = width - PAD * 2;
  const thumbW = Math.round(inner * 0.105);
  const mainW = Math.round(inner * 0.438);
  const mainH = Math.round(mainW * 1.19);
  const leftW = thumbW + Math.round(inner * 0.04) + mainW;
  const nThumbs = Math.min(images.length, 5);

  // related grid: 4 compact cards per row (same sizing as the Products screen)
  const cardW = (width - 16 - GAP * 3) / 4;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppHeader scaled />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ paddingBottom: 28, backgroundColor: '#FFFFFF' }}
      >
        {/* ---------------- breadcrumb ---------------- */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, paddingTop: 6, paddingBottom: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 6 }}
          >
            <Ionicons name="chevron-back" size={18} color={C.dark2} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.body, fontSize: 9, color: C.muted }}>
            <Text onPress={() => navigation.navigate('Products', { categoryId: p.category_id, title: p.category_name })}>
              {p.category_name}
            </Text>
            {!!p.subcategory && `  ›  ${p.subcategory}`}
            {'  ›  '}
            <Text style={{ fontFamily: FONT.headingBold, color: C.dark2 }}>{p.name}</Text>
          </Text>
        </View>

        {/* ---------------- gallery | info ---------------- */}
        <View style={{ flexDirection: 'row', paddingHorizontal: PAD }}>
          {/* gallery */}
          <View style={{ width: leftW, flexDirection: 'row' }}>
            {/* thumbnails: 5 slots spread over the height of the main image */}
            <View
              style={{
                width: thumbW,
                // start lower than the main image; keep the bottom edge aligned with it
                marginTop: Math.round(mainH * THUMB_SHIFT),
                // 5 thumbs spread to the bottom edge; fewer thumbs just stack from the top
                height: nThumbs >= 5 ? mainH - Math.round(mainH * THUMB_SHIFT) : undefined,
                justifyContent: nThumbs >= 5 ? 'space-between' : 'flex-start',
              }}
            >
              {images.slice(0, 5).map((u, i) => (
                <TouchableOpacity
                  key={`${u}-${i}`}
                  onPress={() => setIdx(i)}
                  activeOpacity={0.85}
                  style={{
                    width: thumbW,
                    height: thumbW,
                    borderRadius: 8,
                    marginBottom: nThumbs >= 5 ? 0 : 7,
                    backgroundColor: '#FFFFFF',
                    borderWidth: i === idx ? 1.5 : 0,
                    borderColor: C.green,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <Pic src={u} style={{ width: '88%', height: '88%' }} />
                </TouchableOpacity>
              ))}
            </View>

            {/* main image: white background, no border */}
            <View
              style={{
                width: mainW,
                height: mainH,
                marginLeft: Math.round(inner * 0.04),
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Pic
                src={images[idx] || images[0]}
                mode="contain"
                style={{
                  width: '92%',
                  height: '92%',
                  // push the picture DOWN: the photos carry extra empty space at the bottom (shadow),
                  // so they look too high even when mathematically centered. Tune IMG_SHIFT.
                  transform: [{ translateY: Math.round(mainH * IMG_SHIFT) }],
                }}
              />
              {off > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    left: 5,
                    backgroundColor: C.green,
                    borderRadius: 5,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: '#fff', fontFamily: FONT.headingBold, fontSize: 8 }}>{off}% OFF</Text>
                </View>
              )}
              <View
                style={{
                  position: 'absolute',
                  right: 5,
                  bottom: 5,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="expand-outline" size={10} color={C.dark2} />
              </View>
            </View>
          </View>

          {/* info */}
          <View style={{ flex: 1, marginLeft: Math.round(inner * 0.03) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                numberOfLines={2}
                style={{ flex: 1, fontFamily: FONT.headingBold, fontSize: 16, lineHeight: 19, color: C.dark2 }}
              >
                {p.name}
              </Text>
              <TouchableOpacity onPress={onShare} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }} style={{ marginLeft: 6 }}>
                <Ionicons name="share-social-outline" size={16} color={C.dark2} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onWish} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }} style={{ marginLeft: 8 }}>
                <Ionicons name={saved ? 'heart' : 'heart-outline'} size={16} color={saved ? C.red : C.dark2} />
              </TouchableOpacity>
            </View>

            <Text numberOfLines={1} style={{ fontFamily: FONT.script, fontSize: 10, color: C.green, marginTop: 1 }}>
              {p.tagline || unit}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="star" size={10} color={C.amber} />
              <Text style={{ marginLeft: 3, fontFamily: FONT.heading, fontSize: 9, color: C.text }}>{p.rating}</Text>
              <Text style={{ marginLeft: 3, fontFamily: FONT.body, fontSize: 8, color: C.muted }}>({reviews} reviews)</Text>
            </View>
            {out && (
              <Text style={{ fontFamily: FONT.heading, fontSize: 9, color: C.red, marginTop: 2 }}>Out of stock</Text>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
              <Text style={{ fontFamily: FONT.headingBold, fontSize: 21, color: C.dark2 }}>{rs(price)}</Text>
              {mrp > price && (
                <Text style={{ color: C.muted, textDecorationLine: 'line-through', fontSize: 9, marginLeft: 5 }}>{rs(mrp)}</Text>
              )}
              {off > 0 && (
                <View style={{ backgroundColor: C.tint, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 5 }}>
                  <Text style={{ color: C.green, fontFamily: FONT.headingBold, fontSize: 8 }}>{off}% OFF</Text>
                </View>
              )}
            </View>
            <Text style={{ fontFamily: FONT.body, fontSize: 7.5, color: C.muted, marginTop: 1 }}>
              Inclusive of all taxes
            </Text>

            <Text
              numberOfLines={4}
              style={{ fontFamily: FONT.body, fontSize: 8.5, lineHeight: 12, color: C.muted, marginTop: 6 }}
            >
              {p.description || 'No description available.'}
            </Text>

            <Benefit icon="leaf-outline" title="Freshly Sourced" />
            <Benefit icon="shield-checkmark-outline" title="No Harmful Chemicals" />
            <Benefit icon="ribbon-outline" title="Quality Checked" />
          </View>
        </View>

        {/* ---------------- select quantity ---------------- */}
        <View style={{ paddingHorizontal: PAD, marginTop: 14 }}>
          <Title right={packs.length > 1 ? `${packs.length} options` : undefined}>Select Quantity</Title>

          <View style={{ flexDirection: 'row' }}>
            {(packs.length ? packs : [{ label: unit, price }]).slice(0, 4).map((pk, i, a) => {
              const sel = (active?.label || unit) === pk.label;
              return (
                <TouchableOpacity
                  key={pk.label}
                  activeOpacity={0.85}
                  onPress={() => { setPack(pk); setQty(1); }}
                  style={{
                    flex: 1,
                    marginRight: i === a.length - 1 ? 0 : 6,
                    paddingVertical: 6,
                    alignItems: 'center',
                    borderRadius: 8,
                    borderWidth: sel ? 1.5 : 1,
                    borderColor: sel ? C.green : '#E3EBDD',
                    backgroundColor: sel ? C.tint : '#fff',
                  }}
                >
                  <Text style={{ fontFamily: FONT.headingBold, fontSize: 10, color: C.dark2 }}>{pk.label}</Text>
                  <Text style={{ fontFamily: FONT.heading, fontSize: 9, color: sel ? C.green : C.muted, marginTop: 1 }}>
                    {rs(pk.price)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* buttons */}
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              disabled={out || !!busy}
              onPress={addNow}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 8,
                marginRight: 8,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                backgroundColor: out ? C.border : C.tint,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy === 'cart' ? (
                <ActivityIndicator size="small" color={C.green} />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={14} color={out ? C.muted : C.green} />
                  <Text style={{ color: out ? C.muted : C.green, fontFamily: FONT.headingBold, fontSize: 11, marginLeft: 5 }}>
                    {out ? 'Out of Stock' : 'Add to Cart'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              disabled={out || !!busy}
              onPress={buyNow}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                backgroundColor: out ? C.border : C.green,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy === 'buy' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: out ? C.muted : '#fff', fontFamily: FONT.headingBold, fontSize: 11 }}>Buy Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------- delivery strip ---------------- */}
        <View style={{ paddingHorizontal: PAD, marginTop: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 9,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E6ECE1',
            }}
          >
            {/* icon */}
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: '#DDEFD3',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="moped" size={18} color={C.green} />
            </View>

            {/* text */}
            <View style={{ flex: 1, marginLeft: 9 }}>
              <Text style={{ fontFamily: FONT.headingBold, fontSize: 10.5, color: C.dark2 }}>
                <Text style={{ color: C.green }}>Get it by </Text>
                {etaText(p.delivery?.eta_minutes)}
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 8.5, color: C.muted, marginTop: 2 }}>
                Free delivery on orders above {rs(p.delivery?.free_delivery_above ?? p.delivery?.free_above ?? 499)}
              </Text>
            </View>

            {/* button */}
            <TouchableOpacity
              onPress={() => notify('Pincode check coming soon')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 28,
                paddingHorizontal: 11,
                borderRadius: 9,
                backgroundColor: '#DDEFD3',
              }}
            >
              <Text style={{ fontFamily: FONT.headingBold, fontSize: 9.5, color: C.green }}>Check Pincode</Text>
              <Ionicons name="arrow-forward" size={11} color={C.green} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------- product details + farm fresh ---------------- */}
        <View style={{ paddingHorizontal: PAD, marginTop: 16 }}>
          <Text style={{ fontFamily: FONT.headingBold, fontSize: 13, color: C.dark2, marginBottom: 5 }}>
            Product Details
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                flex: 1,
                fontFamily: FONT.body,
                fontSize: 9.5,
                lineHeight: 14,
                color: C.muted,
              }}
            >
              {p.description || 'No description available.'}
            </Text>

            {/* 100% Farm Fresh card */}
            <View
              style={{
                width: Math.round(inner * 0.3),
                marginLeft: 14,
                paddingVertical: 11,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: '#E5F2DD',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* two leaves */}
              <View style={{ width: 28, height: 34, marginRight: 5 }}>
                <Ionicons
                  name="leaf"
                  size={26}
                  color={C.green}
                  style={{ position: 'absolute', left: 0, top: 6, transform: [{ rotate: '-30deg' }] }}
                />
                <Ionicons
                  name="leaf"
                  size={20}
                  color="#2E7D32"
                  style={{ position: 'absolute', left: 8, top: 0, transform: [{ rotate: '15deg' }] }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.headingBold, fontSize: 10.5, lineHeight: 12.5, color: C.dark2 }}>
                  100%{'\n'}Farm Fresh
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 7.5, lineHeight: 10, color: C.dark2, marginTop: 4 }}>
                  Good Food{'\n'}Happier You{' '}
                  <Text style={{ color: C.dark2 }}>♥</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ---------------- nutrition ---------------- */}
        {!!p.nutrition && (
          <View style={{ paddingHorizontal: PAD, marginTop: 12 }}>
            {nutri.length > 0 ? (
              <>
                <Title right="(per 100 g)">Nutritional Information</Title>
                <View style={{ flexDirection: 'row' }}>
                  {nutri.map((n, i) => (
                    <View
                      key={n.label}
                      style={{
                        flex: 1,
                        marginRight: i === nutri.length - 1 ? 0 : 6,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: 8,
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#E3EBDD',
                      }}
                    >
                      <Text numberOfLines={1} style={{ fontFamily: FONT.headingBold, fontSize: 11, color: C.dark2 }}>
                        {n.value}
                      </Text>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.body, fontSize: 8, color: C.muted, marginTop: 1 }}>
                        {n.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <NutritionCards rows={p.nutrition} />
            )}
          </View>
        )}

        {/* ---------------- you may also like (4 per row) ---------------- */}
        {related.length > 0 && (
          <View style={{ marginTop: 14 }}>
            <View style={{ paddingHorizontal: PAD }}>
              <Title right="See All" onRight={() => navigation.push('Products', { title: 'All Products' })}>
                You May Also Like
              </Title>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 8,
                columnGap: GAP,
              }}
            >
              {related.map((x) => (
                <ProductCard
                  key={String(x.id)}
                  product={x}
                  compact
                  style={{ width: cardW, marginBottom: 8, borderWidth: 1, borderColor: '#E8EFE1' }}
                  qty={qtyOf(x.id)}
                  onPress={() => navigation.push('ProductDetails', { id: x.id })}
                  onAdd={() => add(x.id, 1)}
                  onInc={() => updateQuantity(x.id, qtyOf(x.id) + 1)}
                  onDec={() => (qtyOf(x.id) <= 1 ? removeFromCart(x.id) : updateQuantity(x.id, qtyOf(x.id) - 1))}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
