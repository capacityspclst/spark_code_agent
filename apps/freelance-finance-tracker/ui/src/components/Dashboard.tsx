import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [error, setError] = useState('');

  const fetchTxns = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/transactions');
      setTransactions(resp.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxns();
  }, []);

  const openAdd = () => {
    setEditTxn(null);
    setShowForm(true);
  };

  const openEdit = (txn: Transaction) => {
    setEditTxn(txn);
    setShowForm(true);
  };

  const deleteTxn = async (id: number) => {
    if (!window.confirm('Delete transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      alert('Transaction removed.');
      fetchTxns();
    } catch (e: any) {
      alert('Could not delete transaction. Please try again.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      amount: parseFloat(data.get('amount') as string),
      description: data.get('description') as string,
      date: data.get('date') as string,
    };
    try {
      if (editTxn) {
        await api.put(`/transactions/${editTxn.id}`, payload);
        alert('Transaction updated.');
      } else {
        await api.post('/transactions', payload);
        alert('Transaction added.');
      }
      setShowForm(false);
      fetchTxns();
    } catch (e: any) {
      alert('Could not save transaction. Please try again.');
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '64px auto', padding: 16 }}>
      <h1>Freelance Finance</h1>
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      {loading && <p>Loading...</p>}
      {!loading && transactions.length === 0 && (
        <div>
          <p>No transactions yet</p>
          <button onClick={openAdd}>Add first transaction</button>
        </div>
      )}
      {!loading && transactions.length > 0 && (
        <ul>
          {transactions.map((t) => (
            <li key={t.id} style={{ marginBottom: 8 }}>
              <div>
                <strong>{t.description}</strong> – ${t.amount} on {t.date}
              </div>
              <button aria-label="Edit" onClick={() => openEdit(t)}>Edit</button>
              <button aria-label="Delete" onClick={() => deleteTxn(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button
        aria-label="Add transaction"
        style={{ position: 'fixed', right: 16, bottom: 80, width: 56, height: 56, borderRadius: '50%', background: '#007bff', color: '#fff', fontSize: 24 }}
        onClick={openAdd}
      >+</button>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleFormSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, width: '90%', maxWidth: 380 }}>
            <h2>{editTxn ? 'Edit transaction' : 'Add transaction'}</h2>
            <div>
              <label htmlFor="amount">Amount</label>
              <input id="amount" name="amount" type="number" step="0.01" defaultValue={editTxn?.amount ?? ''} required />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <input id="description" name="description" type="text" defaultValue={editTxn?.description ?? ''} />
            </div>
            <div>
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" defaultValue={editTxn?.date ?? ''} required />
            </div>
            <div>
              <label htmlFor="type">Type</label>
              <select id="type" name="type" defaultValue="Income" disabled>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
