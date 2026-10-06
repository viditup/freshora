import React, { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api, errMsg } from '../api';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import AppHeader from '../components/AppHeader';
import Img from '../components/Img';
import { catEmoji, countLabel } from '../components/CategoryCard';
import D from '../designImages';
import { C, FONT } from '../theme';

// CATEGORIES PAGE - exact copy of the design screen "Shop by Categories" (PDF, 3rd row, 1st screen).
// Every size below is written in DESIGN UNITS: the PDF screen is 850 units wide, u(n) = n units converted to dp for the
// current phone width, so the page keeps the same proportions on every phone. f(n, min) = same for text, but never
// smaller than `min` dp (a few design texts would be ~8 dp on a real phone - unreadable).
// Photos are cropped from the PDF (assets/design/cs_*.jpg); names, counts, arrows and the banner text are drawn natively (sharp text).
const REF_W = 850;

// Set to false to show the real product_count from the backend instead of the design's "500+ items" style labels.
const USE_DESIGN_COUNTS = true;

// Grid order exactly like the design. `rx` finds the matching backend category, `label` keeps the design's line breaks.
const GRID = [
  { key: 'fruits', rx: /fruit|veg/i, label: 'Fruits &\nVegetables', count: '500+ items', ar: 494 / 516, arrow: '#0A1410', art: 'cs_fruits' },
  { key: 'dairy', rx: /dairy|milk|breakfast/i, label: 'Dairy &\nBreakfast', count: '300+ items', ar: 494 / 516, arrow: '#1A5CA8', art: 'cs_dairy' },
  { key: 'snacks', rx: /^(?!.*healthy).*snack/i, label: 'Snacks &\nBeverages', count: '400+ items', ar: 494 / 516, arrow: '#111111', art: 'cs_snacks' },
  { key: 'atta', rx: /atta|rice|staple|grocer/i, label: 'Atta, Rice &\nStaples', count: '300+ items', ar: 494 / 520, arrow: '#111111', art: 'cs_atta' },
  { key: 'household', rx: /house/i, label: 'Household\nEssentials', count: '250+ items', ar: 494 / 520, arrow: '#10392E', art: 'cs_household' },
  { key: 'personal', rx: /personal/i, label: 'Personal\nCare', count: '300+ items', ar: 494 / 520, arrow: '#111111', art: 'cs_personal' },
  { key: 'baby', rx: /baby/i, label: 'Baby Care', count: '200+ items', ar: 494 / 502, arrow: '#1A5CA8', art: 'cs_baby' },
  { key: 'pet', rx: /pet/i, label: 'Pet Care', count: '150+ items', ar: 494 / 502, arrow: '#111111', art: 'cs_pet' },
];
const ALL_COUNT = '2000+ items';
const FEATURED = [
  { key: 'organic', rx: /organic/i, label: 'Organic\nProducts', count: '120+ items', art: 'cs_feat_organic', w: 185, name: '#0B3D2A', sub: '#667070' },
  { key: 'healthy', rx: /healthy/i, label: 'Healthy\nSnacks', count: '100+ items', art: 'cs_feat_healthy', w: 182, name: '#5A2410', sub: '#6A6256' },
  { key: 'bev', rx: /^beverages?$/i, label: 'Beverages', count: '180+ items', art: 'cs_feat_bev', w: 183, name: '#0A3A36', sub: '#6E7C86' },
  { key: 'clean', rx: /clean/i, label: 'Cleaning\nEssentials', count: '100+ items', art: 'cs_feat_clean', w: 175, name: '#0B3A37', sub: '#738391' },
];
const FEATURED_GAPS = [18, 17, 18]; // design gaps between the 4 tiles (units)
const isFeaturedName = (c) => FEATURED.some((f) => f.rx.test(c.name || ''));

