import * as React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import './styles/theme.css';
import './styles/global.css';

// Static hosts serve /services/index.html at /services/; keep the canonical address without the trailing slash.
const { pathname, search, hash } = window.location;
if (pathname.length > 1 && pathname.endsWith('/')) {
  window.history.replaceState(window.history.state, '', pathname.replace(/\/+$/, '') + search + hash);
}

const container = document.getElementById('root');
if (container) {
  const app = (
    <React.StrictMode>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </React.StrictMode>
  );
  if (container.firstElementChild) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
