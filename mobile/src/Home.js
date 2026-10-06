import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import AppHeader from '../components/AppHeader';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import HomeProductSection from '../components/HomeProducts';
import CategoryCard, { AllCategoriesTile } from '../components/CategoryCard';
import { OffersForYou, QuickDeliveryStrip } from '../components/HomeOffers';
import HomeBanner from '../components/HomeBanner';
import ReadLearn from '../components/ReadLearn';
import { findCategory, useCategorySections, useRecentlyViewed } from '../homeSections';
import { GetOurApp, HomeFooter, StayUpdated } from '../components/HomeBottom'; // PART 26: design-size versions
import { Testimonials, WhyShopWithUs } from '../components/HomeInfo'; // PART 25: design-size versions
import { MembershipBanner, PromoBanner } from '../components/HomeBanners'; // banners are now pictures (src/assets/banners)
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from '../theme';
import { useDesign } from '../scale';

// PART 17: heading sizes / gaps follow the design proportions (see ../scale.js). Same look as the product-row headings.
const Section = ({ title, onAll, children }) => {
  const { u, f } = useDesign();
  return (
    <View style={{ marginTop: u(36) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: u(42), marginBottom: u(22) }}>
        <Text maxFontSizeMultiplier={1.1} style={{ fontSize: f(32, 14), fontFamily: FONT.headingBold, color: C.text }}>{title}</Text>
        {onAll && (
          <TouchableOpacity onPress={onAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text maxFontSizeMultiplier={1.1} style={{ color: C.green, fontFamily: FONT.heading, fontSize: f(28, 12) }}>See All</Text>
            <Ionicons name="arrow-forward" size={f(30, 13)} color={C.green} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
};

export default function Home({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState(null);
  const { add, notify } = useCart();
  const { width } = useWindowDimensions();
  const { u, f } = useDesign();
  const bw = Math.round(u(974)); // design: banner = 974 of 1048 units wide
  const rows = useCategorySections(data?.categories); // PART 10 rows (hooks stay above the early returns)
  const [viewed, clearViewed] = useRecentlyViewed();

  const load = useCallback(async () => {
    try { setData((await api.get('/home')).data); setErr(null); } catch (e) { setErr(errMsg(e)); }
    setLoading(false); setRefreshing(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;
  if (err && !data) return <ErrorState message={err} onRetry={() => { setLoading(true); load(); }} />;

  const openCat = (c) => navigation.navigate('Products', { categoryId: c.id, title: c.name });
  const openProduct = (p) => navigation.navigate('ProductDetails', { id: p.id });
  const onBanner = (b) => (b.action_type === 'category'
    ? navigation.navigate('Products', { categoryId: b.action_value, title: b.title })
    : navigation.navigate('Products', { title: 'All Products' }));
  const goCategories = () => navigation.getParent()?.navigate('CategoriesTab');
  const goOffers = () => navigation.getParent()?.navigate('OffersTab');
  const organic = data.categories.find((c) => /organic/i.test(`${c.slug} ${c.name}`));
  const empty = !data.banners.length && !data.categories.length && !data.featured_products.length && !data.popular_products.length;
  // PART 5A: the design's 5 category tiles (+ All Categories). Matched by name against the seed categories; names missing in the DB are skipped.
  const homeCats = [
    [/fruit|veg/i, 'Fruits & Vegetables'], [/dairy|milk/i, 'Dairy & Breakfast'], [/snack|bever/i, 'Snacks & Beverages'],
    [/household/i, 'Household Essentials'], [/personal/i, 'Personal Care'],
  ].map(([rx, label]) => ({ cat: data.categories.find((c) => rx.test(`${c.slug} ${c.name}`)), label })).filter((x) => x.cat);
  // PART 17: design = 6 tiles, tile 135 units wide, pitch 166 units (first tile starts 40 units from the left edge).
  const catPad = Math.round(u(25));
  const catItemW = Math.floor((width - 2 * catPad) / (homeCats.length + 1));
  const catTile = Math.min(Math.round(u(135)), catItemW - 4);
  const catFs = f(22, 9.5);
  const catGap = Math.round(u(15));
  const onAdd = (p) => add(p.id);
  const soon = () => notify('Coming soon');
  const allProducts = () => navigation.navigate('Products', { title: 'All Products' });
  // PART 10
  const openRow = (key, title) => () => (rows[key]?.cat
    ? navigation.navigate('Products', { categoryId: rows[key].cat.id, title, sort: key === 'seasonal' ? 'newest' : 'popular' })
    : allProducts());
  const household = findCategory(data.categories, /household|kitchen/i);
  const goCategory = (cat, title) => () => (cat ? navigation.navigate('Products', { categoryId: cat.id, title }) : allProducts());

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader scaled />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.green} />} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 0 }}>
        {empty && <Empty icon="🌱" title="Nothing here yet" sub="Products will appear once they are added." />}
        {/* PART 19: ONE fixed hero banner exactly like the design (no swipe, no dots). Always the design artwork + headline;
            tapping it opens the first backend banner's target (or all products). */}
        <View style={{ marginTop: u(20), paddingHorizontal: Math.round(u(37)) }}>
          <HomeBanner forceDesign banner={data.banners[0] || { id: 'hero', title: 'Freshness at your doorstep in minutes.' }} width={bw} onPress={data.banners[0] ? onBanner : allProducts} />
        </View>
        {homeCats.length > 0 && (
          // PART 15: design shows all 6 tiles (5 categories + All Categories) in ONE row. Width is divided evenly, so it also fits small phones.
          <View style={{ marginTop: u(38), paddingHorizontal: catPad, flexDirection: 'row', justifyContent: 'space-between' }}>
            {homeCats.map((x) => <CategoryCard key={x.cat.id} compact category={x.cat} label={x.label} onPress={openCat} itemWidth={catItemW} tile={catTile} fs={catFs} gap={catGap} />)}
            <AllCategoriesTile onPress={goCategories} itemWidth={catItemW} tile={catTile} fs={catFs} gap={catGap} />
          </View>
        )}
        <View style={{ marginTop: u(30) }}>
          <QuickDeliveryStrip onPress={() => navigation.navigate('Products', { title: 'All Products' })} />
        </View>
        <HomeProductSection first title="Fresh Picks for You" products={data.featured_products}
          onAll={allProducts} onProduct={openProduct} onAdd={onAdd} />
        <Section title="Offers for You" onAll={goOffers}>
          <OffersForYou onDeals={goOffers}
            onShop={() => navigation.navigate('Products', { title: 'All Products' })}
            onHealthy={() => navigation.navigate('Products', organic ? { categoryId: organic.id, title: organic.name } : { title: 'All Products' })} />
        </Section>
        <HomeProductSection title="Best of Snacks & Beverages" products={rows.snacks?.items}
          onAll={openRow('snacks', rows.snacks?.cat?.name || 'Snacks')} onProduct={openProduct} onAdd={onAdd} />
        {/* PART 23: section ORDER now follows the design: Snacks > Atta > Kitchen banner > Personal Care > Membership (once) > Seasonal > Festival banner > Recently Viewed > Read & Learn > Greener */}
        <HomeProductSection title="Atta, Rice & Staples" products={rows.staples?.items}
          onAll={openRow('staples', rows.staples?.cat?.name || 'Staples')} onProduct={openProduct} onAdd={onAdd} />
        <PromoBanner variant="kitchen" title="Kitchen Essentials Made Easy" onPress={goCategory(household, household?.name || 'Kitchen Essentials')} />
        <HomeProductSection title="Personal Care Essentials" products={rows.personal?.items}
          onAll={openRow('personal', rows.personal?.cat?.name || 'Personal Care')} onProduct={openProduct} onAdd={onAdd} />
        <MembershipBanner onPress={soon} />
        <HomeProductSection title="Seasonal Specials" products={rows.seasonal?.items}
          onAll={openRow('seasonal', rows.seasonal?.cat?.name || 'Seasonal Specials')} onProduct={openProduct} onAdd={onAdd} />
        <PromoBanner variant="festival" title="Festival Essentials" onPress={allProducts} />
        <HomeProductSection title="Recently Viewed" products={viewed}
          onAll={allProducts} onProduct={openProduct} onAdd={onAdd} />
        <ReadLearn onOpen={(a) => navigation.navigate('Article', { id: a.id })} />
        <PromoBanner variant="green" title="A Greener Tomorrow"
          onPress={() => (organic ? navigation.navigate('Products', { categoryId: organic.id, title: organic.name }) : allProducts())} />
        <WhyShopWithUs />
        <Testimonials onAll={soon} />
        <PromoBanner variant="fresh" title="Fresh Choices Brighter Tomorrows" onPress={allProducts} />
        <StayUpdated notify={notify} />
        <GetOurApp onPress={soon} />
        <HomeFooter onLink={(page) => (page === 'help' ? navigation.navigate('Help') : navigation.navigate('InfoPage', { page }))} onSocial={soon} />
      </ScrollView>
    </View>
  );
}
