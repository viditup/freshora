import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Img from './Img';
import D from '../designImages';
import B, { RATIO } from '../bannerImages';
import { C, FONT } from '../theme';
import { useDesign } from '../scale';

// PART 26 (chunk 6): Stay Updated, Get Our App and footer in the DESIGN proportions (see ../scale.js: 1048 units = screen width).
// Replaces the old fixed-dp versions in HomeLower.js (those are now unused). Same behaviour as before:
// newsletter validates the email locally (nothing is sent), store buttons / social icons show "Coming soon", footer links open pages.
const SLATE = '#5B6478';   // bluish grey used for the design's small texts

// Stay Updated: the whole card is a picture (src/assets/banners/stay.png). The REAL email input and the REAL Subscribe button sit exactly
// on top of the picture's email box and Subscribe pill (positions as % of the picture), so it works and nothing looks doubled.
// Newsletter still validates the email locally (nothing is sent).
const BOX = { left: '3.77%', top: '63.1%', width: '53.3%', height: '26.2%' };   // email box in the picture
const BTN = { left: '58.5%', top: '63.5%', width: '21.4%', height: '25.8%' };   // Subscribe pill in the picture

// WIDTH CONTROL: SIDE_STAY = empty space on the left and right in design units (1048 = full screen). 0 = edge to edge, 15 = small gap.
const SIDE_STAY = 15;
export const StayUpdated = ({ notify }) => {
  const { u, f } = useDesign();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = () => {
    if (done) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { notify('Enter a valid email address', 'error'); return; }
    setDone(true); setEmail(''); notify('Thanks for subscribing!');
  };
  return (
    <View style={{ width: Math.round(u(1048 - 2 * SIDE_STAY)), height: Math.round(u(1048 - 2 * SIDE_STAY) / RATIO.stay), alignSelf: 'center', marginTop: u(36) }}>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
        <Img source={B.stay} fit="cover" style={{ width: '100%', height: '100%' }} />
      </View>
      {done ? (
        <View style={{ position: 'absolute', ...BOX, backgroundColor: '#fff', borderRadius: u(14), flexDirection: 'row', alignItems: 'center', paddingHorizontal: u(34) }}>
          <Ionicons name="checkmark-circle" size={f(26, 14)} color={C.green} />
          <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={{ color: C.dark2, fontFamily: FONT.heading, fontSize: f(20, 10), marginLeft: u(10) }}>You're subscribed</Text>
        </View>
      ) : (
        <TextInput value={email} onChangeText={setEmail} placeholder="Enter your email address" placeholderTextColor="#9AA5A0"
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} onSubmitEditing={submit} returnKeyType="send"
          style={{ position: 'absolute', ...BOX, backgroundColor: '#fff', borderRadius: u(14), paddingHorizontal: u(42), paddingVertical: 0, textAlignVertical: 'center', color: C.text, fontSize: f(20, 10), fontFamily: FONT.body }} />
      )}
      <TouchableOpacity activeOpacity={0.85} onPress={submit} accessibilityLabel="Subscribe" hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={{ position: 'absolute', ...BTN }} />
    </View>
  );
};

