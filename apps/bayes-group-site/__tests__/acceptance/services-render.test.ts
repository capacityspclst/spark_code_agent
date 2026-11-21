/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import { SERVICE_SECTIONS } from '../../src/content/services';

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
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function sentenceCount(s: string): number {
  const m = s.trim().match(/[.!?](?=\s+[A-Z0-9"']|\s*$)/g);
  return m ? m.length : 0;
}

function deepestMatching(scope: Element, re: RegExp): Element | null {
  const all = [scope, ...Array.from(scope.querySelectorAll('*'))].filter((e) => re.test(norm(e.textContent)));
  const leaf = all.filter((e) => !Array.from(e.children).some((c) => re.test(norm(c.textContent))));
  return leaf[0] || null;
}

const follows = (a: Node, b: Node) =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

afterEach(() => cleanup());

const EXPECTED: Record<string, string[]> = {
  enablement: [
    'AI readiness assessment',
    'Use-case discovery and prioritization',
    'AI strategy and roadmap',
    'AI governance and responsible-AI policy',
  ],
  training: [
    'Executive AI briefings',
    'Hands-on team workshops',
    'Deep-learning bootcamps for technical teams',
    'Custom curricula',
  ],
  'custom-development': [
    'LLM and retrieval-augmented (RAG) applications',
    'AI agents and workflow automation',
    'Predictive models and ML pipelines',
    'Deep-learning solutions',
    'Integration with existing systems',
  ],
};

describe('services page rendering', () => {
  test('h1 Services', () => {
    renderAt('/services');
    const main = screen.getByRole('main');
    expect(norm(within(main).getByRole('heading', { level: 1 }).textContent)).toBe('Services');
  });

  test('sections rendered with ids in order', () => {
    renderAt('/services');
    const main = screen.getByRole('main');
    const ids = Array.from(
      main.querySelectorAll('#enablement, #training, #custom-development'),
    ).map((e) => e.id);
    expect(ids).toEqual(['enablement', 'training', 'custom-development']);
  });

  test('every item description is one sentence', () => {
    for (const s of SERVICE_SECTIONS) {
      for (const item of s.items) {
        expect(sentenceCount(item.description)).toBe(1);
      }
    }
  });

  test.each(Object.keys(EXPECTED))('section %s lists its items with descriptions', (id) => {
    renderAt('/services');
    const main = screen.getByRole('main');
    const section = main.querySelector(`#${id}`);
    expect(section).not.toBeNull();
    const text = norm(section!.textContent);
    const lower = text.toLowerCase();
    for (const name of EXPECTED[id]) expect(lower).toContain(name.toLowerCase());
    const data = SERVICE_SECTIONS.find((s) => s.id === id)!;
    for (const item of data.items) expect(text).toContain(norm(item.description));
  });

  test.each(Object.keys(EXPECTED))('section %s shows a Typical engagement line in its header', (id) => {
    renderAt('/services');
    const main = screen.getByRole('main');
    const section = main.querySelector(`#${id}`)!;
    expect(section).not.toBeNull();
    const data = SERVICE_SECTIONS.find((s) => s.id === id)!;
    const text = norm(section.textContent);
    const re = new RegExp(`Typical engagement:?\\s*${esc(norm(data.typicalEngagement))}`);
    expect(text).toMatch(re);
    const line = deepestMatching(section, re);
    expect(line).not.toBeNull();
    const h2 = section.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(follows(h2!, line!)).toBe(true);
    const firstDescRe = new RegExp(esc(norm(data.items[0].description)));
    const firstDesc = deepestMatching(section, firstDescRe);
    expect(firstDesc).not.toBeNull();
    expect(follows(line!, firstDesc!)).toBe(true);
  });
});
