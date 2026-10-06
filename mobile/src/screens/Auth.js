import React, { useRef, useState } from 'react';
import { Text, TextInput, Image, StatusBar, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from '../theme';
import { MiniToast } from '../components/AuthParts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hero images (put the files in /assets; adjust the path if yours differs).
const HERO_LOGIN_NEW = require('../../assets/login_hero.jpg');   // 850x745
const LEAF_BL = require('../../assets/login_leaf_bl.png');       // 125x190
const HERO_SIGNUP_NEW = require('../../assets/signup_hero.jpg'); // 850x660 (handwritten text + bag + top of card baked in)
const PHONE_LOGIN = true; // login screen uses Mobile Number (+91). Set false to use Email again.
// The design shows "Email Address (Optional)" on Sign Up. Existing logic requires an email, so this is OFF by default.
// Set true ONLY after confirming the backend /auth/register accepts a missing email.
const SIGNUP_EMAIL_OPTIONAL = false;

function Form({ signup, navigation }) {
  const { login, register } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [agree, setAgree] = useState(false);
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const timer = useRef(null);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const soon = (what) => {
    setToast(what === 'Password reset' ? 'Password reset is coming soon' : `${what} sign-in is coming soon`); // PART 10 wording
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 1800);
  };

  const validate = () => {
    const e = {};
    const email = f.email.trim();
    if (signup && f.name.trim().length < 2) e.name = 'Enter your full name';
    if (signup && !/^\d{10}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (signup) {
      if (!(SIGNUP_EMAIL_OPTIONAL && email === '') && !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    } else if (!PHONE_LOGIN && !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    if (!signup && PHONE_LOGIN && !/^\d{10}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (signup && !agree) e.agree = 'Please accept the Terms & Privacy Policy';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setErr('');
    if (!validate()) return;
    setBusy(true);
    try {
      if (signup) {
        const body = { name: f.name.trim(), phone: f.phone, password: f.password };
        if (f.email.trim() !== '' || !SIGNUP_EMAIL_OPTIONAL) body.email = f.email.trim();
        await register(body);
      } else await login(PHONE_LOGIN ? f.phone : f.email.trim(), f.password);
    } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };

  const p = { navigation, f, set, errs, err, busy, submit, soon, toast };
  return signup ? <SignupView {...p} agree={agree} setAgree={setAgree} /> : <LoginView {...p} />;
}
export const Login = (p) => <Form {...p} />;
export const Signup = (p) => <Form signup {...p} />;



// ---------------------------------------------------------------------------
// Login screen, built to the design (850px wide artboard). Every size below is
// a design pixel multiplied by u = screenWidth / 850, so it scales on any phone.
// ---------------------------------------------------------------------------
const L_BG = '#FEFFFA';

// India flag drawn with views (no emoji), +91, chevron and separator, as in the design.
function LPhonePrefix({ u }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 45 * u, height: 32 * u, borderRadius: 4 * u, overflow: 'hidden', borderWidth: 0.5, borderColor: '#E3E3E3', marginRight: 24 * u }}>
        <View style={{ flex: 1, backgroundColor: '#FF9933' }} />
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 10 * u, height: 10 * u, borderRadius: 5 * u, borderWidth: 1.4 * u, borderColor: '#000080' }} />
        </View>
        <View style={{ flex: 1, backgroundColor: '#138808' }} />
      </View>
      <Text style={{ color: '#1F2328', fontFamily: FONT.bodyMedium, fontSize: 24 * u }}>+91</Text>
      <Ionicons name="chevron-down" size={24 * u} color="#3A3F45" style={{ marginLeft: 12 * u }} />
      <View style={{ width: 1, height: 40 * u, backgroundColor: '#DADADD', marginLeft: 33 * u, marginRight: 27 * u }} />
    </View>
  );
}

function LField({ u, icon, right, prefixNode, error, last, h = 86, ...props }) {
  return (
    <View style={{ marginHorizontal: 64 * u, marginBottom: last ? 0 : 21 * u }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: h * u, borderRadius: 26 * u, borderWidth: 1, borderColor: error ? C.red : '#E5E5E7', backgroundColor: '#fff', paddingLeft: 33 * u, paddingRight: 27 * u }}>
        <Ionicons name={icon} size={34 * u} color="#4B4F56" style={{ marginRight: 44 * u }} />
        {prefixNode}
        <TextInput placeholderTextColor="#A3A7AE" {...props} style={{ flex: 1, color: C.text, fontSize: 24 * u, fontFamily: FONT.body, paddingVertical: 0 }} />
        {right}
      </View>
      {!!error && <Text style={{ color: C.red, fontSize: 12, marginTop: 3, marginLeft: 4 }}>{error}</Text>}
    </View>
  );
}

