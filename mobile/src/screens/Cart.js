import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import AppHeader from '../components/AppHeader'; // same header as Home (location + search bar)
import Img from '../components/Img';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import { C, FONT, rs } from '../theme';

/*
 * ============================================================
 * CART  (matches the target design)
 *
 *  Home header (delivering-to + search bar)
 *  My Cart  .......................  [Clear Cart]
 *  Free delivery progress card
 *  Items card (compact rows)
 *  "You might also need" strip + 4 mini cards
 *  Bill Details + savings pill
 *  sticky: Continue Shopping | Proceed to Checkout
 * ============================================================
 */

const PAD = 12;
const BORDER = '#E6ECE1';
const SOFT = '#E5F2DD';

/* ---------- field helpers (cart items may be flat or nested under .product) ---------- */

const pick = (i, key, alt) => i?.[key] ?? i?.product?.[key] ?? (alt ? i?.[alt] : undefined);
const nameOf = (i) => pick(i, 'name', 'title') || 'Product';
const unitOf = (i) => pick(i, 'unit') || '';
const imageOf = (i) => {
  const imgs = pick(i, 'images');
  return pick(i, 'image', 'image_url') || (Array.isArray(imgs) ? imgs[0] : undefined) || pick(i, 'thumbnail');
};
const priceOf = (i) => Number(pick(i, 'price') ?? 0);
const mrpOf = (i) => Number(pick(i, 'original_price', 'mrp') ?? 0);
const offOf = (i) => {
  const d = pick(i, 'discount');
  if (d != null && Number(d) > 0) return Math.round(Number(d));
  const m = mrpOf(i);
  const p = priceOf(i);
  return m > p ? Math.round(((m - p) / m) * 100) : 0;
};

/* ---------- small pieces ---------- */

const Stepper = ({ qty, busy, onMinus, onPlus }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <TouchableOpacity
      onPress={onMinus}
      disabled={busy}
      activeOpacity={0.8}
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="remove" size={13} color={C.dark2} />
    </TouchableOpacity>

    <Text style={{ minWidth: 24, textAlign: 'center', fontFamily: FONT.headingBold, fontSize: 11, color: C.dark2 }}>
      {busy ? '·' : qty}
    </Text>

    <TouchableOpacity
      onPress={onPlus}
      disabled={busy}
      activeOpacity={0.8}
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: C.green,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="add" size={13} color="#fff" />
    </TouchableOpacity>
  </View>
);

const CartRow = ({ item, last, busy, onChange, onRemove }) => {
  const price = priceOf(item);
  const mrp = mrpOf(item);
  const off = offOf(item);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img fit="contain" uri={imageOf(item)} style={{ width: 48, height: 48 }} />
      </View>

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.headingBold, fontSize: 11, color: C.dark2 }}>
          {nameOf(item)}
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 8.5, color: C.muted, marginTop: 1 }}>{unitOf(item)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
          <Text style={{ fontFamily: FONT.headingBold, fontSize: 12, color: C.dark2 }}>{rs(price)}</Text>
          {mrp > price && (
            <Text style={{ fontSize: 8.5, color: C.muted, textDecorationLine: 'line-through', marginLeft: 5 }}>
              {rs(mrp)}
            </Text>
          )}
          {off > 0 && (
            <View style={{ backgroundColor: SOFT, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 5 }}>
              <Text style={{ fontFamily: FONT.headingBold, fontSize: 8, color: C.green }}>{off}% OFF</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' }}>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={15} color={C.muted} />
        </TouchableOpacity>
        <Stepper
          qty={item.quantity}
          busy={busy}
          onMinus={() => (item.quantity <= 1 ? onRemove() : onChange(item.quantity - 1))}
          onPlus={() => onChange(item.quantity + 1)}
        />
      </View>
    </View>
  );
};

const BillRow = ({ label, children, bold }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }}>
    <Text style={{ fontFamily: bold ? FONT.headingBold : FONT.body, fontSize: bold ? 12 : 9.5, color: bold ? C.dark2 : C.muted }}>
      {label}
    </Text>
    {children}
  </View>
);

/* ============================================================
 * SCREEN
 * ============================================================ */

