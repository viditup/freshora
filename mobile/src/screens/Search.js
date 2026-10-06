import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, errMsg } from '../api';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import ProductGrid from '../components/ProductGrid';
import { C, R, FONT } from '../theme';

export default function Search({ navigation }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(null); // null = nothing searched yet
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [recent, setRecent] = useState([]);
  const req = useRef(0);

  useEffect(() => { AsyncStorage.getItem('recent_searches').then((v) => v && setRecent(JSON.parse(v))).catch(() => {}); }, []);
  const saveRecent = async (t) => {
    const n = [t, ...recent.filter((x) => x !== t)].slice(0, 6);
    setRecent(n);
    await AsyncStorage.setItem('recent_searches', JSON.stringify(n)).catch(() => {});
  };
  const clearRecent = () => { setRecent([]); AsyncStorage.removeItem('recent_searches'); };

  const run = useCallback(async (text) => {
    const id = ++req.current; // ignore out-of-order responses
    if (!text.trim()) { setItems(null); setLoading(false); setErr(null); return; }
    setLoading(true);
    try {
      const { data } = await api.get('/products/search', { params: { q: text.trim(), limit: 40 } });
      if (id !== req.current) return;
      setItems(data.data); setErr(null);
    } catch (e) { if (id !== req.current) return; setErr(errMsg(e)); }
    setLoading(false);
  }, []);
  useEffect(() => { const t = setTimeout(() => run(q), 400); return () => clearTimeout(t); }, [q, run]);
  const submit = (text = q) => { if (text.trim()) { setQ(text); run(text); saveRecent(text.trim()); } };

  let body;
  if (err) body = <ErrorState message={err} onRetry={() => run(q)} />;
  else if (loading) body = <Loading />;
  else if (items === null)
    body = (
      <View style={{ padding: 16 }}>
        {recent.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: FONT.headingBold, color: C.text }}>Recent searches</Text>
              <TouchableOpacity onPress={clearRecent}><Text style={{ color: C.green, fontFamily: FONT.heading }}>Clear</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {recent.map((r) => (
                <TouchableOpacity key={r} onPress={() => submit(r)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 7 }}>
                  <Text style={{ color: C.text }}>🕘 {r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        {!recent.length && <Empty icon="🔍" title="Search Freshora" sub="Find fruits, vegetables, dairy and more." />}
      </View>
    );
  else body = <ProductGrid data={items} ListHeaderComponent={<View style={{ height: 8 }} />} ListEmptyComponent={<Empty icon="😕" title="No results" sub={`Nothing matched "${q}". Try a different word.`} />} />;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 16 }}>
      <TouchableOpacity onPress={() => { Keyboard.dismiss(); navigation.goBack(); }} accessibilityLabel="Close search" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 10 }}>
        <Ionicons name="arrow-back" size={24} color={C.text} />
      </TouchableOpacity>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: R, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12 }}>
        <Ionicons name="search" size={18} color={C.muted} />
        <TextInput style={{ flex: 1, padding: 12 }} autoFocus placeholder="Search products..." value={q} onChangeText={setQ} returnKeyType="search" onSubmitEditing={() => submit()} autoCorrect={false} />
        {!!q && <TouchableOpacity onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity>}
        <TouchableOpacity onPress={() => submit()} style={{ marginLeft: 8, backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: '#fff', fontFamily: FONT.heading }}>Go</Text></TouchableOpacity>
      </View>
      </View>
      <View style={{ flex: 1 }}>{body}</View>
    </SafeAreaView>
  );
}
