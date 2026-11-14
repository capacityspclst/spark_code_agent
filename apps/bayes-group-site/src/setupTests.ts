import '@testing-library/jest-dom';
import { within } from '@testing-library/react';
// expose within globally for tests that omit import
declare global {
  var within: typeof within;
}
globalThis.within = within;

// polyfill fetch for test environment
import 'whatwg-fetch';
