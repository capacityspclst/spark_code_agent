import * as React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { NAV_LINKS, CTA } from '../content/site';

import { useLocation } from 'react-router-dom';

export default function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { pathname } = useLocation();
  const panelId = 'mobile-nav';
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const isActive = (to: string) => {
    const clean = pathname.replace(/\/$/, '');
    return clean === to;
  };

  return (
    <header className='site-header'>
      <div className='header-inner'>
        <Wordmark />
        {/* Desktop nav */}
        <nav aria-label='Main' className='nav-desktop'>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} aria-current={isActive(link.to) ? 'page' : undefined}>
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
                <Link to={link.to} aria-current={isActive(link.to) ? 'page' : undefined}>{link.label}</Link>
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
