/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;
g.scrollTo = jest.fn();
(window as any).scrollTo = jest.fn();
(Element.prototype as any).scrollIntoView = jest.fn();

const { MemoryRouter } = require('react-router-dom');
const { AppRoutes } = require('../../src/App');

function renderAt(path: string) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(AppRoutes)),
  );
}

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

afterEach(() => cleanup());

const NAV: Array<[string, string]> = [
  ['Services', '/services'],
  ['Systems', '/systems'],
  ['Training', '/training'],
  ['Engagements', '/engagements'],
  ['About', '/about'],
  ['Contact', '/contact'],
];

const ROUTES: Array<[string, string, string]> = [
  ['/', 'The Bayes Group | Evidence-driven AI', 'Evidence-driven AI, built for your business.'],
  ['/services', 'Services | The Bayes Group', 'Services'],
  ['/systems', 'Systems engineering | The Bayes Group', 'Systems engineering'],
  ['/training', 'Training | The Bayes Group', 'Training'],
  ['/engagements', 'Engagements | The Bayes Group', 'Engagements'],
  ['/about', 'About | The Bayes Group', 'About'],
  ['/contact', 'Contact | The Bayes Group', 'Book a consultation'],
  ['/this-page-does-not-exist', 'Page not found | The Bayes Group', 'Page not found'],
];

describe.each(ROUTES)('page %s', (path, title, h1Text) => {
  test('sets the document title', () => {
    document.title = '';
    renderAt(path);
    expect(document.title).toBe(title);
  });

  test('has exactly one h1 with the expected text', () => {
    const { container } = renderAt(path);
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(norm(h1s[0].textContent)).toBe(h1Text);
  });

  test('uses header, nav, main and footer landmarks', () => {
    renderAt(path);
    const banner = screen.getByRole('banner');
    expect(banner.tagName).toBe('HEADER');
    expect(banner.querySelector('nav')).not.toBeNull();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('main').tagName).toBe('MAIN');
    expect(screen.getByRole('contentinfo').tagName).toBe('FOOTER');
  });

  test('header has the wordmark home link, nav links and the CTA', () => {
    renderAt(path);
    const banner = screen.getByRole('banner');
    const homeLinks = within(banner)
      .getAllByRole('link', { name: /The Bayes Group/, hidden: true })
      .filter((a) => a.getAttribute('href') === '/');
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(homeLinks[0].querySelector('svg')).not.toBeNull();
    for (const [label, to] of NAV) {
      const links = within(banner).getAllByRole('link', { name: label, hidden: true });
      expect(links.some((a) => a.getAttribute('href') === to)).toBe(true);
    }
    const cta = within(banner).getAllByRole('link', { name: 'Book a consultation', hidden: true });
    expect(cta.some((a) => a.getAttribute('href') === '/contact')).toBe(true);
  });

  test('footer has the wordmark, line, nav links and copyright', () => {
    renderAt(path);
    const footer = screen.getByRole('contentinfo');
    expect(footer.querySelector('svg')).not.toBeNull();
    const text = norm(footer.textContent);
    expect(text).toContain('The Bayes Group');
    expect(text).toContain('AI enablement, training and custom development.');
    expect(text).toContain('\u00a9 2026 The Bayes Group');
    for (const [label, to] of NAV) {
      const links = within(footer).getAllByRole('link', { name: label, hidden: true });
      expect(links.some((a) => a.getAttribute('href') === to)).toBe(true);
    }
  });
});

describe('mobile menu', () => {
  test('Menu button opens and closes the navigation links', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const banner = screen.getByRole('banner');
    const btn = within(banner).getByRole('button', { name: /menu/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    const controlsId = btn.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();

    await user.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const panel = document.getElementById(controlsId as string);
    expect(panel).not.toBeNull();
    for (const [label, to] of NAV) {
      const link = within(panel as HTMLElement).getByRole('link', { name: label });
      expect(link.getAttribute('href')).toBe(to);
    }
    const cta = within(panel as HTMLElement).getByRole('link', { name: 'Book a consultation' });
    expect(cta.getAttribute('href')).toBe('/contact');

    await user.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('not found page', () => {
  test('unknown route shows Page not found with a link home', () => {
    renderAt('/no/such/page');
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
    const homeLinks = Array.from(main.querySelectorAll('a')).filter(
      (a) => a.getAttribute('href') === '/',
    );
    expect(homeLinks.length).toBeGreaterThan(0);
  });
});
