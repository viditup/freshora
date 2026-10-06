import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Img from './Img';
import D from '../designImages';
import { C, FONT } from '../theme';

// PART 3C: lower Home sections from the Freshora PDF. All UI-only: no backend, coupon, membership or payment logic.
const SIDE = 16;
const GAP = 12;

const Title = ({ children, sub }) => (
  <View style={{ paddingHorizontal: SIDE, marginBottom: 12 }}>
    <Text style={{ fontSize: 20, fontFamily: FONT.headingBold, color: C.text }}>{children}</Text>
    {!!sub && <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</Text>}
  </View>
);

const Cta = ({ label, onPress, bg = C.green, fg = '#fff' }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityLabel={label}
    style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: bg, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginTop: 10 }}>
    <Text style={{ color: fg, fontFamily: FONT.headingBold, fontSize: 12.5 }}>{label}</Text>
    <Ionicons name="arrow-forward" size={13} color={fg} style={{ marginLeft: 5 }} />
  </TouchableOpacity>
);

// Generic rounded promo card: text + CTA left, emoji right.
export const PromoBanner = ({ title, sub, emoji, art, bg, border, fg, cta, ctaBg, onPress, eyebrow }) => (
  <View style={{ marginHorizontal: SIDE, marginTop: 24, borderRadius: 20, backgroundColor: bg, borderWidth: 1, borderColor: border, padding: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
    <View style={{ flex: 1, paddingRight: 8 }}>
      {!!eyebrow && <Text style={{ color: fg, fontSize: 11, fontFamily: FONT.heading, letterSpacing: 0.6, opacity: 0.8, marginBottom: 2 }}>{eyebrow}</Text>}
      <Text numberOfLines={2} style={{ color: fg, fontSize: 18, fontFamily: FONT.headingBold, lineHeight: 23 }}>{title}</Text>
      {!!sub && <Text numberOfLines={2} style={{ color: fg, fontSize: 12.5, marginTop: 4, opacity: 0.85 }}>{sub}</Text>}
      <Cta label={cta} onPress={onPress} bg={ctaBg} />
    </View>
    {art
      ? <Img source={art} style={{ width: 128, height: 110, borderRadius: 16 }} />
      : <Text style={{ fontSize: 56 }}>{emoji}</Text>}
  </View>
);

// PDF "Join Our Membership" banner (UI only).
export const MembershipBanner = ({ onPress }) => (
  <View style={{ marginHorizontal: SIDE, marginTop: 24, borderRadius: 20, backgroundColor: '#FFF3CF', borderWidth: 1, borderColor: '#F5E2A0', padding: 16, overflow: 'hidden' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: '#7A5200', fontSize: 11, fontFamily: FONT.heading, letterSpacing: 0.6 }}>FRESHORA MEMBERSHIP</Text>
        <Text style={{ color: '#5C3D00', fontSize: 19, fontFamily: FONT.headingBold, lineHeight: 24, marginTop: 2 }}>Join Our Membership</Text>
        <Text style={{ color: '#7A5200', fontSize: 12.5, marginTop: 4 }}>Unlock member-only deals and free delivery perks.</Text>
      </View>
      <Img source={D.banner_membership_art} style={{ width: 96, height: 120, borderRadius: 16 }} />
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
      {['Free delivery', 'Extra savings', 'Early access'].map((t) => (
        <View key={t} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFFB3', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, marginRight: 6, marginTop: 4 }}>
          <Ionicons name="checkmark-circle" size={13} color={C.green} />
          <Text style={{ color: '#5C3D00', fontSize: 11.5, fontFamily: FONT.bodySemi, marginLeft: 4 }}>{t}</Text>
        </View>
      ))}
    </View>
    <Cta label="Join Now" onPress={onPress} bg={C.dark} />
  </View>
);

// PDF "Why Shop With Us?" 2x2 benefit grid.
const WHY = [
  { icon: 'basket-outline', t: 'Wide Range', s: 'Everything you need, one app' },
  { icon: 'shield-checkmark-outline', t: 'Quality Assured', s: 'Fresh, checked products' },
  { icon: 'card-outline', t: 'Secure Payments', s: 'Safe & easy checkout' },
  { icon: 'headset-outline', t: '24/7 Support', s: 'Always here to help' },
];
export const WhyShopWithUs = () => (
  <View style={{ marginTop: 28 }}>
    <Title>Why Shop With Us?</Title>
    <View style={{ flexDirection: 'row', marginHorizontal: SIDE, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#E8EFE1', paddingVertical: 14, paddingHorizontal: 4 }}>
      {WHY.map((w) => (
        <View key={w.t} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 3 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={w.icon} size={22} color={C.green} />
          </View>
          <Text numberOfLines={2} style={{ fontSize: 12, fontFamily: FONT.headingBold, color: C.text, textAlign: 'center', marginTop: 8 }}>{w.t}</Text>
          <Text numberOfLines={3} style={{ fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 2, fontFamily: FONT.body }}>{w.s}</Text>
        </View>
      ))}
    </View>
  </View>
);

// PDF "What Our Customers Say": static demo testimonials.
const REVIEWS = [
  { n: 'Priya S.', r: 5, q: 'Fresh fruits and vegetables, delivered right on time. My go-to grocery app now.' },
  { n: 'Rahul K.', r: 5, q: 'Prices are fair and the quality is consistently good. Ordering is quick and easy.' },
  { n: 'Neha M.', r: 4, q: 'Great range of daily essentials. Packaging is neat and the delivery is smooth.' },
];
export const Testimonials = () => {
  const { width } = useWindowDimensions();
  const w = Math.round(Math.min(300, width * 0.78));
  return (
    <View style={{ marginTop: 28 }}>
      <Title>What Our Customers Say</Title>
      <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={w + GAP} contentContainerStyle={{ paddingHorizontal: SIDE }}>
        {REVIEWS.map((r) => (
          <View key={r.n} style={{ width: w, marginRight: GAP, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#E8EFE1', padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.green, fontFamily: FONT.headingBold, fontSize: 15 }}>{r.n[0]}</Text>
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: 13.5 }}>{r.n}</Text>
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => <Ionicons key={i} name={i <= r.r ? 'star' : 'star-outline'} size={12} color={C.amber} />)}
                </View>
              </View>
            </View>
            <Text numberOfLines={4} style={{ color: C.text, fontSize: 12.5, lineHeight: 18, marginTop: 10, opacity: 0.85 }}>{r.q}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// PDF "Stay Updated" newsletter box. UI only: validates the email locally, nothing is sent anywhere.
export const StayUpdated = ({ notify }) => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { notify('Enter a valid email address', 'error'); return; }
    setDone(true); setEmail(''); notify('Thanks for subscribing!');
  };
  return (
    <View style={{ marginHorizontal: SIDE, marginTop: 28, borderRadius: 20, backgroundColor: C.tint, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: FONT.headingBold, color: C.dark }}>Stay Updated</Text>
          <Text style={{ fontSize: 12.5, color: C.dark, opacity: 0.8, marginTop: 3 }}>Get fresh deals and offers straight to your inbox.</Text>
        </View>
        <Img source={D.banner_newsletter_art} style={{ width: 96, height: 57, borderRadius: 12, marginLeft: 8 }} />
      </View>
      {done ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Ionicons name="checkmark-circle" size={18} color={C.green} />
          <Text style={{ color: C.dark, fontFamily: FONT.heading, marginLeft: 6 }}>You're subscribed</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <TextInput value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor={C.muted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            onSubmitEditing={submit} returnKeyType="send"
            style={{ flex: 1, height: 44, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, color: C.text, fontSize: 14 }} />
          <TouchableOpacity activeOpacity={0.85} onPress={submit} accessibilityLabel="Subscribe"
            style={{ height: 44, marginLeft: 8, paddingHorizontal: 16, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontFamily: FONT.headingBold, fontSize: 13 }}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// PDF "Get Our App": decorative store buttons (no real links).
const Store = ({ icon, small, big, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityLabel={`${small} ${big}`}
    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, marginTop: 6 }}>
    <Ionicons name={icon} size={20} color="#fff" />
    <View style={{ marginLeft: 6 }}>
      <Text style={{ color: '#fff', fontSize: 8.5, opacity: 0.85 }}>{small}</Text>
      <Text style={{ color: '#fff', fontSize: 12.5, fontFamily: FONT.heading, marginTop: -1 }}>{big}</Text>
    </View>
  </TouchableOpacity>
);
export const GetOurApp = ({ onPress }) => (
  <View style={{ marginHorizontal: SIDE, marginTop: 24, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: '#E3ECDB', padding: 16, flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, fontFamily: FONT.headingBold, color: C.text }}>Get Our App</Text>
      <Text style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>Fresh groceries, faster. Shop anytime, anywhere.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
        <Store icon="logo-google-playstore" small="GET IT ON" big="Google Play" onPress={onPress} />
        <Store icon="logo-apple" small="Download on the" big="App Store" onPress={onPress} />
      </View>
    </View>
    <Img source={D.app_phone_mockup} fit="contain" style={{ width: 110, height: 80, marginLeft: 6 }} />
  </View>
);

// PDF footer: brand, quick links (open InfoPage), copyright.
export const HomeFooter = ({ onLink }) => (
  <View style={{ marginTop: 28, backgroundColor: '#EEF6E8', borderTopWidth: 1, borderTopColor: '#E3ECDB', paddingHorizontal: SIDE, paddingTop: 20, paddingBottom: 24, alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontFamily: FONT.headingBold, color: C.green }}>freshora</Text>
    <Text style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginTop: 2 }}>EVERYDAY ESSENTIALS, IN MINUTES</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
      {[['About Us', 'about'], ['Contact', 'contact'], ['Privacy Policy', 'privacy'], ['Terms', 'terms']].map(([t, page]) => (
        <TouchableOpacity key={t} onPress={() => onLink(page)} accessibilityLabel={t} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: C.dark, fontSize: 12.5, fontFamily: FONT.bodySemi }}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <Text style={{ fontSize: 20, fontFamily: FONT.script, color: C.green, marginTop: 12 }}>Good Food, Happier You</Text>
    <Text style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>© {new Date().getFullYear()} Freshora. All rights reserved.</Text>
  </View>
);
