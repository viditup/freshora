import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setUnauthorizedHandler } from '../api';

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    (async () => {
      try {
        if (await AsyncStorage.getItem('token')) {
          const { data } = await api.get('/auth/me'); // persistent login
          setUser(data.user);
        }
      } catch (e) { if (e.response?.status === 401 || e.response?.status === 403) await AsyncStorage.removeItem('token'); } // keep token if only the network/backend is down
      setReady(true);
    })();
  }, [logout]);

  const save = async (data) => { await AsyncStorage.setItem('token', data.token); setUser(data.user); };
  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const register = async (body) => save((await api.post('/auth/register', body)).data);

  return <AuthCtx.Provider value={{ user, setUser, ready, login, register, logout }}>{children}</AuthCtx.Provider>;
}
