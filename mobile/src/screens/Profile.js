import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { userKey } from '../storage';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';
import Img from '../components/Img';
import { inGroup } from '../orderUtils';
import { C, RAD, rs, FONT } from '../theme';

// PROFILE - copy of the design screen. Header = the same AppHeader as Home (Delivering to + address, bell, cart).
// Sizes are dp for a 390-wide phone, measured from the design image, and scale with the screen: u(n) = n dp, T(n) = text style.
// Data/logic unchanged: /orders counts, on-device wallet balance, AuthContext user + logout.
const REF_W = 390;
// Banner picture (already contains headline, subtitle, Shop Now button and the handwritten note). To use another picture, change only this line.
const BANNER = require('../../assets/design/os_banner_goodfood.jpg');
const WHITE = '#FFFFFF';
const INK = '#0D1210';
const SUB = '#7C8397';
const DKGREEN = '#0B6B33';

const phoneLabel = (p) => { const d = String(p || '').replace(/\D/g, '').slice(-10); return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : (p ? `+91 ${p}` : ''); };
const plural = (n) => (n === '-' ? '-' : `${n} order${n === 1 ? '' : 's'}`);

export default function Profile({ navigation }) {
  const { user, logout } = useAuth(); // logout clears JWT + user; CartProvider unmounts so cart state resets too
  const { width } = useWindowDimensions();
  const k = width / REF_W;
  const u = (n) => Math.round(n * k * 10) / 10;
  const T = (n, lh = 1.3) => { const fs = Math.max(7.5, Math.round(n * k * 10) / 10); return { fontSize: fs, lineHeight: Math.round(fs * lh * 10) / 10, includeFontPadding: false }; };

  const [orders, setOrders] = useState(null); // null = loading / failed -> counts show "-"
  const [wallet, setWallet] = useState(null);   // demo wallet balance (on-device); re-read on every focus
  useFocusEffect(useCallback(() => {
    let live = true;
    AsyncStorage.getItem(userKey(user.id, 'wallet')).then((v) => { if (live) setWallet(v ? (JSON.parse(v).balance || 0) : 0); }).catch(() => {});
    api.get('/orders').then((r) => live && setOrders(r.data.data)).catch(() => {});
    return () => { live = false; };
  }, [user.id]));

  const benefits = () => Alert.alert('Gold Member benefits', 'Priority support\nEarly access to deals\n\nDemo membership: perks are display only and are not enforced yet.');
  const confirmLogout = () => Alert.alert('Log out', 'Are you sure you want to log out?', [{ text: 'Cancel' }, { text: 'Log out', style: 'destructive', onPress: logout }]);
  const openOrders = (filter) => navigation.getParent()?.navigate('OrdersTab', { screen: 'Root', params: { filter, ts: Date.now() } });
  const goHome = () => navigation.getParent()?.navigate('HomeTab');
  const goOffers = () => navigation.getParent()?.navigate('OffersTab');

  // order counts for the 4 tiles (real data). "Out for delivery" = status shipped; "To be delivered" = the other active orders.
  const toBe = orders ? orders.filter((o) => inGroup(o, 'deliver') && o.order_status !== 'shipped').length : '-';
  const out = orders ? orders.filter((o) => o.order_status === 'shipped').length : '-';
  const delivered = orders ? orders.filter((o) => inGroup(o, 'delivered')).length : '-';
  const returns = orders ? orders.filter((o) => inGroup(o, 'returns')).length : '-';
  const TILES = [
    ['To Be Delivered', toBe, 'deliver', <MaterialCommunityIcons name="package-variant-closed" size={u(17)} color={DKGREEN} />],
    ['Out for Delivery', out, 'deliver', <MaterialCommunityIcons name="truck-delivery-outline" size={u(18)} color={DKGREEN} />],
    ['Delivered', delivered, 'delivered', <Ionicons name="checkbox-outline" size={u(17)} color={DKGREEN} />],
    ['Returns', returns, 'returns', <Ionicons name="return-up-back-outline" size={u(18)} color={DKGREEN} />],
  ];

  // menu row: separate light-bordered card, dark line icon (no circle), title + subtitle, optional green pill, chevron
  const row = (icon, title, sub, onPress, pill) => (
    <TouchableOpacity key={title} onPress={onPress} activeOpacity={0.7}
      style={{ height: u(36), marginTop: u(4.5), flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: u(10), borderWidth: 1, borderColor: '#EEF0F3', paddingLeft: u(10), paddingRight: u(9) }}>
      <View style={{ width: u(22), alignItems: 'center' }}>{icon}</View>
      <View style={{ flex: 1, marginLeft: u(11) }}>
        <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bodySemi, color: INK, ...T(9.5, 1.25) }}>{title}</Text>
        <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.body, color: SUB, ...T(8, 1.3) }}>{sub}</Text>
      </View>
      {!!pill && <View style={{ height: u(18), minWidth: u(42), alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4F3DA', borderRadius: RAD.pill, paddingHorizontal: u(8), marginRight: u(8) }}><Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bodySemi, color: DKGREEN, ...T(9, 1.2) }}>{pill}</Text></View>}
      <Ionicons name="chevron-forward" size={u(14)} color="#9097A5" />
    </TouchableOpacity>
  );
  const ic = (name) => <Ionicons name={name} size={u(15)} color="#10151A" />;

  const bannerW = width - u(32);
  const bs = Image.resolveAssetSource(BANNER);
  const bannerH = Math.round(bannerW * ((bs && bs.width && bs.height) ? bs.height / bs.width : 430 / 1552) * 10) / 10; // follows the picture's own proportions

  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>
      <AppHeader scaled />
      <ScrollView style={{ backgroundColor: WHITE }} contentContainerStyle={{ paddingBottom: u(20) }} showsVerticalScrollIndicator={false}>

        {/* avatar / details / Edit Profile (white background) */}
        <View style={{ backgroundColor: WHITE, paddingHorizontal: u(16), paddingTop: u(10), flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.85} style={{ width: u(60), height: u(60) }}>
            <View style={{ width: u(60), height: u(60), borderRadius: u(30), overflow: 'hidden', backgroundColor: C.tint, borderWidth: 1, borderColor: '#E3EFE0' }}>
              {user.profile_image
                ? <Img uri={user.profile_image} emoji="👤" style={{ width: u(58), height: u(58) }} />
                : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, color: C.green, ...T(26) }}>{user.name?.[0]?.toUpperCase()}</Text></View>}
            </View>
            <View style={{ position: 'absolute', right: u(-3), bottom: u(-1), width: u(17), height: u(17), borderRadius: u(8.5), backgroundColor: DKGREEN, borderWidth: 1.5, borderColor: WHITE, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="camera" size={u(9)} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: u(16) }}>
            <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.headingBold, color: INK, ...T(16, 1.25) }}>{user.name}</Text>
            {!!user.phone && <Text maxFontSizeMultiplier={1} style={{ color: '#6B7280', fontFamily: FONT.body, marginTop: u(3), ...T(9.5, 1.3) }}>{phoneLabel(user.phone)}</Text>}
            <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ color: '#6B7280', fontFamily: FONT.body, marginTop: u(1), ...T(9.5, 1.3) }}>{user.email}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.85}
            style={{ height: u(29), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE, borderRadius: u(9), borderWidth: 1, borderColor: '#9FD3B0', paddingHorizontal: u(12), marginLeft: u(8) }}>
            <Ionicons name="create-outline" size={u(12)} color={DKGREEN} />
            <Text maxFontSizeMultiplier={1} style={{ color: C.dark2, fontFamily: FONT.heading, marginLeft: u(6), ...T(8.5, 1.2) }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: u(16) }}>
          {/* Gold Member: gold crown on the left + big faint crown behind (display only: perks are not enforced by the backend) */}
          <TouchableOpacity onPress={benefits} activeOpacity={0.85} style={{ height: u(49), marginTop: u(10), flexDirection: 'row', alignItems: 'center', backgroundColor: '#E4F3DA', borderRadius: u(10), overflow: 'hidden', paddingLeft: u(14), paddingRight: u(14) }}>
            <MaterialCommunityIcons name="crown" size={u(54)} color="#B9DDA3" style={{ position: 'absolute', left: u(206), top: u(10), opacity: 0.6 }} />
            <View style={{ width: u(30), alignItems: 'center' }}><MaterialCommunityIcons name="crown" size={u(30)} color="#F5BE1B" /></View>
            <View style={{ flex: 1, marginLeft: u(5) }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, color: C.dark2, ...T(13.5, 1.2) }}>Gold Member</Text>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.body, color: '#1F6B3F', ...T(9, 1.25) }}>Save more. Shop smarter.</Text>
            </View>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, color: DKGREEN, ...T(9.5) }}>View Benefits</Text>
            <Ionicons name="arrow-forward" size={u(11)} color={DKGREEN} style={{ marginLeft: u(5) }} />
          </TouchableOpacity>

          {/* My Orders */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: u(16) }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.headingBold, color: INK, ...T(12.5) }}>My Orders</Text>
            <TouchableOpacity onPress={() => openOrders('all')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, color: DKGREEN, ...T(9.5) }}>View All</Text>
              <Ionicons name="arrow-forward" size={u(11)} color={DKGREEN} style={{ marginLeft: u(4) }} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', marginTop: u(11) }}>
            {TILES.map(([label, n, filter, icon]) => (
              <TouchableOpacity key={label} activeOpacity={0.8} onPress={() => openOrders(filter)} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ width: u(34), height: u(34), borderRadius: u(17), backgroundColor: '#E4F3DA', alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
                <Text maxFontSizeMultiplier={1} numberOfLines={1} style={{ fontFamily: FONT.bodySemi, color: INK, marginTop: u(6), ...T(8.5) }}>{label}</Text>
                <Text maxFontSizeMultiplier={1} style={{ color: SUB, fontFamily: FONT.body, marginTop: u(1), ...T(8) }}>{plural(n)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* menu */}
          <View style={{ marginTop: u(8) }}>
            {row(ic('location-outline'), 'My Addresses', 'Manage your delivery addresses', () => navigation.navigate('Addresses'))}
            {row(ic('card-outline'), 'Payment Methods', 'UPI, Cards, Wallets and more', () => navigation.navigate('PaymentMethods'))}
            {row(ic('wallet-outline'), 'My Wallet', 'View balance and transactions', () => navigation.navigate('Wallet'), wallet == null ? '' : rs(wallet))}
            {row(<MaterialCommunityIcons name="brightness-percent" size={u(16)} color="#10151A" />, 'My Offers', 'View and apply your coupons', goOffers)}
            {row(ic('heart-outline'), 'My Wishlist', 'Your saved products', () => navigation.navigate('Wishlist'))}
            {row(<MaterialCommunityIcons name="account-group-outline" size={u(17)} color="#10151A" />, 'Refer & Earn', 'Invite friends and earn rewards', () => navigation.navigate('ReferEarn'))}
            {row(ic('headset-outline'), 'Help & Support', 'Get help with your orders', () => navigation.navigate('Help'))}
            {row(ic('settings-outline'), 'Settings', 'App preferences and notifications', () => navigation.navigate('Settings'))}
          </View>

          {/* Logout */}
          <TouchableOpacity onPress={confirmLogout} activeOpacity={0.85} style={{ marginTop: u(8.5), height: u(33), borderRadius: u(9), backgroundColor: '#FDE8E8', borderWidth: 1, borderColor: '#F3B9B9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="log-out-outline" size={u(14)} color="#D32F2F" />
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.heading, color: '#D32F2F', marginLeft: u(7), ...T(9.5) }}>Logout</Text>
          </TouchableOpacity>

          {/* Good Food banner: only the picture. Everything on it is already in the image; an invisible area over the picture's Shop Now button makes it work. */}
          <View style={{ marginTop: u(11), width: bannerW, height: bannerH, borderRadius: u(10), overflow: 'hidden', backgroundColor: '#E3F2D4' }}>
            <Image source={BANNER} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            <TouchableOpacity onPress={goHome} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Shop Now"
              style={{ position: 'absolute', left: '3.5%', top: '66%', width: '23%', height: '25%' }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
