import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, errMsg } from '../api';
import { C, FONT } from '../theme';

const CartCtx = createContext();
export const useCart = () => useContext(CartCtx);
const EMPTY = { items: [], summary: { subtotal: 0, discount: 0, delivery_fee: 0, total: 0 }, delivery: null };

// Backend is the source of truth: every action calls the API and stores the returned cart.
// PART 7: add/update accept the chosen pack-size label so the cart line keeps its pack.
// PART 8: a delivery option (standard | express) rides every call so the server prices the
// delivery fee for it - the Cart progress bar and the Checkout review both read the same numbers.
export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [option, setOption] = useState('standard'); // delivery option
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const insets = useSafeAreaInsets();

  const notify = useCallback((message, type = 'ok') => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 1800);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const loadCart = useCallback(async () => {
    try {
      const { data } = await api.get('/cart', { params: { delivery: option } });
      setCart({ items: data.items, summary: data.summary, delivery: data.delivery });
      setError(null);
    } catch (e) { setError(errMsg(e)); }
    setReady(true);
  }, [option]);
  useEffect(() => { loadCart(); }, [loadCart]); // provider only mounts after login

  const run = async (fn, successMsg) => {
    try {
      const { data } = await fn();
      setCart({ items: data.items, summary: data.summary, delivery: data.delivery });
      if (successMsg) notify(successMsg);
      return true;
    } catch (e) { notify(errMsg(e), 'error'); return false; }
  };
  const q = { params: { delivery: option } };
  const addToCart = (id, quantity = 1, unit = '') => run(() => api.post('/cart/items', { product_id: id, quantity, ...(unit ? { unit } : {}) }, q), 'Added to cart');
  const updateQuantity = (id, quantity, unit = '') => run(() => api.put(`/cart/items/${id}`, { quantity, ...(unit ? { unit } : {}) }, q));
  const removeFromCart = (id) => run(() => api.delete(`/cart/items/${id}`, q), 'Item removed');
  const clearCart = () => run(() => api.delete('/cart', q), 'Cart cleared');
  const changeDelivery = useCallback((key) => setOption(key === 'express' ? 'express' : 'standard'), []);
  const count = cart.items.reduce((t, i) => t + i.quantity, 0);

  return (
    <CartCtx.Provider value={{ cart, count, ready, error, notify, loadCart, refreshCart: loadCart, add: addToCart, addToCart, updateQuantity, removeFromCart, clearCart, delivery: option, changeDelivery }}>
      <View style={{ flex: 1 }}>
        {children}
        {toast && (
          <View pointerEvents="none" style={{ position: 'absolute', bottom: 80 + insets.bottom, left: 20, right: 20, alignItems: 'center' }}>
            <View style={{ backgroundColor: toast.type === 'error' ? C.red : C.dark, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22 }}>
              <Text style={{ color: '#fff', fontFamily: FONT.bodySemi }}>{toast.message}</Text>
            </View>
          </View>
        )}
      </View>
    </CartCtx.Provider>
  );
}
