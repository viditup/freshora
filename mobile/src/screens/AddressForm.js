import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import Field from '../components/Field';
import Btn from '../components/Btn';
import { C, FONT } from '../theme';

export default function AddressForm({ navigation, route }) {
  const { address, returnTo } = route.params || {};
  const { notify } = useCart();
  const [f, setF] = useState({ name: address?.name || '', phone: address?.phone || '', address_line: address?.address_line || '', city: address?.city || '',
    state: address?.state || '', pincode: address?.pincode || '', landmark: address?.landmark || '', type: address?.type || 'Home', is_default: !!address?.is_default });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF({ ...f, [k]: v });

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
    if (f.address_line.trim().length < 3) e.address_line = 'Address is required';
    if (!f.city.trim()) e.city = 'City is required';
    if (!f.state.trim()) e.state = 'State is required';
    if (!/^[1-9]\d{5}$/.test(f.pincode.trim())) e.pincode = 'Enter a valid 6-digit PIN code';
    setErrs(e);
    return !Object.keys(e).length;
  };

  const save = async () => {
    if (!validate()) return;
    setBusy(true);
    const body = { ...f, name: f.name.trim(), phone: f.phone.trim(), address_line: f.address_line.trim(), city: f.city.trim(), state: f.state.trim(), pincode: f.pincode.trim(), landmark: f.landmark.trim() };
    try {
      const { data } = address ? await api.put(`/addresses/${address.id}`, body) : await api.post('/addresses', body);
      notify(address ? 'Address updated' : 'Address added');
      if (returnTo === 'Checkout') navigation.navigate({ name: 'Checkout', params: { addressId: data.address.id }, merge: true });
      else navigation.goBack();
    } catch (e) { notify(errMsg(e), 'error'); }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontFamily: FONT.bodySemi, color: C.text, marginBottom: 6 }}>Address type</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {['Home', 'Work', 'Other'].map((t) => (
            <TouchableOpacity key={t} onPress={() => set('type')(t)} style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: f.type === t ? C.green : '#fff', borderWidth: 1, borderColor: f.type === t ? C.green : C.border }}>
              <Text style={{ color: f.type === t ? '#fff' : C.text, fontFamily: FONT.heading }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field label="Full name" value={f.name} onChangeText={set('name')} error={errs.name} />
        <Field label="Mobile number" value={f.phone} onChangeText={set('phone')} error={errs.phone} keyboardType="phone-pad" maxLength={10} />
        <Field label="Address (house no, street, area)" value={f.address_line} onChangeText={set('address_line')} error={errs.address_line} />
        <Field label="Landmark (optional)" value={f.landmark} onChangeText={set('landmark')} />
        <Field label="City" value={f.city} onChangeText={set('city')} error={errs.city} />
        <Field label="State" value={f.state} onChangeText={set('state')} error={errs.state} />
        <Field label="PIN code" value={f.pincode} onChangeText={set('pincode')} error={errs.pincode} keyboardType="number-pad" maxLength={6} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontFamily: FONT.bodySemi, color: C.text }}>Make this my default address</Text>
          <Switch value={f.is_default} onValueChange={set('is_default')} trackColor={{ true: C.green }} />
        </View>
        <Btn title={address ? 'Update Address' : 'Save Address'} onPress={save} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
