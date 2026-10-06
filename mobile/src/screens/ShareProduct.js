import React from 'react';
import { Share, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FS, R, S, T, shadow, FONT } from '../theme';

// PART 7: share sheet screen. It only uses React Native's built-in Share API,
// so it needs no extra package. Tapping a channel opens the device share sheet
// (which lists WhatsApp / Message / Email) with the message ready to send.
const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366', hint: 'Chats and groups' },
  { key: 'message', label: 'Message', icon: 'chatbubble-ellipses-outline', color: '#0A84FF', hint: 'SMS / iMessage' },
  { key: 'email', label: 'Email', icon: 'mail-outline', color: '#D44638', hint: 'Subject added for you' },
  { key: 'more', label: 'More apps', icon: 'ellipsis-horizontal', color: C.dark, hint: 'Anything installed' },
];

export default function ShareProduct({ route }) {
  const { name = 'this product', text = '', app } = route.params || {};

  const send = async (channel) => {
    try {
      await Share.share({ message: text, title: channel === 'email' ? `${name} on Freshora` : name });
    } catch (e) {
      // The user dismissed the sheet, or the device has no share targets.
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: S.lg }}>
      <View style={{ backgroundColor: C.card, borderRadius: R, padding: S.lg, ...shadow }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="share-social" size={18} color={C.green} />
          <Text style={{ marginLeft: S.sm, fontFamily: FONT.headingBold, color: C.text }}>Share {name}</Text>
        </View>
        <Text style={{ color: C.text, marginTop: S.md, lineHeight: 21 }}>{text}</Text>
        <Text style={[T.caption, { marginTop: S.md }]}>This is exactly the message that will be sent.</Text>
      </View>

      <Text style={[T.h3, { marginTop: S.xl, marginBottom: S.md }]}>Send it via</Text>
      {CHANNELS.map((c) => (
        <TouchableOpacity key={c.key} onPress={() => send(c.key)} activeOpacity={0.85} accessibilityLabel={`Share via ${c.label}`}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.key === app ? C.light : C.card, borderRadius: R, padding: S.md, marginBottom: S.sm, ...shadow }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={c.icon} size={20} color={c.color} />
          </View>
          <View style={{ flex: 1, marginLeft: S.md }}>
            <Text style={{ fontFamily: FONT.heading, color: C.text }}>{c.label}</Text>
            <Text style={T.caption}>{c.hint}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={() => send('more')} activeOpacity={0.85}
        style={{ height: 50, borderRadius: R, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: S.md }}>
        <Text style={{ color: '#fff', fontFamily: FONT.headingBold }}>Open share sheet</Text>
      </TouchableOpacity>

      <Text style={{ color: C.muted, fontSize: FS.sm, marginTop: S.md, lineHeight: 18 }}>
        Your device's share sheet opens next — pick WhatsApp, Message, Email or any other app there.
      </Text>
    </View>
  );
}
