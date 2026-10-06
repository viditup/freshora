import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import Img from '../components/Img';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import { rs, FONT } from '../theme';

// CHECKOUT - exact copy of the PDF screen "Checkout" (row 4, 2nd screen): ONE scrolling page
// (Delivery Address, Order Items, Delivery Options, Payment Method, Order Summary) + Place Order.
// Every size is written in DESIGN UNITS (the PDF screen is 850 units wide): u(n) turns n units into dp for the
// current phone, so the page keeps the same proportions on every phone. T(n) = text style for an n-unit font (lineHeight follows the font).
// Logic is unchanged: same APIs (/addresses, /orders), server-computed totals, demo-only payments, same navigation.
const REF_W = 850;
const GREEN = '#0B7A3E';
const STEPS = ['Cart', 'Checkout', 'Payment', 'Order Placed'];
const STEP_X = [88, 305, 540, 759]; // circle centres measured in the design
const ACTIVE = 1;                    // Cart is done, Checkout is the current step

// design copy for the 4 demo payment methods (keys must stay the same as the backend expects)
const PAY_UI = {
  upi: { title: 'UPI', sub: 'Pay with any UPI app (GPay, PhonePe, Paytm etc.)' },
  card: { title: 'Credit / Debit Card', sub: 'Visa, Mastercard, Rupay and more' },
  wallet: { title: 'Wallet', sub: 'Paytm, Amazon Pay and more' },
  COD: { title: 'Cash on Delivery', sub: 'Pay when you receive your order' },
};
const PAY_ORDER = ['upi', 'card', 'wallet', 'COD'];

