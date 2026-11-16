/**
 * @jest-environment jsdom
 */
const nodeUtil = require('util');
const g: any = globalThis as any;
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = nodeUtil.TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = nodeUtil.TextDecoder;
g.scrollTo = jest.fn();
(window as any).scrollTo = jest.fn();
(Element.prototype as any).scrollIntoView = jest.fn();

const mockHydrateRoot = jest.fn(() => ({ render: jest.fn(), unmount: jest.fn() }));
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({ render: mockRender, unmount: jest.fn() }));

jest.mock('react-dom/client', () => {
  const api = { hydrateRoot: mockHydrateRoot, createRoot: mockCreateRoot };
  return { __esModule: true, ...api, default: api };
});
jest.mock('../../src/styles/global.css', () => ({}), { virtual: true });
jest.mock('../../src/styles/theme.css', () => ({}), { virtual: true });

const { render: serverRender } = require('../../src/entry-server');

beforeEach(() => {
  mockHydrateRoot.mockClear();
  mockCreateRoot.mockClear();
  mockRender.mockClear();
  document.body.innerHTML = '';
});

describe('browser entry (src/main.tsx)', () => {
  test('hydrates prerendered markup with hydrateRoot', () => {
    const root = document.createElement('div');
    root.id = 'root';
    root.innerHTML = serverRender('/');
    document.body.appendChild(root);
    jest.isolateModules(() => {
      require('../../src/main');
    });
    expect(mockHydrateRoot).toHaveBeenCalledTimes(1);
    expect((mockHydrateRoot.mock.calls[0] as any[])[0]).toBe(root);
    expect(mockCreateRoot).not.toHaveBeenCalled();
  });

  test('mounts into #root (hydrateRoot or createRoot) when #root is empty', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    jest.isolateModules(() => {
      require('../../src/main');
    });
    const total = mockHydrateRoot.mock.calls.length + mockCreateRoot.mock.calls.length;
    expect(total).toBe(1);
    const call = (mockHydrateRoot.mock.calls[0] || mockCreateRoot.mock.calls[0]) as any[];
    expect(call[0]).toBe(root);
  });
});
