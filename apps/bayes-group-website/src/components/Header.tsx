import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const navLinks = (
    <>
      <Link to="/services" className="button-secondary">Services</Link>
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
          <Link to="/contact" className="button-primary" role="button">Book a consultation</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
