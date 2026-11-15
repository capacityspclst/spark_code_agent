import * as React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link" style={{ position: 'absolute', left: '-999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
        onFocus={(e) => { e.currentTarget.style.position = 'static'; e.currentTarget.style.left = 'auto'; }}
        onBlur={(e) => { e.currentTarget.style.position = 'absolute'; e.currentTarget.style.left = '-999px'; }}
      >Skip to main content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
