import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './context/AuthContext';

// PART 10: per-user, on-device storage for the demo-only screens (wallet, saved payments, settings).
// Keys are namespaced by user id so two accounts on one phone never see each other's data.
export const userKey = (uid, name) => `freshora:${uid}:${name}`;

export function useStored(name, initial) {
  const { user } = useAuth();
  const key = userKey(user.id, name);
  const [val, setVal] = useState(initial);
  const [ready, setReady] = useState(false);
  const init = useRef(initial);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(key)
      .then((v) => { if (live && v != null) setVal(JSON.parse(v)); })
      .catch(() => {})
      .finally(() => live && setReady(true));
    return () => { live = false; };
  }, [key]);
  const save = useCallback((next) => {
    setVal(next);
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
  }, [key]);
  return [val, save, ready, init.current];
}

export const DEMO_KEYS = ['wallet', 'saved_payments', 'settings', 'recent_viewed'];
export const clearDemoData = (uid) => AsyncStorage.multiRemove(DEMO_KEYS.map((k) => userKey(uid, k)));
