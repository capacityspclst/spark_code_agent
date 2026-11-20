/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { PHOTOS } from '../../src/content/images';

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

afterEach(() => cleanup());

const PAGES: Array<[string, string[]]> = [
  ['/', ['hero-boardroom', 'smb-owner', 'enterprise-atrium', 'strategy-session', 'team-workshop', 'custom-development', 'about-office']],
  ['/services', ['strategy-session', 'team-workshop', 'custom-development']],
  ['/training', ['team-workshop']],
  ['/engagements', ['enterprise-atrium']],
  ['/about', ['about-office']],
  ['/contact', ['contact-meeting']],
];

function photoImgs(): Array<[string, HTMLImageElement]> {
  const main = screen.getByRole('main');
  const out: Array<[string, HTMLImageElement]> = [];
  for (const img of Array.from(main.querySelectorAll('img'))) {
    const m = (img.getAttribute('src') || '').match(/^\/images\/([\w-]+?)\.jpg$/);
    if (m) out.push([m[1], img as HTMLImageElement]);
  }
  return out;
}

describe.each(PAGES)('photos on %s', (route, expected) => {
  test('shows the expected photos', () => {
    renderAt(route);
    const names = photoImgs().map(([n]) => n);
    for (const n of expected) {
      if (!names.includes(n)) throw new Error(`${route} has no <img src="/images/${n}.jpg">; found ${names.join(', ')}`);
    }
  });

  test('every photo has srcset, sizes, width, height, decoding and alt', () => {
    renderAt(route);
    const imgs = photoImgs();
    expect(imgs.length).toBeGreaterThan(0);
    for (const [name, img] of imgs) {
      const srcset = img.getAttribute('srcset') || '';
      expect(srcset).toContain(`/images/${name}-768.jpg 768w`);
      expect(srcset).toContain(`/images/${name}.jpg 1344w`);
      expect((img.getAttribute('sizes') || '').trim().length).toBeGreaterThan(0);
      expect(img.getAttribute('width')).toBe('1344');
      expect(img.getAttribute('height')).toBe('768');
      expect(img.getAttribute('decoding')).toBe('async');
      const alt = img.getAttribute('alt') || '';
      expect(alt.trim().length).toBeGreaterThanOrEqual(10);
      expect(alt).toBe((PHOTOS as any)[name].alt);
    }
  });

  test('photos are lazy-loaded except the home hero', () => {
    renderAt(route);
    for (const [name, img] of photoImgs()) {
      if (route === '/' && name === 'hero-boardroom') {
        expect(img.getAttribute('loading')).not.toBe('lazy');
      } else {
        expect(img.getAttribute('loading')).toBe('lazy');
      }
    }
  });
});
