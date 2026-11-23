/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import {
  SYSTEMS_LEAD,
  SYSTEMS_SECTIONS,
  DELIVERABLES_HEADING,
  DELIVERABLES,
  SYSTEMS_CTA,
} from '../../src/content/systems';

const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;
g.scrollTo = jest.fn();
(window as any).scrollTo = jest.fn();
(Element.prototype as any).scrollIntoView = jest.fn();

const { MemoryRouter } = require('react-router-dom');
const { AppRoutes } = require('../../src/App');

const ROOT = path.resolve(__dirname, '..', '..');

function renderAt(p: string) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [p] }, React.createElement(AppRoutes)),
  );
}

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

function listFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}
function allCss(): string {
  return listFiles(path.join(ROOT, 'src'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}
type Rule = { selector: string; body: string };
function cssRules(css: string): Rule[] {
  const out: Rule[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}
function hasClass(selector: string, cls: string): boolean {
  return new RegExp(`\\.${escRe(cls)}(?![\\w-])`).test(selector);
}
const MONO_RE = /font-family\s*:[^;}]*(var\(--font-mono\)|monospace|ui-monospace)/i;
function isMono(el: Element, stop: Element, rules: Rule[]): boolean {
  let e: Element | null = el;
  while (e) {
    if (/font-family\s*:[^;]*mono/i.test(e.getAttribute('style') || '')) return true;
    const cls = (e.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    if (cls.some((c) => rules.some((r) => hasClass(r.selector, c) && MONO_RE.test(r.body)))) return true;
    if (e === stop) break;
    e = e.parentElement;
  }
  return false;
}

afterEach(() => cleanup());

const SECTIONS: any[] = SYSTEMS_SECTIONS as any[];

const KEYWORDS: Record<string, RegExp[][]> = {
  agentic: [[/planning/i, /tool-using/i], [/human approval/i, /consequential/i], [/evaluation suites?/i, /ships?/i], [/limits/i, /agent/i]],
  architecture: [[/CRM/, /ERP/, /data warehouses?/i, /document stores?/i], [/event-driven/i, /API/], [/data contracts/i], [/security reviews?/i, /least-privilege/i]],
  observability: [[/end-to-end tracing/i, /agent step/i], [/metrics/i, /dashboards/i, /quality/i, /latency/i, /cost/i], [/alerts?/i, /drift/i], [/evaluation results/i, /over time/i]],
  sustainability: [[/runbooks/i, /on-call/i], [/cost budgets/i, /usage limits/i], [/model-agnostic/i, /swap/i], [/decision records/i, /handover training/i]],
};

describe('systems content', () => {
  test('lead, sections, deliverables and CTA', () => {
    expect(SYSTEMS_LEAD).toBe(
      'We design AI systems the way mature engineering teams build software: specific to your business, connected to the systems you already run, observable from day one and built to be maintained.',
    );
    expect(SECTIONS.map((s) => [s.id, s.title])).toEqual([
      ['agentic', 'Agentic development'],
      ['architecture', 'Multi-system architecture'],
      ['observability', 'Observable by design'],
      ['sustainability', 'Built to be sustained'],
    ]);
    for (const s of SECTIONS) {
      expect(s.items).toHaveLength(4);
      expect(norm(s.eyebrow).length).toBeGreaterThan(0);
      expect(norm(s.intro).length).toBeGreaterThan(0);
      KEYWORDS[s.id].forEach((res, i) => res.forEach((re) => expect(s.items[i]).toMatch(re)));
    }
    expect(DELIVERABLES_HEADING).toBe('What every system ships with');
    expect(DELIVERABLES).toEqual([
      'Architecture diagram & decision records',
      'Evaluation suite',
      'Tracing & dashboards',
      'Runbooks',
      'Cost & usage budgets',
      'Handover training',
    ]);
    expect(SYSTEMS_CTA).toEqual({
      heading: 'Have a system in mind?',
      button: { label: 'Book a consultation', to: '/contact' },
    });
  });
});

describe('systems page rendering', () => {
  test('hero has the h1, lead sentence and diagram', () => {
    renderAt('/systems');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    expect(norm(h1.textContent)).toBe('Systems engineering');
    const first = main.querySelector('#agentic');
    if (!first) throw new Error('No #agentic on /systems');
    // The hero is the whole top band: climb from the h1 until the parent is main
    // or would include the first content section.
    let hero: Element = h1;
    while (hero.parentElement && hero.parentElement !== main && !hero.parentElement.contains(first)) {
      hero = hero.parentElement;
    }
    expect(hero).not.toBe(main);
    expect(hero.contains(first)).toBe(false);
    expect(norm(hero.textContent)).toContain(norm(SYSTEMS_LEAD));
    const texts = Array.from(hero.querySelectorAll('svg text')).map((t) => norm(t.textContent));
    expect(texts).toContain('Agent orchestration');
  });

  test.each(SECTIONS.map((s) => s.id))('section %s has eyebrow, h2, intro, 4 icon items and an illustration', (id) => {
    renderAt('/systems');
    const main = screen.getByRole('main');
    const data = SECTIONS.find((s) => s.id === id);
    const section = main.querySelector(`#${id}`)!;
    expect(section).not.toBeNull();
    const h2 = section.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(norm(h2!.textContent)).toBe(data.title);
    const text = norm(section.textContent);
    expect(text.toLowerCase()).toContain(norm(data.eyebrow).toLowerCase());
    const p = Array.from(section.querySelectorAll('p')).find((x) => norm(x.textContent).includes(norm(data.intro)));
    expect(p).toBeTruthy();
    const ul = Array.from(section.querySelectorAll('ul')).find((u) => u.querySelectorAll('li').length === 4);
    expect(ul).toBeTruthy();
    const lis = Array.from(ul!.querySelectorAll('li'));
    lis.forEach((li, i) => {
      expect(norm(li.textContent)).toContain(norm(data.items[i]));
      expect(li.querySelector('svg')).not.toBeNull();
    });
    const illustration = Array.from(section.querySelectorAll('svg')).filter((s) => !ul!.contains(s));
    expect(illustration.length).toBeGreaterThan(0);
  });

  test('deliverables: six items, each with an icon tile and a monospace name', () => {
    renderAt('/systems');
    const main = screen.getByRole('main');
    const h2 = within(main).getByRole('heading', { name: 'What every system ships with' });
    expect(h2.tagName).toBe('H2');
    const section = ancestorWhere(h2, main, (e) => (DELIVERABLES as string[]).every((d) => norm(e.textContent).includes(d)));
    expect(section).not.toBe(main);
    const rules = cssRules(allCss());
    for (const name of DELIVERABLES as string[]) {
      const nameEl = deepest(section, name);
      expect(norm(nameEl.textContent)).toBe(name);
      const card = ancestorWhere(nameEl, section, (e) => !!e.querySelector('svg'));
      expect(card).not.toBe(section);
      for (const other of (DELIVERABLES as string[]).filter((d) => d !== name)) {
        expect(norm(card.textContent)).not.toContain(other);
      }
      expect(card.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 24 24');
      if (!isMono(nameEl, card, rules)) throw new Error(`Deliverable "${name}" is not in the monospace font`);
    }
  });

  test('CTA band Have a system in mind? with Book a consultation', () => {
    renderAt('/systems');
    const main = screen.getByRole('main');
    const h2 = within(main).getByRole('heading', { name: 'Have a system in mind?' });
    const band = ancestorWhere(h2, main, (e) =>
      Array.from(e.querySelectorAll('a')).some(
        (a) => norm(a.textContent) === 'Book a consultation' && a.getAttribute('href') === '/contact',
      ),
    );
    expect(band).not.toBe(main);
  });
});
