import * as React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { NAV_LINKS, COPYRIGHT, FOOTER_LINE } from '../content/site';

export default function Footer() {
  return (
    <footer className='site-footer'>
      <div className='footer-inner'>
        <Wordmark />
        <p>{FOOTER_LINE}</p>
        <nav aria-label='Footer'>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p>{COPYRIGHT}</p>
      </div>
    </footer>
  );
}
