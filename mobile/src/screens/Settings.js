import React from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { clearDemoData, useStored } from '../storage';
import { DemoNote, Section } from '../components/Demo';
import { C, R, shadow, FONT } from '../theme';

const PREFS = [
  ['orderUpdates', 'Order updates', 'Status and delivery alerts'],
  ['offers', 'Offers & deals', 'Discounts and new arrivals'],
  ['sound', 'Sound', 'In-app sounds'],
];
const DEFAULTS = { orderUpdates: true, offers: true, sound: true };

const Card = ({ children }) => <View style={{ backgroundColor: C.card, borderRadius: R, paddingHorizontal: 14, ...shadow }}>{children}</View>;
const Line = ({ first, children }) => <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }, !first && { borderTopWidth: 1, borderTopColor: C.border }]}>{children}</View>;

export default function Settings({ navigation }) {
  const { user } = useAuth();
  const { notify } = useCart();
  const [s, setS] = useStored('settings', DEFAULTS);
  const val = (k) => (s[k] === undefined ? DEFAULTS[k] : s[k]);

  const reset = () => Alert.alert('Clear saved data', 'This removes your demo wallet, saved payment methods and settings from this device. Your account and orders are not affected.', [
    { text: 'Cancel' },
    { text: 'Clear', style: 'destructive', onPress: async () => { await clearDemoData(user.id); setS(DEFAULTS); notify('Saved data cleared'); navigation.goBack(); } },
  ]);

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <DemoNote>Notification choices are saved on this device. Push notifications are not wired up in this build.</DemoNote>
      <Section title="Notifications">
        <Card>
          {PREFS.map(([k, t, sub], i) => (
            <Line key={k} first={!i}>
              <View style={{ flex: 1 }}><Text style={{ fontFamily: FONT.bodySemi, color: C.text }}>{t}</Text><Text style={{ color: C.muted, fontSize: 12 }}>{sub}</Text></View>
              <Switch value={val(k)} onValueChange={(v) => setS({ ...DEFAULTS, ...s, [k]: v })} trackColor={{ true: C.green, false: C.border }} thumbColor="#fff" />
            </Line>
          ))}
        </Card>
      </Section>
      <Section title="Account">
        <Card>
          <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}><Line first><Text style={{ flex: 1, fontFamily: FONT.bodySemi, color: C.text }}>Change Password</Text><Ionicons name="chevron-forward" size={18} color={C.muted} /></Line></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Addresses')}><Line><Text style={{ flex: 1, fontFamily: FONT.bodySemi, color: C.text }}>Manage Addresses</Text><Ionicons name="chevron-forward" size={18} color={C.muted} /></Line></TouchableOpacity>
          <TouchableOpacity onPress={reset}><Line><Text style={{ flex: 1, fontFamily: FONT.bodySemi, color: C.red }}>Clear saved data on this device</Text></Line></TouchableOpacity>
        </Card>
      </Section>
      <Section title="About">
        <Card>
          <Line first><Text style={{ flex: 1, color: C.muted }}>App</Text><Text style={{ color: C.text, fontFamily: FONT.bodySemi }}>Freshora</Text></Line>
          <Line><Text style={{ flex: 1, color: C.muted }}>Version</Text><Text style={{ color: C.text, fontFamily: FONT.bodySemi }}>1.0.0</Text></Line>
        </Card>
      </Section>
    </ScrollView>
  );
}
