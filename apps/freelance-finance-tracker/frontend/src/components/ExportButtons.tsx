import React, { useContext } from 'react';
import { exportPdf, exportCsv } from '../api';
import { AuthContext } from '../App';

export const ExportButtons: React.FC = () => {
  const { token } = useContext(AuthContext);

  const handleExportPdf = async () => {
    const blob = await exportPdf(token!);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.pdf';
    a.click();
    URL.revokeObjectURL(url);
    alert('PDF download started.');
  };

  const handleExportCsv = async () => {
    const blob = await exportCsv(token!);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.csv';
    a.click();
    URL.revokeObjectURL(url);
    alert('CSV download started.');
  };

  return (
    <div className="card">
      <h2>Export Data</h2>
      <button className="primary" onClick={handleExportPdf}>Export PDF</button>
      <button className="secondary" onClick={handleExportCsv}>Export CSV</button>
    </div>
  );
};
