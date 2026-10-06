import React, { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import AddressCard from '../components/AddressCard';
import Btn from '../components/Btn';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import { C } from '../theme';

export default function Addresses({ navigation, route }) {
  const select = !!route.params?.select; // opened from Checkout
  const { notify } = useCart();
  const [list, setList] = useState(null);
  const [err, setErr] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setList((await api.get('/addresses')).data.data); setErr(null); } catch (e) { setErr(errMsg(e)); }
    setRefreshing(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const act = async (fn, msg) => { try { await fn(); notify(msg); } catch (e) { notify(errMsg(e), 'error'); } load(); };
  const del = (a) => Alert.alert('Delete address', 'Are you sure you want to delete this address?', [
    { text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => act(() => api.delete(`/addresses/${a.id}`), 'Address deleted') }]);
  const add = () => navigation.navigate('AddressForm', { returnTo: 'Addresses' });

  if (list === null && !err) return <Loading />;
  if (err && !list) return <ErrorState message={err} onRetry={load} />;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList data={list} keyExtractor={(a) => a.id} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Empty icon="📍" title="No saved addresses" sub="Add an address to get your groceries delivered." action="Add Address" onAction={add} />}
        renderItem={({ item: a }) => (
          <AddressCard a={a}
            onSelect={select ? () => navigation.navigate({ name: 'Checkout', params: { addressId: a.id }, merge: true }) : undefined}
            onEdit={() => navigation.navigate('AddressForm', { address: a, returnTo: 'Addresses' })}
            onDelete={() => del(a)}
            onDefault={() => act(() => api.post(`/addresses/${a.id}/default`), 'Default address updated')} />
        )} />
      {list?.length > 0 && <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: C.border }}><Btn title="+ Add New Address" onPress={add} /></View>}
    </View>
  );
}
