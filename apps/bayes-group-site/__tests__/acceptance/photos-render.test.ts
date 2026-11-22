/**
 * @jest-environment jsdom
 */
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

function renderAt(p: string) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [p] }, React.createElement(AppRoutes)),
  );
}

afterEach(() => cleanup());

const EXPECTED: Array<[string, string[]]> = [
  ['/', ['hero-boardroom', 'smb-owner', 'enterprise-atrium', 'strategy-session', 'team-workshop', 'custom-development', 'about-office']],
  ['/services', ['strategy-session', 'team-workshop', 'custom-development']],
  ['/training', ['team-workshop']],
  ['/engagements', ['enterprise-atrium']],
  ['/about', ['about-office']],
  ['/contact', ['contact-meeting']],
];

function photoName(img: Element): string | null {
  const m = (img.getAttribute('src') || '').match(/\/images\/([\w-]+?)(-768)?\.jpg$/);
  return m ? m[1] : null;
}

function srcsetOf(img: Element): string {
  const own = img.getAttribute('srcset') || img.getAttribute('srcSet') || '';
  const pic = img.closest('picture');
  const sources = pic
    ? Array.from(pic.querySelectorAll('source')).map((s) => s.getAttribute('srcset') || '')
    : [];
  return [own, ...sources].join(', ');
}

function photos(main: HTMLElement): HTMLImageElement[] {
  return Array.from(main.querySelectorAll('img')).filter((i) => photoName(i) !== null) as HTMLImageElement[];
}

describe.each(EXPECTED)('photos on %s', (p, names) => {
  test('shows the expected photos', () => {
    renderAt(p);
    const found = photos(screen.getByRole('main')).map(photoName);
    for (const n of names) expect(found).toContain(n);
  });

  test('each photo has srcset 768w and 1344w, sizes, width, height, decoding async and descriptive alt', () => {
    renderAt(p);
    const imgs = photos(screen.getByRole('main'));
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) {
      const name = photoName(img)!;
      const srcset = srcsetOf(img);
      expect(srcset).toContain(`/images/${name}-768.jpg 768w`);
      expect(srcset).toContain(`/images/${name}.jpg 1344w`);
      expect((img.getAttribute('sizes') || '').trim().length).toBeGreaterThan(0);
      expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);
      expect(img.getAttribute('decoding')).toBe('async');
      const alt = (img.getAttribute('alt') || '').trim();
      expect(alt.length).toBeGreaterThanOrEqual(10);
      expect(alt.toLowerCase()).not.toContain(name);
      expect(alt).not.toMatch(/\.jpg/i);
    }
  });

  test('photos load lazily except the home hero', () => {
    renderAt(p);
    for (const img of photos(screen.getByRole('main'))) {
      const name = photoName(img);
      if (p === '/' && name === 'hero-boardroom') {
        expect(img.getAttribute('loading')).not.toBe('lazy');
      } else {
        expect(img.getAttribute('loading')).toBe('lazy');
      }
    }
  });
});
