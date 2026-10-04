import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { ReceiptUpload } from './components/ReceiptUpload';
import { MileageForm } from './components/MileageForm';
import { ExportButtons } from './components/ExportButtons';
import { Layout } from './components/Layout';

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
}
export const AuthContext = createContext<AuthContextProps>({ token: null, setToken: () => {} });

const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const [token, setTokenState] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setTokenState(stored);
  }, []);

  // Persist token changes
  const setToken = (t: string | null) => {
    if (t) {
      localStorage.setItem('token', t);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(t);
  };

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Authenticated routes wrapped with Layout for persistent navigation */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Layout>
                <Dashboard />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/receipt-upload"
          element={
            <RequireAuth>
              <Layout>
                <ReceiptUpload />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/mileage-form"
          element={
            <RequireAuth>
              <Layout>
                <MileageForm />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/export"
          element={
            <RequireAuth>
              <Layout>
                <ExportButtons />
              </Layout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
