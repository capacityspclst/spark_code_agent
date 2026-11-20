import * as React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

import ScrollManager from './ScrollManager';

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Header />
        <ScrollManager />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
