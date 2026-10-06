import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, errMsg } from '../api';
import { C, FONT } from '../theme';

// FORGOT PASSWORD - simple demo version (no SMS / email provider, no third-party API, no OTP).
// The user enters the registered mobile number + a new password  ->  POST /auth/reset-password { phone, new_password }
// NOTE: without an OTP anyone who knows a number can reset its password. Fine for a demo; a real app would verify by SMS/email.
// Sizes use the same design units as the Login screen (u = screen width / 850).
const L_BG = '#FEFFFA';

function Field({ u, icon, right, error, ...props }) {
  return (
    <View style={{ marginHorizontal: 64 * u, marginBottom: 21 * u }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 86 * u, borderRadius: 26 * u, borderWidth: 1, borderColor: error ? C.red : '#E5E5E7', backgroundColor: '#fff', paddingLeft: 33 * u, paddingRight: 27 * u }}>
        <Ionicons name={icon} size={34 * u} color="#4B4F56" style={{ marginRight: 34 * u }} />
        <TextInput placeholderTextColor="#A3A7AE" {...props} style={{ flex: 1, color: C.text, fontSize: 24 * u, fontFamily: FONT.body, paddingVertical: 0 }} />
        {right}
      </View>
      {!!error && <Text style={{ color: C.red, fontSize: 12, marginTop: 3, marginLeft: 4 }}>{error}</Text>}
    </View>
  );
}

export default function ForgotPassword({ navigation, route }) {
  const { width: W } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const u = W / 850;

  const [phone, setPhone] = useState(route.params?.phone || '');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setErr('');
    const e = {};
    if (!/^\d{10}$/.test(phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (pw.length < 6) e.pw = 'Password must be at least 6 characters';
    if (pw2 !== pw) e.pw2 = 'Passwords do not match';
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { phone, new_password: pw });
      setDone(true);
    } catch (x) { setErr(errMsg(x)); }
    setBusy(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: L_BG }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 21 * u, paddingBottom: 120 * u }}>
          {!done && (
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ marginLeft: 36 * u, width: 60 * u }} accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={40 * u} color="#1A1A1A" />
            </TouchableOpacity>
          )}

          {done ? (
            <View style={{ alignItems: 'center', marginTop: 160 * u, paddingHorizontal: 64 * u }}>
              <View style={{ width: 180 * u, height: 180 * u, borderRadius: 90 * u, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark-circle" size={110 * u} color={C.green} />
              </View>
              <Text style={{ marginTop: 40 * u, fontSize: 56 * u, lineHeight: 64 * u, fontFamily: FONT.headingBold, color: '#00291A', textAlign: 'center' }}>Password updated</Text>
              <Text style={{ marginTop: 16 * u, fontSize: 24 * u, lineHeight: 36 * u, fontFamily: FONT.body, color: '#5B5E60', textAlign: 'center' }}>You can now log in with your new password.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.85}
                style={{ alignSelf: 'stretch', marginTop: 50 * u, height: 88 * u, borderRadius: 44 * u, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: FONT.heading, fontSize: 25 * u }}>Back to Log In</Text>
                  <Ionicons name="arrow-forward" size={32 * u} color="#fff" style={{ marginLeft: 14 * u }} />
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ marginLeft: 90 * u, marginTop: 40 * u, color: C.green, fontFamily: FONT.bodySemi, fontSize: 18.5 * u, lineHeight: 26 * u, letterSpacing: 2.5 * u }}>FORGOT PASSWORD</Text>
              <Text style={{ marginLeft: 90 * u, marginTop: 1 * u, marginRight: 60 * u, fontSize: 64 * u, lineHeight: 70 * u, includeFontPadding: false, fontFamily: FONT.headingBold, color: '#00291A' }}>
                {'Reset your\n'}<Text style={{ color: '#62A737' }}>password</Text>
              </Text>
              <Text style={{ marginLeft: 90 * u, marginRight: 90 * u, marginTop: 12 * u, fontSize: 23 * u, lineHeight: 35.5 * u, fontFamily: FONT.body, color: '#5B5E60' }}>
                Enter your registered mobile number and choose a new password.
              </Text>
              <View style={{ height: 30 * u }} />

              <Field u={u} icon="call-outline" placeholder="Mobile Number" keyboardType="number-pad" maxLength={10}
                value={phone} onChangeText={(v) => setPhone(v.replace(/\D/g, ''))} error={errs.phone} />
              <Field u={u} icon="lock-closed-outline" placeholder="New Password" secureTextEntry={!show} autoCapitalize="none"
                value={pw} onChangeText={setPw} error={errs.pw}
                right={<TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={36 * u} color="#3A3F45" />
                </TouchableOpacity>} />
              <Field u={u} icon="lock-closed-outline" placeholder="Confirm New Password" secureTextEntry={!show} autoCapitalize="none"
                value={pw2} onChangeText={setPw2} error={errs.pw2} />

              {!!err && <Text style={{ color: C.red, marginHorizontal: 64 * u, marginTop: 4 * u }}>{err}</Text>}
              <TouchableOpacity onPress={submit} disabled={busy} activeOpacity={0.85}
                style={{ marginHorizontal: 64 * u, marginTop: 29 * u, height: 88 * u, borderRadius: 44 * u, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
                {busy ? <ActivityIndicator color="#fff" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontFamily: FONT.heading, fontSize: 25 * u }}>Reset Password</Text>
                    <Ionicons name="checkmark" size={32 * u} color="#fff" style={{ marginLeft: 14 * u }} />
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
