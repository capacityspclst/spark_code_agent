import { htmlEscape } from '../src/lib/exportPdf';

describe('PDF HTML injection prevention', () => {
  it('escapes dangerous characters in user text', () => {
    const dangerous = "<img src='x' onerror=alert(1)>";
    const escaped = htmlEscape(dangerous);
    expect(escaped).toBe('&lt;img src=&#39;x&#39; onerror=alert(1)&gt;');
  });
});
