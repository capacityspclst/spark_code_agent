import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

export const MileageForm: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mileage = {
      date,
      start_location: start,
      end_location: end,
      distance_miles: parseFloat(distance),
      purpose,
    };
    const res = await fetch('/mileage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(mileage),
    });
    if (res.ok) {
      alert('Mileage saved!');
      navigate('/dashboard');
    } else {
      alert('Failed to save mileage');
    }
  };

  return (
    <div className="card">
      <h1>Add Mileage</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="date">Date</label>
        <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <label htmlFor="start">Start location</label>
        <input id="start" type="text" value={start} onChange={e => setStart(e.target.value)} required />
        <label htmlFor="end">End location</label>
        <input id="end" type="text" value={end} onChange={e => setEnd(e.target.value)} required />
        <label htmlFor="distance">Distance (miles)</label>
        <input id="distance" type="number" step="0.01" value={distance} onChange={e => setDistance(e.target.value)} required />
        <label htmlFor="purpose">Purpose (optional)</label>
        <input id="purpose" type="text" value={purpose} onChange={e => setPurpose(e.target.value)} />
        <button type="submit" className="primary">Save mileage</button>
      </form>
    </div>
  );
};
