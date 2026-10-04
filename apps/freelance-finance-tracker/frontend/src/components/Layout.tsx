import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  const current = location.pathname;

  const isDashboard = current.startsWith('/dashboard');
  const isMileage = current.startsWith('/mileage');
  const isExport = current.startsWith('/export');

  const handleFabClick = () => {
    if (isDashboard) navigate('/receipt-upload');
    else if (isMileage) navigate('/mileage-form');
  };

  const fabLabel = isDashboard ? 'Add Receipt' : isMileage ? 'Add Mileage' : '';

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="header-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-16)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--size-20)' }}>Freelance Finance Tracker</h1>
        <button onClick={handleLogout} aria-label="Log out" className="secondary">
          Log out
        </button>
      </header>
      <main>{children}</main>
      {/* Bottom navigation for mobile */}
      <nav className="bottom-nav" aria-label="Main navigation" role="tablist" style={{ display: 'flex', justifyContent: 'space-around', padding: 'var(--space-8)' }}>
        <button
          role="tab"
          aria-selected={isDashboard}
          className={isDashboard ? 'active' : ''}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button
          role="tab"
          aria-selected={isMileage}
          className={isMileage ? 'active' : ''}
          onClick={() => navigate('/mileage')}
        >
          Mileage
        </button>
        <button
          role="tab"
          aria-selected={isExport}
          className={isExport ? 'active' : ''}
          onClick={() => navigate('/export')}
        >
          Export
        </button>
      </nav>
      {fabLabel && (
        <button
          className="fab"
          aria-label={fabLabel}
          onClick={handleFabClick}
        >
          +
        </button>
      )}
    </div>
  );
};
