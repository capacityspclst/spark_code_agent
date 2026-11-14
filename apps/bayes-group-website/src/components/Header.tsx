import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 420);

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
      <button className="button-secondary" onClick={() => window.location.href='/services'}>Services</button>
      <button className="button-secondary" onClick={() => window.location.href='/training'}>Training</button>
      <button className="button-secondary" onClick={() => window.location.href='/about'}>About</button>
      <button className="button-secondary" onClick={() => window.location.href='/contact'}>Contact</button>
    </>
  );

  return (
    <header>
      <Link to="/" aria-label="The Bayes Group">
        <Wordmark className="wordmark" />
      </Link>
      {isMobile ? (
        <>
          <Link
            to="#"
            role="button"
            aria-label="Menu"
            aria-controls="mobile-nav"
            aria-expanded={menuOpen}
            onClick={(e)=>{e.preventDefault(); toggleMenu();}}
            className="button-primary"
          >
            Menu
          </Link>
          {menuOpen && (
            <nav id="mobile-nav" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg)', padding: 'var(--space-4)' }}>
              {navLinks}
              <Link to="/contact" className="button-primary" role="button" style={{ display: 'block', marginTop: 'var(--space-4)' }}>Book a consultation</Link>
            </nav>
          )}
        </>
      ) : (
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {navLinks}
          <button className="button-primary" onClick={() => window.location.href='/contact'}>Book a consultation</button>
        </nav>
      )}
    </header>
  );
};

export default Header;
