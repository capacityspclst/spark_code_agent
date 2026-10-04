import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

const NavTabs: React.FC = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  return (
    <nav style={{ position: 'fixed', bottom: 0, width: '100%', height: 64, display: 'flex', justifyContent: 'space-around', background: '#fff', borderTop: '1px solid var(--c-border)' }}>
      <Link role="tab" to="/dashboard" style={{ padding: 16 }}>Dashboard</Link>
      <Link role="tab" to="/profile" style={{ padding: 16 }}>Profile</Link>
    </nav>
  );
};

const App: React.FC = () => {
  const token = localStorage.getItem('access_token');
  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <NavTabs />
    </Router>
  );
};

export default App;