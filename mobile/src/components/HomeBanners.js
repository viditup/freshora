import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Img from './Img';
import B, { RATIO } from '../bannerImages';
import { useDesign } from '../scale';

// Home promo banners are ready-made pictures (assets/banners), shown FULL WIDTH: exactly as wide as the screen
// (1048 design units, see ../scale.js), no side margin, height = width / picture ratio, so nothing is stretched or cut.
// ONLY THE BUTTON is tappable: a transparent button sits exactly on top of the picture's button
// (BTN = [left, top, width, height] as fractions of the picture).
// WIDTH CONTROL: SIDE = empty space on the LEFT and on the RIGHT, in design units (1048 = full screen width).
// 0 = edge to edge, 15 = small gap. To make a banner narrower change its number, e.g. kitchen: 37 -> small side gap, centred, height follows automatically.
const SIDE = { kitchen: 15, fresh: 15, green: 15, festival: 15, membership: 15 };
const W = (u, v) => Math.round(u(1048 - 2 * (SIDE[v] || 0)));
const H = (u, v, ratio) => Math.round(W(u, v) / ratio);
const BTN = {
  kitchen:    [0.0596, 0.7162, 0.1792, 0.1419],   // Shop Now
  fresh:      [0.0477, 0.7222, 0.2015, 0.2018],   // Shop Now
  green:      [0.1600, 0.6192, 0.1815, 0.2385],   // Learn More
  festival:   [0.0438, 0.6963, 0.2785, 0.1748],   // Shop Festival Store
  membership: [0.1538, 0.4309, 0.2108, 0.1521],   // Join Now
};
const pct = (v) => `${(v * 100).toFixed(2)}%`;

const Banner = ({ variant, src, label, onPress }) => {
  const { u } = useDesign();
  const b = BTN[variant];
  return (
    <View style={{ width: W(u, variant), height: H(u, variant, RATIO[variant]), marginTop: u(36), alignSelf: 'center' }}>
      <Img source={src} fit="cover" style={{ width: '100%', height: '100%' }} />
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ position: 'absolute', left: pct(b[0]), top: pct(b[1]), width: pct(b[2]), height: pct(b[3]) }} />
    </View>
  );
};

// variant = kitchen | festival | green | fresh. The picture is ALWAYS B[variant] (assets/banners/<variant>.png).
// An old `art` prop (the text-less pictures an older Home.js still passes) is deliberately IGNORED, otherwise the left side shows empty.
export const PromoBanner = ({ variant = 'kitchen', title, onPress }) => (
  <Banner variant={variant} src={B[variant]} label={String(title || variant).replace(/\n/g, ' ')} onPress={onPress} />
);

// "Join Our Membership" picture: the "Join Now" button is the tap target.
export const MembershipBanner = ({ onPress }) => (
  <Banner variant="membership" src={B.membership} label="Join Now" onPress={onPress} />
);
