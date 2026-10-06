import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { errMsg } from '../services/api';

const ToastCtx = createContext();
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const timer = useRef();
  const toast = useCallback((message, type = 'ok') => {
    clearTimeout(timer.current); setT({ message, type });
    timer.current = setTimeout(() => setT(null), 3200);
  }, []);
  return <ToastCtx.Provider value={toast}>{children}{t && <div className={`toast ${t.type}`}>{t.message}</div>}</ToastCtx.Provider>;
}

// Loads data with loading/error state and a reload function.
export function useLoad(fn, deps = []) {
  const [s, setS] = useState({ data: null, loading: true, error: null });
  const load = useCallback(async () => {
    setS((p) => ({ ...p, loading: true, error: null }));
    try { setS({ data: await fn(), loading: false, error: null }); } catch (e) { setS({ data: null, loading: false, error: errMsg(e) }); }
  }, deps); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  return { ...s, reload: load };
}

export const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
export const Loading = () => <div className="center"><div className="spinner" /></div>;
export const ErrorBox = ({ message, onRetry }) => <div className="center"><p className="err">{message}</p>{onRetry && <button className="btn" onClick={onRetry}>Retry</button>}</div>;
export const Empty = ({ text }) => <div className="center muted">{text}</div>;
export const StatusBadge = ({ status }) => <span className={`badge ${status}`}>{status}</span>;

export function StatusSelect({ value, onChange, disabled }) {
  return <select className="input sm" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>;
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="mh"><h3>{title}</h3><button className="x" onClick={onClose}>×</button></div>
        {children}
      </div>
    </div>
  );
}
