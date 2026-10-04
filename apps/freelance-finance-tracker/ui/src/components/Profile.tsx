import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // clear token
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <main style={{ maxWidth: 420, margin: '64px auto', padding: 16 }}>
      <h1>Account</h1>
      <button onClick={handleLogout}>Log out</button>
    </main>
  );
};

export default Profile;
