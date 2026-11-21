/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import {
  HERO,
  STEPS,
  CREDIBILITY_POINTS,
  AUDIENCE_PANELS,
  SYSTEMS_BAND,
  CAPABILITIES,
  OPERATE_STEP,
  EXAMPLES_SECTION,
  EXAMPLES,
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

function renderAt(p: string) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [p] }, React.createElement(AppRoutes)),
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

const linkIn = (el: Element, label: string, href: string) =>
  Array.from(el.querySelectorAll('a')).some(
    (a) => norm(a.textContent) === label && a.getAttribute('href') === href,
  );

const iconSvgs = (el: Element) =>
  Array.from(el.querySelectorAll('svg')).filter((s) => !s.querySelector('text'));

afterEach(() => cleanup());

const EX: any[] = EXAMPLES as any[];
const CAPS: any[] = CAPABILITIES as any[];
const PANELS: any[] = AUDIENCE_PANELS as any[];

describe('home content additions', () => {
  test('credibility points', () => {
    expect(CREDIBILITY_POINTS).toEqual([
      'Credentialed data scientists',
      'Vendor-neutral advice',
      'Built for small and medium-sized businesses',
      'Enterprise-grade governance',
    ]);
  });

  test('audience panels', () => {
    expect(PANELS.map((p) => [p.id, p.title, p.link, p.photo, p.premium])).toEqual([
      ['smb', 'Small and medium-sized businesses', { label: 'See engagements', to: '/engagements' }, 'smb-owner', false],
      ['enterprise', 'Enterprise', { label: 'Enterprise engagements', to: '/engagements#enterprise' }, 'enterprise-atrium', true],
    ]);
    const smb = PANELS[0].text as string;
    expect(sentenceCount(smb)).toBe(2);
    expect(smb).toMatch(/practical|right-sized/i);
    expect(smb).toMatch(/fast/i);
    expect(smb).toMatch(/\bown/i);
    const ent = PANELS[1].text as string;
    expect(sentenceCount(ent)).toBe(2);
    expect(ent).toMatch(/dedicated/i);
    expect(ent).toMatch(/senior/i);
    expect(ent).toMatch(/multi-system/i);
    expect(ent).toMatch(/governance/i);
  });

  test('systems band and capabilities', () => {
    expect(SYSTEMS_BAND).toEqual({
      eyebrow: 'WHAT WE BUILD',
      heading: 'Systems built to be observed and sustained',
      link: { label: 'How we build systems', to: '/systems' },
    });
    expect(CAPS.map((c) => c.title)).toEqual([
      'Agentic development',
      'Multi-system architecture',
      'Observable by design',
      'Sustainable to run',
    ]);
    for (const c of CAPS) expect(sentenceCount(c.description)).toBe(1);
    const kw: RegExp[][] = [
      [/plan/i, /tool/i, /approv/i],
      [/CRM/, /ERP/, /data/i, /documents/i, /silo/i],
      [/trac/i, /metric/i, /cost/i, /evaluat/i, /day one/i],
      [/runbook/i, /budget/i, /model-agnostic/i, /\bown/i],
    ];
    CAPS.forEach((c, i) => kw[i].forEach((re) => expect(c.description).toMatch(re)));
  });

  test('operate step', () => {
    const s: any = OPERATE_STEP;
    expect(s.title).toBe('Operate & improve');
    expect(s.description).toMatch(/monitor/i);
    expect(s.description).toMatch(/evaluat/i);
    expect(s.description).toMatch(/improv/i);
    expect(s.description).toMatch(/runbook/i);
  });

  test('examples section and examples', () => {
    expect(EXAMPLES_SECTION).toEqual({
      eyebrow: 'EXAMPLE ENGAGEMENTS',
      heading: 'The kinds of systems we build',
      tag: 'Illustrative example',
      note: 'Illustrative example of an engagement type, not a client case study.',
    });
    expect(EX.map((e) => [e.industry, e.name])).toEqual([
      ['Professional services', 'Agentic document intake'],
      ['Manufacturing', 'Connected maintenance forecasting'],
      ['Retail', 'Customer service copilot'],
    ]);
    const kw: Array<Record<string, RegExp[]>> = [
      {
        challenge: [/email/i, /format/i, /by hand/i],
        system: [/classif/i, /extract/i, /practice-management/i, /approv/i, /uncertain/i],
        sustained: [/trace/i, /end to end/i, /accuracy/i, /evaluation set/i, /weekly review queue/i],
      },
      {
        challenge: [/sensor/i, /maintenance system/i, /ERP/],
        system: [/forecast/i, /all three/i, /work orders?/i],
        sustained: [/data-quality/i, /drift/i, /retraining runbooks?/i, /owner/i],
      },
      {
        challenge: [/several systems/i, /question/i],
        system: [/retrieval-augmented/i, /product catalog/i, /order system/i, /polic/i, /draft/i],
        sustained: [/answer-quality/i, /cost per conversation/i, /guardrails/i, /monthly/i],
      },
    ];
    EX.forEach((e, i) => {
      for (const field of ['challenge', 'system', 'sustained']) {
        for (const re of kw[i][field]) expect(e[field]).toMatch(re);
      }
      const all = [e.industry, e.name, e.challenge, e.system, e.sustained].join(' ');
      expect(all).not.toMatch(/[0-9%]/);
    });
  });

  test('placeholder testimonial', () => {
    const t: any = TESTIMONIAL;
    expect(t.attribution).toBe('Client name, Title, Company');
    expect(t.placeholderNote).toBe('Placeholder testimonial: replace with a real client quote before launch.');
    expect(norm(t.quote).length).toBeGreaterThan(0);
  });
});

