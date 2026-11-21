/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { render, screen, cleanup } from '@testing-library/react';

const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;
g.scrollTo = jest.fn();
(window as any).scrollTo = jest.fn();
(Element.prototype as any).scrollIntoView = jest.fn();

const { MemoryRouter } = require('react-router-dom');
const { AppRoutes } = require('../../src/App');
const DiagramModule = require('../../src/components/ArchitectureDiagram');
const ArchitectureDiagram = DiagramModule.ArchitectureDiagram || DiagramModule.default;

const ROOT = path.resolve(__dirname, '..', '..');

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

afterEach(() => cleanup());

function renderAt(p: string) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [p] }, React.createElement(AppRoutes)),
  );
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
    if (/mono/i.test(e.getAttribute('font-family') || '')) return true;
    if (/font-family\s*:[^;]*mono/i.test(e.getAttribute('style') || '')) return true;
    const cls = (e.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    if (cls.some((c) => rules.some((r) => hasClass(r.selector, c) && MONO_RE.test(r.body)))) return true;
    if (e === stop) break;
    e = e.parentElement;
  }
  return false;
}

const LABELS = [
  'Your systems',
  'CRM',
  'ERP',
  'Data warehouse',
  'Documents',
  'Agent orchestration',
  'Planner',
  'Tool-using agents',
  'Human approval',
  'Models (vendor-neutral)',
  'Guardrails & evaluations',
  'Observability',
  'Traces',
  'Metrics',
  'Cost',
  'Evaluations',
];

function diagramSvgs(scope: Element): SVGElement[] {
  return Array.from(scope.querySelectorAll('svg')).filter(
    (s) => s.querySelector('text') && !(s.parentElement && s.parentElement.closest('svg')),
  ) as SVGElement[];
}

function textsOf(svg: Element): string[] {
  return Array.from(svg.querySelectorAll('text')).map((t) => norm(t.textContent));
}

describe.each(['light', 'dark'])('ArchitectureDiagram variant %s', (variant) => {
  function renderDiagram() {
    const { container } = render(React.createElement(ArchitectureDiagram, { variant }));
    const svgs = diagramSvgs(container);
    expect(svgs.length).toBeGreaterThan(0);
    return { container, svgs };
  }

  test('is inline SVG with a viewBox and no fixed pixel width or height', () => {
    const { svgs } = renderDiagram();
    for (const svg of svgs) {
      expect(svg.getAttribute('viewBox') || '').toMatch(
        /^\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+\s*$/,
      );
      for (const attr of ['width', 'height']) {
        const v = svg.getAttribute(attr);
        if (v !== null) expect(v).not.toMatch(/^\s*[\d.]+\s*(px)?\s*$/);
      }
      expect(svg.getAttribute('style') || '').not.toMatch(/(^|;)\s*width\s*:\s*[\d.]+px/);
    }
  });

  test('has role img with a title and desc for screen readers', () => {
    const { svgs } = renderDiagram();
    for (const svg of svgs) {
      expect(svg.getAttribute('role')).toBe('img');
      const title = svg.querySelector('title');
      const desc = svg.querySelector('desc');
      expect(title).not.toBeNull();
      expect(desc).not.toBeNull();
      expect(norm(title!.textContent).length).toBeGreaterThan(0);
      expect(norm(desc!.textContent).length).toBeGreaterThan(0);
    }
  });

  test('every layer and box is labeled exactly with real <text> elements', () => {
    const { svgs } = renderDiagram();
    for (const svg of svgs) {
      const texts = textsOf(svg);
      for (const label of LABELS) {
        if (!texts.includes(label)) {
          throw new Error(`Diagram has no <text> labeled "${label}". Labels: ${texts.join(' | ')}`);
        }
      }
    }
  });

  test('labels use the monospace font', () => {
    const { container, svgs } = renderDiagram();
    const rules = cssRules(allCss());
    for (const svg of svgs) {
      for (const t of Array.from(svg.querySelectorAll('text'))) {
        if (!isMono(t, container, rules)) {
          throw new Error(`Diagram label "${norm(t.textContent)}" is not set in the monospace font`);
        }
      }
    }
  });
});

describe('the same diagram is used on Systems and Home', () => {
  function diagramIn(main: HTMLElement): Element | undefined {
    return diagramSvgs(main).find((svg) => {
      const texts = textsOf(svg);
      return LABELS.every((l) => texts.includes(l));
    });
  }

  test('Systems page shows the architecture diagram', () => {
    renderAt('/systems');
    expect(diagramIn(screen.getByRole('main'))).toBeTruthy();
  });

  test('Home systems band shows the architecture diagram', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    const svg = diagramIn(main);
    expect(svg).toBeTruthy();
    const h2 = Array.from(main.querySelectorAll('h2')).find(
      (h) => norm(h.textContent) === 'Systems built to be observed and sustained',
    );
    expect(h2).toBeTruthy();
    let band: Element | null = h2!.parentElement;
    while (band && band !== main && !band.contains(svg!)) band = band.parentElement;
    expect(band).not.toBeNull();
    expect(band!.contains(svg!)).toBe(true);
  });
});
