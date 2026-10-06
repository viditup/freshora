import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, errMsg } from '../api';
import { useWishlist } from '../context/WishlistContext';
import ProductCard, { useGridWidth } from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import { C, FS, S, T, FONT } from '../theme';

// PART 7: saved-items screen. Ids live in WishlistContext, the cards come from
// /products/by-ids so prices and stock are always current.
export default function Wishlist({ navigation }) {
  const { ids, remove, clear } = useWishlist();
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);
  const w = useGridWidth();

  const load = useCallback(async () => {
    if (!ids.length) { setItems([]); setErr(null); return; }
    try {
      const { data } = await api.get('/products/by-ids', { params: { ids: ids.join(',') } });
      setItems(data.data);
      setErr(null);
    } catch (e) { setErr(errMsg(e)); }
  }, [ids.join(',')]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load])); // refresh after un-saving elsewhere

  if (err && items === null) return <ErrorState message={err} onRetry={load} />;
  if (items === null) return <Loading />;
  if (!items.length)
    return <Empty icon="💚" title="No saved items yet" sub="Tap the heart on any product to save it here."
      action="Browse products" onAction={() => navigation.navigate('Products', { title: 'All Products' })} />;

  return (
    <FlatList data={items} numColumns={2} keyExtractor={(p) => p.id}
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: S.lg }}
      contentContainerStyle={{ paddingTop: S.lg, paddingBottom: 24 }}
      ListHeaderComponent={
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.lg, marginBottom: S.md }}>
          <Text style={[T.caption, { flex: 1 }]}>{items.length} saved item{items.length === 1 ? '' : 's'}</Text>
          <TouchableOpacity onPress={clear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: C.red, fontFamily: FONT.heading, fontSize: FS.sm }}>Clear all</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <ProductCard product={item} style={{ width: w, marginBottom: S.md }} wishlisted
          onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
          onWishlist={() => remove(item.id)} />
      )} />
  );
}
