import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const KEY = 'freshora_admin_token';
export const tokenStore = { get: () => localStorage.getItem(KEY), set: (t) => localStorage.setItem(KEY, t), clear: () => localStorage.removeItem(KEY) };

const http = axios.create({ baseURL: API_URL, timeout: 15000 });
http.interceptors.request.use((c) => {
  const t = tokenStore.get();
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

let onAuthFail = () => {};
export const setAuthFailHandler = (fn) => { onAuthFail = fn; };
http.interceptors.response.use((r) => r, (e) => {
  const s = e.response?.status;
  if ((s === 401 || s === 403) && tokenStore.get()) onAuthFail(); // expired token or lost admin rights -> back to login
  return Promise.reject(e);
});

// Backend errors look like { success:false, message }.
export const errMsg = (e) => {
  if (!e.response) return e.isAxiosError ? 'Cannot reach the server. Is the backend running?' : e.message;
  return e.response.data?.message || 'Something went wrong. Please try again.';
};

export const api = {
  login: (email, password) => http.post('/auth/login', { email, password }),
  me: () => http.get('/auth/me'),
  stats: () => http.get('/admin/dashboard/stats'),
  categories: () => http.get('/admin/categories'),
  createCategory: (b) => http.post('/admin/categories', b),
  updateCategory: (id, b) => http.put(`/admin/categories/${id}`, b),
  deleteCategory: (id) => http.delete(`/admin/categories/${id}`),
  orders: (params) => http.get('/admin/orders', { params }),
  order: (id) => http.get(`/admin/orders/${id}`),
  setOrderStatus: (id, status) => http.put(`/admin/orders/${id}/status`, { status }),
  products: (params) => http.get('/admin/products', { params }),
  createProduct: (b) => http.post('/admin/products', b),
  updateProduct: (id, b) => http.put(`/admin/products/${id}`, b),
  deleteProduct: (id) => http.delete(`/admin/products/${id}`),
  users: (params) => http.get('/admin/users', { params }),
};
