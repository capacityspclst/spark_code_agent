import * as React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { NAV_LINKS, COPYRIGHT, FOOTER_LINE, CONTACT_EMAIL } from '../content/site';

export default function Footer() {
  return (
    <footer className='site-footer on-dark'>
      <div className='container footer-inner'>
        <div className='footer-brand'>
          <Wordmark onDark />
          <p>{FOOTER_LINE}</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className='footer-email'>
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        {/* Services column */}
        <nav aria-label='Footer' className='footer-nav services'>
          <Link to='/services#enablement'>AI Enablement</Link>
          <Link to='/training'>Training</Link>
          <Link to='/services#custom-development'>Custom Development</Link>
          <Link to='/engagements'>Engagements</Link>
        </nav>
        {/* Company column */}
        <nav aria-label='Footer' className='footer-nav company'>
          <p>Company</p>
          <Link to='/about'>About</Link>
          <Link to='/contact'>Contact</Link>
        </nav>
        <p className='footer-copy'>{COPYRIGHT}</p>
      </div>
    </footer>
  );
}
