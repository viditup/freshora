import React from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Btn from '../components/Btn';
import { DemoNote, Section } from '../components/Demo';
import { C, R, shadow, FONT } from '../theme';

// Stable per-user code: FRESH + first letters of the name + last 3 chars of the user id.
export const referralCode = (u) => 'FRESH' + (u.name || 'USER').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() + String(u.id).slice(-3).toUpperCase();

const STEPS = [
  ['1', 'Share your code', 'Send your referral code to friends and family.'],
  ['2', 'They sign up', 'Your friend creates a Freshora account and places an order.'],
  ['3', 'You both get rewarded', 'Rewards are credited once their first order is delivered.'],
];

export default function ReferEarn() {
  const { user } = useAuth();
  const code = referralCode(user);
  const share = () => Share.share({ message: `Join me on Freshora - groceries in minutes! Use my code ${code} when you sign up.` }).catch(() => {});
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <DemoNote>Demo preview: referral codes and rewards are not tracked or paid out by the backend yet.</DemoNote>
      <View style={{ backgroundColor: C.dark, borderRadius: R + 4, padding: 20, alignItems: 'center', marginBottom: 16, ...shadow }}>
        <Text style={{ fontSize: 40 }}>🎁</Text>
        <Text style={{ color: '#fff', fontSize: 20, fontFamily: FONT.headingBold, marginTop: 6 }}>Refer & Earn</Text>
        <Text style={{ color: '#D1E7D6', textAlign: 'center', marginTop: 4 }}>Invite friends to Freshora and earn rewards together.</Text>
        <View style={{ marginTop: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.gold, borderRadius: R, paddingHorizontal: 22, paddingVertical: 10 }}>
          <Text selectable style={{ color: C.gold, fontSize: 22, fontFamily: FONT.headingBold, letterSpacing: 2 }}>{code}</Text>
        </View>
      </View>
      <Btn title="Share Code" onPress={share} style={{ marginBottom: 20 }} />
      <Section title="How it works">
        {STEPS.map(([n, t, s]) => (
          <View key={n} style={{ flexDirection: 'row', backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 10, ...shadow }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.green, fontFamily: FONT.headingBold }}>{n}</Text></View>
            <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ fontFamily: FONT.headingBold, color: C.text }}>{t}</Text><Text style={{ color: C.muted, marginTop: 2 }}>{s}</Text></View>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}
