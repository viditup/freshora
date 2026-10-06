import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Login() {
  const { user, login } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(f.email.trim(), f.password); } catch (er) { setErr(errMsg(er)); }
    setBusy(false);
  };
  return (
    <div className="loginWrap">
      <form className="card loginCard" onSubmit={submit}>
        <div className="logo big">freshora<small>admin</small></div>
        <input className="input" type="email" placeholder="Admin email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        {err && <p className="err">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </div>
  );
}
