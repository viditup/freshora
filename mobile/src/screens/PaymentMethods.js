import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useStored } from '../storage';
import Field from '../components/Field';
import Btn from '../components/Btn';
import Chip from '../components/Chip';
import { DemoNote } from '../components/Demo';
import { C, R, shadow, FONT } from '../theme';

const fmtExpiry = (t) => { const d = t.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
const expiryOk = (e) => {
  const m = /^(\d\d)\/(\d\d)$/.exec(e);
  if (!m || +m[1] < 1 || +m[1] > 12) return false;
  const end = new Date(2000 + +m[2], +m[1], 1); // first day of the month after expiry
  return end > new Date();
};

export default function PaymentMethods() {
  const { notify } = useCart();
  const [list, setList] = useStored('saved_payments', []);
  const [type, setType] = useState(null); // null = form closed, 'upi' | 'card'
  const [f, setF] = useState({ upi: '', name: '', number: '', expiry: '' });
  const [errs, setErrs] = useState({});
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const close = () => { setType(null); setErrs({}); setF({ upi: '', name: '', number: '', expiry: '' }); };

  const add = () => {
    const e = {};
    let item;
    if (type === 'upi') {
      const id = f.upi.trim();
      if (!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(id)) e.upi = 'Enter a valid UPI ID, e.g. name@upi';
      item = { id: String(Date.now()), type: 'upi', title: id };
    } else {
      const num = f.number.replace(/\s/g, '');
      if (f.name.trim().length < 2) e.name = 'Name on card is required';
      if (!/^\d{13,19}$/.test(num)) e.number = 'Enter a valid card number';
      if (!expiryOk(f.expiry)) e.expiry = 'Enter a valid future date (MM/YY)';
      // Only the last 4 digits are kept. The full number is never stored and no CVV is collected.
      item = { id: String(Date.now()), type: 'card', title: `Card •••• ${num.slice(-4)}`, sub: `${f.name.trim()}  •  Exp ${f.expiry}` };
    }
    setErrs(e);
    if (Object.keys(e).length) return;
    if (list.some((x) => x.title === item.title && x.sub === item.sub)) { setErrs({ [type === 'upi' ? 'upi' : 'number']: 'Already saved' }); return; }
    setList([item, ...list]);
    notify('Payment method saved');
    close();
  };
  const remove = (p) => Alert.alert('Remove', `Remove ${p.title}?`, [{ text: 'Cancel' }, { text: 'Remove', style: 'destructive', onPress: () => setList(list.filter((x) => x.id !== p.id)) }]);

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <DemoNote>Demo only: there is no payment gateway and no real money. Details are kept on this device. Only the last 4 card digits are saved, and no CVV is ever asked for.</DemoNote>

      {list.length === 0 && !type && (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 44 }}>💳</Text>
          <Text style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: 16, marginTop: 6 }}>No saved payment methods</Text>
          <Text style={{ color: C.muted, marginTop: 4, textAlign: 'center' }}>Add a UPI ID or card for quicker checkout.</Text>
        </View>
      )}

      {list.map((p) => (
        <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 10, ...shadow }}>
          <Ionicons name={p.type === 'upi' ? 'phone-portrait-outline' : 'card-outline'} size={24} color={C.green} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontFamily: FONT.heading, color: C.text }}>{p.title}</Text>
            {!!p.sub && <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{p.sub}</Text>}
          </View>
          <TouchableOpacity onPress={() => remove(p)} hitSlop={10}><Ionicons name="trash-outline" size={20} color={C.red} /></TouchableOpacity>
        </View>
      ))}

      {type ? (
        <View style={{ backgroundColor: C.card, borderRadius: R, padding: 14, marginTop: 6, ...shadow }}>
          <Text style={{ fontFamily: FONT.headingBold, color: C.text, marginBottom: 10 }}>{type === 'upi' ? 'Add UPI ID' : 'Add Card'}</Text>
          {type === 'upi' ? (
            <Field label="UPI ID" value={f.upi} onChangeText={set('upi')} error={errs.upi} autoCapitalize="none" placeholder="name@upi" />
          ) : (<>
            <Field label="Name on card" value={f.name} onChangeText={set('name')} error={errs.name} autoCapitalize="words" />
            <Field label="Card number" value={f.number} onChangeText={(v) => set('number')(v.replace(/[^\d ]/g, ''))} error={errs.number} keyboardType="number-pad" maxLength={23} placeholder="1234 5678 9012 3456" />
            <Field label="Expiry" value={f.expiry} onChangeText={(v) => set('expiry')(fmtExpiry(v))} error={errs.expiry} keyboardType="number-pad" maxLength={5} placeholder="MM/YY" />
          </>)}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn title="Cancel" outline onPress={close} style={{ flex: 1 }} />
            <Btn title="Save" onPress={add} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <Chip label="+ Add UPI ID" onPress={() => setType('upi')} />
          <Chip label="+ Add Card" onPress={() => setType('card')} />
        </View>
      )}
    </ScrollView>
  );
}
