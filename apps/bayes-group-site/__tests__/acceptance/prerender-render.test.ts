/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;
g.scrollTo = jest.fn();
(window as any).scrollTo = jest.fn();
(Element.prototype as any).scrollIntoView = jest.fn();

const { MemoryRouter } = require('react-router-dom');
const { hydrateRoot } = require('react-dom/client');
const { AppRoutes } = require('../../src/App');
const { render: serverRender, buildPageHtml } = require('../../src/entry-server');
const { getPageMeta } = require('../../src/seo');
const { FOOTER_LINE, COPYRIGHT } = require('../../src/content/site');
const { COURSES } = require('../../src/content/courses');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

const PAGES: Array<[string, string, string, string | null]> = [
  ['/', 'The Bayes Group | Evidence-driven AI', 'Evidence-driven AI, built for your business.', 'https://thebayesgroup.com/'],
  ['/services', 'Services | The Bayes Group', 'Services', 'https://thebayesgroup.com/services'],
  ['/systems', 'Systems engineering | The Bayes Group', 'Systems engineering', 'https://thebayesgroup.com/systems'],
  ['/training', 'Training | The Bayes Group', 'Training', 'https://thebayesgroup.com/training'],
  ['/engagements', 'Engagements | The Bayes Group', 'Engagements', 'https://thebayesgroup.com/engagements'],
  ['/about', 'About | The Bayes Group', 'About', 'https://thebayesgroup.com/about'],
  ['/contact', 'Contact | The Bayes Group', 'Book a consultation', 'https://thebayesgroup.com/contact'],
  ['/404', 'Page not found | The Bayes Group', 'Page not found', null],
];

const NAV: Array<[string, string]> = [
  ['Services', '/services'],
  ['Systems', '/systems'],
  ['Training', '/training'],
  ['Engagements', '/engagements'],
  ['About', '/about'],
  ['Contact', '/contact'],
];

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

function metas(doc: Document, key: string): Element[] {
  return Array.from(doc.querySelectorAll('meta')).filter(
    (m) => m.getAttribute('property') === key || m.getAttribute('name') === key,
  );
}

function oneMeta(doc: Document, key: string, url: string): string {
  const found = metas(doc, key);
  if (found.length !== 1) {
    throw new Error(`buildPageHtml(template, '${url}') must have exactly one meta ${key}, found ${found.length}`);
  }
  return found[0].getAttribute('content') || '';
}

describe('buildPageHtml produces complete pages', () => {
  describe.each(PAGES)('page %s', (url, title, h1Text, canonical) => {
    let html = '';
    let doc: Document;
    beforeAll(() => {
      html = buildPageHtml(TEMPLATE, url);
      doc = parse(html);
    });

    test('has exactly one title with the page title', () => {
      const titles = doc.querySelectorAll('title');
      expect(titles).toHaveLength(1);
      expect(norm(titles[0].textContent)).toBe(title);
    });

    test('has its own meta description from src/seo.ts', () => {
      const meta: any = getPageMeta(url);
      const d = oneMeta(doc, 'description', url);
      expect(d).toBe(meta.description);
      expect(d.trim().length).toBeGreaterThan(0);
    });

    test('has Open Graph tags', () => {
      const meta: any = getPageMeta(url);
      expect(oneMeta(doc, 'og:title', url)).toBe(title);
      expect(oneMeta(doc, 'og:description', url)).toBe(meta.description);
      expect(oneMeta(doc, 'og:type', url)).toBe('website');
      expect(oneMeta(doc, 'og:site_name', url)).toBe('The Bayes Group');
    });

    if (canonical) {
      test('has the canonical link', () => {
        const links = Array.from(doc.querySelectorAll('link')).filter((l) =>
          (l.getAttribute('rel') || '').split(/\s+/).includes('canonical'),
        );
        expect(links).toHaveLength(1);
        expect(links[0].getAttribute('href')).toBe(canonical);
      });
    }

    test('links the favicon', () => {
      const icons = Array.from(doc.querySelectorAll('link')).filter((l) =>
        (l.getAttribute('rel') || '').toLowerCase().split(/\s+/).includes('icon'),
      );
      expect(icons.length).toBeGreaterThan(0);
      for (const i of icons) expect(i.getAttribute('href')).toBe('/favicon.svg');
    });

    test('#root contains the full page: header, one h1, main, footer', () => {
      const root = doc.getElementById('root');
      if (!root) throw new Error(`No #root in buildPageHtml(template, '${url}'):\n${html.slice(0, 2000)}`);
      const h1s = root.querySelectorAll('h1');
      expect(h1s).toHaveLength(1);
      expect(norm(h1s[0].textContent)).toBe(h1Text);
      expect(root.querySelector('header')).not.toBeNull();
      expect(root.querySelectorAll('main')).toHaveLength(1);
      const footer = root.querySelector('footer');
      expect(footer).not.toBeNull();
      const ft = norm(footer!.textContent);
      expect(ft).toContain(FOOTER_LINE);
      expect(ft).toContain(COPYRIGHT);
      const header = root.querySelector('header')!;
      for (const [, to] of NAV) {
        const hrefs = Array.from(header.querySelectorAll('a')).map((a) => a.getAttribute('href'));
        expect(hrefs).toContain(to);
      }
    });

    test('keeps the template module scripts and html lang', () => {
      const templateDoc = parse(TEMPLATE);
      const srcs = (d: Document) =>
        Array.from(d.querySelectorAll('script[type="module"]')).map((s) => s.getAttribute('src'));
      expect(srcs(doc)).toEqual(srcs(templateDoc));
      expect(doc.documentElement.getAttribute('lang')).toBe('en');
    });
  });

  test('descriptions differ between pages', () => {
    const all = PAGES.map(([url]) => oneMeta(parse(buildPageHtml(TEMPLATE, url)), 'description', url));
    expect(new Set(all).size).toBe(all.length);
  });

  test('training page HTML contains every course title', () => {
    const root = parse(buildPageHtml(TEMPLATE, '/training')).getElementById('root')!;
    const text = norm(root.textContent);
    for (const c of COURSES as any[]) expect(text).toContain(norm(c.title));
  });

  test('services page HTML contains the three sections', () => {
    const root = parse(buildPageHtml(TEMPLATE, '/services')).getElementById('root')!;
    const ids = Array.from(root.querySelectorAll('#enablement, #training, #custom-development')).map((e) => e.id);
    expect(ids).toEqual(['enablement', 'training', 'custom-development']);
  });

  test('systems page HTML contains the four sections and the diagram', () => {
    const root = parse(buildPageHtml(TEMPLATE, '/systems')).getElementById('root')!;
    const ids = Array.from(
      root.querySelectorAll('#agentic, #architecture, #observability, #sustainability'),
    ).map((e) => e.id);
    expect(ids).toEqual(['agentic', 'architecture', 'observability', 'sustainability']);
    const texts = Array.from(root.querySelectorAll('svg text')).map((t) => norm(t.textContent));
    expect(texts.join(' | ')).toContain('Observability');
  });

  test('engagements page HTML contains the enterprise tier', () => {
    const root = parse(buildPageHtml(TEMPLATE, '/engagements')).getElementById('root')!;
    expect(root.querySelector('#enterprise')).not.toBeNull();
  });

  test('contact page HTML contains the form', () => {
    const root = parse(buildPageHtml(TEMPLATE, '/contact')).getElementById('root')!;
    const form = root.querySelector('form');
    expect(form).not.toBeNull();
    expect(norm(form!.textContent)).toContain('Send message');
  });

  test('render(url) returns the page markup as a string', () => {
    const out: string = serverRender('/about');
    expect(typeof out).toBe('string');
    expect(out).toMatch(/<main/);
    expect(out).toMatch(/<h1[^>]*>\s*About\s*<\/h1>/);
  });
});

