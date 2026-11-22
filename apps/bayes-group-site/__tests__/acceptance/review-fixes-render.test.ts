/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PILLARS, STEPS } from '../../src/content/home';
import { FOOTER_LINE, COPYRIGHT, TAGLINE, CONTACT_EMAIL } from '../../src/content/site';

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

afterEach(() => cleanup());

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

function desktopBlocks(css: string): string[] {
  const out: string[] = [];
  const re = /@media[^{]*min-width\s*:\s*(1024px|64rem|64em)[^{]*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    const start = i;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    out.push(css.slice(start, i - 1));
  }
  return out;
}

function classesIn(el: Element): string[] {
  const set = new Set<string>();
  const all = [el, ...Array.from(el.querySelectorAll('*'))];
  for (const e of all) {
    for (const c of (e.getAttribute('class') || '').split(/\s+/)) if (c) set.add(c);
  }
  return Array.from(set);
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

describe('How we work styling', () => {
  function howSection(): Element {
    renderAt('/');
    const main = screen.getByRole('main');
    const heading = within(main).getByRole('heading', { name: 'How we work' });
    const section = heading.closest('section');
    if (section && STEPS.every((s) => norm(section.textContent).includes(norm(s.description)))) return section;
    return ancestorWhere(heading, main, (el) =>
      STEPS.every((s) => norm(el.textContent).includes(norm(s.description))),
    );
  }

  test('every class used in the section has a CSS rule', () => {
    const section = howSection();
    const classes = classesIn(section);
    expect(classes.length).toBeGreaterThan(0);
    const rules = cssRules(allCss());
    const missing = classes.filter((c) => !rules.some((r) => hasClass(r.selector, c)));
    if (missing.length) throw new Error(`Classes in How we work without CSS rules: ${missing.join(', ')}`);
  });

  test('four columns at 1024px and wider', () => {
    const classes = classesIn(howSection());
    const blocks = desktopBlocks(allCss());
    const ok = blocks.some((b) =>
      cssRules(b).some(
        (r) =>
          classes.some((c) => hasClass(r.selector, c)) &&
          /grid-template-columns\s*:\s*repeat\(\s*4\s*,/.test(r.body),
      ),
    );
    if (!ok) {
      throw new Error(
        `No rule inside @media (min-width: 1024px) gives a How we work class grid-template-columns: repeat(4, ...). Classes: ${classes.join(', ')}`,
      );
    }
  });

  test('a connecting line drawn with a pseudo-element', () => {
    const classes = classesIn(howSection());
    const rules = cssRules(allCss());
    const ok = rules.some(
      (r) =>
        /::?(before|after)/.test(r.selector) &&
        classes.some((c) => hasClass(r.selector, c)) &&
        /(var\(--color-(border|accent|accent-light|accent-strong)\)|#[0-9a-f]{3,6})/i.test(r.body),
    );
    if (!ok) throw new Error(`No ::before/::after rule on a How we work class draws a colored line. Classes: ${classes.join(', ')}`);
  });
});

describe('pillar card titles', () => {
  test('pillar title element has a class with its own serif styling and every pillar class has a rule', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const rules = cssRules(allCss());
    const serifRe = /font-family\s*:\s*(var\(--font-serif\)|[^;]*(?<!sans-)\bserif\b)/i;
    for (const p of PILLARS) {
      const candidates = within(main)
        .getAllByText(p.title)
        .filter((el) => el.tagName !== 'A' && !el.closest('a'));
      let titleEl: Element | null = null;
      let card: Element | null = null;
      for (const c of candidates) {
        try {
          const found = ancestorWhere(c, main, (el) => norm(el.textContent).includes(norm(p.description)));
          if (found !== main) {
            titleEl = c;
            card = found;
            break;
          }
        } catch (e) {
          /* try next */
        }
      }
      if (!titleEl || !card) throw new Error(`No pillar title element found for "${p.title}"`);
      const cls = (titleEl.getAttribute('class') || '').split(/\s+/).filter(Boolean);
      if (!cls.length) throw new Error(`Pillar title "${p.title}" has no class`);
      const serif = rules.some(
        (r) => cls.some((c) => hasClass(r.selector, c)) && serifRe.test(r.body),
      );
      if (!serif) throw new Error(`No CSS rule for pillar title classes (${cls.join(', ')}) sets a serif font-family`);
      const missing = classesIn(card).filter((c) => !rules.some((r) => hasClass(r.selector, c)));
      if (missing.length) throw new Error(`Pillar card classes without CSS rules: ${missing.join(', ')}`);
    }
  });
});

describe('footer content', () => {
  test.each(['/', '/services', '/contact'])('footer on %s shows only wordmark, line, nav and copyright', (p) => {
    renderAt(p);
    const footer = screen.getByRole('contentinfo');
    const text = norm(footer.textContent);
    expect(text.split(FOOTER_LINE).length - 1).toBe(1);
    expect(text).not.toContain(TAGLINE);
    expect(footer.querySelector('nav[aria-label="Footer"]')).not.toBeNull();
    const clone = footer.cloneNode(true) as HTMLElement;
    Array.from(clone.querySelectorAll('a, nav, svg')).forEach((e) => e.remove());
    // Column headings ("Services", "Company") are allowed.
    Array.from(clone.querySelectorAll('*')).forEach((e) => {
      const t = norm(e.textContent);
      if ((t === 'Services' || t === 'Company') && e.isConnected !== false) e.remove();
    });
    let rest = norm(clone.textContent);
    rest = norm(rest.replace(FOOTER_LINE, ' '));
    rest = norm(rest.replace(COPYRIGHT, ' '));
    rest = norm(rest.replace(CONTACT_EMAIL, ' '));
    if (!(rest === '' || rest === 'The Bayes Group')) {
      throw new Error(`Footer has extra text besides the wordmark, line, nav and copyright: ${JSON.stringify(rest)}`);
    }
  });
});

describe('contact form field style', () => {
  function getForm(): HTMLFormElement {
    renderAt('/contact');
    const form = screen.getByRole('main').querySelector('form');
    if (!form) throw new Error('No form on /contact');
    return form as HTMLFormElement;
  }

  function controls(form: HTMLFormElement) {
    const f = within(form);
    return {
      name: f.getByLabelText(/^Name\b/),
      email: f.getByLabelText(/^Email\b/),
      company: f.getByLabelText(/^Company(?! size)\b/),
      companySize: f.getByLabelText(/^Company size\b/),
      topic: f.getByLabelText(/^What can we help with\?/),
      message: f.getByLabelText(/^Message\b/),
    };
  }

  test('every control uses the form-control class', () => {
    const form = getForm();
    const els = Array.from(form.querySelectorAll('input, select, textarea'));
    expect(els.length).toBeGreaterThanOrEqual(5);
    for (const el of els) {
      if (!el.classList.contains('form-control')) {
        throw new Error(`Control ${el.outerHTML.slice(0, 120)} lacks class form-control`);
      }
    }
  });

  test('CSS: grey border, teal focus, red only when invalid', () => {
    const rules = cssRules(allCss());
    const parts = (r: Rule) => r.selector.split(',').map((s) => s.trim());
    const base = rules.some(
      (r) =>
        parts(r).some((s) => hasClass(s, 'form-control') && !/[:[]/.test(s)) &&
        /border(-color)?\s*:[^;]*(var\(--color-input-border\)|#7a8699)/i.test(r.body),
    );
    if (!base) throw new Error('No .form-control rule with border var(--color-input-border)');
    const focus = rules.some(
      (r) =>
        parts(r).some((s) => /\.form-control(?![\w-])[^,]*:focus/.test(s)) &&
        /border(-color)?\s*:[^;]*(var\(--color-accent(-strong)?\)|#17696a|#1f8a8a)/i.test(r.body),
    );
    if (!focus) throw new Error('No .form-control:focus rule with a teal border-color');
    const invalid = rules.some(
      (r) =>
        parts(r).some((s) => /\.form-control(?![\w-])[^,]*\[aria-invalid=["']?true["']?\]/.test(s)) &&
        /border(-color)?\s*:[^;]*(var\(--color-error\)|#b42318)/i.test(r.body),
    );
    if (!invalid) throw new Error('No .form-control[aria-invalid="true"] rule with border-color var(--color-error)');
    for (const r of rules) {
      if (!/border(-color)?\s*:[^;]*(var\(--color-error\)|#b42318)/i.test(r.body)) continue;
      for (const s of parts(r)) {
        if (/form-control|input|select|textarea/.test(s) && !/aria-invalid/.test(s)) {
          throw new Error(`Field border turns red without aria-invalid in selector "${s}"`);
        }
      }
    }
  });

  test('only fields with an error are aria-invalid', async () => {
    const user = userEvent.setup();
    const form = getForm();
    const c = controls(form);
    for (const el of Object.values(c)) expect(el.getAttribute('aria-invalid')).not.toBe('true');
    await user.click(within(form).getByRole('button', { name: 'Send message' }));
    expect(c.name.getAttribute('aria-invalid')).toBe('true');
    expect(c.email.getAttribute('aria-invalid')).toBe('true');
    expect(c.message.getAttribute('aria-invalid')).toBe('true');
    expect(c.company.getAttribute('aria-invalid')).not.toBe('true');
    expect(c.companySize.getAttribute('aria-invalid')).not.toBe('true');
    expect(c.topic.getAttribute('aria-invalid')).not.toBe('true');
  });

  test('Required is shown the same way on every required field', () => {
    const form = getForm();
    const c = controls(form);
    const fieldByEl = new Map<Element, string>([
      [c.name, 'name'],
      [c.email, 'email'],
      [c.company, 'company'],
      [c.companySize, 'companySize'],
      [c.topic, 'topic'],
      [c.message, 'message'],
    ]);
    const allControls = Array.from(fieldByEl.keys());

    function fieldOf(marker: Element): string | null {
      const label = marker.closest('label');
      if (label) {
        const forId = label.getAttribute('for');
        if (forId) {
          const target = allControls.find((el) => el.id === forId);
          if (target) return fieldByEl.get(target) || null;
        }
        const inner = allControls.filter((el) => label.contains(el));
        if (inner.length === 1) return fieldByEl.get(inner[0]) || null;
      }
      let el: Element | null = marker.parentElement;
      while (el && el !== form) {
        const inside = allControls.filter((ctl) => el!.contains(ctl));
        if (inside.length === 1) return fieldByEl.get(inside[0]) || null;
        if (inside.length > 1) return null;
        el = el.parentElement;
      }
      return null;
    }

    const markers = within(form).getAllByText(/^\s*\(?\s*required\s*\)?\s*$/i);
    const counts: Record<string, number> = {};
    for (const m of markers) {
      const f = fieldOf(m);
      if (!f) throw new Error(`"Required" marker not associated with exactly one field: ${m.outerHTML.slice(0, 120)}`);
      counts[f] = (counts[f] || 0) + 1;
    }
    expect(counts).toEqual({ name: 1, email: 1, message: 1 });
    const shape = (t: HTMLElement) => `${t.tagName}|${(t.getAttribute('class') || '').trim()}`;
    expect(new Set(markers.map(shape)).size).toBe(1);
  });
});
