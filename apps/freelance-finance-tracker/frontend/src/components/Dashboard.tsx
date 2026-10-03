import React, { useEffect, useState, useContext } from 'react';
import { getDashboard } from '../api';
import { AuthContext } from '../App';

export const Dashboard: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getDashboard(token)
        .then(data => setSummary(data))
        .catch(() => alert('Failed to load dashboard'))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) return <div className="card"><p>Loading summary...</p></div>;
  if (!summary) return <div className="card"><p>No data yet. Add a receipt or mileage to get started.</p></div>;

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Total Expenses: ${summary.total_expenses.toFixed(2)}</p>
      <p>Mileage Deduction: ${summary.total_mileage_deduction.toFixed(2)}</p>
    </div>
  );
};
