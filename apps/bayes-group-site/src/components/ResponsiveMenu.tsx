import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

type Props = {
  onClose: () => void;
};

const ResponsiveMenu: React.FC<Props> = ({ onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="mobile-menu"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'white',
        zIndex: 1000,
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: '1.5rem' }}
        aria-label="Close menu"
      >
        ×
      </button>
      <Link to="/" onClick={onClose}>
        <Logo />
      </Link>
      <nav aria-label="Mobile navigation" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Link to="/services" onClick={onClose}>Services</Link>
        <Link to="/training" onClick={onClose}>Training</Link>
        <Link to="/about" onClick={onClose}>About</Link>
        <Link to="/contact" onClick={onClose}>Contact</Link>
        <Link to="/contact" className="btn" onClick={onClose}>Book a consultation</Link>
      </nav>
    </div>
  );
};

export default ResponsiveMenu;
