import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 390);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 390;
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
      <div className="header-brand">
        <Link to="/" aria-label="The Bayes Group home">
          <Wordmark className="wordmark" />
        </Link>
      </div>
      <div className="header-controls">
        {isMobile ? (
          <>
            <button
              type="button"
              aria-label="Menu"
              aria-controls="mobile-nav"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
              className="button-secondary"
            >
              Menu
            </button>
            <Link to="/contact" className="button-primary" role="button">Book a consultation</Link>
            {menuOpen && (
              <nav id="mobile-nav" className="mobile-nav">
                {navLinks}
              </nav>
            )}
          </>
        ) : (
          <>
            <nav className="desktop-nav">
              {navLinks}
            </nav>
            <Link to="/contact" className="button-primary" role="button">Book a consultation</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
