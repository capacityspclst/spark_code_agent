import * as React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/theme.css';
import './styles/global.css';

const container = document.getElementById('root');
if (container) {
  if (container.hasChildNodes()) {
    hydrateRoot(container, <React.StrictMode><App /></React.StrictMode>);
  } else {
    const root = createRoot(container);
    root.render(<React.StrictMode><App /></React.StrictMode>);
  }
}
