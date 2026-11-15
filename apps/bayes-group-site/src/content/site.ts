export const SITE_NAME = 'The Bayes Group';
export const TAGLINE = 'Evidence-driven AI, built for your business.';
export const FOOTER_LINE = 'AI enablement, training and custom development.';
export const COPYRIGHT = '\u00a9 2026 The Bayes Group';
export const CONTACT_EMAIL = 'hello@thebayesgroup.com';
export const NAV_LINKS = [
  { label: 'Services', to: '/services' },
  { label: 'Training', to: '/training' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];
export const CTA = { label: 'Book a consultation', to: '/contact' };

export const PAGE_TITLES = {
  home: 'The Bayes Group | Evidence-driven AI',
  services: 'Services | The Bayes Group',
  training: 'Training | The Bayes Group',
  about: 'About | The Bayes Group',
  contact: 'Contact | The Bayes Group',
  notFound: 'Page not found | The Bayes Group',
};

function normalizePath(pathname: string): string {
  // Remove query and hash
  const withoutQuery = pathname.split('?')[0];
  const base = withoutQuery.split('#')[0];
  // Ensure trailing slash removal
  return base.endsWith('/') && base !== '/' ? base.slice(0, -1) : base;
}

export function getPageTitle(pathname: string): string {
  const path = normalizePath(pathname);
  switch (path) {
    case '/':
      return PAGE_TITLES.home;
    case '/services':
      return PAGE_TITLES.services;
    case '/training':
      return PAGE_TITLES.training;
    case '/about':
      return PAGE_TITLES.about;
    case '/contact':
      return PAGE_TITLES.contact;
    default:
      return PAGE_TITLES.notFound;
  }
}
