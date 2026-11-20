import * as React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { NAV_LINKS, COPYRIGHT, FOOTER_LINE } from '../content/site';

export default function Footer() {
  return (
    <footer className='site-footer on-dark'>
      <div className='container footer-inner'>
        <div className='footer-brand'>
          <Wordmark onDark />
          <p>{FOOTER_LINE}</p>
          
        </div>
        <nav aria-label='Footer' className='footer-nav'>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className='footer-copy'>{COPYRIGHT}</p>
      </div>
    </footer>
  );
}
