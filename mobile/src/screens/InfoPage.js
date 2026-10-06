import React from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import Btn from '../components/Btn';
import { COMPANY_ADDRESS, SUPPORT_EMAIL, SUPPORT_PHONE } from '../config';
import { FOOTER_NOTE, PAGES } from '../content/legal';
import { C, FONT, R, shadow } from '../theme';

// F1: one screen for About Us / Contact / Privacy Policy / Terms (route.params.page).
const Row = ({ icon, label, value, onPress }) => (
  <TouchableOpacity activeOpacity={onPress ? 0.7 : 1} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
    <Ionicons name={icon} size={20} color={C.green} />
    <View style={{ marginLeft: 12, flex: 1 }}>
      <Text style={{ fontSize: 11, color: C.muted, fontFamily: FONT.bodyMedium }}>{label}</Text>
      <Text style={{ fontSize: 14, color: onPress ? C.green : C.text, fontFamily: FONT.bodySemi }}>{value}</Text>
    </View>
  </TouchableOpacity>
);

export default function InfoPage({ route }) {
  const key = route.params?.page;
  const page = PAGES[key] || PAGES.about;
  const { notify } = useCart();
  const open = (url) => Linking.openURL(url).catch(() => notify('Could not open this link', 'error'));
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ fontSize: 26, fontFamily: FONT.headingBold, color: C.dark, marginBottom: 12 }}>{page.title}</Text>
      {page.sections.map((s) => (
        <View key={s.h} style={{ backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 12, ...shadow }}>
          <Text style={{ fontSize: 15, fontFamily: FONT.headingBold, color: C.text }}>{s.h}</Text>
          <Text style={{ fontSize: 13.5, lineHeight: 20, color: C.muted, marginTop: 6 }}>{s.p}</Text>
        </View>
      ))}
      {key === 'contact' && (
        <View style={{ backgroundColor: C.card, borderRadius: R, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12, ...shadow }}>
          <Row icon="mail-outline" label="E-mail" value={SUPPORT_EMAIL} onPress={() => open(`mailto:${SUPPORT_EMAIL}?subject=Freshora%20support`)} />
          <Row icon="call-outline" label="Phone" value={SUPPORT_PHONE} onPress={() => open(`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`)} />
          <Row icon="location-outline" label="Address" value={COMPANY_ADDRESS} />
        </View>
      )}
      {key === 'contact' && <Btn title="Write to us" onPress={() => open(`mailto:${SUPPORT_EMAIL}?subject=Freshora%20support`)} />}
      <Text style={{ textAlign: 'center', color: C.muted, fontSize: 11.5, marginTop: 20 }}>{FOOTER_NOTE}</Text>
    </ScrollView>
  );
}
