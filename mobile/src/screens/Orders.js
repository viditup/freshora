import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, errMsg } from '../api';
import { EtaBanner, StatusBadge } from '../components/OrderStatus';
import Chip from '../components/Chip';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import AppHeader from '../components/AppHeader';
import { payLabel } from '../payments';
import { GROUPS, inGroup } from '../orderUtils';
import Img from '../components/Img';
import { C, R, fmtDate, rs, shortId, FONT } from '../theme';

// PART 9A: flat bordered order cards with a photo strip (design look); logic unchanged.

const FILTERS = [['all', 'All'], ['deliver', GROUPS.deliver.label], ['delivered', GROUPS.delivered.label], ['returns', GROUPS.returns.label]];

export default function Orders({ navigation, route }) {
  const [filter, setFilter] = useState('all');
  // PART 9: Profile quick row opens this tab with { filter, ts }. `ts` changes on every tap so the same filter re-applies.
  useEffect(() => { if (route.params?.filter) setFilter(route.params.filter); }, [route.params?.filter, route.params?.ts]);
  const [list, setList] = useState(null);
  const [err, setErr] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    try { setList((await api.get('/orders')).data.data); setErr(null); } catch (e) { setErr(errMsg(e)); }
    setRefreshing(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const wrap = (body) => <View style={{ flex: 1, backgroundColor: C.bg }}><AppHeader title="My Orders" search={false} />{body}</View>;
  if (list === null && !err) return wrap(<Loading />);
  if (err && !list) return wrap(<ErrorState message={err} onRetry={load} />);
  const shown = list.filter((o) => inGroup(o, filter));
  const chips = (
    <View style={{ paddingTop: 12 }}>
      <ScrollView horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {FILTERS.map(([k, label]) => <Chip key={k} label={label} active={filter === k} onPress={() => setFilter(k)} />)}
      </ScrollView>
    </View>
  );
  return wrap(<>
    {chips}
    <FlatList style={{ backgroundColor: C.bg }} data={shown} keyExtractor={(o) => o.id} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}
      contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
      ListEmptyComponent={filter === 'all'
        ? <Empty icon="📦" title="No orders yet" sub="Your orders will show up here." action="Start Shopping" onAction={() => navigation.getParent()?.navigate('HomeTab')} />
        : <Empty icon="📭" title={`No ${GROUPS[filter].label.toLowerCase()} orders`} sub="Nothing here right now." action="Show all orders" onAction={() => setFilter('all')} />}
      renderItem={({ item: o }) => (
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('OrderDetails', { id: o.id })} style={{ backgroundColor: C.card, borderRadius: R, padding: 14, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.headingBold, color: C.text }}>Order {shortId(o.id)}</Text><StatusBadge status={o.order_status} />
          </View>
          <Text style={{ color: C.muted, fontFamily: FONT.body, marginTop: 4 }}>{fmtDate(o.created_at)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            {o.items.slice(0, 4).map((i) => (
              <View key={i.product_id} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: C.tile, overflow: 'hidden', marginRight: 8 }}>
                <Img fit="contain" uri={i.image} style={{ width: 44, height: 44 }} />
              </View>
            ))}
            {o.items.length > 4 && <Text style={{ color: C.muted, fontFamily: FONT.bodySemi }}>+{o.items.length - 4}</Text>}
          </View>
          <EtaBanner order={o} style={{ marginTop: 10, padding: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ color: C.muted, fontFamily: FONT.body }}>{o.items.length} item{o.items.length > 1 ? 's' : ''}  •  {payLabel(o.payment_method)}</Text>
            <Text style={{ fontFamily: FONT.headingBold, color: C.text }}>{rs(o.total)}</Text>
          </View>
        </TouchableOpacity>
      )} />
  </>);
}
