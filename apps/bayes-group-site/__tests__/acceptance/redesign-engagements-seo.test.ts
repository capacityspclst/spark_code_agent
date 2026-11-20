/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';

const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;
g.scrollTo = jest.fn();
(window as any).scrollTo = jest.fn();
(Element.prototype as any).scrollIntoView = jest.fn();

const { buildPageHtml } = require('../../src/entry-server');
const { getPageMeta } = require('../../src/seo');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

function metas(doc: Document, key: string): Element[] {
  return Array.from(doc.querySelectorAll('meta')).filter(
    (m) => m.getAttribute('property') === key || m.getAttribute('name') === key,
  );
}

function oneMeta(doc: Document, key: string): string {
  const found = metas(doc, key);
  if (found.length !== 1) {
    throw new Error(`buildPageHtml(template, '/engagements') must have exactly one meta ${key}, found ${found.length}`);
  }
  return found[0].getAttribute('content') || '';
}

describe('engagements page head', () => {
  let doc: Document;
  beforeAll(() => {
    doc = parse(buildPageHtml(TEMPLATE, '/engagements'));
  });

  test('title', () => {
    const titles = doc.querySelectorAll('title');
    expect(titles).toHaveLength(1);
    expect(norm(titles[0].textContent)).toBe('Engagements | The Bayes Group');
  });

  test('has its own meta description', () => {
    const meta: any = getPageMeta('/engagements');
    expect(meta.path).toBe('/engagements');
    const d = oneMeta(doc, 'description');
    expect(d.trim().length).toBeGreaterThan(0);
    expect(d).toBe(meta.description);
    for (const other of ['/', '/services', '/training', '/about', '/contact', '/404']) {
      const od = oneMeta(parse(buildPageHtml(TEMPLATE, other)), 'description');
      expect(od).not.toBe(d);
    }
  });

  test('has Open Graph tags', () => {
    const meta: any = getPageMeta('/engagements');
    expect(meta.path).toBe('/engagements');
    expect(oneMeta(doc, 'og:title')).toBe('Engagements | The Bayes Group');
    const ogd = oneMeta(doc, 'og:description');
    expect(ogd.trim().length).toBeGreaterThan(0);
    expect(ogd).toBe(meta.description);
    expect(oneMeta(doc, 'og:type')).toBe('website');
    expect(oneMeta(doc, 'og:site_name')).toBe('The Bayes Group');
  });

  test('has the canonical link', () => {
    const links = Array.from(doc.querySelectorAll('link')).filter((l) =>
      (l.getAttribute('rel') || '').split(/\s+/).includes('canonical'),
    );
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('https://thebayesgroup.com/engagements');
  });
});