const hourLabel = (d) => `${d.getHours() % 12 || 12} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
// "Today, 5 PM - 8 PM": window starts at the next full hour after now + the backend ETA and lasts 3 hours.
const slotLabel = (etaMin) => {
  const start = new Date(Date.now() + (etaMin || 10) * 60000);
  start.setMinutes(0, 0, 0); start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 3 * 3600000);
  return `${start.getDate() === new Date().getDate() ? 'Today' : 'Tomorrow'}, ${hourLabel(start)} - ${hourLabel(end)}`;
};
const phoneLabel = (p) => { const d = String(p || '').replace(/\D/g, '').slice(-10); return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : (p || ''); };

export default function Checkout({ navigation, route }) {
  const { cart, ready, refreshCart, delivery, changeDelivery } = useCart();
  const [addrs, setAddrs] = useState(null);
  const [err, setErr] = useState(null);
  const [selId, setSelId] = useState(null);
  const [pay, setPay] = useState('upi'); // design shows UPI selected first
  const [placing, setPlacing] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const k = width / REF_W;
  const u = (n) => Math.round(n * k * 10) / 10;
  // text style in design units: font follows the design proportion (floor 8 dp only), lineHeight always follows the font so lines never overlap or clip
  const T = (n, lh = 1.3) => { const fs = Math.max(8, Math.round(n * k * 10) / 10); return { fontSize: fs, lineHeight: Math.round(fs * lh * 10) / 10, includeFontPadding: false }; };

  // the page draws its own header (back arrow, title, secure badge) - hide the native one without touching the navigator file
  useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

  const load = useCallback(async () => {
    try { setAddrs((await api.get('/addresses')).data.data); setErr(null); } catch (e) { setErr(errMsg(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { if (route.params?.addressId) setSelId(route.params.addressId); }, [route.params?.addressId]);

  if (!ready || (addrs === null && !err)) return <Loading />;
  if (err && !addrs) return <ErrorState message={err} onRetry={load} />;
  if (!cart.items.length && !placing) return <Empty icon="🛒" title="Your cart is empty" action="Start Shopping" onAction={() => navigation.getParent()?.navigate('HomeTab')} />;

  const address = addrs.find((a) => a.id === selId) || addrs.find((a) => a.is_default) || addrs[0];
  const openAddresses = () => navigation.navigate('Addresses', { select: true });
  const summary = cart.summary;
  const payable = Math.round((summary.subtotal - summary.discount) * 100) / 100;
  const deliveryOption = delivery;
  const options = cart.delivery?.options || [];
  const chosen = options.find((o) => o.key === deliveryOption);

  const place = async () => {
    if (placing) return;
    if (!address) return Alert.alert('Delivery address needed', 'Please add a delivery address first.');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { address_id: address.id, payment_method: pay, delivery_option: deliveryOption }); // backend computes all totals
      navigation.replace('OrderSuccess', { order: data.order });
      refreshCart(); // backend cleared the cart
    } catch (e) {
      Alert.alert("Couldn't place order", errMsg(e));
      refreshCart();
      setPlacing(false);
    }
  };

  // ---- small building blocks (design units) ----
  const PAD = u(40);
  const BORDER = '#EBEDF1';
  const Heading = ({ title, action, onAction, top }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: u(top), paddingHorizontal: PAD }}>
      <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(23), color: '#05090B' }}>{title}</Text>
      {!!action && (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, ...T(21), color: GREEN }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  const Check = ({ on }) => (on
    ? <View style={{ width: u(26), height: u(26), borderRadius: u(13), backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark" size={Math.max(12, u(18))} color="#fff" /></View>
    : <View style={{ width: u(26), height: u(26), borderRadius: u(13), borderWidth: 1.5, borderColor: '#C9CCD3', backgroundColor: '#fff' }} />);

  // stepper: circles centred at the design's x positions, lines between them
  const Stepper = () => (
    <View style={{ height: u(40) + u(9) + u(26), marginTop: u(23) }}>
      {[[108, 285, 0], [325, 520, 31], [560, 739, 0]].map(([a, b, g], i) => (
        <View key={i} style={{ position: 'absolute', left: u(a), width: u(b - a), top: u(19), height: u(2.4), backgroundColor: '#D3D5DA' }}>
          {(i === 0 || g > 0) && <View style={{ width: i === 0 ? '100%' : u(g), height: '100%', backgroundColor: GREEN }} />}
        </View>
      ))}
      {STEPS.map((label, i) => {
        const done = i < ACTIVE; const on = i === ACTIVE;
        return (
          <View key={label} style={{ position: 'absolute', left: u(STEP_X[i] - 90), width: u(180), alignItems: 'center' }}>
            <View style={{ width: u(40), height: u(40), borderRadius: u(20), alignItems: 'center', justifyContent: 'center', backgroundColor: done || on ? GREEN : '#fff', borderWidth: done || on ? 0 : 1.5, borderColor: '#C9CCD3' }}>
              {done ? <Ionicons name="checkmark" size={Math.max(14, u(24))} color="#fff" /> : <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, ...T(21, 1.2), color: on ? '#fff' : '#33363D', textAlign: 'center', textAlignVertical: 'center' }}>{i + 1}</Text>}
            </View>
            <Text maxFontSizeMultiplier={1} style={{ marginTop: u(9), fontFamily: FONT.bodySemi, ...T(18), color: done || on ? '#0C3F27' : '#3C3E45', textAlign: 'center' }}>{label}</Text>
          </View>
        );
      })}
    </View>
  );

  const PayIcon = ({ m }) => {
    if (m === 'upi') return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, fontStyle: 'italic', ...T(23), color: '#2E3036' }}>UPI</Text>
        <View style={{ marginLeft: 2 }}><Ionicons name="caret-forward" size={u(13)} color="#F26B21" style={{ marginBottom: -u(5) }} /><Ionicons name="caret-forward" size={u(13)} color="#0B8A3E" /></View>
      </View>
    );
    if (m === 'card') return <Ionicons name="card" size={Math.max(24, u(40))} color="#2F6DB8" />;
    if (m === 'wallet') return <Ionicons name="wallet-outline" size={Math.max(24, u(38))} color="#1F2A44" />;
    return <View style={{ width: u(46), height: u(32), borderRadius: u(6), borderWidth: 2, borderColor: GREEN, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: u(14), height: u(14), borderRadius: u(7), borderWidth: 2, borderColor: GREEN }} /></View>;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* header + stepper */}
      <LinearGradient colors={['#DDEFD3', '#F3F9EF', '#FFFFFF']} locations={[0, 0.55, 1]} style={{ paddingTop: insets.top + u(6) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: u(34), paddingRight: u(42) }}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Back" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ width: u(52) }}>
            <Ionicons name="chevron-back" size={Math.max(22, u(34))} color="#0A0F0C" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.headingBold, ...T(36, 1.25), color: '#002212', letterSpacing: -0.3 }}>Checkout</Text>
            <Text maxFontSizeMultiplier={1} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: FONT.body, ...T(18), color: '#555A65' }}>Review your order and complete the payment</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: u(8) }}>
            <Ionicons name="shield-checkmark" size={Math.max(20, u(34))} color="#09723A" />
            <View style={{ marginLeft: u(14) }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, ...T(17), color: '#04120A' }}>Secure Checkout</Text>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, ...T(15), color: '#4B5258' }}>100% Safe & Secure</Text>
            </View>
          </View>
        </View>
        <Stepper />
        <View style={{ height: u(19) }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: u(20) }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <Heading title="Delivery Address" action="Change" onAction={openAddresses} top={6} />
        <View style={{ marginHorizontal: PAD, marginTop: u(10), backgroundColor: '#EDF7EE', borderRadius: u(20), paddingVertical: u(13.5), paddingLeft: u(21), paddingRight: u(19), flexDirection: 'row', alignItems: 'center', minHeight: u(127) }}>
          {address ? (
            <>
              <View style={{ width: u(55), height: u(55), borderRadius: u(14), backgroundColor: '#DDF0DD', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="location" size={Math.max(20, u(32))} color={GREEN} />
              </View>
              <View style={{ flex: 1, marginLeft: u(18) }}>
                <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.headingBold, ...T(21), color: '#02060A' }}>{address.type}</Text>
                <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, ...T(19), color: '#4F5462' }}>{address.name}</Text>
                <Text maxFontSizeMultiplier={1} numberOfLines={3} style={{ fontFamily: FONT.body, ...T(19, 1.25), color: '#505560' }}>{address.address_line}{address.landmark ? `, ${address.landmark}` : ''}, {address.city}, {address.state} {address.pincode}</Text>
                <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, ...T(19), color: '#444958' }}>{phoneLabel(address.phone)}</Text>
              </View>
              <TouchableOpacity onPress={openAddresses} activeOpacity={0.85} style={{ marginLeft: u(10), minWidth: u(113), height: u(45), borderRadius: u(15), borderWidth: 1.3, borderColor: GREEN, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, ...T(20), color: '#0A5A2C' }}>Change</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: FONT.body, ...T(19), color: '#4F5462', marginBottom: u(10) }}>No delivery address saved</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddressForm', { returnTo: 'Checkout' })} style={{ backgroundColor: GREEN, borderRadius: u(15), paddingHorizontal: u(30), height: u(45), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontFamily: FONT.headingBold, ...T(20) }}>Add Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order Items */}
        <Heading title={`Order Items (${cart.items.length})`} action="Edit Cart" onAction={() => navigation.navigate('Cart')} top={21} />
        <View style={{ marginHorizontal: PAD, marginTop: u(12), borderRadius: u(20), borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff', overflow: 'hidden' }}>
          {cart.items.map((i, idx) => {
            const orig = Number(i.original_price) || i.price;
            const strike = orig > i.price ? orig * i.quantity : 0;
            return (
              <View key={i.product_id} style={{ flexDirection: 'row', alignItems: 'center', minHeight: u(79), paddingVertical: u(7), paddingRight: u(21) }}>
                <Img fit="contain" uri={i.image} style={{ width: u(100), height: u(66), marginLeft: u(20) }} />
                <View style={{ flex: 1, marginLeft: u(43) }}>
                  <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.heading, ...T(19), color: '#02050A' }}>{i.name}</Text>
                  <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, ...T(18), color: '#767A87' }}>{i.unit}</Text>
                </View>
                <View style={{ width: u(41), height: u(39), borderRadius: u(10), backgroundColor: '#F4F5F8', alignItems: 'center', justifyContent: 'center' }}>
                  <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bodyMedium, ...T(19), color: '#3B3E48' }}>{i.quantity}</Text>
                </View>
                <View style={{ width: u(178), alignItems: 'flex-end' }}>
                  <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(22), color: '#02050A' }}>{rs(i.subtotal)}</Text>
                  {strike > 0 && <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, ...T(18), color: '#7A7D8C', textDecorationLine: 'line-through' }}>{rs(strike)}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Options */}
        <Heading title="Delivery Options" top={17} />
        <View style={{ flexDirection: 'row', marginHorizontal: PAD, marginTop: u(10) }}>
          {options.map((o, idx) => {
            const on = deliveryOption === o.key;
            const free = o.key === 'standard' && o.free_above != null && payable >= o.free_above;
            const isExp = o.key === 'express';
            const sub = isExp ? (o.eta_minutes >= 60 ? `Within ${Math.round(o.eta_minutes / 60)} hours` : `Within ${o.eta_minutes} min`) : slotLabel(o.eta_minutes);
            return (
              <TouchableOpacity key={o.key} onPress={() => changeDelivery(o.key)} activeOpacity={0.9} accessibilityLabel={o.label}
                style={{ flex: 1, minHeight: u(106), marginLeft: idx ? u(13) : 0, borderRadius: u(19), borderWidth: on ? 1.5 : 1, borderColor: on ? GREEN : BORDER, backgroundColor: on ? '#EAF7EC' : '#fff', paddingTop: u(16), paddingLeft: u(21), paddingRight: u(19), paddingBottom: u(12), flexDirection: 'row' }}>
                <View style={{ width: u(48), height: u(48), borderRadius: u(12), backgroundColor: isExp ? '#F3F4F6' : '#DDF0DD', alignItems: 'center', justifyContent: 'center' }}>
                  {isExp ? <Ionicons name="flash" size={Math.max(18, u(28))} color="#32344A" /> : <MaterialCommunityIcons name="moped" size={Math.max(20, u(30))} color={GREEN} />}
                </View>
                <View style={{ flex: 1, marginLeft: u(14) }}>
                  <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.heading, ...T(19), color: '#02050A' }}>{o.label || (isExp ? 'Express Delivery' : 'Standard Delivery')}</Text>
                  <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, ...T(17), color: '#4E565E' }}>{sub}</Text>
                  <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(19), color: free ? '#055721' : '#02050A' }}>{free ? 'FREE' : rs(o.fee)}</Text>
                </View>
                <View style={{ position: 'absolute', top: u(14), right: u(16) }}><Check on={on} /></View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Method */}
        <Heading title="Payment Method" top={15} />
        <View style={{ marginHorizontal: PAD, marginTop: u(10), borderRadius: u(20), borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff', overflow: 'hidden' }}>
          {PAY_ORDER.map((m, idx) => {
            const on = pay === m;
            return (
              <TouchableOpacity key={m} onPress={() => setPay(m)} activeOpacity={0.9} accessibilityLabel={PAY_UI[m].title}
                style={{ height: u(72), flexDirection: 'row', alignItems: 'center', paddingLeft: u(20), paddingRight: u(21), backgroundColor: on ? '#EDF8EE' : '#fff', borderTopWidth: idx ? 1 : 0, borderTopColor: '#F0F1F4' }}>
                <View style={{ width: u(78), alignItems: 'flex-start', justifyContent: 'center' }}><PayIcon m={m} /></View>
                <View style={{ flex: 1, marginLeft: u(0) }}>
                  <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.heading, ...T(19), color: '#02050A' }}>{PAY_UI[m].title}</Text>
                  <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, ...T(17), color: '#565B66' }}>{PAY_UI[m].sub}</Text>
                </View>
                <Check on={on} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Summary */}
        <Heading title="Order Summary" top={18} />
        <View style={{ marginHorizontal: PAD, marginTop: u(10), borderRadius: u(20), borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff', paddingTop: u(7.5), paddingBottom: u(6), paddingHorizontal: u(22) }}>
          {[['Total MRP', rs(summary.subtotal), '#3F4150'], ['Discount', `- ${rs(summary.discount)}`, '#0A602B']].map(([a, b, c]) => (
            <View key={a} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: u(31) }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, ...T(19), color: '#585B69' }}>{a}</Text>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bodySemi, ...T(19), color: c }}>{b}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: u(31) }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, ...T(19), color: '#585B69' }}>Delivery Charge</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {!summary.delivery_fee && Number(chosen?.fee) > 0 && <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bodySemi, ...T(19), color: '#6D717F', textDecorationLine: 'line-through', marginRight: u(14) }}>{rs(chosen.fee)}</Text>}
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bodySemi, ...T(19), color: summary.delivery_fee ? '#3F4150' : '#0C632E' }}>{summary.delivery_fee ? rs(summary.delivery_fee) : 'FREE'}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#E4E6EB', marginTop: u(6) }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: u(44), paddingVertical: u(4) }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(21), color: '#02050A' }}>Total Amount</Text>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(30), color: '#02050A' }}>{rs(summary.total)}</Text>
          </View>
          {Number(summary.discount) > 0 && (
            <View style={{ marginTop: u(13), marginHorizontal: u(2), height: u(49), borderRadius: u(14), backgroundColor: '#EDF8EE', flexDirection: 'row', alignItems: 'center', paddingLeft: u(15) }}>
              <View style={{ width: u(28), height: u(28), borderRadius: u(14), backgroundColor: '#0A5A2C', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="pricetag" size={Math.max(11, u(15))} color="#fff" />
              </View>
              <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ marginLeft: u(13), fontFamily: FONT.body, ...T(18), color: '#10592A' }}>You are saving <Text style={{ fontFamily: FONT.bodySemi }}>{rs(summary.discount)}</Text> on this order!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Place Order (sits above the tab bar, like the design) */}
      <View style={{ backgroundColor: '#fff', paddingHorizontal: u(44), paddingTop: u(10), paddingBottom: u(10) }}>
        <TouchableOpacity onPress={place} disabled={placing} activeOpacity={0.88} accessibilityLabel="Place order"
          style={{ height: u(69), borderRadius: u(18), backgroundColor: '#087D3D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: placing ? 0.7 : 1 }}>
          {placing ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text maxFontSizeMultiplier={1} style={{ color: '#fff', fontFamily: FONT.bodyMedium, ...T(23) }}>Place Order</Text>
              <Ionicons name="arrow-forward" size={Math.max(16, u(26))} color="#fff" style={{ marginLeft: u(12) }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