describe('prerendered markup hydrates without mismatches', () => {
  const mounted: Array<{ root: any; container: HTMLElement }> = [];

  afterEach(async () => {
    while (mounted.length) {
      const m = mounted.pop()!;
      await act(async () => {
        m.root.unmount();
      });
      m.container.remove();
    }
  });

  async function hydrateAt(url: string) {
    const markup: string = serverRender(url);
    const container = document.createElement('div');
    container.id = 'root';
    container.innerHTML = markup;
    document.body.appendChild(container);
    const h1Before = container.querySelector('h1');
    const errors: string[] = [];
    const spy = jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      errors.push(args.map((a) => String(a)).join(' '));
    });
    let root: any;
    try {
      await act(async () => {
        root = hydrateRoot(
          container,
          React.createElement(MemoryRouter, { initialEntries: [url] }, React.createElement(AppRoutes)),
          {
            onRecoverableError: (e: any) => errors.push('recoverable: ' + String((e && e.message) || e)),
          },
        );
      });
    } finally {
      spy.mockRestore();
    }
    mounted.push({ root, container });
    const hydrationErrors = errors.filter((e) =>
      /hydrat|did not match|server html|server rendered|recoverable/i.test(e),
    );
    if (hydrationErrors.length > 0) {
      throw new Error(`Hydrating ${url} reported mismatches:\n${hydrationErrors.join('\n')}`);
    }
    expect(h1Before).not.toBeNull();
    expect(container.querySelector('h1')).toBe(h1Before);
    return container;
  }

  test.each(['/', '/services', '/systems', '/engagements', '/about', '/contact', '/training', '/404'])(
    '%s hydrates cleanly',
    async (url) => {
      await hydrateAt(url);
    },
  );

  test('training filter works after hydration', async () => {
    const user = userEvent.setup();
    const container = await hydrateAt('/training');
    const main = container.querySelector('main') as HTMLElement;
    await user.click(within(main).getByRole('button', { name: 'Managers' }));
    expect(within(main).getByRole('button', { name: 'Managers' }).getAttribute('aria-pressed')).toBe('true');
    const visible = (COURSES as any[])
      .filter((c) => within(main).queryAllByText(c.title).length > 0)
      .map((c) => c.id);
    expect(visible).toEqual((COURSES as any[]).filter((c) => c.audience === 'Managers').map((c) => c.id));
  });

  test('Menu button works after hydration', async () => {
    const user = userEvent.setup();
    const container = await hydrateAt('/');
    const header = container.querySelector('header') as HTMLElement;
    const btn = within(header).getByRole('button', { name: /menu/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    await user.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  test('contact form validates after hydration', async () => {
    const user = userEvent.setup();
    const container = await hydrateAt('/contact');
    const main = container.querySelector('main') as HTMLElement;
    await user.click(within(main).getByRole('button', { name: 'Send message' }));
    const text = norm(main.textContent);
    expect(text).toContain('Please enter your name.');
    expect(text).toContain('Please enter a valid email address.');
    expect(text).toContain('Please enter a message.');
  });
});
