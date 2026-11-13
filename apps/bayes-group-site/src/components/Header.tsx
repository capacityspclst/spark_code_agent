import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import ResponsiveMenu from './ResponsiveMenu';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header style={{ background: 'var(--color-background)', padding: 'var(--space-4)' }}>
      <nav aria-label="Main navigation" className="header-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" aria-label="Home" style={{ display: 'inline-block' }}>
          <Logo />
        </Link>
        {/* Desktop nav links */}
        <div className="nav-links" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <Link to="/services">Services</Link>
          <Link to="/training">Training</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/contact" className="btn">
            Book a consultation
          </Link>
        </div>
        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Menu"
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
          className="menu-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2)' }}
        >
          Menu
        </button>
      </nav>
      {menuOpen && <ResponsiveMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
};

export default Header;
