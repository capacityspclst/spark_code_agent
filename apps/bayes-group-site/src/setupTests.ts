import '@testing-library/jest-dom';
// polyfill fetch for jsdom
if (typeof window !== 'undefined' && !(window as any).fetch) {
  (window as any).fetch = () => Promise.resolve(new Response());
}
// polyfill scrollTo for jsdom
if (typeof window !== 'undefined' && !(window as any).scrollTo) {
  (window as any).scrollTo = () => {};
}
