import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import Field from '../components/Field';
import Btn from '../components/Btn';
import { C } from '../theme';

export default function ChangePassword({ navigation }) {
  const { notify } = useCart();
  const [f, setF] = useState({ cur: '', next: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF({ ...f, [k]: v });

  const save = async () => {
    const e = {};
    if (!f.cur) e.cur = 'Enter your current password';
    if (f.next.length < 6) e.next = 'New password must be at least 6 characters';
    if (f.confirm !== f.next) e.confirm = 'Passwords do not match';
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await api.put('/users/me/password', { current_password: f.cur, new_password: f.next });
      notify('Password changed');
      navigation.goBack();
    } catch (er) { notify(errMsg(er), 'error'); }
    setBusy(false);
  };
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Field label="Current password" secureTextEntry value={f.cur} onChangeText={set('cur')} error={errs.cur} />
      <Field label="New password" secureTextEntry value={f.next} onChangeText={set('next')} error={errs.next} />
      <Field label="Confirm new password" secureTextEntry value={f.confirm} onChangeText={set('confirm')} error={errs.confirm} />
      <Btn title="Update Password" onPress={save} loading={busy} />
    </ScrollView>
  );
}
