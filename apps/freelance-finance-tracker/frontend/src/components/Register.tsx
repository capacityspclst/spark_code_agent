import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import { AuthContext } from '../App';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    const res = await register(email, password);
    if (res.access_token) {
      setToken(res.access_token);
      navigate('/dashboard');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div className="card">
      <h1>Create your account</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <label htmlFor="confirm">Confirm password</label>
        <input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        <button type="submit" className="primary">Create account</button>
      </form>
    </div>
  );
};
