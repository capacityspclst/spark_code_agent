import React, { useState, useContext, useRef } from 'react';
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
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const openFileChooser = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert('File required'); return; }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('amount', amount);
    formData.append('date', date);
    formData.append('vendor', vendor);
    formData.append('category', category);
    const res = await uploadReceipt(formData);
    if (res.id) {
      setSuccess('Receipt added successfully!');
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      alert('Upload failed');
    }
  };

  return (
    <div className="card">
      <h1>Add Receipt</h1>
      <form onSubmit={handleSubmit}>
        {/* Hidden file input for accessibility */}
        <input
          id="file"
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          required
          style={{ position: 'absolute', left: '-9999px' }}
        />
        {/* Button to trigger file chooser */}
        <button type="button" className="secondary" onClick={openFileChooser} aria-label="Take photo">
          Take photo
        </button>
        {file && <p>{file.name}</p>}
        <p className="help-text">Supported formats: JPG, PNG, PDF. Max size 5 MB.</p>
        <label htmlFor="amount">Amount (USD)</label>
        <input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        <label htmlFor="date">Date</label>
        <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <label htmlFor="vendor">Vendor</label>
        <input id="vendor" type="text" value={vendor} onChange={e => setVendor(e.target.value)} required />
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Select category</option>
          <option value="Office">Office</option>
          <option value="Travel">Travel</option>
          <option value="Supplies">Supplies</option>
        </select>
        <button type="submit" className="primary">Upload receipt</button>
        {success && <p className="toast success" role="status">{success}</p>}
      </form>
    </div>
  );
};
