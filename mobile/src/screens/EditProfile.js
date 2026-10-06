import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { api, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Field from '../components/Field';
import Btn from '../components/Btn';
import { C } from '../theme';

export default function EditProfile({ navigation }) {
  const { user, setUser } = useAuth();
  const { notify } = useCart();
  const [f, setF] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF({ ...f, [k]: v });

  const save = async () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email';
    if (f.phone.trim() && !/^\d{10}$/.test(f.phone.trim())) e.phone = 'Enter a 10-digit mobile number';
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const body = { name: f.name.trim(), email: f.email.trim() };
      if (f.phone.trim()) body.phone = f.phone.trim();
      const { data } = await api.put('/users/me', body);
      setUser(data.user);
      notify('Profile updated');
      navigation.goBack();
    } catch (er) { notify(errMsg(er), 'error'); }
    setBusy(false);
  };
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Field label="Full name" value={f.name} onChangeText={set('name')} error={errs.name} />
      <Field label="Email" value={f.email} onChangeText={set('email')} error={errs.email} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Mobile number" value={f.phone} onChangeText={set('phone')} error={errs.phone} keyboardType="phone-pad" maxLength={10} />
      <Btn title="Save Changes" onPress={save} loading={busy} />
    </ScrollView>
  );
}
