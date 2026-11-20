import * as React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { COPYRIGHT, FOOTER_LINE, CONTACT_EMAIL } from '../content/site';

export default function Footer() {
  return (
    <footer className='site-footer on-dark'>
      <div className='container footer-inner'>
        <div className='footer-brand'>
          <Wordmark onDark />
          <p>{FOOTER_LINE}</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
        <nav aria-label='Footer' className='footer-nav'>
          <div className='footer-col'>
            <p className='footer-col-title'>
              <Link to='/services'>Services</Link>
            </p>
            <ul>
              <li><Link to='/services#enablement'>AI Enablement</Link></li>
              <li><Link to='/training'>Training</Link></li>
              <li><Link to='/services#custom-development'>Custom Development</Link></li>
              <li><Link to='/engagements'>Engagements</Link></li>
            </ul>
          </div>
          <div className='footer-col'>
            <p className='footer-col-title'>Company</p>
            <ul>
              <li><Link to='/about'>About</Link></li>
              <li><Link to='/contact'>Contact</Link></li>
            </ul>
          </div>
        </nav>
        <p className='footer-copy'>{COPYRIGHT}</p>
      </div>
    </footer>
  );
}