function LoginView({ navigation, f, set, errs, err, busy, submit, soon, toast }) {
  const { width: W } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [show, setShow] = useState(false);
  const u = W / 850;
  const heroH = insets.top + 655 * u; // image is drawn under the status bar

  return (
    <View style={{ flex: 1, backgroundColor: L_BG }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {/* HERO */}
          <View style={{ height: heroH, overflow: 'hidden', backgroundColor: '#F3EEE4' }}>
            <Image source={HERO_LOGIN_NEW} resizeMode="stretch" style={{ position: 'absolute', left: 0, bottom: 0, width: W, height: 745 * u }} />
            <TouchableOpacity onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ position: 'absolute', top: insets.top + 21 * u, left: 36 * u }}>
              <Ionicons name="chevron-back" size={40 * u} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace('Signup')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ position: 'absolute', top: insets.top + 32 * u, right: 47 * u }}>
              <Text style={{ color: C.green, fontFamily: FONT.bodySemi, fontSize: 25 * u, lineHeight: 32 * u }}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* CARD */}
          <View style={{ flex: 1, backgroundColor: L_BG, marginTop: -80 * u, borderTopLeftRadius: 80 * u, borderTopRightRadius: 80 * u, paddingTop: 54 * u, paddingBottom: 150 * u }}>
            <Text style={{ marginLeft: 90 * u, color: C.green, fontFamily: FONT.bodySemi, fontSize: 18.5 * u, lineHeight: 26 * u, letterSpacing: 2.5 * u }}>WELCOME BACK</Text>
            <Text style={{ marginLeft: 90 * u, marginTop: 1 * u, fontSize: 76 * u, lineHeight: 80 * u, includeFontPadding: false, fontFamily: FONT.headingBold, color: '#00291A' }}>
              {'Log in to\n'}<Text style={{ color: '#62A737' }}>continue</Text>
            </Text>
            <Text style={{ marginLeft: 90 * u, marginTop: 12 * u, maxWidth: 410 * u, fontSize: 23 * u, lineHeight: 35.5 * u, fontFamily: FONT.body, color: '#5B5E60' }}>
              Access your account to order your favourite groceries, track deliveries and more.
            </Text>

            <View style={{ height: 30 * u }} />
            {PHONE_LOGIN
              ? <LField u={u} icon="call-outline" prefixNode={<LPhonePrefix u={u} />} placeholder="Mobile Number" keyboardType="number-pad" maxLength={10} value={f.phone} onChangeText={(v) => set('phone')(v.replace(/\D/g, ''))} error={errs.phone} />
              : <LField u={u} icon="mail-outline" placeholder="Email Address" autoCapitalize="none" keyboardType="email-address" value={f.email} onChangeText={set('email')} error={errs.email} />}
            <LField u={u} icon="lock-closed-outline" placeholder="Password" secureTextEntry={!show} autoCapitalize="none" value={f.password} onChangeText={set('password')} error={errs.password} last
              right={<TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={36 * u} color="#3A3F45" />
              </TouchableOpacity>} />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { phone: f.phone })} style={{ alignSelf: 'flex-end', marginRight: 64 * u, marginTop: 14 * u }}>
              <Text style={{ color: C.green, fontFamily: FONT.bodySemi, fontSize: 21 * u, lineHeight: 26 * u }}>Forgot Password?</Text>
            </TouchableOpacity>

            {!!err && <Text style={{ color: C.red, marginHorizontal: 64 * u, marginTop: 10 * u }}>{err}</Text>}
            <TouchableOpacity onPress={submit} disabled={busy} activeOpacity={0.85}
              style={{ marginHorizontal: 64 * u, marginTop: 29 * u, height: 88 * u, borderRadius: 44 * u, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
              {busy ? <ActivityIndicator color="#fff" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: FONT.heading, fontSize: 25 * u }}>Log In</Text>
                  <Ionicons name="arrow-forward" size={32 * u} color="#fff" style={{ marginLeft: 14 * u }} />
                </View>
              )}
            </TouchableOpacity>

            {/* OR CONTINUE WITH */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 72 * u, marginTop: 36 * u, height: 24 * u }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#D3D4D9' }} />
              <Text style={{ marginHorizontal: 30 * u, color: '#6B7078', fontFamily: FONT.bodyMedium, fontSize: 18 * u, letterSpacing: 2 * u }}>OR CONTINUE WITH</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#D3D4D9' }} />
            </View>

            {/* SOCIAL */}
            <View style={{ flexDirection: 'row', marginHorizontal: 60 * u, marginTop: 28 * u }}>
              {[{ k: 'Google', icon: 'logo-google', color: '#DB4437' }, { k: 'Apple', icon: 'logo-apple', color: '#111' }, { k: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' }].map((s) => (
                <TouchableOpacity key={s.k} activeOpacity={0.8} onPress={() => soon(s.k)}
                  style={{ flex: 1, marginHorizontal: 12 * u, height: 82 * u, borderRadius: 28 * u, borderWidth: 1, borderColor: '#E9E9E9', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={s.icon} size={46 * u} color={s.color} />
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ marginLeft: 24 * u, color: '#222', fontFamily: FONT.bodyMedium, fontSize: 22 * u }}>{s.k}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* NEW HERE + leaf */}
            <View style={{ marginTop: 55 * u, height: 32 * u, justifyContent: 'center' }}>
              <Image source={LEAF_BL} pointerEvents="none" style={{ position: 'absolute', left: -14 * u, top: 12 * u, width: 98 * u, height: 149 * u, opacity: 0.85 }} />
              <TouchableOpacity onPress={() => navigation.replace('Signup')} activeOpacity={0.8}>
                <Text style={{ textAlign: 'center', color: '#6B7078', fontFamily: FONT.body, fontSize: 24 * u, lineHeight: 32 * u }}>
                  {'New here? '}<Text style={{ color: C.green, fontFamily: FONT.headingBold }}>{'Create an Account →'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <MiniToast text={toast} />
    </View>
  );
}


// ---------------------------------------------------------------------------
// Sign Up screen, built to the design (same 850px artboard / u scale as Login).
// The hero image (850x660) already contains the handwritten text, the bag and the
// top curve of the card. It is drawn from the very top of the screen (under the
// status bar, like the design) and the live card is laid over its bottom 120 px.
// ---------------------------------------------------------------------------
function SCheck({ u, checked, onToggle, error }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{ width: 36 * u, height: 36 * u, borderRadius: 9 * u, borderWidth: 2 * u, borderColor: error ? C.red : C.green, backgroundColor: checked ? C.green : '#fff', alignItems: 'center', justifyContent: 'center' }}>
      {checked ? <Ionicons name="checkmark" size={28 * u} color="#fff" /> : null}
    </TouchableOpacity>
  );
}

