/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import {
  HERO,
  CREDIBILITY_POINTS,
  WHO_WE_SERVE,
  CASE_STUDIES,
  CASE_STUDY_NOTE,
  TESTIMONIAL,
} from '../../src/content/home';

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

const CRED = [
  'Credentialed data scientists',
  'Vendor-neutral advice',
  'Built for small and medium-sized businesses',
  'Enterprise-grade governance',
];

afterEach(() => cleanup());

describe('home hero', () => {
  test('hero contains the h1 and the value proposition', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    const hero = ancestorWhere(h1, main, (el) =>
      Array.from(el.querySelectorAll('a')).some((a) => norm(a.textContent) === 'Explore services'),
    );
    expect(norm(hero.textContent)).toContain(
      'We help small and medium-sized businesses put AI to work, with enterprise-grade rigor and senior data scientists on every engagement.',
    );
    expect(norm(hero.textContent)).toContain(norm(HERO.valueProp));
  });
});

describe('credibility strip', () => {
  test('four points rendered right under the hero, before Who we serve', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    const who = within(main).getByRole('heading', { name: 'Who we serve' });
    expect((CREDIBILITY_POINTS as any[]).map((p) => p.title)).toEqual(CRED);
    for (const title of CRED) {
      const el = within(main).getAllByText(title)[0];
      expect(follows(h1, el)).toBe(true);
      expect(follows(el, who)).toBe(true);
    }
  });
});

describe('who we serve', () => {
  test('small and medium-sized businesses panel', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h3 = within(main)
      .getAllByRole('heading', { level: 3, name: 'Small and medium-sized businesses' })[0];
    const panel = ancestorWhere(h3, main, (el) => hasLink(el, 'See engagements', '/engagements'));
    expect(hasLink(panel, 'Enterprise engagements', '/engagements#enterprise')).toBe(false);
    const text = norm(panel.textContent);
    expect(text).toContain(norm((WHO_WE_SERVE as any).smb.text));
    const lower = text.toLowerCase();
    expect(lower).toMatch(/practical|right-sized/);
    expect(lower).toMatch(/\bowns?\b/);
  });

  test('enterprise panel with Premium label', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h3 = within(main).getAllByRole('heading', { level: 3, name: 'Enterprise' })[0];
    const panel = ancestorWhere(h3, main, (el) =>
      hasLink(el, 'Enterprise engagements', '/engagements#enterprise'),
    );
    expect(hasLink(panel, 'See engagements', '/engagements')).toBe(false);
    expect(within(panel as HTMLElement).getAllByText('Premium').length).toBeGreaterThan(0);
    const text = norm(panel.textContent);
    expect(text).toContain(norm((WHO_WE_SERVE as any).enterprise.text));
    const lower = text.toLowerCase();
    expect(lower).toMatch(/dedicated|senior/);
    expect(lower).toContain('custom');
    expect(lower).toContain('governance');
  });
});

describe('client results', () => {
  test('heading and three placeholder case-study cards', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const heading = within(main).getByRole('heading', { name: 'Client results' });
    const cards: Element[] = [];
    for (const c of CASE_STUDIES as any[]) {
      const el = within(main).getAllByText(c.industry).find((e) => follows(heading, e));
      if (!el) throw new Error(`No case-study industry "${c.industry}" after Client results`);
      const card = ancestorWhere(el, main, (x) => {
        const t = norm(x.textContent);
        return t.includes(norm(c.challenge)) && t.includes(norm(c.approach)) && t.includes(CASE_STUDY_NOTE);
      });
      expect(card).not.toBe(main);
      const t = norm(card.textContent);
      expect(t).toContain('Result: to be added from a real engagement.');
      expect(t).toContain('Placeholder case study: replace with a real client engagement before launch.');
      expect(within(card as HTMLElement).getAllByText('Placeholder').length).toBeGreaterThan(0);
      cards.push(card);
    }
    expect(cards.map((c) => c)).toHaveLength(3);
    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < cards.length; j++) {
        if (i !== j) expect(cards[i].contains(cards[j])).toBe(false);
      }
    }
    expect((CASE_STUDIES as any[]).map((c) => c.industry)).toEqual(['Manufacturing', 'Professional services', 'Retail']);
  });
});

describe('testimonial', () => {
  test('placeholder testimonial with attribution and note', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const attr = within(main).getAllByText(/Client name, Title, Company/)[0];
    const block = ancestorWhere(attr, main, (el) =>
      norm(el.textContent).includes('Placeholder testimonial: replace with a real client quote before launch.'),
    );
    expect(block).not.toBe(main);
    expect(norm(block.textContent)).toContain(norm((TESTIMONIAL as any).quote));
  });
});

describe('home section order', () => {
  test('hero, credibility, who we serve, pillars, how we work, client results, testimonial, why, CTA', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    const cred = within(main).getAllByText('Credentialed data scientists')[0];
    const who = within(main).getByRole('heading', { name: 'Who we serve' });
    const learn = Array.from(main.querySelectorAll('a')).find((a) => /Learn more/.test(a.textContent || ''));
    expect(learn).toBeTruthy();
    const how = within(main).getByRole('heading', { name: 'How we work' });
    const results = within(main).getByRole('heading', { name: 'Client results' });
    const testimonial = within(main).getAllByText(/Client name, Title, Company/)[0];
    const why = within(main).getByRole('heading', { name: 'Why The Bayes Group' });
    const cta = within(main).getByRole('heading', { name: 'Ready to put AI to work?' });
    const order: Node[] = [h1, cred, who, learn!, how, results, testimonial, why, cta];
    for (let i = 1; i < order.length; i++) expect(follows(order[i - 1], order[i])).toBe(true);
  });
});
