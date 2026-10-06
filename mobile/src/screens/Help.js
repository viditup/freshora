import React, { useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import Btn from '../components/Btn';
import { Section } from '../components/Demo';
import { SUPPORT_EMAIL } from '../config';
import { C, R, shadow, FONT } from '../theme';

const FAQ = [
  ['How fast is delivery?', 'Standard delivery usually arrives in about 10 minutes. Express is faster and has a flat fee. You can pick the option at checkout and see the ETA on your order.'],
  ['When is delivery free?', 'Standard delivery is free once your cart crosses the free-delivery amount shown in your cart. Below that a small fee applies. Express delivery is always charged.'],
  ['Can I cancel my order?', 'Yes, while the order is still Pending or Confirmed. Open the order from My Orders and tap Cancel Order. Once it is Packed or Shipped it can no longer be cancelled.'],
  ['What happens to my payment if I cancel?', 'Paid orders are marked Refunded when cancelled. Cash on Delivery orders are simply cancelled and nothing is charged.'],
  ['Which payment methods can I use?', 'UPI, Card, Wallet and Cash on Delivery. In this demo build the online methods are simulated and no real money moves.'],
  ['How do I change my address?', 'Go to Profile > Addresses to add, edit or pick a default address. You can also change it during checkout.'],
];

export default function Help({ navigation }) {
  const { notify } = useCart();
  const [open, setOpen] = useState(0);
  const mail = () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Freshora%20support`).catch(() => notify('No email app found', 'error'));
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Section title="Frequently asked questions">
        <View style={{ backgroundColor: C.card, borderRadius: R, paddingHorizontal: 14, ...shadow }}>
          {FAQ.map(([q, a], i) => (
            <View key={q} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: C.border }}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setOpen(open === i ? -1 : i)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
                <Text style={{ flex: 1, fontFamily: FONT.heading, color: C.text }}>{q}</Text>
                <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
              </TouchableOpacity>
              {open === i && <Text style={{ color: C.muted, paddingBottom: 14, lineHeight: 20 }}>{a}</Text>}
            </View>
          ))}
        </View>
      </Section>
      <Section title="Need more help?">
        <View style={{ backgroundColor: C.card, borderRadius: R, padding: 14, ...shadow }}>
          <Text style={{ color: C.muted, marginBottom: 12 }}>Write to us at {SUPPORT_EMAIL} and mention your order ID if it is about an order.</Text>
          <Btn title="Email Support" onPress={mail} />
          <Btn title="View My Orders" outline onPress={() => navigation.getParent()?.navigate('OrdersTab', { screen: 'Root', params: { filter: 'all', ts: Date.now() } })} style={{ marginTop: 10 }} />
        </View>
      </Section>
    </ScrollView>
  );
}
