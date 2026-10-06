import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import AppHeader from '../components/AppHeader';
import HomeBanner from '../components/HomeBanner';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import ProductGrid from '../components/ProductGrid';
import { QuickDeliveryStrip } from '../components/HomeOffers';
import { MembershipBanner, PromoBanner } from '../components/HomeBanners';
import { C, FONT } from '../theme';
import { useDesign } from '../scale';

// DEMO ONLY: the backend has no coupon/offer system, so these cards are UI placeholders (not applied at checkout).
const DEMO_COUPONS = [
  { code: 'FRESH10', title: '10% off', sub: 'On your first order', icon: 'gift-outline' },
  { code: 'FREEDEL', title: 'Free delivery', sub: 'On orders above ₹499', icon: 'bicycle-outline' },
  { code: 'WELCOME50', title: 'Flat ₹50 off', sub: 'On orders above ₹399', icon: 'pricetag-outline' },
];
const TIERS = [{ label: 'All deals', min: 0 }, { label: '15% & above', min: 15 }, { label: '25% & above', min: 25 }, { label: '40% & above', min: 40 }];

// Same heading style as the Home sections (sizes follow the design proportions, see ../scale.js).
const Section = ({ title, right, children }) => {
  const { u, f } = useDesign();
  return (
    <View style={{ marginTop: u(36) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: u(42), marginBottom: u(22) }}>
        <Text maxFontSizeMultiplier={1.1} style={{ fontSize: f(32, 14), fontFamily: FONT.headingBold, color: C.text }}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
};

// Ticket style coupon card: icon + text on the left, dashed tear line, code on the right.
const CouponCard = ({ c, onPress }) => {
  const { u, f } = useDesign();
  const w = Math.round(u(610));
  const codeW = Math.round(u(200));
  const notch = Math.round(u(28));
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${c.title}, code ${c.code}`}
      style={{ width: w, flexDirection: 'row', backgroundColor: '#fff', borderRadius: u(30), borderWidth: 1, borderColor: '#E8EFE1', overflow: 'hidden', marginRight: u(20) }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: u(26) }}>
        <View style={{ width: u(88), height: u(88), borderRadius: u(44), backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={c.icon} size={f(40, 18)} color={C.green} />
        </View>
        <View style={{ flex: 1, marginLeft: u(20) }}>
          <Text numberOfLines={1} maxFontSizeMultiplier={1.1} style={{ fontSize: f(28, 13), fontFamily: FONT.headingBold, color: C.text }}>{c.title}</Text>
          <Text numberOfLines={2} maxFontSizeMultiplier={1.1} style={{ marginTop: 2, fontSize: f(21, 10), fontFamily: FONT.body, color: C.muted }}>{c.sub}</Text>
        </View>
      </View>
      <View style={{ width: codeW, backgroundColor: C.tile, alignItems: 'center', justifyContent: 'center', paddingHorizontal: u(10), paddingVertical: u(16) }}>
        <Text maxFontSizeMultiplier={1} style={{ fontSize: f(15, 8), fontFamily: FONT.heading, color: C.muted, letterSpacing: 0.6 }}>USE CODE</Text>
        <View style={{ marginTop: u(8), borderWidth: 1, borderStyle: 'dashed', borderColor: C.green, borderRadius: u(14), paddingHorizontal: u(14), paddingVertical: u(6), backgroundColor: '#fff' }}>
          <Text numberOfLines={1} maxFontSizeMultiplier={1} style={{ fontSize: f(21, 10), fontFamily: FONT.headingBold, color: C.green }}>{c.code}</Text>
        </View>
      </View>
      {/* ticket notches on the tear line */}
      <View style={{ position: 'absolute', top: -notch / 2, right: codeW - notch / 2, width: notch, height: notch, borderRadius: notch / 2, backgroundColor: C.bg }} />
      <View style={{ position: 'absolute', bottom: -notch / 2, right: codeW - notch / 2, width: notch, height: notch, borderRadius: notch / 2, backgroundColor: C.bg }} />
    </TouchableOpacity>
  );
};

// Filter pill, scaled like the rest of Home.
const DealChip = ({ label, active, onPress }) => {
  const { u, f } = useDesign();
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}
      style={{ paddingHorizontal: u(30), paddingVertical: u(14), borderRadius: 999, borderWidth: 1, marginRight: u(14), backgroundColor: active ? C.green : '#fff', borderColor: active ? C.green : '#E8EFE1' }}>
      <Text maxFontSizeMultiplier={1.1} style={{ fontSize: f(23, 11), fontFamily: FONT.heading, color: active ? '#fff' : C.text }}>{label}</Text>
    </TouchableOpacity>
  );
};

// Offers tab: built only from existing data (/home banners + discounted products). No backend changes.
export default function Offers({ navigation }) {
  const { notify } = useCart();
  const { u, f } = useDesign();
  const [banners, setBanners] = useState([]);
  const [deals, setDeals] = useState(null);
  const [err, setErr] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [min, setMin] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/home');
      let list = data.offers || [];
      if (!list.length) { // fall back to any discounted product, then featured items
        const all = (await api.get('/products', { params: { limit: 100, sort: 'popular' } })).data.data;
        list = all.filter((p) => p.discount > 0);
        if (!list.length) list = data.featured_products || [];
      }
      setBanners(data.banners || []); setDeals(list); setErr(null);
    } catch (e) { setErr(errMsg(e)); }
    setRefreshing(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const wrap = (body) => <View style={{ flex: 1, backgroundColor: C.bg }}><AppHeader scaled />{body}</View>;
  if (deals === null && !err) return wrap(<Loading />);
  if (err && deals === null) return wrap(<ErrorState message={err} onRetry={() => { setErr(null); load(); }} />);

  const maxDiscount = Math.round(Math.max(0, ...deals.map((p) => p.discount || 0)));
  const tiers = TIERS.filter((t) => t.min === 0 || t.min <= maxDiscount);
  const shown = deals.filter((p) => (p.discount || 0) >= min);
  const bw = Math.round(u(974));
  const allProducts = () => navigation.navigate('Products', { title: 'All Products' });
  const onBanner = (b) => (b.action_type === 'category'
    ? navigation.navigate('Products', { categoryId: b.action_value, title: b.title })
    : allProducts());

  const header = (
    <View>
      {/* 1. Offer banners from the backend (swipe) */}
      {banners.length > 0 && (
        <FlatList horizontal data={banners} keyExtractor={(b) => String(b.id)} showsHorizontalScrollIndicator={false}
          snapToInterval={bw + u(20)} decelerationRate="fast" style={{ marginTop: u(20) }}
          contentContainerStyle={{ paddingHorizontal: Math.round(u(37)) }} ItemSeparatorComponent={() => <View style={{ width: u(20) }} />}
          renderItem={({ item }) => <HomeBanner banner={item} width={bw} onPress={onBanner} />} />
      )}

      {/* 2. 10 minute delivery strip (same picture as Home) */}
      <View style={{ marginTop: u(banners.length ? 30 : 20) }}>
        <QuickDeliveryStrip onPress={allProducts} />
      </View>

      {/* 3. Coupons */}
      <Section title="Coupons for You">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: u(42), paddingBottom: 2 }}>
          {DEMO_COUPONS.map((c) => (
            <CouponCard key={c.code} c={c} onPress={() => notify(`${c.code} is a demo offer, not applied at checkout`)} />
          ))}
        </ScrollView>
      </Section>

      {/* 4. Top deals + discount filter */}
      <Section title="Top Deals" right={
        <Text maxFontSizeMultiplier={1.1} style={{ color: C.muted, fontFamily: FONT.bodyMedium, fontSize: f(24, 11) }}>
          {shown.length} {shown.length === 1 ? 'item' : 'items'}
        </Text>
      }>
        {tiers.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: u(42) }}>
            {tiers.map((t) => <DealChip key={t.min} label={t.label} active={min === t.min} onPress={() => setMin(t.min)} />)}
          </ScrollView>
        )}
      </Section>
      <View style={{ height: u(24) }} />
    </View>
  );

  // 5. Promo pictures at the bottom, same as Home
  const footer = (
    <View style={{ paddingBottom: u(24) }}>
      <MembershipBanner onPress={() => notify('Coming soon')} />
      <PromoBanner variant="festival" title="Festival Essentials" onPress={allProducts} />
    </View>
  );

  return wrap(
    <ProductGrid data={shown} ListHeaderComponent={header} ListFooterComponent={footer}
      refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}
      ListEmptyComponent={<Empty icon="🏷️" title="No deals right now" sub="Check back soon for fresh offers." />} />
  );
}
