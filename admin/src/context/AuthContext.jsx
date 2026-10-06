import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setAuthFailHandler, tokenStore } from '../services/api';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  useEffect(() => {
    setAuthFailHandler(logout);
    (async () => {
      if (tokenStore.get()) {
        try {
          const { data } = await api.me(); // real backend check on every page load
          if (data.user.role === 'admin') setUser(data.user); else tokenStore.clear();
        } catch { tokenStore.clear(); }
      }
      setReady(true);
    })();
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.login(email, password);
    if (data.user.role !== 'admin') throw new Error('This account does not have admin access.');
    tokenStore.set(data.token);
    setUser(data.user);
  };
  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}
