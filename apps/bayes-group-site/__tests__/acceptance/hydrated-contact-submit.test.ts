/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { act, within, waitFor } from '@testing-library/react';
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
const { render: serverRender } = require('../../src/entry-server');
const { SUCCESS_MESSAGE } = require('../../src/lib/contactForm');

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

let mounted: { root: any; container: HTMLElement } | null = null;

afterEach(async () => {
  if (mounted) {
    const m = mounted;
    mounted = null;
    await act(async () => {
      m.root.unmount();
    });
    m.container.remove();
  }
});

test('contact form submits successfully after hydration', async () => {
  const user = userEvent.setup();
  const container = document.createElement('div');
  container.id = 'root';
  container.innerHTML = serverRender('/contact');
  document.body.appendChild(container);
  let root: any;
  await act(async () => {
    root = hydrateRoot(
      container,
      React.createElement(MemoryRouter, { initialEntries: ['/contact'] }, React.createElement(AppRoutes)),
      { onRecoverableError: () => {} },
    );
  });
  mounted = { root, container };
  const main = container.querySelector('main') as HTMLElement;
  const form = main.querySelector('form') as HTMLElement;
  const f = within(form);
  await user.type(f.getByLabelText(/^Name\b/), 'Test User');
  await user.type(f.getByLabelText(/^Email\b/), 'test.user@example.com');
  await user.type(f.getByLabelText(/^Message\b/), 'We would like a workshop for our analytics team.');
  await user.click(f.getByRole('button', { name: 'Send message' }));
  await waitFor(() => expect(norm(main.textContent)).toContain(SUCCESS_MESSAGE));
  expect(norm(main.textContent)).not.toContain('Please enter your name.');
});
