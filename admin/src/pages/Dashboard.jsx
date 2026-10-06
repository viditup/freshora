import React from 'react';
import { api } from '../services/api';
import { fmtDate, money, shortId } from '../utils';
import { Empty, ErrorBox, Loading, StatusBadge, useLoad } from '../components/ui';

export default function Dashboard() {
  const { data: s, loading, error, reload } = useLoad(async () => (await api.stats()).data.data);
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const st = s.orders_by_status;
  const cards = [['Total Users', s.users], ['Total Products', s.products], ['Total Categories', s.categories], ['Total Orders', s.orders],
    ['Total Revenue', money(s.revenue)], ['Pending Orders', st.pending ?? 0], ['In Progress', (st.confirmed ?? 0) + (st.packed ?? 0) + (st.shipped ?? 0)],
    ['Delivered Orders', st.delivered ?? 0], ['Cancelled Orders', st.cancelled ?? 0]];
  return (
    <>
      <h2>Dashboard</h2>
      <div className="grid">{cards.map(([k, v]) => <div key={k} className="card stat"><span className="muted">{k}</span><b>{v}</b></div>)}</div>
      <h3>Recent Orders</h3>
      <div className="card tableWrap">
        {!s.recent_orders.length ? <Empty text="No orders yet" /> : (
          <table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>{s.recent_orders.map((o) => (
              <tr key={o.id}><td>{shortId(o.id)}</td><td>{o.customer?.name || '-'}</td><td>{fmtDate(o.created_at)}</td><td>{money(o.total)}</td><td>{o.payment_method} / {o.payment_status}</td><td><StatusBadge status={o.order_status} /></td></tr>
            ))}</tbody></table>
        )}
      </div>
    </>
  );
}