export default function Categories({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState(null);
  const { width } = useWindowDimensions();
  const k = width / REF_W;
  const u = (n) => Math.round(n * k * 10) / 10;
  const f = (n, min = 10) => Math.max(min, Math.round(n * k * 10) / 10);

  const load = useCallback(async () => {
    try { setList((await api.get('/categories')).data.data); setErr(null); } catch (e) { setErr(errMsg(e)); }
    setLoading(false); setRefreshing(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;
  if (err && !list.length) return <ErrorState message={err} onRetry={() => { setLoading(true); load(); }} />;

  const open = (c) => navigation.navigate('Products', { categoryId: c.id, title: c.name });
  const total = list.reduce((t, c) => t + (c.product_count || 0), 0);

  // 8 design slots -> backend categories (a missing one is filled with another category so the grid has no hole)
  const used = new Set();
  const slots = GRID.map((g) => { const hit = list.find((c) => !used.has(c.id) && g.rx.test(c.name || '')); if (hit) used.add(hit.id); return hit || null; });
  const spare = list.filter((c) => !used.has(c.id) && !isFeaturedName(c));
  const cells = GRID.map((g, i) => ({ g, c: slots[i] || null, designArt: true }));
  const featured = FEATURED.map((g) => ({ g, c: list.find((c) => g.rx.test(c.name || '')) || null }));
  const organic = list.find((c) => /organic/i.test(c.name || ''));

  const PAD = u(37);
  const GAP = u(17);
  const cardW = (width - PAD * 2 - GAP * 2) / 3;
  const radius = u(19);

  // Screen-fit widths: everything is computed from the real phone width so nothing can go past the right edge.
  const contentW = width - PAD * 2;
  const bannerW = contentW;
  // banner height follows the real picture ratio, so the photo is shown in full (no cropping at the top)
  const bSrc = Image.resolveAssetSource ? Image.resolveAssetSource(D.cs_banner_lifestyle) : null;
  const bannerH = Math.max(u(213), bSrc && bSrc.width && bSrc.height ? Math.round(bannerW * bSrc.height / bSrc.width) : 0);
  const featGapSum = FEATURED_GAPS.reduce((t, x) => t + u(x), 0);
  const featSumW = FEATURED.reduce((t, x) => t + x.w, 0);
  const featTileW = (g) => Math.floor(((contentW - featGapSum) * g.w / featSumW) * 10) / 10;
  const featGap = (i) => u(FEATURED_GAPS[i] || 17);

  // text block at the bottom-left of a card + white circle with arrow at the bottom-right (same in all 9 cards)
  // every line of a label is its own single-line Text that shrinks to fit the given width -> no ugly wrapping, no "..."
  const Lines = ({ text, style, minScale = 0.7 }) => String(text).split('\n').map((t, i) => (
    <Text key={i} maxFontSizeMultiplier={1} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={minScale} style={style}>{t}</Text>
  ));
  const CardText = ({ label, count, nameColor = '#0A0F0C', countColor = '#505B55' }) => (
    <View pointerEvents="none" style={{ position: 'absolute', left: u(19), bottom: u(8), width: u(150) }}>
      <Lines text={label} style={{ fontFamily: FONT.heading, fontSize: f(19, 9.5), lineHeight: f(22, 11), color: nameColor }} />
      <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, fontSize: f(15, 8.5), lineHeight: f(18, 10), color: countColor, marginTop: u(5) }}>{count}</Text>
    </View>
  );
  const Arrow = ({ color }) => (
    <View pointerEvents="none" style={{ position: 'absolute', right: u(14), bottom: u(14), width: u(40), height: u(40), borderRadius: u(20), backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="chevron-forward" size={Math.max(14, u(26))} color={color} />
    </View>
  );

  const Card = ({ g, c, designArt }) => {
    const label = designArt ? g.label : (c ? c.name : g.label);
    const count = USE_DESIGN_COUNTS && designArt ? g.count : (c ? countLabel(c) : g.count);
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => (c ? open(c) : navigation.navigate('AllCategories'))} accessibilityLabel={c ? c.name : g.label}
        style={{ width: cardW, aspectRatio: g.ar, borderRadius: radius, overflow: 'hidden', backgroundColor: '#EFF7E1' }}>
        {designArt
          ? <Img source={D[g.art]} fit="cover" style={{ width: '100%', height: '100%' }} />
          : <Img uri={c && c.image} emoji={c ? catEmoji(c) : '🥬'} fit="contain" style={{ width: '100%', height: '70%' }} />}
        <CardText label={label} count={count} />
        <Arrow color={g.arrow} />
      </TouchableOpacity>
    );
  };

  const AllCard = ({ ar }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AllCategories')} accessibilityLabel="All categories"
      style={{ width: cardW, aspectRatio: ar, borderRadius: radius, overflow: 'hidden', backgroundColor: '#EBF7EB' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: u(51), left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ width: u(62), flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: u(27), height: u(27), borderRadius: u(9), backgroundColor: '#0B7A3E', marginBottom: i < 2 ? u(8) : 0 }} />)}
        </View>
      </View>
      <CardText label={'All\nCategories'} count={USE_DESIGN_COUNTS ? ALL_COUNT : `${total} items`} />
      <Arrow color="#0F4A33" />
    </TouchableOpacity>
  );

  const rowsOf = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
  const allCells = [...cells.map((x) => ({ ...x, type: 'cat' })), { type: 'all', g: { ar: 494 / 502 } }];
  const gridRows = rowsOf(allCells, 3);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppHeader scaled />
      <ScrollView style={{ width: width }} contentContainerStyle={{ paddingBottom: u(26), width: width }} horizontal={false} bounces keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.green} />}>

        {/* title row: heading + sub-title on the left, "Fresh Choices Healthier Tomorrows" pill on the right */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, marginTop: u(22) }}>
          <View style={{ flex: 1, marginRight: u(10) }}>
            <Text maxFontSizeMultiplier={1} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: FONT.headingBold, fontSize: u(50), lineHeight: u(56), color: '#07281B', letterSpacing: -0.4 }}>Shop by Categories</Text>
            <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, fontSize: f(22, 10.5), lineHeight: f(28, 14), color: '#5F6673', marginTop: u(6) }}>Everything you need, all in one place.</Text>
          </View>
          <View style={{ width: u(290), height: u(77), borderRadius: u(30), backgroundColor: '#E4F5E3', flexDirection: 'row', alignItems: 'center', paddingLeft: u(20), paddingRight: u(12) }}>
            <Ionicons name="leaf" size={Math.max(18, u(40))} color="#3C8A12" />
            <View style={{ flex: 1, marginLeft: u(12) }}>
              <Lines text={'Fresh Choices\nHealthier Tomorrows'} minScale={0.6} style={{ fontFamily: FONT.heading, fontSize: f(17, 9), lineHeight: f(21, 11.5), color: '#0B3A1E' }} />
            </View>
          </View>
        </View>

        {!list.length && <Empty icon="🗂️" title="No categories yet" sub="Categories will appear once they are added." />}

        {(
          <View style={{ paddingHorizontal: PAD, marginTop: u(25) }}>
            {gridRows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', marginBottom: ri < gridRows.length - 1 ? GAP : 0 }}>
                {row.map((cell, ci) => (
                  <View key={cell.type === 'all' ? 'all' : cell.g.key} style={{ marginRight: ci < 2 ? GAP : 0 }}>
                    {cell.type === 'all' ? <AllCard ar={cell.g.ar} /> : <Card g={cell.g} c={cell.c} designArt={cell.designArt} />}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {featured.length > 0 && (
          <View style={{ marginTop: u(30) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, fontSize: u(28), lineHeight: u(36), color: '#08140E', letterSpacing: -0.2 }}>Featured Categories</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('AllCategories')} accessibilityLabel="See all categories" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, fontSize: f(23, 11.5), color: '#0E7A3C' }}>See All</Text>
                <Ionicons name="arrow-forward" size={Math.max(15, u(24))} color="#0E7A3C" style={{ marginLeft: u(8) }} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', paddingHorizontal: PAD, marginTop: u(17), width: width, overflow: 'hidden' }}>
              {featured.map(({ g, c }, i) => (
                <TouchableOpacity key={g.key} activeOpacity={0.9} onPress={() => (c ? open(c) : navigation.navigate('AllCategories'))} accessibilityLabel={c ? c.name : g.label}
                  style={{ width: featTileW(g), height: u(167), borderRadius: radius, overflow: 'hidden', marginRight: i < featured.length - 1 ? featGap(i) : 0, backgroundColor: '#EEF6E4' }}>
                  <Img source={D[g.art]} fit="cover" style={{ width: '100%', height: '100%' }} />
                  <View pointerEvents="none" style={{ position: 'absolute', left: u(14), top: u(11), width: featTileW(g) * 0.62 }}>
                    <Lines text={g.label} minScale={0.6} style={{ fontFamily: FONT.heading, fontSize: f(16, 8.5), lineHeight: f(19, 10), color: g.name }} />
                    <Text maxFontSizeMultiplier={1} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{ fontFamily: FONT.body, fontSize: f(12.5, 8), lineHeight: f(15, 9.5), color: g.sub, marginTop: u(3) }}>{USE_DESIGN_COUNTS || !c ? g.count : countLabel(c)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {(
          <View style={{ marginLeft: PAD, width: bannerW, marginTop: u(19), height: bannerH, borderRadius: radius + 2, overflow: 'hidden', backgroundColor: '#E5F4D3' }}>
            <Img source={D.cs_banner_lifestyle} fit="cover" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }} />
            <View style={{ position: 'absolute', left: u(29), top: u(16), width: u(320) }}>
              <Lines text={'Explore a\nHealthier Lifestyle'} minScale={0.7} style={{ fontFamily: FONT.headingBold, fontSize: u(32), lineHeight: u(35), color: '#0B3D2A', letterSpacing: -0.4 }} />
              <View style={{ marginTop: u(8) }}>
                <Lines text={'Wide range of organic, healthy\nand natural products.'} minScale={0.6} style={{ fontFamily: FONT.body, fontSize: f(15, 8.5), lineHeight: f(18, 10.5), color: '#1D4A2A' }} />
              </View>
            </View>
            {(() => {
              // sizes taken from the design image, as a share of the banner width (so it looks the same on every phone)
              const btnW = bannerW * 0.25;
              const btnH = bannerW * 0.058;
              return (
                <TouchableOpacity activeOpacity={0.9} accessibilityLabel="Shop now" onPress={() => (organic ? open(organic) : navigation.navigate('AllCategories'))}
                  style={{ position: 'absolute', left: bannerW * 0.039, bottom: bannerW * 0.025, width: btnW, height: btnH, borderRadius: btnH / 2, backgroundColor: '#0B4F31', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.bodySemi, fontSize: Math.max(10, bannerW * 0.0215), color: '#FFFFFF', includeFontPadding: false, textAlignVertical: 'center' }}>Shop Now</Text>
                  <Ionicons name="arrow-forward" size={Math.max(13, bannerW * 0.024)} color="#FFFFFF" style={{ marginLeft: bannerW * 0.012 }} />
                </TouchableOpacity>
              );
            })()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
