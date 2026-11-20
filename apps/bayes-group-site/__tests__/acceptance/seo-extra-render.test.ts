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
const { buildPageHtml } = require('../../src/entry-server');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

afterEach(() => cleanup());

const normD = (d: string | null) => (d || '').replace(/[\s,]+/g, ' ').trim();

test('404 page has a canonical link to the site URL plus its path', () => {
  const doc = new DOMParser().parseFromString(buildPageHtml(TEMPLATE, '/404'), 'text/html');
  const links = Array.from(doc.querySelectorAll('link')).filter((l) =>
    (l.getAttribute('rel') || '').split(/\s+/).includes('canonical'),
  );
  expect(links).toHaveLength(1);
  expect(links[0].getAttribute('href')).toBe('https://thebayesgroup.com/404');
});

test('favicon.svg contains the bell-curve path from the wordmark, stroked teal', () => {
  render(React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(AppRoutes)));
  const banner = screen.getByRole('banner');
  const home = within(banner)
    .getAllByRole('link', { name: /The Bayes Group/, hidden: true })
    .find((a) => a.getAttribute('href') === '/');
  expect(home).toBeTruthy();
  const wordmarkDs = Array.from(home!.querySelectorAll('svg path'))
    .map((p) => normD(p.getAttribute('d')))
    .filter(Boolean);
  expect(wordmarkDs.length).toBeGreaterThan(0);

  const svgText = fs.readFileSync(path.join(ROOT, 'public', 'favicon.svg'), 'utf8');
  const fav = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const paths = Array.from(fav.getElementsByTagName('path'));
  const match = paths.find((p) => wordmarkDs.includes(normD(p.getAttribute('d'))));
  if (!match) {
    throw new Error(`favicon.svg has no path matching the wordmark's bell curve. Wordmark paths: ${wordmarkDs.join(' | ')}`);
  }
  let stroke = '';
  let el: Element | null = match;
  while (el && !stroke) {
    stroke = el.getAttribute('stroke') || '';
    const style = el.getAttribute('style') || '';
    const m = style.match(/stroke\s*:\s*([^;]+)/);
    if (!stroke && m) stroke = m[1].trim();
    el = el.parentElement;
  }
  expect(stroke.toLowerCase()).toBe('#1f8a8a');
});
