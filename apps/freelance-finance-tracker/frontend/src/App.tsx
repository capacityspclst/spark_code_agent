import React, { createContext, useState, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { ReceiptUpload } from './components/ReceiptUpload';
import { MileageForm } from './components/MileageForm';
import { ExportButtons } from './components/ExportButtons';

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
}
export const AuthContext = createContext<AuthContextProps>({ token: null, setToken: () => {} });

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { token } = React.useContext(AuthContext);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/receipt-upload"
            element={
              <RequireAuth>
                <ReceiptUpload />
              </RequireAuth>
            }
          />
          <Route
            path="/mileage-form"
            element={
              <RequireAuth>
                <MileageForm />
              </RequireAuth>
            }
          />
          <Route
            path="/export"
            element={
              <RequireAuth>
                <ExportButtons />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
