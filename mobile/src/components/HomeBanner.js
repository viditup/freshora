import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Img from './Img';
import { C, FONT } from '../theme';
import D from '../designImages';

// Backend seed banners use placehold.co text images; for those (or a missing image) the bundled design photo is used (no internet needed).
const HERO_DARK = '#072B1C'; // measured from the design headline
export const bannerImage = (u) => (!u || /placehold\.co/i.test(u) ? null : u);

// PART 17: every size is a fraction of the banner's own width, measured from the design (banner = 974 design units wide, 575 tall).
// So the card has the design's shape (height = 59% of width), the same text size relative to the card, and the same art position on any phone.
// Height is still only a MINIMUM: if a phone shows text bigger than expected the card grows instead of clipping.
export default function HomeBanner({ banner: b, width, onPress, forceDesign }) {
  const k = width / 974;
  const u = (n) => Math.round(n * k * 10) / 10;
  const f = (n, min) => Math.max(min, u(n));
  const h = Math.round(u(575));
  const real = forceDesign ? null : bannerImage(b.image); // forceDesign (Home): always the design artwork + headline
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={() => onPress && onPress(b)} accessibilityLabel={b.title}
      style={{ width, minHeight: h, borderRadius: u(40), overflow: 'hidden' }}>
      <LinearGradient colors={['#F1F8E8', '#DCEFCB']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: u(722), overflow: 'hidden' }}>
        {real
          ? <Img uri={real} emoji="🥗" style={{ width: '100%', height: '100%' }} />
          : <Img source={D.hero_home_bag} style={{ width: '100%', height: '100%' }} />}
        {/* PART 31: hero_home_bag.jpg now has a 100px plain-background strip on its left (with a mirrored leaf), so only that strip is faded - the lettuce/broccoli stay sharp. */}
        <LinearGradient pointerEvents="none" colors={['#EBF6E0', 'rgba(235,246,224,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '9%' }} />
      </View>
      <View style={{ minHeight: h, paddingLeft: u(40), paddingRight: u(580), paddingTop: u(46), paddingBottom: u(40) }}>
        {real ? (
          <Text maxFontSizeMultiplier={1} numberOfLines={4} style={{ color: C.dark2, fontSize: f(52, 16), lineHeight: f(58, 19), fontFamily: FONT.headingBold }}>{b.title}</Text>
        ) : (
          // explicit line breaks = the 4 lines of the design: Freshness / at your / doorstep / in minutes.
          <Text maxFontSizeMultiplier={1} style={{ color: HERO_DARK, fontSize: f(61, 18), lineHeight: f(65.5, 21), fontFamily: FONT.headingBold }}>
            {'Freshness\nat your\n'}<Text style={{ color: '#62A82F' }}>doorstep</Text>{'\nin minutes.'}
          </Text>
        )}
        <Text maxFontSizeMultiplier={1} style={{ color: '#44524B', fontSize: f(21.5, 9), lineHeight: f(28.5, 12), marginTop: u(16), fontFamily: FONT.body }}>
          {/* PART 31: the design's exact 3 lines */}
          {real && b.subtitle ? b.subtitle : 'Groceries, daily essentials\nand more \u2014 delivered fresh\nand fast.'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.dark2, height: Math.max(26, u(66)), paddingHorizontal: u(46), borderRadius: 40, marginTop: u(30) }}>
          <Text maxFontSizeMultiplier={1} style={{ color: '#fff', fontFamily: FONT.bodyMedium, fontSize: f(25, 11) }}>Shop Now</Text>
          <Ionicons name="arrow-forward" size={f(27, 12)} color="#fff" style={{ marginLeft: u(14) }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
