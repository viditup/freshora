import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from './api';
import { useAuth } from './context/AuthContext';
import { clearViewed, loadViewed } from './recent';

// PART 10: data for the lower Home rows. Each row finds its category in the /home categories list
// (matched by slug / name, like the Organic shortcut) and loads products with the existing /products endpoint.
// No backend change. If a category is missing or a request fails, that row simply stays hidden.
export const SECTION_DEFS = [
  { key: 'seasonal', match: /fruit/i, sort: 'newest' },
  { key: 'snacks', match: /snack/i, sort: 'popular' },
  { key: 'staples', match: /grocery|staple/i, sort: 'popular' },
  { key: 'personal', match: /personal/i, sort: 'popular' },
];
export const findCategory = (categories, re) => categories.find((c) => re.test(`${c.slug || ''} ${c.name}`));

// PART 31b: a Home row should show 4 cards. If a category has fewer, it is topped up with in-stock products of a similar kind
// (matched by name) from the general product list, then with any other product. Nothing is added to the database.
const FILL = {
  snacks: /snack|chip|cookie|makhana|namkeen|juice|coffee|tea|granola|muffin|bread|bun|coconut|nuts|oats|flakes|peanut/i,
  personal: /shampoo|soap|body wash|face wash|hand ?wash|toothpaste|toothbrush|lotion|wipes|diaper|cream|conditioner|deodorant|sanitizer|moisturi|bath|shaving|hair/i,
};
let poolPromise = null;
const getPool = () => {
  if (!poolPromise) poolPromise = api.get('/products', { params: { in_stock: true, limit: 60 } }).then((r) => r.data.data || []).catch(() => { poolPromise = null; return []; });
  return poolPromise;
};
async function fillRow(key, items, want = 4) {
  if (!FILL[key] || items.length >= want) return items;
  const pool = await getPool();
  const have = new Set(items.map((p) => p.id));
  const similar = pool.filter((p) => !have.has(p.id) && FILL[key].test(p.name) && !(key === 'personal' && /pet|dog|cat\b|puppy/i.test(p.name)));
  const out = [...items, ...similar];
  // PART 33: Personal Care is never padded with unrelated products (milk / oil showed up there) - it shows fewer cards instead.
  if (out.length < want && key !== 'personal') { const ids = new Set(out.map((p) => p.id)); out.push(...pool.filter((p) => !ids.has(p.id))); }
  return out.slice(0, Math.max(want, items.length));
}

const NONE = [];
export function useCategorySections(categories = NONE) {
  const [rows, setRows] = useState({});
  useEffect(() => {
    let live = true;
    SECTION_DEFS.forEach(async (s) => {
      const cat = findCategory(categories, s.match);
      if (!cat) { live && setRows((r) => ({ ...r, [s.key]: { cat: null, items: [] } })); return; }
      try {
        const { data } = await api.get('/products', { params: { category: cat.id, sort: s.sort, in_stock: true, limit: 10 } });
        const items = await fillRow(s.key, data.data || []);
        live && setRows((r) => ({ ...r, [s.key]: { cat, items } }));
      } catch (e) { /* keep the row hidden */ }
    });
    return () => { live = false; };
  }, [categories]);
  return rows;
}

export function useRecentlyViewed() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  useFocusEffect(useCallback(() => {
    let live = true;
    (async () => {
      const ids = await loadViewed(user.id);
      if (!ids.length) { if (live) setItems([]); return; }
      try {
        const { data } = await api.get('/products/by-ids', { params: { ids: ids.join(',') } });
        if (live) setItems(data.data);
      } catch (e) { /* keep what we have */ }
    })();
    return () => { live = false; };
  }, [user.id]));
  const clear = useCallback(async () => { await clearViewed(user.id); setItems([]); }, [user.id]);
  return [items, clear];
}
