/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COURSES } from '../../src/content/courses';

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

function ancestorWhere(start: Element, scope: Element, pred: (el: Element) => boolean): Element {
  let el: Element | null = start;
  while (el) {
    if (pred(el)) return el;
    if (el === scope) break;
    el = el.parentElement;
  }
  throw new Error('No ancestor matched');
}

afterEach(() => cleanup());

function visibleIds(main: HTMLElement): string[] {
  return COURSES.filter((c) => within(main).queryAllByText(c.title).length > 0).map((c) => c.id);
}

describe('training page rendering', () => {
  test('h1 Training', () => {
    renderAt('/training');
    const main = screen.getByRole('main');
    expect(norm(within(main).getByRole('heading', { level: 1 }).textContent)).toBe('Training');
  });

  test('each course card shows title, audience, format, duration and a You will learn list of three', () => {
    renderAt('/training');
    const main = screen.getByRole('main');
    const cards = new Set<Element>();
    for (const c of COURSES) {
      const titleEl = within(main).getAllByText(c.title)[0];
      const parts = [c.title, c.audience, c.format, c.duration, ...c.learn].map((p) => norm(p));
      const card = ancestorWhere(titleEl, main, (el) =>
        parts.every((p) => norm(el.textContent).includes(p)),
      );
      expect(card).not.toBe(main);
      expect(norm(card.textContent)).toContain('You will learn');
      const lists = Array.from(card.querySelectorAll('ul, ol'));
      const hasLearnList = lists.some((list) => {
        const lis = Array.from(list.querySelectorAll('li'));
        return (
          lis.length === 3 &&
          c.learn.every((l) => lis.some((li) => norm(li.textContent).includes(norm(l))))
        );
      });
      expect(hasLearnList).toBe(true);
      cards.add(card);
    }
    expect(cards.size).toBe(COURSES.length);
    expect(cards.size).toBeGreaterThanOrEqual(6);
  });

  test('four filter buttons above the catalog, All selected initially', () => {
    renderAt('/training');
    const main = screen.getByRole('main');
    const firstTitle = within(main).getAllByText(COURSES[0].title)[0];
    for (const name of ['All', 'Executives', 'Managers', 'Technical teams']) {
      const btn = within(main).getByRole('button', { name });
      expect(
        btn.compareDocumentPosition(firstTitle) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(btn.getAttribute('aria-pressed')).toBe(name === 'All' ? 'true' : 'false');
    }
    expect(visibleIds(main)).toEqual(COURSES.map((c) => c.id));
  });

  test('choosing a filter shows only that audience and marks the button pressed', async () => {
    const user = userEvent.setup();
    renderAt('/training');
    const main = screen.getByRole('main');
    const names = ['All', 'Executives', 'Managers', 'Technical teams'];
    for (const aud of ['Executives', 'Managers', 'Technical teams']) {
      await user.click(within(main).getByRole('button', { name: aud }));
      const expected = COURSES.filter((c) => c.audience === aud).map((c) => c.id);
      expect(expected.length).toBeGreaterThan(0);
      expect(visibleIds(main)).toEqual(expected);
      for (const n of names) {
        const pressed = within(main).getByRole('button', { name: n }).getAttribute('aria-pressed');
        if (n === aud) expect(pressed).toBe('true');
        else expect(pressed).not.toBe('true');
      }
    }
    await user.click(within(main).getByRole('button', { name: 'All' }));
    expect(visibleIds(main)).toEqual(COURSES.map((c) => c.id));
    expect(within(main).getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    for (const n of ['Executives', 'Managers', 'Technical teams']) {
      expect(within(main).getByRole('button', { name: n }).getAttribute('aria-pressed')).not.toBe(
        'true',
      );
    }
  });
});
