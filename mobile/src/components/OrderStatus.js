import React from 'react';
import { Text, View } from 'react-native';
import { C, R, FONT } from '../theme';
import { STEP_LIST, etaInfo, fmtClock, stepTime, toDate, useNow } from '../orderUtils';

export const STATUS = {
  pending: { label: 'Pending', color: C.amber }, confirmed: { label: 'Confirmed', color: '#2563EB' },
  packed: { label: 'Packed', color: '#7C3AED' }, shipped: { label: 'Shipped', color: '#0891B2' },
  delivered: { label: 'Delivered', color: C.green }, cancelled: { label: 'Cancelled', color: C.red },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, color: C.muted };
  return <View style={{ backgroundColor: s.color + '22', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 }}><Text style={{ color: s.color, fontFamily: FONT.headingBold, fontSize: 12 }}>{s.label}</Text></View>;
}

// PART 9: "Arriving in ~N min / Expected by 6:42 PM" banner. Renders nothing for delivered / cancelled orders.
export function EtaBanner({ order, style }) {
  const active = order.order_status !== 'cancelled' && order.order_status !== 'delivered';
  const now = useNow(30000, active);
  const e = etaInfo(order, now);
  if (!e) return null;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: e.late ? C.amber + '22' : C.light, borderRadius: R, padding: 12 }, style]}>
      <Text style={{ fontSize: 24 }}>{e.late ? '⏳' : '🛵'}</Text>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: 15 }}>{e.title}</Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{e.sub}</Text>
      </View>
    </View>
  );
}

// Vertical tracking timeline. Placed shows the real time; upcoming steps show an estimated time (backend has no per-step timestamps).
// Pass `order` for times; passing only `status` still works (no times).
export default function OrderStatus({ status, order }) {
  const st = order ? order.order_status : status;
  if (st === 'cancelled')
    return <View style={{ backgroundColor: C.red + '18', borderRadius: R, padding: 14 }}><Text style={{ color: C.red, fontFamily: FONT.headingBold }}>❌ Order Cancelled</Text></View>;
  const cur = STEP_LIST.findIndex(([k]) => k === st);
  const delivered = st === 'delivered';
  return (
    <View>
      {STEP_LIST.map(([k, label], i) => {
        const done = i <= cur;
        let note = '';
        if (order) {
          if (k === 'pending') note = fmtClock(toDate(order.created_at));
          else if (delivered && k === 'delivered') note = 'Delivered';
          else if (!done) note = `Est. ${fmtClock(stepTime(order, k))}`;
          else if (i === cur) note = 'In progress';
          else note = 'Done';
        }
        return (
          <View key={k} style={{ flexDirection: 'row', minHeight: 44 }}>
            <View style={{ alignItems: 'center', width: 24 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: done ? C.green : C.border, borderWidth: i === cur ? 3 : 0, borderColor: C.light }} />
              {i < STEP_LIST.length - 1 && <View style={{ flex: 1, width: 2, backgroundColor: i < cur ? C.green : C.border }} />}
            </View>
            <View style={{ marginLeft: 10, flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: i === cur ? FONT.headingBold : FONT.bodyMedium, color: done ? C.text : C.muted }}>{label}</Text>
              {!!note && <Text style={{ fontSize: 12, color: done ? C.green : C.muted, fontFamily: done ? FONT.heading : FONT.bodyMedium }}>{note}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}
