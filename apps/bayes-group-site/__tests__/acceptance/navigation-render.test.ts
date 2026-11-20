/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;

const { MemoryRouter } = require('react-router-dom');
const { AppRoutes } = require('../../src/App');

let intoView: Element[] = [];

beforeEach(() => {
  intoView = [];
  g.scrollTo = jest.fn();
  (window as any).scrollTo = g.scrollTo;
  (Element.prototype as any).scrollIntoView = function (this: Element) {
    intoView.push(this);
  };
});

afterEach(() => cleanup());

function renderAt(path: string) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(AppRoutes)),
  );
}

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

function scrolledToTop(fn: any): boolean {
  return fn.mock.calls.some(
    (a: any[]) =>
      (a[0] === 0 && (a[1] === 0 || a[1] === undefined)) ||
      (a[0] !== null && typeof a[0] === 'object' && a[0].top === 0),
  );
}

describe('route change scroll and focus', () => {
  test('first page load does not scroll or move focus', () => {
    renderAt('/');
    const main = screen.getByRole('main');
    expect((window as any).scrollTo).not.toHaveBeenCalled();
    expect(intoView).toHaveLength(0);
    expect(document.activeElement).not.toBe(main);
  });

  test('first page load with a hash does not scroll', () => {
    renderAt('/services#training');
    expect((window as any).scrollTo).not.toHaveBeenCalled();
    expect(intoView).toHaveLength(0);
  });

  test('navigating to another page scrolls to the top and focuses main', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const main = screen.getByRole('main');
    const explore = Array.from(main.querySelectorAll('a')).find(
      (a) => norm(a.textContent) === 'Explore services',
    );
    expect(explore).toBeTruthy();
    await user.click(explore!);
    await waitFor(() =>
      expect(norm(within(screen.getByRole('main')).getByRole('heading', { level: 1 }).textContent)).toBe('Services'),
    );
    await waitFor(() => expect(scrolledToTop((window as any).scrollTo)).toBe(true));
    await waitFor(() => {
      const m = screen.getByRole('main');
      expect(m.id).toBe('main');
      expect(document.activeElement).toBe(m);
    });
  });

  test('navigating with a footer link also scrolls and focuses main', async () => {
    const user = userEvent.setup();
    renderAt('/services');
    const footer = screen.getByRole('contentinfo');
    const about = within(footer)
      .getAllByRole('link', { name: 'About', hidden: true })
      .find((a) => a.getAttribute('href') === '/about');
    expect(about).toBeTruthy();
    await user.click(about!);
    await waitFor(() =>
      expect(norm(within(screen.getByRole('main')).getByRole('heading', { level: 1 }).textContent)).toBe('About'),
    );
    await waitFor(() => expect(scrolledToTop((window as any).scrollTo)).toBe(true));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('main')));
  });

  test('a link with a hash scrolls to that section', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const main = screen.getByRole('main');
    const learn = Array.from(main.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === '/services#training',
    );
    expect(learn).toBeTruthy();
    await user.click(learn!);
    await waitFor(() => expect(document.getElementById('training')).not.toBeNull());
    await waitFor(() => {
      const ids = intoView.map((e) => e.id);
      if (!ids.includes('training')) {
        throw new Error(`Expected scrollIntoView on #training, got calls on: ${JSON.stringify(ids)}`);
      }
    });
  });
});
