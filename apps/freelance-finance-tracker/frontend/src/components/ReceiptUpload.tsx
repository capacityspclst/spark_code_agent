import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReceipt } from '../api';
import { AuthContext } from '../App';

export const ReceiptUpload: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert('File required'); return; }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('amount', amount);
    formData.append('date', date);
    formData.append('vendor', vendor);
    formData.append('category', category);
    const res = await uploadReceipt(formData, token!);
    if (res.id) {
      alert('Receipt added successfully!');
      navigate('/dashboard');
    } else {
      alert('Upload failed');
    }
  };

  return (
    <div className="card">
      <h1>Add Receipt</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="file">Image</label>
        <input id="file" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
        <label htmlFor="amount">Amount (USD)</label>
        <input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        <label htmlFor="date">Date</label>
        <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <label htmlFor="vendor">Vendor</label>
        <input id="vendor" type="text" value={vendor} onChange={e => setVendor(e.target.value)} required />
        <label htmlFor="category">Category</label>
        <input id="category" type="text" value={category} onChange={e => setCategory(e.target.value)} required />
        <button type="submit" className="primary">Upload receipt</button>
      </form>
    </div>
  );
};
