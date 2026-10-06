import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [['/', 'Dashboard', '📊'], ['/categories', 'Categories', '🗂️'], ['/products', 'Products', '🛒'], ['/orders', 'Orders', '📦'], ['/users', 'Users', '👥']];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">freshora<small>admin</small></div>
        <nav>{links.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>{icon} {label}</NavLink>)}</nav>
      </aside>
      <div className="main">
        <header className="top"><span className="muted">Signed in as <b>{user.name}</b></span><button className="btn ghost" onClick={logout}>Logout</button></header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
