import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (password.length < 12) return 'Password must be at least 12 characters.';
    if (!/[a-z]/.test(password)) return 'Password must include a lower‑case letter.';
    if (!/[A-Z]/.test(password)) return 'Password must include an upper‑case letter.';
    if (!/[0-9]/.test(password)) return 'Password must include a digit.';
    if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must include a symbol.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationMsg = validate();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }
    try {
      await api.post('/register', { email, password, confirm_password: confirmPassword });
      // auto‑login after successful registration
      const loginResp = await api.post('/login', new URLSearchParams({ username: email, password }));
      localStorage.setItem('access_token', loginResp.data.access_token);
      setSuccess('Account created! Welcome.');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '64px auto', padding: 16 }}>
      <h1>Create your account</h1>
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      {success && <div role="alert" style={{ color: 'green' }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={!email || !password || !confirmPassword}>Sign up</button>
      </form>
    </main>
  );
};

export default Register;