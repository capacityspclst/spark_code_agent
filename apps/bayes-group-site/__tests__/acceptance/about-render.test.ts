/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import { MISSION, WHY_BAYES, FOUNDERS, VALUES } from '../../src/content/about';

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

afterEach(() => cleanup());

describe('about page rendering', () => {
  test('h1 About, mission and Why Bayes', () => {
    renderAt('/about');
    const main = screen.getByRole('main');
    expect(norm(within(main).getByRole('heading', { level: 1 }).textContent)).toBe('About');
    const text = norm(main.textContent);
    expect(text).toContain(norm(MISSION));
    expect(within(main).getAllByRole('heading', { name: /Why Bayes/i }).length).toBeGreaterThan(0);
    expect(text).toContain(norm(WHY_BAYES));
    expect(WHY_BAYES).toMatch(/Bayesian/i);
    expect(WHY_BAYES).toMatch(/updat/i);
    expect(WHY_BAYES).toMatch(/engagement/i);
  });

  test('two founder cards marked as placeholders to be replaced', () => {
    renderAt('/about');
    const main = screen.getByRole('main');
    const names = within(main).getAllByText('Founder Name');
    expect(names).toHaveLength(2);
    const cards = names.map((n, i) => {
      const f = FOUNDERS[i];
      const parts = [f.name, f.role, f.bio, ...f.credentials].map((p) => norm(p));
      return ancestorWhere(n, main, (el) => parts.every((p) => norm(el.textContent).includes(p)));
    });
    expect(cards[0]).not.toBe(cards[1]);
    expect(cards[0].contains(cards[1])).toBe(false);
    expect(cards[1].contains(cards[0])).toBe(false);
    for (const card of cards) {
      const t = norm(card.textContent);
      expect(t).toContain('Co-founder & Principal Data Scientist');
      expect(t).toMatch(/placeholder/i);
      expect(t).toMatch(/replace/i);
    }
  });

  test('four values rendered', () => {
    renderAt('/about');
    const main = screen.getByRole('main');
    const text = norm(main.textContent);
    for (const title of ['Evidence over hype', 'Build to transfer', 'Vendor-neutral', 'Responsible by design']) {
      expect(within(main).getAllByText(title).length).toBeGreaterThan(0);
    }
    for (const v of VALUES as any[]) {
      expect(text).toContain(norm(v.description));
    }
  });
});
