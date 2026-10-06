import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, FONT } from '../theme';

// Text input with a leading icon and an optional right-side element (e.g. eye toggle).
// `wrap` (new, optional) overrides the outer wrapper style (e.g. margins).
export function IconField({ icon, right, prefix, prefixNode, error, style, label, helper, wrap, ...props }) {
  return (
    <View style={[{ marginBottom: 12 }, wrap]}>
      {!!label && <Text style={{ fontFamily: FONT.bodySemi, fontSize: 13, color: C.text, marginBottom: 6, marginLeft: 2 }}>{label}</Text>}
      <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: error ? C.red : C.border, borderRadius: R, paddingHorizontal: 12, height: 52 }, style]}>
        {!!icon && <Ionicons name={icon} size={19} color={C.muted} style={{ marginRight: 10 }} />}
        {prefixNode}
        {!!prefix && <Text style={{ color: C.text, fontFamily: FONT.heading, marginRight: 8 }}>{prefix}</Text>}
        <TextInput placeholderTextColor={C.muted} {...props} style={{ flex: 1, color: C.text, fontSize: 14, fontFamily: FONT.body, paddingVertical: 0 }} />
        {right}
      </View>
      {!!error && <Text style={{ color: C.red, fontSize: 12, marginTop: 3, marginLeft: 4 }}>{error}</Text>}
      {!error && !!helper && <Text style={{ color: C.muted, fontSize: 10.5, marginTop: 4, marginLeft: 4, lineHeight: 14 }}>{helper}</Text>}
    </View>
  );
}

// Flag + dial code + chevron + divider shown inside the mobile number field (signup design).
export function PhonePrefix() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
      <Text style={{ fontSize: 16, marginRight: 6 }}>🇮🇳</Text>
      <Text style={{ color: C.text, fontFamily: FONT.bodyMedium, fontSize: 13 }}>+91</Text>
      <Ionicons name="chevron-down" size={13} color={C.muted} style={{ marginLeft: 3 }} />
      <View style={{ width: 1, height: 20, backgroundColor: C.border, marginLeft: 10 }} />
    </View>
  );
}

// Small green tag above the headline (e.g. WELCOME BACK / CREATE ACCOUNT).
export function AuthTag({ children }) {
  return <Text style={{ color: C.green, fontFamily: FONT.bodySemi, fontSize: 12, letterSpacing: 1.5, marginBottom: 6 }}>{children}</Text>;
}

// Password field with show/hide toggle.
export function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <IconField icon="lock-closed-outline" secureTextEntry={!show} autoCapitalize="none" {...props}
      right={<TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={C.muted} />
      </TouchableOpacity>} />
  );
}

export function Checkbox({ checked, onToggle, children, error }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: error ? 4 : 12 }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: error ? C.red : C.green, backgroundColor: checked ? C.green : '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        {checked && <Ionicons name="checkmark" size={15} color="#fff" />}
      </View>
      <Text style={{ flex: 1, color: C.muted, fontSize: 12, lineHeight: 17 }}>{children}</Text>
    </TouchableOpacity>
  );
}

// Google / Apple / WhatsApp buttons. UI only: onPress just reports which one was tapped.
// `compact` (new, optional) = smaller buttons and spacing (used by Login).
export function SocialRow({ onPress, compact }) {
  const items = [
    { k: 'Google', icon: 'logo-google', color: '#DB4437' },
    { k: 'Apple', icon: 'logo-apple', color: '#111' },
    { k: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  ];
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: compact ? 10 : 16 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <Text style={{ color: C.muted, marginHorizontal: 12, fontSize: compact ? 10 : 11, letterSpacing: 1, fontFamily: FONT.bodyMedium }}>OR CONTINUE WITH</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {items.map((s) => (
          <TouchableOpacity key={s.k} activeOpacity={0.8} onPress={() => onPress(s.k)}
            style={{ flex: 1, marginHorizontal: 4, paddingHorizontal: 4, height: compact ? 40 : 48, borderRadius: R, borderWidth: 1, borderColor: C.border, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={s.icon} size={compact ? 18 : 20} color={s.color} />
            <Text style={{ marginLeft: 5, color: C.text, fontFamily: FONT.bodySemi, fontSize: 12 }} numberOfLines={1} adjustsFontSizeToFit>{s.k}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Small self-contained toast for the auth screens (CartContext is not available before login).
export function MiniToast({ text }) {
  if (!text) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', bottom: 30, left: 24, right: 24, alignItems: 'center' }}>
      <View style={{ backgroundColor: C.dark, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
        <Text style={{ color: '#fff', fontFamily: FONT.bodySemi }}>{text}</Text>
      </View>
    </View>
  );
}

// PART 3C: full-width hero. The image is shown at its natural aspect ratio (width/height = aspect) and the
// container crops it vertically (focus 35% from the top, where the bag and vegetables are), so it is never stretched or zoomed.
export function AuthHero({ source, height = 190, aspect = 1, children }) {
  const { width } = useWindowDimensions();
  const imgH = width / aspect;
  const top = -Math.max(0, imgH - height) * 0.35;
  return (
    <View style={{ height, backgroundColor: C.headerBg, overflow: 'hidden' }}>
      <Image source={source} resizeMode="cover" style={{ position: 'absolute', top, left: 0, width, height: Math.max(imgH, height) }} />
      {children}
    </View>
  );
}
