import React, { useEffect, useState, useContext } from 'react';
import { getDashboard } from '../api';
import { AuthContext } from '../App';

export const Dashboard: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      getDashboard(token)
        .then(data => setSummary(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) return <div className="card"><p>Loading summary...</p></div>;
  if (error) return <div className="card"><p className="error" role="alert">Failed to load data. Retry.</p></div>;
  if (!summary || (summary.total_income === 0 && summary.total_expenses === 0 && summary.total_mileage_deduction === 0)) {
    return <div className="card"><p>No data yet. Add a receipt or mileage to get started.</p></div>;
  }

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Total Expenses: ${summary.total_expenses.toFixed(2)}</p>
      <p>Mileage Deduction: ${summary.total_mileage_deduction.toFixed(2)}</p>
    </div>
  );
};
