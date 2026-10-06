import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import AddressCard from '../components/AddressCard';
import OrderItem from '../components/OrderItem';
import OrderStatus, { EtaBanner, StatusBadge } from '../components/OrderStatus';
import PriceSummary from '../components/PriceSummary';
import Btn from '../components/Btn';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { payLabel } from '../payments';
import { C, R, fmtDate, shortId, FONT } from '../theme';

const Card = ({ title, children }) => (
  // PART 9A: flat bordered cards; Order Summary uses PriceSummary design mode.
  <View style={{ backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border }}>
    <Text style={{ fontFamily: FONT.headingBold, color: C.text, marginBottom: 8, fontSize: 16 }}>{title}</Text>{children}
  </View>
);

export default function OrderDetails({ route }) {
  const { id } = route.params;
  const { notify } = useCart();
  const [o, setO] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { setO((await api.get(`/orders/${id}`)).data.order); setErr(null); } catch (e) { setErr(errMsg(e)); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  // PART 9: while the order is still moving, re-fetch every 20s so admin status changes show up without leaving the screen.
  const live = !!o && !['delivered', 'cancelled'].includes(o.order_status);
  useEffect(() => {
    if (!live) return undefined;
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [live, load]);

  if (err && !o) return <ErrorState message={err} onRetry={load} />;
  if (!o) return <Loading />;

  const doCancel = async () => {
    setBusy(true);
    try { setO((await api.post(`/orders/${id}/cancel`)).data.order); notify('Order cancelled'); }
    catch (e) { Alert.alert('Cannot cancel', errMsg(e)); load(); } // backend decides if cancelling is allowed
    setBusy(false);
  };
  const cancel = () => Alert.alert('Cancel order', 'Are you sure you want to cancel this order?', [{ text: 'No' }, { text: 'Yes, cancel', style: 'destructive', onPress: doCancel }]);
  const canCancel = ['pending', 'confirmed'].includes(o.order_status); // matches backend rule

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card title={`Order ${shortId(o.id)}`}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: C.muted }}>Placed on {fmtDate(o.created_at)}</Text><StatusBadge status={o.order_status} />
        </View>
      </Card>
      <Card title="Order Tracking">
        <EtaBanner order={o} style={{ marginBottom: 12 }} />
        <OrderStatus order={o} />
      </Card>
      <Card title="Delivery Address"><AddressCard a={o.address} /></Card>
      <Card title="Items">{o.items.map((i) => <OrderItem key={i.product_id} item={i} />)}</Card>
      <Card title="Payment">
        <Text style={{ color: C.text }}>Method: {payLabel(o.payment_method)}</Text>
        <Text style={{ color: C.text, marginTop: 2 }}>Status: {String(o.payment_status).replace(/^./, (c) => c.toUpperCase())}</Text>
        <Text style={{ color: C.text, marginTop: 2 }}>Delivery: {o.delivery_option === 'express' ? 'Express' : 'Standard'}{o.eta_minutes ? ` · ~${o.eta_minutes} min` : ''}</Text>
      </Card>
      <PriceSummary design data={o} />
      {canCancel && <Btn title="Cancel Order" outline color={C.red} onPress={cancel} loading={busy} style={{ marginTop: 16 }} />}
    </ScrollView>
  );
}
