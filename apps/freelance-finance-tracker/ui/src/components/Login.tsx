import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.post('/login', new URLSearchParams({ username: email, password }));
      localStorage.setItem('access_token', resp.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '64px auto', padding: 16 }}>
      <h1>Log in to your account</h1>
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autocomplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autocomplete="current-password" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={!email || !password || loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <p>Don’t have an account? <Link to="/register">Create account</Link></p>
    </main>
  );
};

export default Login;
