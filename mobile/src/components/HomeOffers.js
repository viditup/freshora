import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Img from './Img';
import B, { RATIO } from '../bannerImages';
import { FONT } from '../theme';
import { useDesign } from '../scale';

// The "10 Minutes" strip and the 3 "Offers for You" cards are now ready-made pictures (src/assets/banners).
// Each picture keeps its own shape (aspectRatio = picture width / height), so nothing is stretched or cut.

// "Get your essentials in 10 Minutes": FULL WIDTH picture with a live white "Order Now" button on the right.
// WIDTH CONTROL: SIDE_10MIN = empty space on the left and right in design units (1048 = full screen). 0 = full width; e.g. 37 = small side gap.
const SIDE_10MIN = 15;
export const QuickDeliveryStrip = ({ onPress }) => {
  const { u, f } = useDesign();
  const w = Math.round(u(1048 - 2 * SIDE_10MIN));
  const h = Math.round(w / RATIO.quick10);
  // "Order Now" button: size / position (design units). Smaller = lower PILL_H. Further right = lower PILL_RIGHT. Further down = higher PILL_DOWN.
  const PILL_H = 48, PILL_RIGHT = 20, PILL_DOWN = 16;
  const pillH = Math.max(22, u(PILL_H));
  return (
    <View style={{ width: w, height: h, alignSelf: 'center' }}>
      <Img source={B.quick10} fit="cover" style={{ width: '100%', height: '100%' }} />
      {/* only this "Order Now" button is tappable */}
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} accessibilityRole="button" accessibilityLabel="Order now" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ position: 'absolute', right: u(PILL_RIGHT), top: (h - pillH) / 2 + u(PILL_DOWN), height: pillH, paddingHorizontal: u(24), borderRadius: pillH / 2, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' }}>
        <Text maxFontSizeMultiplier={1} style={{ color: '#C41A2E', fontFamily: FONT.heading, fontSize: f(18, 9) }}>Order Now</Text>
        <Ionicons name="arrow-forward" size={f(20, 10)} color="#C41A2E" style={{ marginLeft: u(8) }} />
      </TouchableOpacity>
    </View>
  );
};

// "Offers for You": 3 cards. The whole card is tappable AND the round ">" arrow (top right of each picture) has its own
// transparent button on top of it, so the arrow works exactly as before.
// Arrow position inside the pictures: about 79%-98% from the left, 3%-29% from the top.
export const OffersForYou = ({ onDeals, onShop, onHealthy }) => {
  const { u } = useDesign();
  const cw = Math.floor(u(309));
  const cards = [
    { t: 'Fresh Deals Everyday, up to 40% off', art: B.offer_fresh, onPress: onDeals },
    { t: 'Top Brands Lower Prices, great savings', art: B.offer_brands, onPress: onShop },
    { t: 'Healthy Choices Happier You, up to 30% off', art: B.offer_healthy, onPress: onHealthy },
  ];
  return (
    <View style={{ flexDirection: 'row', paddingLeft: u(38) }}>
      {cards.map((c, i) => (
        <View key={c.t} style={{ width: cw, aspectRatio: RATIO.offer_fresh, marginLeft: i ? u(23) : 0 }}>
          <TouchableOpacity activeOpacity={0.9} onPress={c.onPress} accessibilityLabel={c.t} style={{ width: '100%', height: '100%' }}>
            <Img source={c.art} fit="cover" style={{ width: '100%', height: '100%' }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={c.onPress} accessibilityLabel={`Open ${c.t}`} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={{ position: 'absolute', left: '79%', top: '3%', width: '19%', height: '26%' }} />
        </View>
      ))}
    </View>
  );
};
