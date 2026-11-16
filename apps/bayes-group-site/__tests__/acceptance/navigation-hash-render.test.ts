/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
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

function scrolledToTop(fn: any): boolean {
  return fn.mock.calls.some(
    (a: any[]) =>
      (a[0] === 0 && (a[1] === 0 || a[1] === undefined)) ||
      (a[0] !== null && typeof a[0] === 'object' && a[0].top === 0),
  );
}

test('a link with a hash scrolls to the section and not to the top', async () => {
  const user = userEvent.setup();
  render(React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(AppRoutes)));
  const main = screen.getByRole('main');
  const learn = Array.from(main.querySelectorAll('a')).find(
    (a) => a.getAttribute('href') === '/services#training',
  );
  expect(learn).toBeTruthy();
  await user.click(learn!);
  await waitFor(() => expect(intoView.map((e) => e.id)).toContain('training'));
  expect(scrolledToTop((window as any).scrollTo)).toBe(false);
});
