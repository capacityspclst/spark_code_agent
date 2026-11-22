/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import { FOOTER_LINE, COPYRIGHT, CONTACT_EMAIL } from '../../src/content/site';
import { SYSTEMS_LEAD } from '../../src/content/systems';

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

const norm = (s: string | null | undefined) =>
  (s || '').replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim();
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

afterEach(() => cleanup());

// ---------- DOM helpers ----------
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

function lca(a: Element, b: Element): Element {
  let el: Element | null = a;
  while (el && !el.contains(b)) el = el.parentElement;
  if (!el) throw new Error('No common ancestor');
  return el;
}

const follows = (a: Node, b: Node) =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

function ownClasses(el: Element): string[] {
  return (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
}

function classesIn(el: Element): string[] {
  const set = new Set<string>();
  for (const e of [el, ...Array.from(el.querySelectorAll('*'))]) for (const c of ownClasses(e)) set.add(c);
  return Array.from(set);
}

// ---------- CSS helpers ----------
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

function lastCompound(sel: string): string {
  const parts = sel.trim().split(/[\s>+~]+/).filter(Boolean);
  return parts[parts.length - 1] || '';
}

// True when one of the comma-separated selectors targets the class in its last compound.
function targets(selector: string, cls: string): boolean {
  const re = new RegExp(`\\.${escRe(cls)}(?![\\w-])`);
  return selector.split(',').some((s) => re.test(lastCompound(s)));
}

function blockAt(css: string, openIdx: number): { inner: string; end: number } {
  let depth = 1;
  let i = openIdx + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  return { inner: css.slice(openIdx + 1, i - 1), end: i };
}

function desktopBlocks(css: string): string[] {
  const out: string[] = [];
  const re = /@media[^{]*min-width\s*:\s*(1024px|64rem|64em)[^{]*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const { inner } = blockAt(css, re.lastIndex - 1);
    out.push(inner);
  }
  return out;
}

function stripAtBlocks(css: string): string {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('@', i);
    if (at === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, at);
    const open = css.indexOf('{', at);
    const semi = css.indexOf(';', at);
    if (open === -1) break;
    if (semi !== -1 && semi < open) {
      i = semi + 1;
      continue;
    }
    i = blockAt(css, open).end;
  }
  return out;
}

function gtcValues(body: string): string[] {
  const out: string[] = [];
  const re = /grid-template-columns\s*:\s*([^;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.push(m[1].replace(/!important/i, '').trim());
  return out;
}

function tracks(value: string): string[] {
  const tokens: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (cur) tokens.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur) tokens.push(cur);
  const out: string[] = [];
  for (const t of tokens) {
    const rep = t.match(/^repeat\(\s*(\d+)\s*,\s*([\s\S]+)\)$/);
    if (rep) {
      const inner = tracks(rep[2]);
      for (let i = 0; i < Number(rep[1]); i++) out.push(...inner);
    } else if (/^repeat\(/.test(t)) {
      out.push(t, t); // auto-fit/auto-fill: treat as multi-column
    } else out.push(t);
  }
  return out;
}

function weight(tok: string): { n: number; unit: string } | null {
  const re = /([\d.]+)(fr|%)/g;
  let m: RegExpExecArray | null;
  let last: { n: number; unit: string } | null = null;
  while ((m = re.exec(tok))) last = { n: Number(m[1]), unit: m[2] };
  return last;
}

// ---------- 1. Footer ----------
const SERVICES_LINKS = ['AI Enablement', 'Training', 'Custom Development', 'Systems engineering', 'Engagements'];
const COMPANY_LINKS = ['About', 'Contact'];

function footerGroups(p: string) {
  renderAt(p);
  const footer = screen.getByRole('contentinfo');
  const headings = Array.from(footer.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const servicesH = headings.find((h) => norm(h.textContent) === 'Services');
  const companyH = headings.find((h) => norm(h.textContent) === 'Company');
  if (!servicesH || !companyH) {
    throw new Error(`Footer on ${p} needs headings "Services" and "Company"; found ${JSON.stringify(headings.map((h) => norm(h.textContent)))}`);
  }
  const services = ancestorWhere(servicesH, footer, (el) => el.querySelectorAll('a').length > 0);
  const company = ancestorWhere(companyH, footer, (el) => el.querySelectorAll('a').length > 0);
  let brand = deepest(footer, FOOTER_LINE);
  while (
    brand.parentElement &&
    brand.parentElement !== footer &&
    !brand.parentElement.querySelector('h1, h2, h3, h4, h5, h6')
  ) {
    brand = brand.parentElement;
  }
  return { footer, headings, servicesH, companyH, services, company, brand };
}

const linkLabels = (el: Element) => Array.from(el.querySelectorAll('a')).map((a) => norm(a.textContent));

describe('footer has exactly three groups', () => {
  test.each(['/', '/contact', '/systems'])('footer on %s', (p) => {
    const { footer, headings, services, company, brand } = footerGroups(p);
    expect(headings.map((h) => norm(h.textContent))).toEqual(['Services', 'Company']);

    expect(services.contains(company)).toBe(false);
    expect(company.contains(services)).toBe(false);
    if (JSON.stringify(linkLabels(services)) !== JSON.stringify(SERVICES_LINKS)) {
      throw new Error(`Services column links on ${p}: ${JSON.stringify(linkLabels(services))}, expected ${JSON.stringify(SERVICES_LINKS)}`);
    }
    if (JSON.stringify(linkLabels(company)) !== JSON.stringify(COMPANY_LINKS)) {
      throw new Error(`Company column links on ${p}: ${JSON.stringify(linkLabels(company))}, expected ${JSON.stringify(COMPANY_LINKS)}`);
    }

    expect(brand).not.toBe(footer);
    expect(brand.contains(services)).toBe(false);
    expect(brand.contains(company)).toBe(false);
    const bt = norm(brand.textContent);
    expect(bt).toContain(FOOTER_LINE);
    expect(bt).toContain(CONTACT_EMAIL);
    const mail = Array.from(brand.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === `mailto:${CONTACT_EMAIL}`,
    );
    expect(mail).toBeTruthy();
    expect(brand.querySelector('svg')).not.toBeNull();

    expect(follows(brand, services)).toBe(true);
    expect(follows(services, company)).toBe(true);

    for (const a of Array.from(footer.querySelectorAll('a'))) {
      if (![brand, services, company].some((grp) => grp.contains(a))) {
        throw new Error(`Footer link outside the three groups on ${p}: ${a.outerHTML.slice(0, 160)}`);
      }
    }

    const copy = deepest(footer, COPYRIGHT);
    for (const grp of [brand, services, company]) expect(grp.contains(copy)).toBe(false);
    expect(follows(company, copy)).toBe(true);
    expect(footer.querySelector('nav[aria-label="Footer"]')).not.toBeNull();
  });

  test('CSS: three columns (brand widest) at 1024px+, stacked by default, no 4-column footer grid', () => {
    const { footer, services, company, brand } = footerGroups('/');
    const grid = lca(lca(brand, services), company);
    const candidates: string[] = [];
    let el: Element | null = grid;
    while (el) {
      candidates.push(...ownClasses(el));
      if (el === footer) break;
      el = el.parentElement;
    }
    const css = allCss();
    const desktopRules = desktopBlocks(css).flatMap((b) => cssRules(b));
    const desktop = desktopRules.filter((r) => candidates.some((c) => targets(r.selector, c)) && gtcValues(r.body).length);
    const three = desktop.filter((r) => gtcValues(r.body).some((v) => tracks(v).length === 3));
    if (!three.length) {
      throw new Error(
        `No rule inside @media (min-width: 1024px) gives the footer grid (classes ${candidates.join(', ')}) three grid-template-columns tracks. Found: ${desktop.map((r) => `${r.selector} { ${gtcValues(r.body).join(' / ')} }`).join(' ; ')}`,
      );
    }
    for (const r of three) {
      for (const v of gtcValues(r.body)) {
        const t = tracks(v).map(weight);
        if (t.length === 3 && t.every((w) => w !== null) && t.every((w) => w!.unit === t[0]!.unit)) {
          if (!(t[0]!.n > t[1]!.n && t[0]!.n > t[2]!.n)) {
            throw new Error(`Footer brand column should be the widest: "${r.selector} { grid-template-columns: ${v} }"`);
          }
        }
      }
    }
    const usedClasses = Array.from(new Set([...candidates, ...classesIn(footer).filter((c) => /footer/i.test(c))]));
    for (const r of cssRules(css)) {
      if (!usedClasses.some((c) => targets(r.selector, c))) continue;
      for (const v of gtcValues(r.body)) {
        if (tracks(v).length >= 4) {
          throw new Error(`Footer still has a 4-column grid: "${r.selector} { grid-template-columns: ${v} }"`);
        }
      }
    }
    const gridClasses = Array.from(new Set(three.flatMap((r) => candidates.filter((c) => targets(r.selector, c)))));
    for (const r of cssRules(stripAtBlocks(css))) {
      if (!gridClasses.some((c) => targets(r.selector, c))) continue;
      for (const v of gtcValues(r.body)) {
        if (tracks(v).length > 1) {
          throw new Error(`Footer grid must stack on phones, but the base rule "${r.selector}" sets grid-template-columns: ${v}`);
        }
      }
    }
  });
});

// ---------- 2. Contact page header band ----------
function bandOf(main: HTMLElement, h1: Element, stop: Element): Element {
  let el: Element = h1;
  while (el.parentElement && el.parentElement !== main && !el.parentElement.contains(stop)) el = el.parentElement;
  return el;
}

function contactBand() {
  renderAt('/contact');
  const main = screen.getByRole('main');
  const h1 = within(main).getByRole('heading', { level: 1 });
  const form = main.querySelector('form');
  if (!form) throw new Error('No form on /contact');
  const band = bandOf(main, h1, form);
  return { main, h1, form, band };
}

describe('contact page header band', () => {
  test('band holds the eyebrow, h1, lead and email line, and no form', () => {
    const { main, h1, form, band } = contactBand();
    expect(norm(h1.textContent)).toBe('Book a consultation');
    expect(band).not.toBe(main);
    expect(band.contains(form)).toBe(false);
    const eyebrow = Array.from(band.querySelectorAll('.eyebrow')).find(
      (e) => norm(e.textContent).toUpperCase() === 'CONTACT',
    );
    if (!eyebrow) {
      throw new Error(`Contact band has no .eyebrow "CONTACT". Band HTML: ${band.outerHTML.slice(0, 600)}`);
    }
    expect(follows(eyebrow, h1)).toBe(true);
    const text = norm(band.textContent);
    expect(text).toContain("Tell us what you're working on and we'll reply within one business day.");
    expect(text).toContain(`Prefer email? ${CONTACT_EMAIL}`);
    const mail = Array.from(band.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === `mailto:${CONTACT_EMAIL}`,
    );
    expect(mail).toBeTruthy();
    expect(norm(mail!.textContent)).toBe(CONTACT_EMAIL);
    expect(text).not.toContain('What happens next');
  });

  test('form and What happens next follow the band', () => {
    const { main, form, band } = contactBand();
    expect(follows(band, form)).toBe(true);
    const next = deepest(main, 'What happens next');
    expect(band.contains(next)).toBe(false);
    expect(follows(band, next)).toBe(true);
    expect(main.querySelectorAll('h1')).toHaveLength(1);
  });

  test('band uses the same page-header styling as Services (shared class, motif, navy background)', () => {
    const { band } = contactBand();
    const contactClasses = ownClasses(band);
    const contactHasMotif = !!band.querySelector('svg[aria-hidden="true"]');
    const contactAll = classesIn(band);
    cleanup();

    renderAt('/services');
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    const first = main.querySelector('#enablement');
    if (!first) throw new Error('No #enablement on /services');
    const sBand = bandOf(main, h1, first);
    const servicesClasses = ownClasses(sBand);
    const shared = contactClasses.filter((c) => servicesClasses.includes(c));
    if (!shared.length) {
      throw new Error(
        `Contact header band (classes: ${contactClasses.join(' ') || 'none'}) shares no class with the Services header band (classes: ${servicesClasses.join(' ') || 'none'})`,
      );
    }
    if (sBand.querySelector('svg[aria-hidden="true"]')) expect(contactHasMotif).toBe(true);

    const rules = cssRules(allCss());
    const navy = rules.some(
      (r) =>
        contactAll.some((c) => targets(r.selector, c)) &&
        /background(-color)?\s*:[^;]*(var\(--color-navy\)|#0b1f3a)/i.test(r.body),
    );
    if (!navy) throw new Error(`No CSS rule gives the contact header band (classes ${contactAll.join(', ')}) a navy background`);
  });
});

// ---------- 3. Systems hero ----------
function systemsHero() {
  renderAt('/systems');
  const main = screen.getByRole('main');
  const h1 = within(main).getByRole('heading', { level: 1 });
  const first = main.querySelector('#agentic');
  if (!first) throw new Error('No #agentic on /systems');
  const hero = bandOf(main, h1, first);
  const diagrams = Array.from(hero.querySelectorAll('svg')).filter(
    (s) =>
      !(s.parentElement && s.parentElement.closest('svg')) &&
      Array.from(s.querySelectorAll('text')).some((t) => norm(t.textContent) === 'Agent orchestration'),
  );
  if (!diagrams.length) throw new Error('No architecture diagram in the Systems hero');
  const grid = lca(h1, diagrams[0]);
  return { main, h1, hero, diagrams, grid };
}

describe('systems hero puts the diagram beside the text', () => {
  test('two columns: text (h1 + lead) first, then the diagram', () => {
    const { h1, diagrams, grid } = systemsHero();
    const kids = Array.from(grid.children);
    if (kids.length !== 2) {
      throw new Error(`Systems hero grid should have exactly 2 children (text, diagram); got ${kids.length}: ${grid.outerHTML.slice(0, 400)}`);
    }
    const [textCol, diagCol] = kids;
    expect(textCol.contains(h1)).toBe(true);
    expect(norm(textCol.textContent)).toContain(norm(SYSTEMS_LEAD));
    for (const d of diagrams) {
      expect(diagCol.contains(d)).toBe(true);
      expect(textCol.contains(d)).toBe(false);
    }
    expect(norm(diagCol.textContent)).not.toContain(norm(SYSTEMS_LEAD));
    expect(follows(textCol, diagCol)).toBe(true);
  });

  test('CSS: text about 40% and diagram beside it at 1024px+, centered; stacked by default', () => {
    const { grid } = systemsHero();
    const gridClasses = ownClasses(grid);
    if (!gridClasses.length) throw new Error('Systems hero grid element has no class');
    const diagClasses = ownClasses(grid.children[1]);
    const css = allCss();
    const desktop = desktopBlocks(css)
      .flatMap((b) => cssRules(b))
      .filter((r) => gridClasses.some((c) => targets(r.selector, c)));
    const two = desktop.flatMap((r) => gtcValues(r.body)).filter((v) => tracks(v).length === 2);
    if (!two.length) {
      throw new Error(`No rule inside @media (min-width: 1024px) gives the Systems hero grid (classes ${gridClasses.join(', ')}) two grid-template-columns tracks`);
    }
    for (const v of two) {
      const [a, b] = tracks(v).map(weight);
      if (a && b && a.unit === b.unit) {
        const share = a.n / (a.n + b.n);
        if (share < 0.3 || share > 0.5) {
          throw new Error(`Systems hero text column should be about 40% wide, got grid-template-columns: ${v}`);
        }
      }
    }
    const rules = cssRules(css);
    const centered = rules.some(
      (r) =>
        (gridClasses.some((c) => targets(r.selector, c)) && /(align-items|place-items)\s*:\s*center/i.test(r.body)) ||
        (diagClasses.some((c) => targets(r.selector, c)) && /(align-self|place-self)\s*:\s*center/i.test(r.body)),
    );
    if (!centered) throw new Error('The Systems hero diagram column is not vertically centered (align-items: center)');
    for (const r of cssRules(stripAtBlocks(css))) {
      if (!gridClasses.some((c) => targets(r.selector, c))) continue;
      for (const v of gtcValues(r.body)) {
        if (tracks(v).length > 1) {
          throw new Error(`Systems hero must stack on phones, but the base rule "${r.selector}" sets grid-template-columns: ${v}`);
        }
      }
    }
  });
});
