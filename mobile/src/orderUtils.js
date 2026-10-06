import { useEffect, useState } from 'react';

// PART 9: shared order helpers (grouping for Profile quick row / Orders filter, ETA maths for tracking).
// The backend stores no per-step timestamps, so step ETAs are ESTIMATES derived from created_at + eta_minutes.

export const TO_DELIVER = ['pending', 'confirmed', 'packed', 'shipped'];
export const GROUPS = {
  deliver: { label: 'To Deliver', statuses: TO_DELIVER },
  delivered: { label: 'Delivered', statuses: ['delivered'] },
  returns: { label: 'Returns', statuses: ['cancelled'] }, // no returns flow in the backend: cancelled / refunded orders live here
};
export const inGroup = (o, key) => !key || key === 'all' || GROUPS[key].statuses.includes(o.order_status);

// Backend sends UTC datetimes without a timezone suffix; treat them as UTC (same rule as theme.fmtDate).
export const toDate = (s) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z');
export const fmtClock = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

// Fraction of the total ETA at which each step is expected. Delivered is always the full ETA.
const STEP_AT = { pending: 0, confirmed: 0.1, packed: 0.4, shipped: 0.65, delivered: 1 };
export const STEP_LIST = [['pending', 'Order Placed'], ['confirmed', 'Confirmed'], ['packed', 'Packed'], ['shipped', 'Shipped'], ['delivered', 'Delivered']];

export function stepTime(order, key) {
  const eta = order.eta_minutes ?? 10;
  return new Date(toDate(order.created_at).getTime() + eta * 60000 * STEP_AT[key]);
}

// Headline ETA text for an order, or null when it is finished/cancelled.
export function etaInfo(order, now = Date.now()) {
  if (order.order_status === 'cancelled' || order.order_status === 'delivered') return null;
  const due = stepTime(order, 'delivered');
  const mins = Math.ceil((due.getTime() - now) / 60000);
  if (mins <= 0) return { late: true, title: 'Arriving any moment', sub: 'Slightly delayed - your order is on its way' };
  return { late: false, title: `Arriving in ~${mins} min`, sub: `Expected by ${fmtClock(due)}` };
}

// Re-renders every `ms` so countdowns stay fresh. Only ticks while `on` is true.
export function useNow(ms = 30000, on = true) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!on) return undefined;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms, on]);
  return now;
}
