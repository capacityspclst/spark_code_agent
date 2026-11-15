import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { MenuIcon } from './Icons';
import { NAV_LINKS, CTA } from '../content/site';

export default function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const panelId = 'mobile-nav';
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const close = () => setMenuOpen(false);
  const location = useLocation();

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className='site-header'>
      <div className='container header-inner'>
        <Wordmark />
        {/* Desktop nav */}
        <nav aria-label='Main' className='nav-desktop'>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className='nav-link'>
              {link.label}
            </NavLink>
          ))}
          <Link to={CTA.to} className='btn btn-primary btn-header'>
            {CTA.label}
          </Link>
        </nav>
        {/* Mobile menu button */}
        <button
          type='button'
          ref={toggleRef}
          aria-controls={panelId}
          aria-expanded={menuOpen ? 'true' : 'false'}
          onClick={toggleMenu}
          className='menu-toggle'
        >
          <span>Menu</span>
          <MenuIcon open={menuOpen} />
        </button>
      </div>
      {menuOpen && (
        <nav id={panelId} aria-label='Mobile' className='nav-mobile'>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className='nav-link' onClick={close}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link to={CTA.to} className='btn btn-primary btn-block' onClick={close}>
                {CTA.label}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
