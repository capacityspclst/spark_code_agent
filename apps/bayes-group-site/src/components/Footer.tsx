import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => (
  <footer style={{ background: 'var(--color-background)', padding: 'var(--space-6)', textAlign: 'center' }}>
    <div className="footer-top" style={{ marginBottom: 'var(--space-4)' }}>
      <Link to="/" aria-label="Home" style={{ display: 'inline-block' }}>
        <Logo />
      </Link>
      <p>AI enablement, training and custom development.</p>
    </div>
    <nav aria-label="Footer navigation" style={{ marginBottom: 'var(--space-4)' }} aria-hidden="true">
      <Link to="/services" aria-hidden="true" tabIndex={-1}>Services</Link>{' | '}
      <Link to="/training" aria-hidden="true" tabIndex={-1}>Training</Link>{' | '}
      <Link to="/about" aria-hidden="true" tabIndex={-1}>About</Link>{' | '}
      <Link to="/contact" aria-hidden="true" tabIndex={-1}>Contact</Link>
    </nav>
    <div className="footer-bottom">© 2026 The Bayes Group</div>
  </footer>
);

export default Footer;
