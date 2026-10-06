import React, { useState } from 'react';
import { api, errMsg } from '../services/api';
import { money } from '../utils';
import { Empty, ErrorBox, Loading, Modal, useLoad, useToast } from '../components/ui';

const blank = { name: '', category_id: '', price: '', original_price: '', stock: 0, unit: '1 kg', description: '', image: '', subcategory: '', brand: '', organic: false, pack_sizes: '', featured: false, active: true };

export default function Products() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useLoad(async () => (await api.products({ page, limit: 50 })).data, [page]);
  const cats = useLoad(async () => (await api.categories()).data.data);
  const [edit, setEdit] = useState(null); // null | {} (new) | product
  const [form, setForm] = useState(blank);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const openForm = (p) => {
    setEdit(p);
    setForm(p.id ? { name: p.name, category_id: p.category_id, price: p.price, original_price: p.original_price ?? '', stock: p.stock, unit: p.unit || '', description: p.description || '', image: p.images?.[0] || '', subcategory: p.subcategory || '', brand: p.brand || '', organic: !!p.organic, pack_sizes: (p.pack_sizes || []).map((k) => `${k.label} | ${k.price}${k.original_price > k.price ? ` | ${k.original_price}` : ''}`).join('\n'), featured: !!p.featured, active: p.active !== false }
      : { ...blank, category_id: cats.data?.[0]?.id || '' });
  };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { name: form.name.trim(), category_id: form.category_id, price: parseFloat(form.price), stock: parseInt(form.stock, 10) || 0, unit: form.unit.trim() || '1 pc',
      description: form.description.trim(), images: form.image.trim() ? [form.image.trim()] : [],
      subcategory: form.subcategory.trim(), brand: form.brand.trim(), organic: !!form.organic,
      pack_sizes: form.pack_sizes.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((a) => a[0] && parseFloat(a[1]) > 0)
        .map((a) => ({ label: a[0], price: parseFloat(a[1]), ...(a[2] && parseFloat(a[2]) > 0 ? { original_price: parseFloat(a[2]) } : {}) })),
      featured: form.featured, active: form.active };
    if (form.original_price !== '') body.original_price = parseFloat(form.original_price);
    try {
      edit.id ? await api.updateProduct(edit.id, body) : await api.createProduct(body);
      toast(edit.id ? 'Product updated' : 'Product created'); setEdit(null); reload();
    } catch (er) { toast(errMsg(er), 'error'); }
    setBusy(false);
  };
  const deactivate = async () => {
    setBusy(true);
    try { await api.deleteProduct(del.id); toast('Product deactivated'); reload(); } catch (er) { toast(errMsg(er), 'error'); }
    setDel(null); setBusy(false);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  if ((loading && !data) || cats.loading) return <Loading />;
  if (error || cats.error) return <ErrorBox message={error || cats.error} onRetry={() => { reload(); cats.reload(); }} />;
  const rows = data.data.filter((p) => `${p.name} ${p.category_name}`.toLowerCase().includes(q.toLowerCase()));
  const pg = data.pagination;
  return (
    <>
      <div className="bar"><h2>Products ({pg.total})</h2><div className="row"><input className="input sm" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn" onClick={() => openForm({})}>+ Add Product</button></div></div>
      <div className="card tableWrap">
        {!rows.length ? <Empty text={q ? 'No matching products' : 'No products yet. Add your first one.'} /> : (
          <table><thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
            <tbody>{rows.map((p) => (
              <tr key={p.id}>
                <td><img className="thumb" src={p.images?.[0]} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }} /></td>
                <td><b>{p.name}</b>{p.featured && <span className="badge confirmed" style={{ marginLeft: 6 }}>featured</span>}<div className="muted small">{p.unit}</div></td>
                <td>{p.category_name}</td>
                <td>{money(p.price)}{p.original_price > p.price && <div className="muted small"><s>{money(p.original_price)}</s> ({p.discount}% off)</div>}</td>
                <td className={p.stock <= 5 ? 'err' : ''}>{p.stock}</td>
                <td><span className={`badge ${p.active ? 'delivered' : 'cancelled'}`}>{p.active ? 'active' : 'inactive'}</span></td>
                <td className="actions"><button className="link" onClick={() => openForm(p)}>Edit</button>{p.active && <button className="link red" onClick={() => setDel(p)}>Deactivate</button>}</td>
              </tr>))}</tbody></table>
        )}
      </div>
      <div className="row end pager"><button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button><span className="muted">Page {pg.page} of {Math.max(pg.total_pages, 1)}</span><button className="btn ghost" disabled={page >= pg.total_pages} onClick={() => setPage(page + 1)}>Next</button></div>
      {edit && (
        <Modal title={edit.id ? 'Edit Product' : 'Add Product'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="form">
            <label>Name<input className="input" value={form.name} onChange={set('name')} minLength={2} required /></label>
            <label>Category<select className="input" value={form.category_id} onChange={set('category_id')} required>{cats.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <div className="row"><label style={{ flex: 1 }}>Price (₹)<input className="input" type="number" min="0.01" step="0.01" value={form.price} onChange={set('price')} required /></label>
              <label style={{ flex: 1 }}>MRP (₹)<input className="input" type="number" min="0.01" step="0.01" value={form.original_price} onChange={set('original_price')} /></label></div>
            <div className="row"><label style={{ flex: 1 }}>Stock<input className="input" type="number" min="0" value={form.stock} onChange={set('stock')} required /></label>
              <label style={{ flex: 1 }}>Unit<input className="input" value={form.unit} onChange={set('unit')} placeholder="1 kg" /></label></div>
            <label>Description<input className="input" value={form.description} onChange={set('description')} /></label>
            <div className="row"><label style={{ flex: 1 }}>Sub-category (listing chip)<input className="input" value={form.subcategory} onChange={set('subcategory')} placeholder="Leafy Greens" /></label>
              <label style={{ flex: 1 }}>Brand (filter)<input className="input" value={form.brand} onChange={set('brand')} placeholder="Freshora Farm" /></label></div>
            <label className="check"><input type="checkbox" checked={form.organic} onChange={set('organic')} /> Organic (shows in the Organic filter)</label>
            <label>Pack sizes (optional - one per line: label | price | MRP)<textarea className="input" rows={3} value={form.pack_sizes} onChange={set('pack_sizes')} placeholder={'500 g | 75 | 89\n1 kg | 149 | 179\n2 kg | 283 | 358'} /></label>
            <label>Image URL<input className="input" value={form.image} onChange={set('image')} /></label>
            <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured on Home</label>
            <label className="check"><input type="checkbox" checked={form.active} onChange={set('active')} /> Active (visible in the app)</label>
            <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title="Deactivate product?" onClose={() => setDel(null)}>
          <p><b>{del.name}</b> will be hidden from the app. Old orders are not affected, and you can re-activate it with Edit.</p>
          <div className="row end"><button className="btn ghost" onClick={() => setDel(null)}>Cancel</button><button className="btn red" onClick={deactivate} disabled={busy}>Deactivate</button></div>
        </Modal>
      )}
    </>
  );
}
