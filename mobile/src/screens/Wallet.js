import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { useStored } from '../storage';
import { DemoNote, Section } from '../components/Demo';
import { C, R, rs, shadow, FONT } from '../theme';

const PRESETS = [100, 500, 1000, 2000];
const MAX_BALANCE = 10000;

export default function Wallet() {
  const { notify } = useCart();
  const [w, setW] = useStored('wallet', { balance: 0, txns: [] });

  const topUp = (amt) => {
    if (w.balance + amt > MAX_BALANCE) { notify(`Wallet limit is ${rs(MAX_BALANCE)}`, 'error'); return; }
    const txn = { id: String(Date.now()), title: 'Added to wallet (demo)', amount: amt, at: new Date().toISOString() };
    setW({ balance: w.balance + amt, txns: [txn, ...w.txns].slice(0, 30) });
    notify(`${rs(amt)} added`);
  };

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <DemoNote>Demo wallet: the balance is play money stored on this device. It is not linked to the server and is not deducted at checkout.</DemoNote>
      <View style={{ backgroundColor: C.dark, borderRadius: R + 4, padding: 20, marginBottom: 16, ...shadow }}>
        <Text style={{ color: '#D1E7D6' }}>Freshora Wallet</Text>
        <Text style={{ color: '#fff', fontSize: 34, fontFamily: FONT.headingBold, marginTop: 4 }}>{rs(w.balance)}</Text>
        <Text style={{ color: '#D1E7D6', fontSize: 12, marginTop: 2 }}>Max balance {rs(MAX_BALANCE)}</Text>
      </View>

      <Section title="Add money">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PRESETS.map((a) => (
            <TouchableOpacity key={a} activeOpacity={0.85} onPress={() => topUp(a)} style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: R, borderWidth: 1.5, borderColor: C.green, backgroundColor: '#fff' }}>
              <Text style={{ color: C.green, fontFamily: FONT.headingBold }}>+ {rs(a)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      <Section title="Transactions">
        {w.txns.length === 0
          ? <Text style={{ color: C.muted }}>No transactions yet.</Text>
          : <View style={{ backgroundColor: C.card, borderRadius: R, paddingHorizontal: 14, ...shadow }}>
              {w.txns.map((t, i) => (
                <View key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.bodySemi, color: C.text }}>{t.title}</Text>
                    <Text style={{ color: C.muted, fontSize: 12 }}>{new Date(t.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={{ fontFamily: FONT.headingBold, color: t.amount >= 0 ? C.green : C.red }}>{t.amount >= 0 ? '+' : '-'} {rs(Math.abs(t.amount))}</Text>
                </View>
              ))}
            </View>}
      </Section>
    </ScrollView>
  );
}
