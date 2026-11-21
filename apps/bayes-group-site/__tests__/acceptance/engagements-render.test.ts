/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import { ENGAGEMENTS_INTRO, TIERS, NOT_SURE } from '../../src/content/engagements';

const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;
g.scrollTo = jest.fn();
(window as any).scrollTo = jest.fn();
(Element.prototype as any).scrollIntoView = jest.fn();

const { MemoryRouter } = require('react-router-dom');
const { AppRoutes } = require('../../src/App');

function renderAt(p: string) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [p] }, React.createElement(AppRoutes)),
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

function deepest(scope: Element, str: string): Element {
  const target = norm(str);
  const all = [scope, ...Array.from(scope.querySelectorAll('*'))].filter((e) =>
    norm(e.textContent).includes(target),
  );
  const leaf = all.filter((e) => !Array.from(e.children).some((c) => norm(c.textContent).includes(target)));
  if (!leaf.length) throw new Error(`Text not found: ${str}`);
  return leaf[0];
}

const follows = (a: Node, b: Node) =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

afterEach(() => cleanup());

const T: any[] = TIERS as any[];
const SMB = 'For small and medium-sized businesses';

const KEYWORDS: RegExp[][][] = [
  [[/readiness assessment/i], [/top three use cases/i, /prioriti/i], [/quick-win prototype/i], [/90-day roadmap/i]],
  [[/custom AI system/i, /deploy/i], [/integration/i, /existing systems/i], [/tracing/i, /dashboards/i, /day one/i], [/training/i, /runbooks/i]],
  [[/senior data scientist/i, /on call/i], [/monthly improvement sprints/i], [/monitoring/i, /evaluations/i, /model updates/i], [/quarterly roadmap reviews/i]],
  [[/dedicated senior team/i], [/multi-system/i, /agentic programs/i], [/governance/i, /responsible-AI policy/i], [/security/i, /compliance reviews/i], [/priority support/i]],
];

describe('engagements content', () => {
  test('intro and tiers', () => {
    expect(ENGAGEMENTS_INTRO).toBe(
      'Right-sized engagements for small and medium-sized businesses, and a premium tier for enterprise.',
    );
    expect(T.map((t) => [t.id, t.name, t.timeline, t.premium])).toEqual([
      ['jumpstart', 'Jumpstart', '2 to 4 weeks', false],
      ['build', 'Build', '6 to 12 weeks', false],
      ['partner', 'Partner', 'Ongoing, monthly', false],
      ['enterprise', 'Enterprise', 'Custom scope', true],
    ]);
    for (const t of T.slice(0, 3)) {
      expect(t.audience).toBe(SMB);
      expect(t.cta).toEqual({ label: 'Book a consultation', to: '/contact' });
    }
    expect(T[3].cta).toEqual({ label: 'Talk to us about enterprise', to: '/contact' });
    expect(T.map((t) => t.included.length)).toEqual([4, 4, 4, 5]);
    T.forEach((t, i) => KEYWORDS[i].forEach((res, j) => res.forEach((re) => expect(t.included[j]).toMatch(re))));
    expect(JSON.stringify(T)).not.toMatch(/[$€£]/);
    expect((NOT_SURE as any).text).toBe('Not sure which fits?');
    expect((NOT_SURE as any).link.to).toBe('/contact');
  });
});

describe('engagements page rendering', () => {
  test('h1, intro and no prices', () => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    expect(norm(within(main).getByRole('heading', { level: 1 }).textContent)).toBe('Engagements');
    const text = norm(main.textContent);
    expect(text).toContain(ENGAGEMENTS_INTRO);
    expect(text).not.toMatch(/[$€£]/);
  });

  test('four tier cards in order', () => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    const NAMES = ['Jumpstart', 'Build', 'Partner', 'Enterprise'];
    const TIMELINES = ['2 to 4 weeks', '6 to 12 weeks', 'Ongoing, monthly', 'Custom scope'];
    const headings: Element[] = [];
    const cards: Element[] = [];
    NAMES.forEach((name, i) => {
      const candidates = within(main)
        .queryAllByRole('heading')
        .filter((h) => norm(h.textContent) === name && h.tagName !== 'H1');
      let found: { h: Element; card: Element } | null = null;
      for (const h of candidates) {
        try {
          const card = ancestorWhere(h, main, (el) => norm(el.textContent).includes(TIMELINES[i]));
          if (card !== main) {
            found = { h, card };
            break;
          }
        } catch (e) {
          /* try next */
        }
      }
      if (!found) throw new Error(`No tier card with heading "${name}" and timeline "${TIMELINES[i]}"`);
      headings.push(found.h);
      cards.push(found.card);
    });
    for (let i = 1; i < headings.length; i++) expect(follows(headings[i - 1], headings[i])).toBe(true);
    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < cards.length; j++) {
        if (i !== j) expect(cards[i].contains(headings[j])).toBe(false);
      }
    }
  });

  test.each(T.map((t) => t.id))('tier %s card content', (id) => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    const t = T.find((x) => x.id === id);
    const card = main.querySelector(`article#${id}`)!;
    expect(card).not.toBeNull();
    const h2 = card.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(norm(h2!.textContent)).toBe(t.name);
    const text = norm(card.textContent);
    expect(text).toContain(t.audience);
    expect(text).toContain(t.timeline);
    expect(text).toMatch(/What['’]s included/);
    const ul = Array.from(card.querySelectorAll('ul')).find((u) => u.querySelectorAll('li').length === t.included.length);
    expect(ul).toBeTruthy();
    Array.from(ul!.querySelectorAll('li')).forEach((li, i) => {
      expect(norm(li.textContent)).toContain(norm(t.included[i]));
      expect(li.querySelector('svg')).not.toBeNull();
    });
    const tierIcon = Array.from(card.querySelectorAll('svg')).filter((s) => !ul!.contains(s));
    expect(tierIcon.length).toBeGreaterThan(0);
    const cta = Array.from(card.querySelectorAll('a')).find((a) => norm(a.textContent) === t.cta.label);
    expect(cta).toBeTruthy();
    expect(cta!.getAttribute('href')).toBe('/contact');
  });

  test('Enterprise card is premium with the atrium photo', () => {
    renderAt('/engagements');
    const card = screen.getByRole('main').querySelector('article#enterprise')!;
    expect(Array.from(card.querySelectorAll('*')).some((e) => norm(e.textContent) === 'Premium')).toBe(true);
    const srcs = Array.from(card.querySelectorAll('img')).map((i) => i.getAttribute('src') || '');
    expect(srcs.some((s) => s.includes('enterprise-atrium'))).toBe(true);
    const cta = Array.from(card.querySelectorAll('a')).find((a) => norm(a.textContent) === 'Talk to us about enterprise');
    expect(cta && cta.getAttribute('href')).toBe('/contact');
  });

  test('Not sure which fits? line with a link to /contact below the tiers', () => {
    renderAt('/engagements');
    const main = screen.getByRole('main');
    const el = deepest(main, 'Not sure which fits?');
    const last = main.querySelector('article#enterprise')!;
    expect(follows(last, el)).toBe(true);
    const block = ancestorWhere(el, main, (e) =>
      Array.from(e.querySelectorAll('a')).some((a) => a.getAttribute('href') === '/contact'),
    );
    expect(block).not.toBe(main);
    expect(block.querySelector('article')).toBeNull();
  });
});
