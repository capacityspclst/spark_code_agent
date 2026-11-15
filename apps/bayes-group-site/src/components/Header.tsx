import * as React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { NAV_LINKS, CTA } from '../content/site';

export default function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const panelId = 'mobile-nav';
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className='site-header'>
      <div className='header-inner'>
        <Wordmark />
        {/* Desktop nav */}
        <nav aria-label='Main' className='nav-desktop'>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} aria-current='page'>
              {link.label}
            </Link>
          ))}
          <Link to={CTA.to} className='cta-button'>
            {CTA.label}
          </Link>
        </nav>
        {/* Mobile menu button */}
        <button
          type='button'
          aria-label='Menu'
          aria-controls={panelId}
          aria-expanded={menuOpen ? 'true' : 'false'}
          onClick={toggleMenu}
          className='menu-toggle'
        >
          Menu
        </button>
      </div>
      {menuOpen && (
        <nav id={panelId} className='nav-mobile'>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link to={CTA.to} className='cta-button'>
                {CTA.label}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
