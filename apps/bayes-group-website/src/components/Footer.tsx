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
        <Link to="/services">Services</Link>
        <Link to="/training">Training</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <p>© 2026 The Bayes Group</p>
    </div>
  </footer>
);

export default Footer;
