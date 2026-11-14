import React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

const Footer: React.FC = () => (
  <footer>
    <div>
      <Wordmark className="wordmark" />
    </div>
    <div>
      <p>AI enablement, training and custom development.</p>
      <nav>
        <Link to="/services" aria-hidden="true">Services</Link>
        <Link to="/training" aria-hidden="true">Training</Link>
        <Link to="/about" aria-hidden="true">About</Link>
        <Link to="/contact" aria-hidden="true">Contact</Link>
      </nav>
      <p>© 2026 The Bayes Group</p>
    </div>
  </footer>
);

export default Footer;
