import * as React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { COPYRIGHT, FOOTER_LINE, CONTACT_EMAIL } from '../content/site';

const SERVICE_LINKS = [
  { label: 'AI Enablement', to: '/services#enablement' },
  { label: 'Training', to: '/services#training' },
  { label: 'Custom Development', to: '/services#custom-development' },
  { label: 'Systems engineering', to: '/systems' },
  { label: 'Engagements', to: '/engagements' },
];

const COMPANY_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <Wordmark onDark />
            <p>{FOOTER_LINE}</p>
            <a className="footer-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <nav aria-label="Footer" className="footer-nav">
            <nav className="footer-col" aria-label="Services links">
              <h2 className="footer-heading">Services</h2>
              <ul>
                {SERVICE_LINKS.map((l) => (
                  <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
                ))}
              </ul>
            </nav>
            <nav className="footer-col" aria-label="Company links">
              <h2 className="footer-heading">Company</h2>
              <ul>
                {COMPANY_LINKS.map((l) => (
                  <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
                ))}
              </ul>
            </nav>
          </nav>

        </div>
        <div className="footer-bottom">
          <p className="footer-copy">{COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}