describe('home page redesign rendering', () => {
  test('hero contains the h1 and the value proposition', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    const hero = ancestorWhere(h1, main, (el) => linkIn(el, 'See how we build', '/systems'));
    expect(hero).not.toBe(main);
    expect(norm(hero.textContent)).toContain(
      'We design, build and run AI systems for small and medium-sized businesses, from single agents to multi-system architectures, with enterprise-grade rigor and senior data scientists on every engagement.',
    );
    expect(norm(HERO.valueProp)).toBe(norm(hero.textContent).match(/We design, build and run[^]*?engagement\./)![0]);
  });

  test('credibility strip shows four points, each with an icon', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    for (const point of CREDIBILITY_POINTS as string[]) {
      const el = within(main).getAllByText(point)[0];
      const item = ancestorWhere(el, main, (e) => iconSvgs(e).length > 0);
      expect(item).not.toBe(main);
      for (const other of (CREDIBILITY_POINTS as string[]).filter((p) => p !== point)) {
        expect(norm(item.textContent)).not.toContain(other);
      }
    }
  });

  test('small and medium-sized businesses panel', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const title = within(main).getAllByText('Small and medium-sized businesses')[0];
    const panel = ancestorWhere(title, main, (e) => linkIn(e, 'See engagements', '/engagements'));
    expect(panel).not.toBe(main);
    expect(norm(panel.textContent)).toContain(norm(PANELS[0].text));
    expect(linkIn(panel, 'Enterprise engagements', '/engagements#enterprise')).toBe(false);
    const imgs = Array.from(panel.querySelectorAll('img')).map((i) => i.getAttribute('src') || '');
    expect(imgs.some((s) => s.includes('smb-owner'))).toBe(true);
  });

  test('Enterprise panel with Premium label', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    let panel: Element | null = null;
    for (const t of within(main).getAllByText('Enterprise')) {
      try {
        panel = ancestorWhere(t, main, (e) => linkIn(e, 'Enterprise engagements', '/engagements#enterprise'));
        break;
      } catch (e) {
        /* next */
      }
    }
    expect(panel).not.toBeNull();
    expect(panel).not.toBe(main);
    expect(linkIn(panel!, 'See engagements', '/engagements')).toBe(false);
    const text = norm(panel!.textContent);
    expect(text).toContain(norm(PANELS[1].text));
    expect(Array.from(panel!.querySelectorAll('*')).some((e) => norm(e.textContent) === 'Premium')).toBe(true);
    const imgs = Array.from(panel!.querySelectorAll('img')).map((i) => i.getAttribute('src') || '');
    expect(imgs.some((s) => s.includes('enterprise-atrium'))).toBe(true);
  });

  test('systems band: eyebrow, h2, four capabilities with icons, and the link', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h2 = within(main).getByRole('heading', { name: 'Systems built to be observed and sustained' });
    expect(h2.tagName).toBe('H2');
    const band = ancestorWhere(h2, main, (e) =>
      CAPS.every((c) => norm(e.textContent).includes(c.title)) && linkIn(e, 'How we build systems', '/systems'),
    );
    expect(band).not.toBe(main);
    expect(norm(band.textContent)).toMatch(/what we build/i);
    for (const c of CAPS) {
      const titleEl = within(band as HTMLElement).getAllByText(c.title)[0];
      const card = ancestorWhere(titleEl, band, (e) => norm(e.textContent).includes(norm(c.description)));
      expect(card).not.toBe(band);
      expect(iconSvgs(card).length).toBeGreaterThan(0);
      for (const other of CAPS.filter((o) => o !== c)) expect(norm(card.textContent)).not.toContain(other.title);
    }
  });

  test('How we work has the Operate & improve step after the four numbered steps', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const heading = within(main).getByRole('heading', { name: 'How we work' });
    const section = ancestorWhere(heading, main, (el) =>
      STEPS.every((s) => norm(el.textContent).includes(norm(s.description))) &&
      norm(el.textContent).includes(norm((OPERATE_STEP as any).description)),
    );
    expect(section).not.toBe(main);
    const ol = Array.from(section.querySelectorAll('ol')).find((o) => o.querySelectorAll('li').length === 4);
    expect(ol).toBeTruthy();
    const op = deepest(section, 'Operate & improve');
    expect(ol!.contains(op)).toBe(false);
    expect(follows(ol!, op)).toBe(true);
  });

  test('example engagements section', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const h2 = within(main).getByRole('heading', { name: 'The kinds of systems we build' });
    expect(h2.tagName).toBe('H2');
    const section = ancestorWhere(h2, main, (e) => EX.every((x) => norm(e.textContent).includes(x.name)));
    expect(section).not.toBe(main);
    const text = norm(section.textContent);
    expect(text).toMatch(/example engagements/i);
    expect(text).toContain('Illustrative example of an engagement type, not a client case study.');
    for (const ex of EX) {
      const nameEl = deepest(section, ex.name);
      const card = ancestorWhere(nameEl, section, (e) =>
        [ex.industry, ex.challenge, ex.system, ex.sustained].every((p) => norm(e.textContent).includes(norm(p))),
      );
      expect(card).not.toBe(section);
      for (const other of EX.filter((o) => o !== ex)) expect(norm(card.textContent)).not.toContain(other.name);
      const tag = Array.from(card.querySelectorAll('*')).some((e) => norm(e.textContent) === 'Illustrative example');
      expect(tag).toBe(true);
    }
  });

  test('placeholder testimonial is marked and attributed', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const note = deepest(main, 'Placeholder testimonial: replace with a real client quote before launch.');
    const block = ancestorWhere(note, main, (e) =>
      norm(e.textContent).includes('Client name, Title, Company') &&
      norm(e.textContent).includes(norm((TESTIMONIAL as any).quote)),
    );
    expect(block).not.toBe(main);
  });

  test('sections appear in the required order', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const order: Element[] = [
      within(main).getByRole('heading', { level: 1 }),
      within(main).getAllByText('Credentialed data scientists')[0],
      within(main).getAllByText('Small and medium-sized businesses')[0],
      within(main).getByRole('heading', { name: 'Systems built to be observed and sustained' }),
      within(main).getAllByText('AI Enablement')[0],
      within(main).getByRole('heading', { name: 'How we work' }),
      within(main).getByRole('heading', { name: 'The kinds of systems we build' }),
      deepest(main, 'Placeholder testimonial: replace with a real client quote before launch.'),
      within(main).getByRole('heading', { name: 'Why The Bayes Group' }),
      within(main).getByRole('heading', { name: 'Ready to put AI to work?' }),
    ];
    for (let i = 1; i < order.length; i++) expect(follows(order[i - 1], order[i])).toBe(true);
  });
});