export default function Cart({ navigation }) {
  const { cart, ready, error, loadCart, updateQuantity, removeFromCart, clearCart, add } = useCart();
  const { items, summary } = cart;
  const [upsell, setUpsell] = useState([]);
  const [adding, setAdding] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Home's AppHeader is rendered inside this screen, so hide the stack header.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      contentStyle: { backgroundColor: '#FFFFFF' },
      cardStyle: { backgroundColor: '#FFFFFF' },
    });
  }, [navigation]);

  const loadUpsell = useCallback(async () => {
    try { setUpsell((await api.get('/cart/upsell')).data.data || []); } catch { setUpsell([]); }
  }, []);
  useEffect(() => { if (items.length) loadUpsell(); else setUpsell([]); }, [items.length, loadUpsell]);

  if (!ready) return <Loading />;
  if (error && !items.length) return <ErrorState message={error} onRetry={loadCart} />;

  const confirmClear = () =>
    Alert.alert('Clear cart?', 'All items will be removed.', [
      { text: 'Cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);

  const change = async (id, qty) => { setBusyId(id); await updateQuantity(id, qty); setBusyId(null); };
  const addUpsell = async (p) => {
    setAdding(p.id);
    await add(p.id, 1);
    setAdding(null);
    loadUpsell();
  };
  const onRefresh = async () => { setRefreshing(true); await loadCart(); setRefreshing(false); };

  /* ---------- numbers (server summary first, computed values as fallback) ---------- */
  const s = summary || {};
  const subtotal = items.reduce((t, i) => t + priceOf(i) * i.quantity, 0);
  const mrpTotal = s.total_mrp ?? s.mrp_total ?? items.reduce((t, i) => t + (mrpOf(i) > priceOf(i) ? mrpOf(i) : priceOf(i)) * i.quantity, 0);
  const discount = s.discount ?? s.total_discount ?? Math.max(0, mrpTotal - subtotal);
  const threshold = s.free_delivery_threshold ?? s.free_delivery_above ?? s.free_above ?? s.free_delivery_min ?? 499;
  const fee = s.delivery_fee ?? s.delivery_charge ?? s.delivery ?? (subtotal >= threshold ? 0 : 40);
  const total = s.total ?? s.grand_total ?? s.total_amount ?? subtotal + fee;
  const baseFee = fee > 0 ? fee : (s.delivery_fee_original ?? 40);
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(1, threshold > 0 ? subtotal / threshold : 1);
  const freeUnlocked = remaining <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppHeader scaled />

      {/* ---------------- title row ---------------- */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, paddingTop: 8, paddingBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.headingBold, fontSize: 20, color: C.dark2 }}>My Cart</Text>
          {items.length > 0 && (
            <Text style={{ fontFamily: FONT.body, fontSize: 9.5, color: C.muted, marginTop: 1 }}>
              {`${items.length} item${items.length > 1 ? 's' : ''} in your cart`}
            </Text>
          )}
        </View>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={confirmClear}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 28,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: BORDER,
              backgroundColor: '#fff',
            }}
          >
            <Ionicons name="trash-outline" size={13} color={C.dark2} />
            <Text style={{ fontFamily: FONT.heading, fontSize: 9.5, color: C.dark2, marginLeft: 4 }}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>

      {!items.length ? (
        <Empty icon="🛒" title="Your cart is empty" sub="Add fresh groceries to get started." action="Start Shopping" onAction={() => navigation.navigate('HomeTab')} />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ backgroundColor: '#FFFFFF' }}
            contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: 20, backgroundColor: '#FFFFFF' }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green} />}
          >
            {/* ---------------- free delivery card ---------------- */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                borderRadius: 12,
                backgroundColor: '#EAF4E3',
                borderWidth: 1,
                borderColor: '#D5E7CA',
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="moped" size={14} color={C.green} />
                  <Text style={{ flex: 1, marginLeft: 5, fontFamily: FONT.headingBold, fontSize: 10, color: C.green }}>
                    {freeUnlocked ? 'You have unlocked FREE delivery!' : `Add ${rs(remaining)} more for FREE delivery!`}
                  </Text>
                </View>

                <View style={{ height: 6, borderRadius: 3, backgroundColor: '#fff', marginTop: 7, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: C.green, borderRadius: 3 }} />
                </View>

                <Text style={{ fontFamily: FONT.body, fontSize: 8, color: C.muted, marginTop: 4 }}>
                  {rs(subtotal)} / {rs(threshold)}
                </Text>
              </View>

              <View style={{ alignItems: 'center', marginLeft: 12, minWidth: 62 }}>
                <MaterialCommunityIcons name="truck-delivery" size={30} color={C.green} />
                <Text style={{ fontFamily: FONT.headingBold, fontSize: 8.5, lineHeight: 10, color: C.dark2, textAlign: 'center' }}>
                  Free{'\n'}Delivery
                </Text>
              </View>
            </View>

            {/* ---------------- items ---------------- */}
            <View
              style={{
                marginTop: 12,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              {items.map((i, idx) => (
                <CartRow
                  key={String(i.product_id)}
                  item={i}
                  last={idx === items.length - 1}
                  busy={busyId === i.product_id}
                  onChange={(q) => change(i.product_id, q)}
                  onRemove={() => removeFromCart(i.product_id)}
                />
              ))}
            </View>

            {/* ---------------- you might also need ---------------- */}
            {upsell.length > 0 && (
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Products', { title: 'All Products' })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    backgroundColor: '#EAF4E3',
                    borderWidth: 1,
                    borderColor: '#D5E7CA',
                  }}
                >
                  <Ionicons name="gift-outline" size={17} color={C.green} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ fontFamily: FONT.headingBold, fontSize: 10, color: C.green }}>You might also need</Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 8, color: C.muted, marginTop: 1 }}>
                      Add everyday essentials to your cart
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={C.dark2} />
                </TouchableOpacity>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                  contentContainerStyle={{ paddingRight: 4 }}
                >
                  {upsell.map((p, idx) => (
                    <TouchableOpacity
                      key={String(p.id)}
                      activeOpacity={0.9}
                      onPress={() => navigation.navigate('ProductDetails', { id: p.id })}
                      style={{
                        width: 78,
                        marginRight: idx === upsell.length - 1 ? 0 : 6,
                        padding: 5,
                        borderRadius: 9,
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: BORDER,
                      }}
                    >
                      <View style={{ height: 46, alignItems: 'center', justifyContent: 'center' }}>
                        <Img fit="contain" uri={imageOf(p)} style={{ width: 44, height: 44 }} />
                      </View>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.headingBold, fontSize: 8.5, color: C.dark2, marginTop: 3 }}>
                        {nameOf(p)}
                      </Text>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.body, fontSize: 7, color: C.muted, marginTop: 1 }}>
                        {unitOf(p)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }}>
                        <Text style={{ fontFamily: FONT.headingBold, fontSize: 9.5, color: C.dark2 }}>{rs(priceOf(p))}</Text>
                        <TouchableOpacity
                          onPress={() => addUpsell(p)}
                          disabled={adding === p.id}
                          activeOpacity={0.8}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            backgroundColor: C.green,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: adding === p.id ? 0.6 : 1,
                          }}
                        >
                          <Ionicons name="add" size={13} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* ---------------- bill details ---------------- */}
            <View
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <Text style={{ fontFamily: FONT.headingBold, fontSize: 12, color: C.dark2 }}>Bill Details</Text>

              <BillRow label="Total MRP">
                <Text style={{ fontFamily: FONT.heading, fontSize: 9.5, color: C.dark2 }}>{rs(mrpTotal)}</Text>
              </BillRow>

              <BillRow label="Discount">
                <Text style={{ fontFamily: FONT.heading, fontSize: 9.5, color: C.green }}>- {rs(discount)}</Text>
              </BillRow>

              <BillRow label="Delivery Charge">
                {fee > 0 ? (
                  <Text style={{ fontFamily: FONT.heading, fontSize: 9.5, color: C.dark2 }}>{rs(fee)}</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 8.5, color: C.muted, textDecorationLine: 'line-through', marginRight: 5 }}>
                      {rs(baseFee)}
                    </Text>
                    <Text style={{ fontFamily: FONT.headingBold, fontSize: 9.5, color: C.green }}>FREE</Text>
                  </View>
                )}
              </BillRow>

              <View style={{ height: 1, backgroundColor: '#EEF2EA', marginTop: 9 }} />

              <BillRow label="Total Amount" bold>
                <Text style={{ fontFamily: FONT.headingBold, fontSize: 14, color: C.dark2 }}>{rs(total)}</Text>
              </BillRow>
            </View>

            {discount > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: '#EAF4E3',
                }}
              >
                <Ionicons name="pricetag" size={12} color={C.green} />
                <Text style={{ marginLeft: 6, fontFamily: FONT.heading, fontSize: 9.5, color: C.green }}>
                  You are saving {rs(discount)} on this order!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* ---------------- sticky buttons ---------------- */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: PAD,
              paddingVertical: 10,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderColor: BORDER,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: BORDER,
                backgroundColor: '#fff',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Ionicons name="arrow-back" size={13} color={C.dark2} />
              <Text style={{ fontFamily: FONT.headingBold, fontSize: 10, color: C.dark2, marginLeft: 5 }}>
                Continue Shopping
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}
              style={{
                flex: 1.25,
                height: 38,
                borderRadius: 9,
                backgroundColor: C.green,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: FONT.headingBold, fontSize: 10, color: '#fff' }}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
