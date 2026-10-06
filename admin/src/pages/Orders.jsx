import React, { useState } from 'react';
import { api, errMsg } from '../services/api';
import { fmtDate, money, shortId } from '../utils';
import { Empty, ErrorBox, Loading, Modal, STATUSES, StatusSelect, useLoad, useToast } from '../components/ui';

function OrderModal({ id, onClose, onChange }) {
  const { data: o, loading, error, reload } = useLoad(async () => (await api.order(id)).data.data, [id]);
  return (
    <Modal title={`Order ${shortId(id)}`} onClose={onClose} wide>
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <div className="detail">
          <p><b>Status:</b> <StatusSelect value={o.order_status} disabled={o.order_status === 'cancelled'} onChange={async (s) => { if (await onChange(o, s)) reload(); }} /></p>
          <p><b>Placed:</b> {fmtDate(o.created_at)}</p>
          <p><b>Customer:</b> {o.customer ? `${o.customer.name} • ${o.customer.email} • ${o.customer.phone || 'no phone'}` : 'Unknown'}</p>
          <p><b>Ship to:</b> {o.address.name}, {o.address.phone}<br />{o.address.address_line}{o.address.landmark ? `, ${o.address.landmark}` : ''}, {o.address.city}, {o.address.state} - {o.address.pincode}</p>
          <p><b>Payment:</b> {o.payment_method} ({o.payment_status})</p>
          <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
            <tbody>{o.items.map((i) => <tr key={i.product_id}><td>{i.name} <span className="muted small">{i.unit}</span></td><td>{i.quantity}</td><td>{money(i.price)}</td><td>{money(i.subtotal)}</td></tr>)}</tbody></table>
          <p className="right">Subtotal {money(o.subtotal)} • Discount -{money(o.discount)} • Delivery {money(o.delivery_fee)}<br /><b>Total {money(o.total)}</b></p>
        </div>
      )}
    </Modal>
  );
}

export default function Orders() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const { data, loading, error, reload } = useLoad(async () => (await api.orders({ status: status || undefined, page, limit: 20 })).data, [status, page]);

  const change = async (o, next) => {
    if (next === o.order_status) return false;
    if (next === 'cancelled' && !window.confirm('Cancel this order? Stock will be restored and this cannot be undone.')) return false;
    try { await api.setOrderStatus(o.id, next); toast(`Order marked ${next}`); reload(); return true; } catch (e) { toast(errMsg(e), 'error'); return false; }
  };

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const rows = data.data.filter((o) => !q || `${o.id} ${o.customer?.name} ${o.customer?.email}`.toLowerCase().includes(q.toLowerCase()));
  const pg = data.pagination;
  return (
    <>
      <div className="bar"><h2>Orders</h2>
        <div className="row"><input className="input sm" placeholder="Search id / customer" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div></div>
      <div className="card tableWrap">
        {!rows.length ? <Empty text="No orders found" /> : (
          <table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>{rows.map((o) => (
              <tr key={o.id}>
                <td><button className="link" onClick={() => setOpen(o.id)}>{shortId(o.id)}</button></td><td>{o.customer?.name || '-'}</td><td>{fmtDate(o.created_at)}</td>
                <td>{o.items.length}</td><td>{money(o.total)}</td><td>{o.payment_method} / {o.payment_status}</td>
                <td><StatusSelect value={o.order_status} disabled={o.order_status === 'cancelled'} onChange={(s) => change(o, s)} /></td>
              </tr>))}</tbody></table>
        )}
      </div>
      <div className="row end pager"><button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button><span className="muted">Page {pg.page} of {Math.max(pg.total_pages, 1)} ({pg.total} orders)</span><button className="btn ghost" disabled={page >= pg.total_pages} onClick={() => setPage(page + 1)}>Next</button></div>
      {open && <OrderModal id={open} onClose={() => setOpen(null)} onChange={change} />}
    </>
  );
}
