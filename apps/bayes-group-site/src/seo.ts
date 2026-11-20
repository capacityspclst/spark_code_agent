export const SITE_URL = 'https://thebayesgroup.com';
export const SITE_NAME = 'The Bayes Group';

export interface PageMeta {
  path: string;
  title: string;
  description: string;
}

export const PAGES: PageMeta[] = [
  { path: '/', title: 'The Bayes Group | Evidence-driven AI', description: 'Evidence-driven AI consulting, training and custom development led by two credentialed data scientists.' },
  { path: '/services', title: 'Services | The Bayes Group', description: 'AI enablement, team training and custom AI development that deliver measurable results for your business.' },
  { path: '/training', title: 'Training | The Bayes Group', description: 'Practical AI courses for executives, managers and technical teams, taught by working data scientists.' },
  { path: '/about', title: 'About | The Bayes Group', description: 'Meet the data scientists behind The Bayes Group and the values that guide our work.' },
  { path: '/contact', title: 'Contact | The Bayes Group', description: 'Book a consultation with The Bayes Group and get a reply within one business day.' },
];

export const NOT_FOUND_PAGE: PageMeta = {
  path: '/404',
  title: 'Page not found | The Bayes Group',
  description: 'The page you requested could not be found on The Bayes Group website.',
};

export function getPageMeta(pathname: string): PageMeta {
  // strip query, hash, trailing slash (except root)
  let path = pathname.split('?')[0].split('#')[0];
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  const found = PAGES.find((p) => p.path === path);
  return found || NOT_FOUND_PAGE;
}
