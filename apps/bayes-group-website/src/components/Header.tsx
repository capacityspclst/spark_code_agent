import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 420);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 420;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const navLinks = (
    <>
      <Link to="/services" className="button-secondary" aria-label="Services">Services</Link>
      <Link to="/training" className="button-secondary">Training</Link>
      <Link to="/about" className="button-secondary">About</Link>
      <Link to="/contact" className="button-secondary">Contact</Link>
    </>
  );

  return (
    <header>
      <Link to="/" aria-label="The Bayes Group">
        <Wordmark className="wordmark" />
      </Link>
      {/* Booking button always visible */}
    <Link to="/contact" className="button-primary" role="button" style={{ marginLeft: 'var(--space-4)' }}>Book a consultation</Link>
    {isMobile ? (
        <>
          <button
            type="button"
            aria-label="Menu"
            aria-controls="mobile-nav"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className="button-primary"
          >
            Menu
          </button>
          {menuOpen && (
            <nav id="mobile-nav" style={{ flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
              {navLinks}
            </nav>
          )}
        </>
      ) : (
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {navLinks}
        </nav>
      )}
    </header>
  );
};

export default Header;
