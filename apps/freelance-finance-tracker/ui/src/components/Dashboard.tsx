import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{id:number, desc:string}|null>(null);

  const fetchTxns = async () => {
    setLoading(true);
    setError('');
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

  const netTotal = transactions.reduce((sum, t) => sum + (t.type === 'Income' ? t.amount : -t.amount), 0);

  const openAdd = () => {
    setEditTxn(null);
    setShowForm(true);
  };

  const openEdit = (txn: Transaction) => {
    setEditTxn(txn);
    setShowForm(true);
  };

  const confirmDelete = (id: number, desc: string) => {
    setShowDeleteConfirm({id, desc});
  };

  const performDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      await api.delete(`/transactions/${showDeleteConfirm.id}`);
      setToast('Transaction removed.');
      fetchTxns();
    } catch (e: any) {
      setToast('Could not delete transaction. Please try again.');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const amount = parseFloat(data.get('amount') as string);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    const payload = {
      amount,
      description: data.get('description') as string,
      date: data.get('date') as string,
      type: data.get('type') as string,
    };
    setSaving(true);
    try {
      if (editTxn) {
        await api.put(`/transactions/${editTxn.id}`, payload);
        setToast('Transaction updated.');
      } else {
        await api.post('/transactions', payload);
        setToast('Transaction added.');
      }
      setShowForm(false);
      fetchTxns();
    } catch (e: any) {
      setToast('Could not save transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '64px auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Freelance Finance</h1>
        <div>Net total: ${netTotal.toFixed(2)}</div>
      </header>
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      {toast && <Toast message={toast} onClose={() => setToast('')} type="success" />}
      {loading && <p>Loading...</p>}
      {!loading && transactions.length === 0 && (
        <div>
          <p>No transactions yet</p>
          <p>Start tracking your income or expenses.</p>
          <button onClick={openAdd}>Add first transaction</button>
        </div>
      )}
      {!loading && transactions.length > 0 && (
        <ul>
          {transactions.map((t) => (
            <li key={t.id} style={{ marginBottom: 8 }}>
              <div>
                <strong>{t.description}</strong> – ${t.amount} on {t.date} ({t.type})
              </div>
              <button aria-label="Edit" onClick={() => openEdit(t)}>Edit</button>
              <button aria-label="Delete" onClick={() => confirmDelete(t.id, t.description)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button
        aria-label="Add transaction"
        style={{ position: 'fixed', right: 16, bottom: 80, width: 56, height: 56, borderRadius: '50%', background: '#007bff', color: '#fff', fontSize: 24 }}
        onClick={openAdd}
      >+</button>

      {/* Form Modal */}
      {showForm && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <select id="type" name="type" defaultValue={editTxn?.type ?? 'Income'}>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 300 }}>
            <h3>Delete transaction?</h3>
            <p>This cannot be undone.</p>
            <button onClick={performDelete}>Delete</button>
            <button onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
