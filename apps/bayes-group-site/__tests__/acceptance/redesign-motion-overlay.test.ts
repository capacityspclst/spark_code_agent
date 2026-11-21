/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';
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

const ROOT = path.resolve(__dirname, '..', '..');

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

function mediaBlocks(css: string, re: RegExp): string[] {
  const out: string[] = [];
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

type Rule = { selector: string; body: string };

function cssRules(css: string): Rule[] {
  const out: Rule[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hasClass(selector: string, cls: string): boolean {
  return new RegExp(`\\.${escRe(cls)}(?![\\w-])`).test(selector);
}

function customProps(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /(--[\w-]+)\s*:\s*([^;{}]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) if (!(m[1] in out)) out[m[1]] = m[2].trim();
  return out;
}

function resolveVars(body: string, props: Record<string, string>): string {
  let out = body;
  for (let i = 0; i < 4; i++) {
    out = out.replace(/var\(\s*(--[\w-]+)[^)]*\)/g, (whole, name) => (name in props ? props[name] : whole));
  }
  return out;
}

function classesIn(el: Element): string[] {
  const set = new Set<string>();
  for (const e of [el, ...Array.from(el.querySelectorAll('*'))]) {
    for (const c of (e.getAttribute('class') || '').split(/\s+/)) if (c) set.add(c);
  }
  return Array.from(set);
}

describe('reduced motion', () => {
  test('prefers-reduced-motion: reduce turns off animations, transitions and transforms', () => {
    const blocks = mediaBlocks(allCss(), /@media[^{]*prefers-reduced-motion\s*:\s*reduce[^{]*\{/g).join('\n');
    expect(blocks.length).toBeGreaterThan(0);
    if (!/animation(-name)?\s*:\s*none|animation-duration\s*:/i.test(blocks)) {
      throw new Error('The prefers-reduced-motion: reduce block does not turn off animations');
    }
    if (!/transition(-property)?\s*:\s*none|transition-duration\s*:/i.test(blocks)) {
      throw new Error('The prefers-reduced-motion: reduce block does not turn off transitions');
    }
    if (!/transform\s*:\s*none/i.test(blocks)) {
      throw new Error('The prefers-reduced-motion: reduce block does not remove transforms (hover lifts)');
    }
  });
});

describe('text over photos', () => {
  test('hero text sits on a navy gradient overlay', () => {
    render(React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(AppRoutes)));
    const main = screen.getByRole('main');
    const h1 = within(main).getByRole('heading', { level: 1 });
    let hero: Element | null = h1;
    while (hero && !hero.querySelector('img[src="/images/hero-boardroom.jpg"]')) {
      if (hero === main) {
        hero = null;
        break;
      }
      hero = hero.parentElement;
    }
    if (!hero) throw new Error('The h1 and the hero-boardroom photo are not in the same hero element');
    const css = allCss();
    const props = customProps(css);
    const classes = classesIn(hero);
    const ok = cssRules(css).some((r) => {
      if (!classes.some((c) => hasClass(r.selector, c))) return false;
      const body = resolveVars(r.body, props);
      return /linear-gradient/i.test(body) && /navy|premium|#0b1f3a|11\s*,\s*31\s*,\s*58/i.test(r.body + body);
    });
    if (!ok) throw new Error(`No CSS rule on a hero class draws a navy linear-gradient overlay. Classes: ${classes.join(', ')}`);
  });
});
