import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api';
import { AuthContext } from '../App';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    // Register the user
    const regRes = await register(email, password);
    if (regRes.id) {
      // Auto‑login after successful registration
      const loginRes = await login(email, password);
      if (loginRes.access_token) {
        setToken(loginRes.access_token);
        navigate('/dashboard');
        return;
      }
      setError('Login after registration failed');
    } else {
      setError(regRes.detail || 'Registration failed');
    }
  };

  return (
    <div className="card">
      <h1>Create your account</h1>
      {error && <p className="error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <label htmlFor="confirm">Confirm password</label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <button type="submit" className="primary">Create account</button>
      </form>
    </div>
  );
};
