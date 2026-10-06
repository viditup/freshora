import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { C, FS, S, T, FONT } from '../theme';
import { useDesign } from '../scale';

// PART 31: header icons look like the design (bolder, near-black): Material outline bell / cart and the "scan-helper" frame (corners + centre square).
// If a name is missing from the installed glyph map we fall back to the old Ionicons one, so nothing can crash.
const ICON_DARK = '#16241C';
const HeaderIcon = ({ mci, ion, size, color = ICON_DARK }) => {
  const ok = MaterialCommunityIcons.glyphMap && MaterialCommunityIcons.glyphMap[mci];
  return ok ? <MaterialCommunityIcons name={mci} size={size} color={color} /> : <Ionicons name={ion} size={size} color={color} />;
};

// PART 31b: the design's scan icon drawn with Views (no icon font): 4 rounded corner brackets + a thick rounded square with a dot in the middle.
const ScanIcon = ({ size = 24, color = ICON_DARK }) => {
  const t = Math.max(2, Math.round(size * 0.1));       // stroke
  const arm = Math.round(size * 0.3);                  // bracket arm length
  const r = Math.round(size * 0.14);                   // bracket corner radius
  const box = Math.round(size * 0.4);                  // centre square
  const dot = Math.max(2, Math.round(size * 0.1));
  const corner = (pos, bw) => <View style={[{ position: 'absolute', width: arm, height: arm, borderColor: color }, pos, bw]} />;
  return (
    <View style={{ width: size, height: size }}>
      {corner({ top: 0, left: 0 }, { borderTopWidth: t, borderLeftWidth: t, borderTopLeftRadius: r })}
      {corner({ top: 0, right: 0 }, { borderTopWidth: t, borderRightWidth: t, borderTopRightRadius: r })}
      {corner({ bottom: 0, left: 0 }, { borderBottomWidth: t, borderLeftWidth: t, borderBottomLeftRadius: r })}
      {corner({ bottom: 0, right: 0 }, { borderBottomWidth: t, borderRightWidth: t, borderBottomRightRadius: r })}
      <View style={{ position: 'absolute', left: (size - box) / 2, top: (size - box) / 2, width: box, height: box, borderWidth: t, borderColor: color, borderRadius: Math.round(size * 0.07), alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
      </View>
    </View>
  );
};

// `m` = measurements. Default (all other screens) keeps the old sizes; Home passes `scaled` and gets design-proportional sizes (PART 17).
const IconBtn = ({ icon, ion, onPress, badge, label, dot, m }) => (
  <TouchableOpacity onPress={onPress} accessibilityLabel={label} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
    style={{ width: m.btn, height: m.btn, alignItems: 'center', justifyContent: 'center', marginLeft: m.btnGap }}>
    <HeaderIcon mci={icon} ion={ion} size={m.icon} />
    {dot && <View style={{ position: 'absolute', top: m.dotTop, right: m.dotRight, width: m.dot, height: m.dot, borderRadius: m.dot, backgroundColor: C.red, borderWidth: 1.5, borderColor: C.headerTop }} />}
    {badge > 0 && (
      <View style={{ position: 'absolute', top: m.badgeTop, right: m.badgeRight, backgroundColor: C.green, borderRadius: 10, minWidth: m.badge, height: m.badge, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.headerTop }}>
        <Text maxFontSizeMultiplier={1} style={{ color: '#fff', fontSize: m.badgeFs, fontFamily: FONT.headingBold }}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const DEFAULT_M = {
  btn: 42, btnGap: S.xs, icon: 25, dot: 9, dotTop: 8, dotRight: 9, badge: 19, badgeTop: 2, badgeRight: 0, badgeFs: 10,
  padTop: S.sm, padSide: S.lg, padBottom: S.md, rowH: 44, locIcon: 28, locGap: S.sm, titleFs: FS.lg + 1, addrFs: FS.sm, chev: 16,
  searchGap: S.md, searchH: 48, searchRadius: 16, searchPad: S.lg, searchIcon: 21, searchFs: FS.md, searchTextGap: S.md,
};

// Tappable search bar: opens the Search screen (existing search API lives there).
export const SearchBar = ({ onPress, placeholder = 'Search for milk, fruits, snacks and more...', m = DEFAULT_M }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityLabel="Search products"
    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: m.searchRadius, borderWidth: 1, borderColor: '#E3EDDD', paddingHorizontal: m.searchPad, height: m.searchH,
      shadowColor: '#14532D', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
    <Ionicons name="search-outline" size={m.searchIcon} color={m.searchIconColor || C.muted} />
    <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ color: m.searchColor || '#8A97A0', marginLeft: m.searchTextGap, fontSize: m.searchFs, flex: 1 }}>{placeholder}</Text>
    <ScanIcon size={m.scanIcon || m.searchIcon} />
  </TouchableOpacity>
);

/**
 * Global reusable header: [delivery address | page title] + bell + cart(badge), and an optional search bar.
 * Handles the top safe-area inset itself, so screens using it must NOT add a top SafeAreaView.
 * Every tab stack registers Search / Cart / Notifications / Addresses, so plain navigate() works from any tab.
 * PART 17: `scaled` (Home only) = sizes follow the design proportions of the screen width.
 * CATEGORIES PAGE: optional `deliveringTo` (label "Delivering to" instead of the address type), `placeholder` (search text), `tint` ([top, bottom] gradient colours)
 * and `metrics` (measurements merged over the defaults). All are optional - when they are not passed the header is exactly as before (Home etc. unchanged).
 */
export default function AppHeader({ title, search = true, scaled = false, deliveringTo = false, placeholder, tint, metrics }) {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { count } = useCart();
  const { u, f } = useDesign();
  const [addr, setAddr] = useState(null);

  useFocusEffect(useCallback(() => {
    if (title) return undefined; // title mode does not show the address
    let alive = true;
    api.get('/addresses').then((r) => { if (alive) setAddr(r.data.data.find((a) => a.is_default) || r.data.data[0] || null); }).catch(() => {});
    return () => { alive = false; };
  }, [title]));

  const base = scaled ? {
    btn: Math.max(34, u(86)), btnGap: 0, icon: Math.max(23, u(58)), dot: Math.max(7, u(15)), dotTop: 5, dotRight: 6, badge: Math.max(16, u(34)), badgeTop: 0, badgeRight: 0, badgeFs: 9.5,
    padTop: u(14), padSide: u(45), padBottom: u(12), rowH: Math.max(36, u(86)), locIcon: Math.max(20, u(50)), locGap: u(14), titleFs: f(31, 14), addrFs: f(21, 10.5), chev: 14,
    searchGap: u(18), searchH: Math.max(40, u(93)), searchRadius: u(26), searchPad: u(32), searchIcon: 19, scanIcon: Math.max(22, u(50)), searchFs: f(23, 12), searchTextGap: u(22),
  } : DEFAULT_M;
  const m = metrics ? { ...base, ...metrics } : base;

  const line2 = addr ? [addr.address_line, `${addr.city} ${addr.pincode}`].filter(Boolean).join(', ') : 'Tap to choose where to deliver';

  return (
    <LinearGradient colors={tint || [C.headerTop, C.bg]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      style={{ paddingTop: insets.top + m.padTop, paddingHorizontal: m.padSide, paddingBottom: m.padBottom }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: m.rowH }}>
        {title ? (
          <Text numberOfLines={1} style={[T.h1, { flex: 1 }]}>{title}</Text>
        ) : (
          <TouchableOpacity activeOpacity={0.8} onPress={() => nav.navigate('Addresses')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} accessibilityLabel="Delivery address">
            <Ionicons name="location-sharp" size={m.locIcon} color={C.dark} />
            <View style={{ marginLeft: m.locGap, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontSize: m.titleFs, fontFamily: FONT.headingBold, color: C.text, flexShrink: 1 }}>{deliveringTo ? 'Delivering to' : (addr ? addr.type : 'Add address')}</Text>
                <Ionicons name="chevron-down" size={m.chev} color={C.text} style={{ marginLeft: 3 }} />
              </View>
              <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontSize: m.addrFs, color: C.muted, marginTop: 1 }}>{line2}</Text>
            </View>
          </TouchableOpacity>
        )}
        <IconBtn m={m} icon="bell-outline" ion="notifications-outline" label="Notifications" dot onPress={() => nav.navigate('Notifications')} />
        <IconBtn m={m} icon="cart-outline" ion="cart-outline" label="Cart" badge={count} onPress={() => nav.navigate('Cart')} />
      </View>
      {search && <View style={{ marginTop: m.searchGap }}><SearchBar m={m} placeholder={placeholder} onPress={() => nav.navigate('Search')} /></View>}
    </LinearGradient>
  );
}
