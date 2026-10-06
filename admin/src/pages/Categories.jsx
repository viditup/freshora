import React, { useState } from 'react';
import { api, errMsg } from '../services/api';
import { Empty, ErrorBox, Loading, Modal, useLoad, useToast } from '../components/ui';

export default function Categories() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(async () => (await api.categories()).data.data);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null); // null | {} (new) | category
  const [del, setDel] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const openForm = (c) => { setEdit(c); setForm({ name: c.name || '', description: c.description || '', image: c.image || '', active: c.active ?? true }); };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      edit.id ? await api.updateCategory(edit.id, form) : await api.createCategory(form);
      toast(edit.id ? 'Category updated' : 'Category created'); setEdit(null); reload();
    } catch (er) { toast(errMsg(er), 'error'); }
    setBusy(false);
  };
  const remove = async () => {
    setBusy(true);
    try { await api.deleteCategory(del.id); toast('Category deleted'); setDel(null); reload(); } catch (er) { toast(errMsg(er), 'error'); setDel(null); }
    setBusy(false);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const rows = data.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="bar"><h2>Categories</h2><div className="row"><input className="input sm" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn" onClick={() => openForm({})}>+ Add Category</button></div></div>
      <div className="card tableWrap">
        {!rows.length ? <Empty text={q ? 'No matching categories' : 'No categories yet. Add your first one.'} /> : (
          <table><thead><tr><th></th><th>Name</th><th>Slug</th><th>Products</th><th>Status</th><th></th></tr></thead>
            <tbody>{rows.map((c) => (
              <tr key={c.id}>
                <td><img className="thumb" src={c.image} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }} /></td>
                <td><b>{c.name}</b><div className="muted small">{c.description}</div></td><td>{c.slug}</td><td>{c.product_count}</td>
                <td><span className={`badge ${c.active ? 'delivered' : 'cancelled'}`}>{c.active ? 'active' : 'inactive'}</span></td>
                <td className="actions"><button className="link" onClick={() => openForm(c)}>Edit</button><button className="link red" onClick={() => setDel(c)}>Delete</button></td>
              </tr>))}</tbody></table>
        )}
      </div>
      {edit && (
        <Modal title={edit.id ? 'Edit Category' : 'Add Category'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="form">
            <label>Name<input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} minLength={2} maxLength={40} required /></label>
            <label>Description<input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={200} /></label>
            <label>Image URL (blank = auto placeholder)<input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label>
            <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active (visible in the app)</label>
            <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title="Delete category?" onClose={() => setDel(null)}>
          <p>Are you sure you want to delete <b>{del.name}</b>? {del.product_count > 0 && <span className="err">It has {del.product_count} product(s) and the server will refuse.</span>}</p>
          <div className="row end"><button className="btn ghost" onClick={() => setDel(null)}>Cancel</button><button className="btn red" onClick={remove} disabled={busy}>Delete</button></div>
        </Modal>
      )}
    </>
  );
}
