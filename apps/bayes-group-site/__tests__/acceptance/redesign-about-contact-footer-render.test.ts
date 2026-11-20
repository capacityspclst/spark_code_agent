/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import { FOUNDERS, VALUES } from '../../src/content/about';

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

function ancestorWhere(start: Element, scope: Element, pred: (el: Element) => boolean): Element {
  let el: Element | null = start;
  while (el) {
    if (pred(el)) return el;
    if (el === scope) break;
    el = el.parentElement;
  }
  throw new Error('No ancestor matched');
}

const follows = (a: Node, b: Node) =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

const hasLink = (el: Element, label: string, href: string) =>
  Array.from(el.querySelectorAll('a')).some(
    (a) => norm(a.textContent) === label && a.getAttribute('href') === href,
  );

afterEach(() => cleanup());

describe('about page illustrations', () => {
  test('each founder card has an svg avatar marked Photo placeholder', () => {
    renderAt('/about');
    const main = screen.getByRole('main');
    const names = within(main).getAllByText('Founder Name');
    expect(names).toHaveLength(2);
    names.forEach((n, i) => {
      const f = FOUNDERS[i];
      const parts = [f.name, f.role, f.bio, ...f.credentials].map((p) => norm(p));
      const card = ancestorWhere(n, main, (el) => parts.every((p) => norm(el.textContent).includes(p)));
      expect(card).not.toBe(main);
      expect(card.querySelector('svg')).not.toBeNull();
      expect(norm(card.textContent)).toContain('Photo placeholder');
    });
  });

  test.each(['Evidence over hype', 'Build to transfer', 'Vendor-neutral', 'Responsible by design'])(
    'value %s has its icon',
    (title) => {
      renderAt('/about');
      const main = screen.getByRole('main');
      const v = (VALUES as any[]).find((x) => x.title === title);
      const others = (VALUES as any[]).filter((x) => x.title !== title);
      let card: Element | null = null;
      for (const el of within(main).getAllByText(title)) {
        try {
          const c = ancestorWhere(el, main, (x) => norm(x.textContent).includes(norm(v.description)));
          if (c !== main && !others.some((o) => norm(c.textContent).includes(norm(o.description)))) {
            card = c;
            break;
          }
        } catch (e) {
          /* try next */
        }
      }
      if (!card) throw new Error(`No card for value "${title}"`);
      expect(card.querySelector('svg')).not.toBeNull();
    },
  );
});

describe('contact page', () => {
  test('shows the email', () => {
    renderAt('/contact');
    const main = screen.getByRole('main');
    expect(norm(main.textContent)).toContain('hello@thebayesgroup.com');
    const mail = Array.from(main.querySelectorAll('a')).some(
      (a) => a.getAttribute('href') === 'mailto:hello@thebayesgroup.com',
    );
    expect(mail).toBe(true);
  });

  test('What happens next lists the three steps in order', () => {
    renderAt('/contact');
    const main = screen.getByRole('main');
    const heading = within(main).getByRole('heading', { name: 'What happens next' });
    const steps = [
      'We reply within one business day',
      'A 30-minute call about your goals',
      'A written recommendation, no obligation',
    ];
    const section = ancestorWhere(heading, main, (el) =>
      steps.every((s) => norm(el.textContent).includes(s)),
    );
    expect(section.querySelector('form')).toBeNull();
    const text = norm(section.textContent);
    const idx = steps.map((s) => text.indexOf(s));
    for (let i = 1; i < idx.length; i++) expect(idx[i]).toBeGreaterThan(idx[i - 1]);
  });

  test('optional Company size select after Company with the four options', () => {
    renderAt('/contact');
    const form = screen.getByRole('main').querySelector('form') as HTMLElement;
    expect(form).not.toBeNull();
    const f = within(form);
    const company = f.getByLabelText(/^Company(?! size)\b/);
    const size = f.getByLabelText(/^Company size\b/);
    const topic = f.getByLabelText(/^What can we help with\?/);
    expect(size.tagName).toBe('SELECT');
    expect(follows(company, size)).toBe(true);
    expect(follows(size, topic)).toBe(true);
    expect(size.hasAttribute('required')).toBe(false);
    expect(size.getAttribute('aria-required')).not.toBe('true');
    const opts = Array.from(size.querySelectorAll('option')) as HTMLOptionElement[];
    const real = opts.filter((o) => o.value !== '');
    expect(real.map((o) => norm(o.textContent))).toEqual([
      '1-49 employees',
      '50-249 employees',
      '250-999 employees',
      '1,000+ employees',
    ]);
  });
});

describe('footer columns', () => {
  test('footer shows the email', () => {
    renderAt('/');
    const footer = screen.getByRole('contentinfo');
    expect(norm(footer.textContent)).toContain('hello@thebayesgroup.com');
    expect(
      Array.from(footer.querySelectorAll('a')).some((a) => a.getAttribute('href') === 'mailto:hello@thebayesgroup.com'),
    ).toBe(true);
  });

  test('Services column', () => {
    renderAt('/');
    const footer = screen.getByRole('contentinfo');
    const nav = footer.querySelector('nav[aria-label="Footer"]') as HTMLElement;
    expect(nav).not.toBeNull();
    const title = within(nav)
      .getAllByRole('link', { name: 'Services', hidden: true })
      .find((a) => a.getAttribute('href') === '/services');
    expect(title).toBeTruthy();
    const col = ancestorWhere(title!, nav, (el) =>
      hasLink(el, 'AI Enablement', '/services#enablement') && hasLink(el, 'Engagements', '/engagements'),
    );
    expect(hasLink(col, 'Training', '/training')).toBe(true);
    expect(hasLink(col, 'Custom Development', '/services#custom-development')).toBe(true);
    expect(hasLink(col, 'About', '/about')).toBe(false);
    expect(hasLink(col, 'Contact', '/contact')).toBe(false);
  });

  test('Company column', () => {
    renderAt('/');
    const footer = screen.getByRole('contentinfo');
    const nav = footer.querySelector('nav[aria-label="Footer"]') as HTMLElement;
    expect(nav).not.toBeNull();
    const title = within(nav).getAllByText('Company')[0];
    const col = ancestorWhere(title, nav, (el) => hasLink(el, 'About', '/about') && hasLink(el, 'Contact', '/contact'));
    expect(hasLink(col, 'AI Enablement', '/services#enablement')).toBe(false);
    expect(hasLink(col, 'Engagements', '/engagements')).toBe(false);
  });
});
