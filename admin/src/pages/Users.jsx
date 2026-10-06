import React, { useState } from 'react';
import { api } from '../services/api';
import { fmtDate } from '../utils';
import { Empty, ErrorBox, Loading, useLoad } from '../components/ui';

export default function Users() {
  const { data, loading, error, reload } = useLoad(async () => (await api.users({ limit: 200 })).data);
  const [q, setQ] = useState('');
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const rows = data.data.filter((u) => `${u.name} ${u.email} ${u.phone || ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="bar"><h2>Users ({data.total})</h2><input className="input sm" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="card tableWrap">
        {!rows.length ? <Empty text="No users found" /> : (
          <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Account</th><th>Joined</th></tr></thead>
            <tbody>{rows.map((u) => (
              <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone || '-'}</td><td>{u.role}</td>
                <td><span className={`badge ${u.active === false ? 'cancelled' : 'delivered'}`}>{u.active === false ? 'disabled' : 'active'}</span></td><td>{fmtDate(u.created_at)}</td></tr>))}</tbody></table>
        )}
      </div>
    </>
  );
}
