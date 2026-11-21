import {
  SITE_NAME,
  TAGLINE,
  FOOTER_LINE,
  COPYRIGHT,
  CONTACT_EMAIL,
  NAV_LINKS,
  CTA,
  PAGE_TITLES,
  getPageTitle,
} from '../../src/content/site';

describe('site constants', () => {
  test('brand strings', () => {
    expect(SITE_NAME).toBe('The Bayes Group');
    expect(TAGLINE).toBe('Evidence-driven AI, built for your business.');
    expect(FOOTER_LINE).toBe('AI enablement, training and custom development.');
    expect(COPYRIGHT).toBe('\u00a9 2026 The Bayes Group');
    expect(CONTACT_EMAIL).toBe('hello@thebayesgroup.com');
  });

  test('nav links in order', () => {
    expect(NAV_LINKS.map((l) => ({ label: l.label, to: l.to }))).toEqual([
      { label: 'Services', to: '/services' },
      { label: 'Training', to: '/training' },
      { label: 'Engagements', to: '/engagements' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ]);
  });

  test('header CTA', () => {
    expect(CTA.label).toBe('Book a consultation');
    expect(CTA.to).toBe('/contact');
  });
});

describe('page titles', () => {
  test('PAGE_TITLES values', () => {
    expect(PAGE_TITLES.home).toBe('The Bayes Group | Evidence-driven AI');
    expect(PAGE_TITLES.services).toBe('Services | The Bayes Group');
    expect(PAGE_TITLES.training).toBe('Training | The Bayes Group');
    expect(PAGE_TITLES.about).toBe('About | The Bayes Group');
    expect(PAGE_TITLES.contact).toBe('Contact | The Bayes Group');
    expect(PAGE_TITLES.notFound).toBe('Page not found | The Bayes Group');
  });

  test.each([
    ['/', 'The Bayes Group | Evidence-driven AI'],
    ['/services', 'Services | The Bayes Group'],
    ['/services/', 'Services | The Bayes Group'],
    ['/services#training', 'Services | The Bayes Group'],
    ['/training?x=1', 'Training | The Bayes Group'],
    ['/engagements', 'Engagements | The Bayes Group'],
    ['/engagements#enterprise', 'Engagements | The Bayes Group'],
    ['/about', 'About | The Bayes Group'],
    ['/contact', 'Contact | The Bayes Group'],
    ['/does-not-exist', 'Page not found | The Bayes Group'],
    ['/services/extra', 'Page not found | The Bayes Group'],
  ])('getPageTitle(%s) -> %s', (pathname, expected) => {
    expect(getPageTitle(pathname)).toBe(expected);
  });
});