function SignupView({ navigation, f, set, errs, err, busy, submit, soon, toast, agree, setAgree }) {
  const { width: W } = useWindowDimensions();
  const [show, setShow] = useState(false);
  const u = W / 850;
  const heroH = 660 * u; // image drawn from the top of the screen, under the status bar

  return (
    <View style={{ flex: 1, backgroundColor: L_BG }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {/* HERO */}
          <View style={{ height: heroH, backgroundColor: '#E9F1E4', overflow: 'hidden' }}>
            <Image source={HERO_SIGNUP_NEW} resizeMode="stretch" style={{ position: 'absolute', left: 0, top: 0, width: W, height: heroH }} />
          </View>

          {/* CARD (starts at design y=540, exactly where the baked-in card curve starts) */}
          <View style={{ flex: 1, backgroundColor: L_BG, marginTop: -120 * u, borderTopLeftRadius: 80 * u, borderTopRightRadius: 80 * u, paddingTop: 27 * u, paddingBottom: 120 * u }}>
            <Text style={{ marginLeft: 80 * u, color: C.green, fontFamily: FONT.bodySemi, fontSize: 18.5 * u, lineHeight: 26 * u, letterSpacing: 2.5 * u }}>CREATE ACCOUNT</Text>
            <Text style={{ marginLeft: 80 * u, marginTop: 14 * u, fontSize: 76 * u, lineHeight: 80 * u, includeFontPadding: false, fontFamily: FONT.headingBold, color: '#003D28' }}>
              {"Let's get you\n"}<Text style={{ color: '#459B34' }}>started</Text>
            </Text>
            <Text style={{ marginLeft: 80 * u, marginTop: 8 * u, fontSize: 23 * u, lineHeight: 35.5 * u, fontFamily: FONT.body, color: '#5B5E60' }}>
              {'Create an account to enjoy fresh groceries,\nfast delivery and a healthier, happier you.'}
            </Text>

            <View style={{ height: 32 * u }} />
            <LField u={u} h={76} icon="person-outline" placeholder="Full Name" autoCapitalize="words" value={f.name} onChangeText={set('name')} error={errs.name} />
            <LField u={u} h={76} icon="call-outline" prefixNode={<LPhonePrefix u={u} />} placeholder="Mobile Number" keyboardType="number-pad" maxLength={10}
              value={f.phone} onChangeText={(v) => set('phone')(v.replace(/\D/g, ''))} error={errs.phone} />
            <LField u={u} h={76} icon="mail-outline" placeholder={SIGNUP_EMAIL_OPTIONAL ? 'Email Address (Optional)' : 'Email Address'} autoCapitalize="none" keyboardType="email-address"
              value={f.email} onChangeText={set('email')} error={errs.email} />
            <LField u={u} h={76} icon="lock-closed-outline" placeholder="Create Password" secureTextEntry={!show} autoCapitalize="none" last
              value={f.password} onChangeText={set('password')} error={errs.password}
              right={<TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={36 * u} color="#3A3F45" />
              </TouchableOpacity>} />
            <Text style={{ marginHorizontal: 70 * u, marginTop: 12 * u, color: '#8A8E94', fontFamily: FONT.body, fontSize: 19 * u, lineHeight: 26 * u }}>
              Use at least 8 characters with a mix of letters, numbers and a symbol.
            </Text>

            {/* TERMS */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 64 * u, marginTop: 37 * u, height: 40 * u }}>
              <SCheck u={u} checked={agree} onToggle={() => setAgree(!agree)} error={errs.agree} />
              <Text style={{ marginLeft: 18 * u, color: '#5B5E60', fontFamily: FONT.body, fontSize: 20 * u }}>
                I agree to the <Text style={{ color: C.green, fontFamily: FONT.heading }}>Terms of Service</Text> and <Text style={{ color: C.green, fontFamily: FONT.heading }}>Privacy Policy</Text>
              </Text>
            </View>
            {!!errs.agree && <Text style={{ color: C.red, fontSize: 12, marginHorizontal: 64 * u, marginTop: 4 }}>{errs.agree}</Text>}

            {!!err && <Text style={{ color: C.red, marginHorizontal: 64 * u, marginTop: 10 * u }}>{err}</Text>}
            <TouchableOpacity onPress={submit} disabled={busy} activeOpacity={0.85}
              style={{ marginHorizontal: 64 * u, marginTop: 27 * u, height: 88 * u, borderRadius: 44 * u, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
              {busy ? <ActivityIndicator color="#fff" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: FONT.heading, fontSize: 25 * u }}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={32 * u} color="#fff" style={{ marginLeft: 14 * u }} />
                </View>
              )}
            </TouchableOpacity>

            {/* OR CONTINUE WITH */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 72 * u, marginTop: 32 * u, height: 24 * u }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#D3D4D9' }} />
              <Text style={{ marginHorizontal: 30 * u, color: '#6B7078', fontFamily: FONT.bodyMedium, fontSize: 18 * u, letterSpacing: 2 * u }}>OR CONTINUE WITH</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#D3D4D9' }} />
            </View>

            {/* SOCIAL */}
            <View style={{ flexDirection: 'row', marginHorizontal: 60 * u, marginTop: 23 * u }}>
              {[{ k: 'Google', icon: 'logo-google', color: '#DB4437' }, { k: 'Apple', icon: 'logo-apple', color: '#111' }, { k: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' }].map((s) => (
                <TouchableOpacity key={s.k} activeOpacity={0.8} onPress={() => soon(s.k)}
                  style={{ flex: 1, marginHorizontal: 12 * u, height: 82 * u, borderRadius: 28 * u, borderWidth: 1, borderColor: '#E9E9E9', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={s.icon} size={46 * u} color={s.color} />
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ marginLeft: 24 * u, color: '#222', fontFamily: FONT.bodyMedium, fontSize: 22 * u }}>{s.k}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ALREADY HAVE AN ACCOUNT + leaf */}
            <View style={{ marginTop: 53 * u, height: 32 * u, justifyContent: 'center' }}>
              <Image source={LEAF_BL} pointerEvents="none" style={{ position: 'absolute', left: -14 * u, top: 12 * u, width: 98 * u, height: 149 * u, opacity: 0.85 }} />
              <TouchableOpacity onPress={() => navigation.replace('Login')} activeOpacity={0.8}>
                <Text style={{ textAlign: 'center', color: '#6B7078', fontFamily: FONT.body, fontSize: 24 * u, lineHeight: 32 * u }}>
                  {'Already have an account? '}<Text style={{ color: C.green, fontFamily: FONT.headingBold }}>{'Log In →'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <MiniToast text={toast} />
    </View>
  );
}
