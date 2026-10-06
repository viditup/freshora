import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.request.use(async (cfg) => {
  const token = await AsyncStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) onUnauthorized();
    return Promise.reject(e);
  }
);

// Turns any axios/FastAPI error into a readable message
export const errMsg = (e) => {
  if (!e.response) return `Cannot reach ${API_URL}. Check Wi-Fi, firewall (port 8000), that the backend is running, and HOST in src/config.js`;
  const m = e.response.data?.message;
  if (typeof m === 'string') return m;
  const d = e.response.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x) => x.msg).join('\n');
  return 'Something went wrong. Please try again.';
};
