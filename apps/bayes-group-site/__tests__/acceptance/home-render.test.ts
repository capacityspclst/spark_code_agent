/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import { PILLARS, STEPS, WHY_POINTS } from '../../src/content/home';

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

function sentenceCount(s: string): number {
  const m = s.trim().match(/[.!?](?=\s+[A-Z0-9"']|\s*$)/g);
  return m ? m.length : 0;
}

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

function pillarCard(main: HTMLElement, title: string, description: string): Element {
  const candidates = within(main).getAllByText(title);
  for (const c of candidates) {
    try {
      return ancestorWhere(c, main, (el) => norm(el.textContent).includes(norm(description)));
    } catch (e) {
      /* try next */
    }
  }
  throw new Error(`No pillar card for ${title}`);
}

describe('home page rendering', () => {
  test('hero h1 and buttons', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    expect(norm(h1.textContent)).toBe('Evidence-driven AI, built for your business.');
    const hero = ancestorWhere(h1, main, (el) =>
      Array.from(el.querySelectorAll('a')).some((a) => norm(a.textContent) === 'See how we build'),
    );
    const links = Array.from(hero.querySelectorAll('a'));
    const see = links.find((a) => norm(a.textContent) === 'See how we build');
    const book = links.find((a) => norm(a.textContent) === 'Book a consultation');
    expect(see && see.getAttribute('href')).toBe('/systems');
    expect(book && book.getAttribute('href')).toBe('/contact');
  });

  test('pillar descriptions have two or three sentences', () => {
    for (const p of PILLARS) {
      const n = sentenceCount(p.description);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  test('three pillar cards with Learn more links', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const expected = [
      ['AI Enablement', '/services#enablement'],
      ['Training', '/services#training'],
      ['Custom Development', '/services#custom-development'],
    ];
    for (const [title, href] of expected) {
      const p = PILLARS.find((x) => x.title === title)!;
      const card = pillarCard(main, title, p.description);
      const learn = Array.from(card.querySelectorAll('a')).find((a) =>
        /Learn more/.test(a.textContent || ''),
      );
      expect(learn).toBeTruthy();
      expect(learn!.getAttribute('href')).toBe(href);
    }
    const learnHrefs = Array.from(main.querySelectorAll('a'))
      .filter((a) => /Learn more/.test(a.textContent || ''))
      .map((a) => a.getAttribute('href'));
    expect(learnHrefs).toEqual(expected.map((e) => e[1]));
  });

  test('How we work has four numbered steps in order, one sentence each', () => {
    for (const s of STEPS) expect(sentenceCount(s.description)).toBe(1);
    renderAt('/');
    const main = screen.getByRole('main');
    const heading = within(main).getByRole('heading', { name: 'How we work' });
    const section = ancestorWhere(heading, main, (el) =>
      STEPS.every((s) => norm(el.textContent).includes(s.description.trim())),
    );
    const els = ['Assess', 'Design', 'Build', 'Enable'].map(
      (t) => within(section as HTMLElement).getAllByText(t)[0],
    );
    for (let i = 1; i < els.length; i++) expect(follows(els[i - 1], els[i])).toBe(true);
    const text = norm(section.textContent);
    const ol = section.querySelector('ol');
    const numbered =
      (ol !== null && ol.querySelectorAll('li').length === 4) ||
      /1[\s\S]*Assess[\s\S]*2[\s\S]*Design[\s\S]*3[\s\S]*Build[\s\S]*4[\s\S]*Enable/.test(text);
    expect(numbered).toBe(true);
  });

  test('Why The Bayes Group section covers the four points', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const heading = within(main).getByRole('heading', { name: 'Why The Bayes Group' });
    const section = ancestorWhere(heading, main, (el) =>
      WHY_POINTS.every((w) => norm(el.textContent).includes(norm(w.title))),
    );
    const text = norm(section.textContent).toLowerCase();
    expect(text).toContain('credentialed');
    expect(text).toContain('data scientist');
    expect(text).toMatch(/hands-on|builder/);
    expect(text).toMatch(/vendor[- ]neutral/);
    expect(text).toContain('transfer');
    expect(text).toMatch(/\bowns?\b/);
  });

  test('sections appear in order and the page ends with the CTA band', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    const pillar = pillarCard(main, PILLARS[0].title, PILLARS[0].description);
    const how = within(main).getByRole('heading', { name: 'How we work' });
    const why = within(main).getByRole('heading', { name: 'Why The Bayes Group' });
    const cta = within(main).getByRole('heading', { name: 'Ready to put AI to work?' });
    const order = [h1, pillar, how, why, cta];
    for (let i = 1; i < order.length; i++) expect(follows(order[i - 1], order[i])).toBe(true);

    const headings = main.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings[headings.length - 1]).toBe(cta);
    const links = main.querySelectorAll('a');
    const last = links[links.length - 1];
    expect(norm(last.textContent)).toBe('Book a consultation');
    expect(last.getAttribute('href')).toBe('/contact');
    expect(follows(cta, last)).toBe(true);
  });
});
