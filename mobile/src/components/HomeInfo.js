import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { C, FONT } from '../theme';
import { useDesign } from '../scale';

// PART 25: "Why Shop With Us?" and "What Our Customers Say" in the design proportions (see ../scale.js).
const Head = ({ title, onAll }) => {
  const { u, f } = useDesign();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: u(42), marginBottom: u(22) }}>
      <Text maxFontSizeMultiplier={1.1} style={{ fontSize: f(32, 14), fontFamily: FONT.headingBold, color: C.text }}>{title}</Text>
      {onAll && (
        <TouchableOpacity onPress={onAll} accessibilityLabel={`See all ${title}`} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text maxFontSizeMultiplier={1.1} style={{ color: C.green, fontFamily: FONT.heading, fontSize: f(28, 12) }}>See All</Text>
          <Ionicons name="arrow-forward" size={f(30, 13)} color={C.green} style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// design: ONE row of 4, round icon + 2-line title side by side, grey description (3 lines) underneath. No box around it.
const WHY = [
  { mc: 'truck-delivery-outline', t: '10 Min\nDelivery', s: 'Fast & reliable delivery to your doorstep.' },
  { mc: 'shield-check-outline', t: 'Quality\nAssured', s: 'Freshness and quality, always checked.' },
  { ion: 'card-outline', t: 'Secure\nPayments', s: 'Multiple safe payment options.' },
  { ion: 'headset-outline', t: '24/7\nSupport', s: "We're always here to help you." },
];
export const WhyShopWithUs = () => {
  const { u, f } = useDesign();
  const circle = Math.max(30, u(78));
  const isz = Math.round(circle * 0.52);
  return (
    <View style={{ marginTop: u(36) }}>
      <Head title="Why Shop With Us?" />
      <View style={{ flexDirection: 'row', paddingLeft: u(40), paddingRight: u(20) }}>
        {WHY.map((w) => (
          <View key={w.s} style={{ flex: 1, paddingRight: u(14) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: circle, height: circle, borderRadius: circle / 2, backgroundColor: '#E4F3E2', alignItems: 'center', justifyContent: 'center' }}>
                {w.mc ? <MaterialCommunityIcons name={w.mc} size={isz} color={C.green} /> : <Ionicons name={w.ion} size={isz} color={C.green} />}
              </View>
              <Text maxFontSizeMultiplier={1} adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={2} style={{ flex: 1, marginLeft: u(8), fontSize: f(19, 9), lineHeight: f(24, 11), fontFamily: FONT.headingBold, color: C.text }}>{w.t}</Text>
            </View>
            <Text maxFontSizeMultiplier={1} numberOfLines={4} style={{ marginTop: u(14), fontSize: f(17, 8.5), lineHeight: f(23, 11), fontFamily: FONT.body, color: '#7B8A95' }}>{w.s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// design: 3 soft-green cards in ONE row (no sideways scroll): avatar + name + 5 gold stars, then the quote.
const REVIEWS = [
  { n: 'Priya S.', q: '"Super fast delivery and fresh products! Highly recommended!"' },
  { n: 'Rahul K.', q: '"Great quality and amazing offers. My go-to app for groceries."' },
  { n: 'Neha M.', q: '"Very convenient and reliable service. Freshness is top-notch!"' },
];
export const Testimonials = ({ onAll }) => {
  const { u, f } = useDesign();
  const cw = Math.floor(u(312));
  const av = Math.max(26, u(70));
  const star = Math.max(9, u(21));
  return (
    <View style={{ marginTop: u(36) }}>
      <Head title="What Our Customers Say" onAll={onAll} />
      <View style={{ flexDirection: 'row', paddingLeft: u(40) }}>
        {REVIEWS.map((r, i) => (
          <View key={r.n} style={{ width: cw, minHeight: u(240), marginLeft: i ? u(17) : 0, backgroundColor: '#EDF5E8', borderRadius: u(24), padding: u(22) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: av, height: av, borderRadius: av / 2, backgroundColor: '#D4E8CC', alignItems: 'center', justifyContent: 'center' }}>
                <Text maxFontSizeMultiplier={1} style={{ color: C.green, fontFamily: FONT.headingBold, fontSize: f(28, 11) }}>{r.n[0]}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: u(12) }}>
                <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.heading, color: C.text, fontSize: f(19, 9.5) }}>{r.n}</Text>
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  {[1, 2, 3, 4, 5].map((k) => <Ionicons key={k} name="star" size={star} color="#F5B301" />)}
                </View>
              </View>
            </View>
            <Text maxFontSizeMultiplier={1} numberOfLines={5} style={{ marginTop: u(18), color: C.text, fontSize: f(19, 9.5), lineHeight: f(26, 12.5), fontFamily: FONT.body, opacity: 0.9 }}>{r.q}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