// white store button with thin border (design). The Play logo is one colour here (the icon font cannot draw the 4-colour logo).
const Store = ({ icon, color, small, big, onPress }) => {
  const { u, f } = useDesign();
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityLabel={`${small} ${big}`}
      style={{ width: u(292), height: Math.max(36, u(88)), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E3E7EE', borderRadius: u(16) }}>
      <Ionicons name={icon} size={f(38, 19)} color={color} />
      <View style={{ marginLeft: u(10) }}>
        <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ color: '#2B3040', fontSize: f(12, 6.5), fontFamily: FONT.bodySemi }}>{small}</Text>
        <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ color: '#1A1F2B', fontSize: f(20, 9.5), fontFamily: FONT.heading, marginTop: -1 }}>{big}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const GetOurApp = ({ onPress }) => {
  const { u, f } = useDesign();
  return (
    <View style={{ marginTop: u(16), marginHorizontal: u(44), height: u(330) }}>
      {/* phone picture bottom right, cut off by the divider line like the design */}
      <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, width: u(330), height: u(322), overflow: 'hidden' }}>
        <Img source={D.app_phone_mockup} fit="contain" style={{ width: '100%', height: u(322) }} />
        {/* PART 28: the picture has a white background; fade its edges into the page colour so no white box shows */}
        <LinearGradient colors={[C.bg, `${C.bg}00`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '10%' }} />
        <LinearGradient colors={[`${C.bg}00`, C.bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '8%' }} />
        <LinearGradient colors={[C.bg, `${C.bg}00`]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '8%' }} />
      </View>
      <View style={{ paddingTop: u(30), paddingLeft: u(4) }}>
        <Text maxFontSizeMultiplier={1.05} style={{ fontSize: f(30, 13), lineHeight: f(40, 17), fontFamily: FONT.headingBold, color: '#14171F' }}>Get Our App</Text>
        <Text maxFontSizeMultiplier={1} numberOfLines={2} style={{ width: u(540), fontSize: f(19, 9), lineHeight: f(25, 11.5), fontFamily: FONT.body, color: SLATE, marginTop: u(6) }}>
          Shop faster, track orders and get exclusive app-only offers.
        </Text>
        <View style={{ flexDirection: 'row', marginTop: u(26) }}>
          <Store icon="logo-google-playstore" color="#2BA24C" small="GET IT ON" big="Google Play" onPress={onPress} />
          <View style={{ width: u(14) }} />
          <Store icon="logo-apple" color="#111" small="Download on the" big="App Store" onPress={onPress} />
        </View>
      </View>
    </View>
  );
};

const LINKS = [['About Us', 'about'], ['Help & Support', 'help'], ['Terms & Conditions', 'terms'], ['Privacy Policy', 'privacy']];

export const HomeFooter = ({ onLink, onSocial }) => {
  const { u, f } = useDesign();
  const circle = Math.max(30, u(60));
  const isz = Math.round(circle * 0.42);
  const social = [
    { fa: 'facebook-f', label: 'Facebook' }, { ion: 'logo-instagram', label: 'Instagram' },
    { fa: 'youtube', label: 'YouTube' }, { fa: 'linkedin-in', label: 'LinkedIn' },
  ];
  return (
    <View style={{ backgroundColor: '#F8FAF7', paddingBottom: u(40) }}>
      <View style={{ height: 1, backgroundColor: '#E6EAE6', marginHorizontal: u(44) }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: u(26), paddingHorizontal: u(30) }}>
        {LINKS.map(([t, page], i) => (
          <View key={page} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {i > 0 && <Text maxFontSizeMultiplier={1} style={{ color: '#B8BECB', fontSize: f(19, 9.5), marginHorizontal: u(18) }}>|</Text>}
            <TouchableOpacity onPress={() => onLink(page)} accessibilityLabel={t} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
              <Text maxFontSizeMultiplier={1} style={{ color: SLATE, fontSize: f(19, 9), fontFamily: FONT.body }}>{t}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: u(26) }}>
        {social.map((s, i) => (
          <TouchableOpacity key={s.label} onPress={() => onSocial && onSocial(s.label)} accessibilityLabel={s.label}
            style={{ width: circle, height: circle, borderRadius: circle / 2, backgroundColor: '#EDEFF4', alignItems: 'center', justifyContent: 'center', marginLeft: i ? u(38) : 0 }}>
            {s.fa ? <FontAwesome5 brand name={s.fa} size={isz} color="#2B3350" /> : <Ionicons name={s.ion} size={Math.round(isz * 1.15)} color="#2B3350" />}
          </TouchableOpacity>
        ))}
      </View>
      <Text maxFontSizeMultiplier={1} style={{ textAlign: 'center', marginTop: u(26), color: SLATE, fontSize: f(18, 8.5), fontFamily: FONT.body }}>© {new Date().getFullYear()}. All rights reserved.</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: u(10) }}>
        <Text maxFontSizeMultiplier={1} style={{ color: SLATE, fontSize: f(18, 8.5), fontFamily: FONT.body }}>A healthier you, a brighter tomorrow. </Text>
        <Ionicons name="heart-outline" size={f(20, 10)} color={SLATE} />
      </View>
    </View>
  );
};
