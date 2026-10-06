import React, { useEffect, useRef } from 'react';
import { Animated, Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Img from '../components/Img';
import { rs, fmtDate, shortId, FONT } from '../theme';

// ORDER PLACED - exact copy of the PDF screen "Order Placed Successfully!" (row 4, 3rd screen).
// Every size is written in DESIGN UNITS (the PDF screen is 850 units wide): u(n) turns n units into dp for the current phone,
// T(n) = text style for an n-unit font (lineHeight follows the font). Data/logic unchanged: the order comes from POST /api/orders via route params.
const REF_W = 850;
const GREEN = '#0B7A3E';
const DARK = '#0B3D2A';
const STEPS = [
  ['Order Placed', null],
  ['Preparing', 'We are getting\nyour items ready'],
  ['Out for Delivery', 'On the way\nto your location'],
  ['Delivered', 'Enjoy your\nfresh groceries'],
];
const STEP_X = [110, 319, 530, 739];                 // circle centres measured in the design
const PROGRESS = { pending: 0, confirmed: 1, packed: 1, shipped: 2, delivered: 3 }; // order status -> last reached step
const DOTS = [[-66, -34, '#F5A623', 5], [-72, 2, '#7BC043', 4], [-60, 40, '#F2C94C', 5], [-30, 66, '#F5A623', 4], [4, 70, '#F2C94C', 5], [44, -62, '#7BC043', 5], [66, -30, '#F5A623', 4], [-34, -66, '#7BC043', 4], [62, 22, '#F2C94C', 4]];

const toDate = (s) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z');
const up = (s) => s.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
const clock = (d) => up(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
const hourLabel = (d) => `${d.getHours() % 12 || 12} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
// "Today, 5 PM - 8 PM": window starts at the next full hour after (order time + backend ETA) and lasts 3 hours.
const slotLabel = (order) => {
  const base = order.created_at ? toDate(order.created_at) : new Date();
  const start = new Date(base.getTime() + (order.eta_minutes ?? 10) * 60000);
  start.setMinutes(0, 0, 0); start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 3 * 3600000);
  return `${start.getDate() === new Date().getDate() ? 'Today' : 'Tomorrow'}, ${hourLabel(start)} - ${hourLabel(end)}`;
};
const phoneLabel = (p) => { const d = String(p || '').replace(/\D/g, '').slice(-10); return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : (p || ''); };

export default function OrderSuccess({ navigation, route }) {
  const { order } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const k = width / REF_W;
  const u = (n) => Math.round(n * k * 10) / 10;
  const T = (n, lh = 1.3) => { const fs = Math.max(8, Math.round(n * k * 10) / 10); return { fontSize: fs, lineHeight: Math.round(fs * lh * 10) / 10, includeFontPadding: false }; };

  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start(); }, [pop]);

  const goHome = () => { navigation.popToTop(); navigation.getParent()?.navigate('HomeTab'); };
  const openDetails = () => navigation.navigate('OrderDetails', { id: order.id });
  const openHelp = () => navigation.getParent()?.navigate('ProfileTab', { screen: 'Help' });
  const a = order.address;
  const items = order.items || [];
  const reached = PROGRESS[order.order_status] ?? 0;
  const PAD = u(37);
  // BANNER: BANNER_SIDE = gap on the left AND right in dp (0 = full screen width). Change only this number to make the banner narrower/wider.
  const BANNER_SIDE = 15;
  const BANNER_W = width - BANNER_SIDE * 2;
  const BANNER_H = BANNER_W / 3.6337;   // new banner picture is 992 x 273
  const BORDER = '#EBEDF1';
  const when = order.created_at ? toDate(order.created_at) : new Date();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <LinearGradient colors={['#E1F0D7', '#FFFFFF']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: u(520) }} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + u(30), paddingBottom: u(30) }} showsVerticalScrollIndicator={false}>

        {/* header: check badge + title + close */}
        <View style={{ flexDirection: 'row', paddingHorizontal: PAD }}>
          <View style={{ width: u(188) }}>
            <Animated.View style={{ position: 'absolute', left: u(92) - u(50), top: u(17.5), width: u(100), height: u(100), transform: [{ scale: pop }] }}>
              {DOTS.map(([dx, dy, c, r], i) => <View key={i} style={{ position: 'absolute', left: u(50 + dx) - u(r) / 2, top: u(50 + dy) - u(r) / 2, width: u(r), height: u(r), borderRadius: u(r), backgroundColor: c }} />)}
              <View style={{ width: u(100), height: u(100), borderRadius: u(50), backgroundColor: '#0F7A3D', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark" size={Math.max(26, u(62))} color="#fff" />
              </View>
            </Animated.View>
          </View>
          <View style={{ flex: 1, paddingRight: u(40) }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(38, 1.22), color: DARK, letterSpacing: -0.3 }}>{'Order Placed\nSuccessfully!'}</Text>
            <Text maxFontSizeMultiplier={1} style={{ marginTop: u(12), fontFamily: FONT.bodyMedium, ...T(22), color: '#6B6F85' }}>Thank you for shopping with us <Text style={{ color: GREEN }}>♥</Text></Text>
            <Text maxFontSizeMultiplier={1} style={{ marginTop: u(6), fontFamily: FONT.body, ...T(17.5), color: '#7B7F94' }}>Your order is being prepared and will be delivered soon.</Text>
          </View>
          <TouchableOpacity onPress={goHome} accessibilityLabel="Close" hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ position: 'absolute', right: u(37), top: u(2) }}>
            <Ionicons name="close" size={Math.max(20, u(32))} color="#0A0F0C" />
          </TouchableOpacity>
        </View>

        {/* order number / date / total */}
        <View style={{ marginHorizontal: PAD, marginTop: u(32), height: u(112), borderRadius: u(18), backgroundColor: '#EEF6EE' }}>
          {[[23, 'Order Number', shortId(order.id)], [282, 'Order Date', up(fmtDate(order.created_at))], [612, 'Total Amount', rs(order.total)]].map(([x, label, value]) => (
            <View key={label} style={{ position: 'absolute', left: u(x), top: 0, bottom: 0, justifyContent: 'center' }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, ...T(19), color: '#2E3138' }}>{label}</Text>
              <Text maxFontSizeMultiplier={1} style={{ marginTop: u(10), fontFamily: label === 'Order Date' ? FONT.bodyMedium : FONT.headingBold, ...T(label === 'Order Date' ? 20 : 24), color: '#02050A' }}>{value}</Text>
            </View>
          ))}
          {[226, 557].map((x) => <View key={x} style={{ position: 'absolute', left: u(x), top: u(29), width: 1, height: u(54), backgroundColor: '#DDE5DD' }} />)}
        </View>

        {/* Order Tracking */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PAD, marginTop: u(31) }}>
          <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(22), color: '#05090B' }}>Order Tracking</Text>
          <TouchableOpacity onPress={openDetails} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, ...T(20), color: GREEN }}>View Details</Text>
            <Ionicons name="arrow-forward" size={Math.max(14, u(24))} color={GREEN} style={{ marginLeft: u(8) }} />
          </TouchableOpacity>
        </View>
        <View style={{ height: u(68) + u(13) + u(24) + u(6) + u(44), marginTop: u(18) }}>
          {[[144, 285], [353, 496], [564, 705]].map(([x0, x1], i) => (
            <View key={i} style={{ position: 'absolute', left: u(x0), width: u(x1 - x0), top: u(33), height: u(2.5), backgroundColor: i <= reached ? GREEN : '#D9DBE2' }} />
          ))}
          {STEPS.map(([label, sub], i) => {
            const done = i <= reached;
            return (
              <View key={label} style={{ position: 'absolute', left: u(STEP_X[i] - 100), width: u(200), alignItems: 'center' }}>
                <View style={{ width: u(68), height: u(68), borderRadius: u(34), backgroundColor: done ? '#0F7A3D' : '#E7E8ED', alignItems: 'center', justifyContent: 'center' }}>
                  {i === 0 && <MaterialCommunityIcons name="shopping-outline" size={Math.max(18, u(34))} color="#fff" />}
                  {i === 1 && <MaterialCommunityIcons name="package-variant-closed" size={Math.max(18, u(34))} color={done ? '#fff' : '#4A4D5A'} />}
                  {i === 2 && <MaterialCommunityIcons name="truck-delivery-outline" size={Math.max(18, u(34))} color={done ? '#fff' : '#4A4D5A'} />}
                  {i === 3 && <Ionicons name="home-outline" size={Math.max(18, u(32))} color={done ? '#fff' : '#4A4D5A'} />}
                </View>
                <Text maxFontSizeMultiplier={1} style={{ marginTop: u(13), fontFamily: done ? FONT.heading : FONT.bodyMedium, ...T(18), color: done ? GREEN : '#2E3138', textAlign: 'center' }}>{label}</Text>
                <Text maxFontSizeMultiplier={1} style={{ marginTop: u(6), fontFamily: FONT.body, ...T(15, 1.4), color: '#7E8296', textAlign: 'center' }}>{i === 0 ? clock(when) : sub}</Text>
              </View>
            );
          })}
        </View>

        {/* delivering to + estimated delivery */}
        <View style={{ marginHorizontal: u(27), marginTop: u(31), minHeight: u(189), borderRadius: u(20), backgroundColor: '#EEF7EE', flexDirection: 'row', paddingVertical: u(22) }}>
          <View style={{ flex: 1, flexDirection: 'row', paddingLeft: u(21), paddingRight: u(14) }}>
            <View style={{ width: u(70), height: u(70), borderRadius: u(16), backgroundColor: '#DDF1DB', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="location" size={Math.max(20, u(38))} color="#0A6B33" />
            </View>
            <View style={{ flex: 1, marginLeft: u(21) }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bodyMedium, ...T(18), color: GREEN }}>Delivering to</Text>
              <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ marginTop: u(4), fontFamily: FONT.headingBold, ...T(22), color: '#02050A' }}>{a?.type || 'Home'}</Text>
              {!!a && <Text maxFontSizeMultiplier={1} numberOfLines={3} style={{ fontFamily: FONT.body, ...T(19, 1.42), color: '#6B6F85' }}>{a.address_line}{a.landmark ? `, ${a.landmark}` : ''}, {a.city}{a.state ? `, ${a.state}` : ''} {a.pincode}</Text>}
              {!!a?.phone && <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, ...T(19, 1.42), color: '#6B6F85' }}>{phoneLabel(a.phone)}</Text>}
            </View>
          </View>
          <View style={{ width: 1, backgroundColor: '#D9E4D9', marginVertical: u(10) }} />
          <View style={{ width: u(306), flexDirection: 'row', paddingLeft: u(24), paddingTop: u(22) }}>
            <View style={{ width: u(36), height: u(36), borderRadius: u(18), backgroundColor: '#0F7A3D', alignItems: 'center', justifyContent: 'center', marginTop: u(16) }}>
              <Ionicons name="time" size={Math.max(14, u(24))} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: u(14) }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, ...T(18), color: '#6B6F85' }}>Estimated Delivery</Text>
              <Text maxFontSizeMultiplier={1} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ marginTop: u(5), fontFamily: FONT.headingBold, ...T(21), color: '#02050A' }}>{slotLabel(order)}</Text>
              <Text maxFontSizeMultiplier={1} style={{ marginTop: u(5), fontFamily: FONT.heading, ...T(18), color: order.delivery_fee ? '#3F4150' : '#0B7A3E' }}>
                {order.delivery_fee ? `${order.delivery_option === 'express' ? 'Express' : 'Standard'} Delivery ${rs(order.delivery_fee)}` : 'FREE Delivery'}
              </Text>
            </View>
          </View>
        </View>

        {/* items */}
        {items.length > 0 && (
          <>
            <Text maxFontSizeMultiplier={1} style={{ marginTop: u(31), paddingHorizontal: PAD, fontFamily: FONT.headingBold, ...T(21), color: '#05090B' }}>Items in this order ({items.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: u(21), flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: PAD }}>
              {items.map((i, idx) => {
                const orig = Number(i.original_price) || 0;
                return (
                  <View key={`${i.product_id}-${idx}`} style={{ width: u(183), minHeight: u(229), marginRight: idx < items.length - 1 ? u(16) : 0, borderRadius: u(18), borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff', paddingHorizontal: u(17), paddingTop: u(19), paddingBottom: u(15) }}>
                    <Img fit="contain" uri={i.image} style={{ width: '100%', height: u(100) }} />
                    <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ marginTop: u(13), fontFamily: FONT.bodyMedium, ...T(19), color: '#02050A' }}>{i.name}</Text>
                    <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, ...T(17, 1.35), color: '#767A87' }}>{i.unit}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: u(4) }}>
                      <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(22), color: '#02050A' }}>{rs(i.price)}</Text>
                      {orig > i.price && <Text maxFontSizeMultiplier={1} style={{ marginLeft: u(10), fontFamily: FONT.body, ...T(19), color: '#8A8D9B', textDecorationLine: 'line-through' }}>{rs(orig)}</Text>}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* buttons */}
        <View style={{ flexDirection: 'row', marginHorizontal: PAD, marginTop: u(25) }}>
          <TouchableOpacity onPress={openDetails} activeOpacity={0.88} style={{ flex: 1, height: u(82), borderRadius: u(20), backgroundColor: '#E5F4E6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="document-text-outline" size={Math.max(18, u(30))} color={GREEN} />
            <Text maxFontSizeMultiplier={1} style={{ marginLeft: u(14), fontFamily: FONT.heading, ...T(21), color: '#0A5A2C' }}>View Order Details</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goHome} activeOpacity={0.88} style={{ flex: 1, marginLeft: u(16), height: u(82), borderRadius: u(20), backgroundColor: '#0B7A3E', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="cart-outline" size={Math.max(18, u(32))} color="#fff" />
            <Text maxFontSizeMultiplier={1} style={{ marginLeft: u(14), fontFamily: FONT.heading, ...T(21), color: '#fff' }}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>

        {/* Good Food banner: the whole banner (text + button) is the design picture; a see-through button sits exactly on top of the picture's "Shop More" button */}
        <View style={{ width: BANNER_W, height: BANNER_H, marginTop: u(24), alignSelf: 'center', borderRadius: BANNER_W * 0.024, overflow: 'hidden', backgroundColor: '#E3F2D4' }}>
          <Image source={require('../../assets/design/os_banner_goodfood.jpg')} style={{ position: 'absolute', left: -2, top: -2, width: BANNER_W + 4, height: BANNER_H + 4 }} resizeMode="cover" />
          <TouchableOpacity onPress={goHome} activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Shop More"
            style={{ position: 'absolute', left: BANNER_W * 0.0464, top: BANNER_H * 0.7289, width: BANNER_W * 0.2147, height: BANNER_H * 0.1868, borderRadius: 999 }} />
        </View>

        {/* Need Help? */}
        <View style={{ marginHorizontal: PAD, marginTop: u(24), height: u(91), borderRadius: u(18), backgroundColor: '#F4F5F9', flexDirection: 'row', alignItems: 'center', paddingLeft: u(26), paddingRight: u(18) }}>
          <Ionicons name="headset-outline" size={Math.max(20, u(40))} color="#2E3138" />
          <View style={{ flex: 1, marginLeft: u(26) }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, ...T(21), color: '#02050A' }}>Need Help?</Text>
            <Text maxFontSizeMultiplier={1} numberOfLines={2} style={{ fontFamily: FONT.body, ...T(16), color: '#6B6F85' }}>We're here for you. Contact our support team anytime.</Text>
          </View>
          <TouchableOpacity onPress={openHelp} activeOpacity={0.88} style={{ marginLeft: u(10), height: u(47), paddingHorizontal: u(20), borderRadius: u(14), borderWidth: 1, borderColor: '#A9D6B8', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, ...T(19), color: GREEN }}>Get Help</Text>
            <Ionicons name="arrow-forward" size={Math.max(13, u(22))} color={GREEN} style={{ marginLeft: u(8) }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
