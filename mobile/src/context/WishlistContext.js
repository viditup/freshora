import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PART 7: wishlist lives on the device (AsyncStorage) - no backend needed.
// It stores product ids only, so the list is always rendered from fresh API data.
const KEY = 'wishlist_ids';
const WishCtx = createContext();
export const useWishlist = () => useContext(WishCtx);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v) { const a = JSON.parse(v); if (Array.isArray(a)) setIds(a); } })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next) => {
    setIds(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);
  const toggle = useCallback((id) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
    persist(next);
    return next.includes(id); // true = now saved
  }, [ids, persist]);
  const remove = useCallback((id) => persist(ids.filter((x) => x !== id)), [ids, persist]);
  const clear = useCallback(() => persist([]), [persist]);

  return (
    <WishCtx.Provider value={{ ids, count: ids.length, ready, has, toggle, remove, clear }}>
      {children}
    </WishCtx.Provider>
  );
}
