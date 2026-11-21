/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';

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

afterEach(() => cleanup());

const SMB = 'For small and medium-sized businesses';

const TIERS = [
  {
    name: 'Jumpstart',
    audience: SMB,
    timeline: '2 to 4 weeks',
    included: ['AI readiness assessment', 'Top three use cases prioritized', 'One quick-win prototype', 'A 90-day roadmap'],
    cta: 'Book a consultation',
  },
  {
    name: 'Build',
    audience: SMB,
    timeline: '6 to 12 weeks',
    included: [
      'One custom AI solution designed, built and deployed',
      'Integration with your existing systems',
      'Team training',
      'Handover documentation',
    ],
    cta: 'Book a consultation',
  },
  {
    name: 'Partner',
    audience: SMB,
    timeline: 'Ongoing, monthly',
    included: [
      'A senior data scientist on call',
      'Monthly improvement sprints',
      'Model monitoring and updates',
      'Quarterly roadmap reviews',
    ],
    cta: 'Book a consultation',
  },
  {
    name: 'Enterprise',
    audience: 'For larger organizations and enterprises',
    timeline: 'Custom scope',
    included: [
      'A dedicated senior team',
      'Multi-team programs and centers of excellence',
      'AI governance and responsible-AI policy',
      'Security and compliance reviews',
      'Priority support',
    ],
    cta: 'Talk to us about enterprise',
  },
];

function tierHeading(main: HTMLElement, name: string): HTMLElement {
  const hs = within(main)
    .getAllByRole('heading', { level: 2 })
    .filter((h) => norm(h.textContent) === name);
  if (hs.length !== 1) throw new Error(`Expected one h2 "${name}", found ${hs.length}`);
  return hs[0];
}

function tierCard(main: HTMLElement, t: (typeof TIERS)[number]): Element {
  const h = tierHeading(main, t.name);
  const card = ancestorWhere(h, main, (el) => {
    const text = norm(el.textContent);
    return text.includes(t.timeline) && t.included.every((i) => text.includes(i));
  });
  for (const other of TIERS) {
    if (other.name === t.name) continue;
    expect(card.contains(tierHeading(main, other.name))).toBe(false);
  }
  return card;
}

describe('engagements page rendering', () => {
  test('h1 and intro sentence', () => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    expect(norm(within(main).getByRole('heading', { level: 1 }).textContent)).toBe('Engagements');
    expect(norm(main.textContent)).toContain(
      'Right-sized engagements for small and medium-sized businesses, and a premium tier for enterprise.',
    );
  });

  test('four tier cards in order', () => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    const hs = TIERS.map((t) => tierHeading(main, t.name));
    for (let i = 1; i < hs.length; i++) expect(follows(hs[i - 1], hs[i])).toBe(true);
  });

  test.each(TIERS.map((t) => [t.name, t] as const))('%s card content', (_name, t) => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    const card = tierCard(main, t) as HTMLElement;
    const text = norm(card.textContent);
    expect(text).toContain(t.audience);
    expect(text).toContain(t.timeline);
    const inc = within(card).getByRole('heading', { name: /What['\u2019]s included/ });
    expect(inc).toBeTruthy();
    const lis = Array.from(card.querySelectorAll('ul li, ol li')).map((li) => norm(li.textContent));
    for (const item of t.included) {
      expect(lis.some((l) => l.includes(item))).toBe(true);
    }
    const links = within(card).getAllByRole('link', { name: t.cta });
    expect(links.some((a) => a.getAttribute('href') === '/contact')).toBe(true);
  });

  test('Enterprise tier has id enterprise and a Premium label', () => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    const el = document.getElementById('enterprise');
    expect(el).not.toBeNull();
    expect(main.contains(el)).toBe(true);
    expect(el!.contains(tierHeading(main, 'Enterprise'))).toBe(true);
    expect(el!.contains(tierHeading(main, 'Jumpstart'))).toBe(false);
    const text = norm(el!.textContent);
    expect(text).toContain('Custom scope');
    for (const i of TIERS[3].included) expect(text).toContain(i);
    expect(within(el as HTMLElement).getAllByText('Premium').length).toBeGreaterThan(0);
  });

  test('Not sure which fits? line with a contact link below the tiers', () => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    const el = within(main).getAllByText(/Not sure which fits\?/)[0];
    const line = ancestorWhere(el, main, (x) =>
      Array.from(x.querySelectorAll('a')).some((a) => a.getAttribute('href') === '/contact') ||
      (x.tagName === 'A' && x.getAttribute('href') === '/contact'),
    );
    for (const t of TIERS) expect(line.contains(tierHeading(main, t.name))).toBe(false);
    expect(follows(tierHeading(main, 'Enterprise'), el)).toBe(true);
  });
});
