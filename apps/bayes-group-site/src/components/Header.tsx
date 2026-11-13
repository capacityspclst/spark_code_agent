import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ResponsiveMenu from './ResponsiveMenu';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header style={{ background: 'var(--color-background)', padding: 'var(--space-4)' }}>
      <nav aria-label="Main navigation" className="header-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" aria-label="Home" style={{ display: 'inline-block' }}>
          <Logo />
        </Link>
        {/* Desktop nav links */}
        <div className="nav-links">
          <Link to="/services">Services</Link>
          <Link to="/training">Training</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        {/* Book consultation button */}
        <button
          type="button"
          className="btn header-cta"
          onClick={() => navigate('/contact')}
        >
          Book a consultation
        </button>
        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Menu"
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
          className="menu-btn"
        >
          Menu
        </button>
      </nav>
      {menuOpen && <ResponsiveMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
};

export default Header;
