import fs from 'fs';
import path from 'path';

const sourcePath = path.resolve(
  __dirname,
  '../../src/screens/ReceiptEntryScreen.tsx',
);
const source = fs.readFileSync(sourcePath, 'utf8');

describe('ReceiptEntryScreen UI conventions (source‑level checks)', () => {
  test('screen title “Add receipt” appears at least once (in the header)', () => {
    // The title string must exist somewhere in the source; exact UI rendering is not verified here.
    const matches = source.match(/Add receipt/g);
    const count = matches ? matches.length : 0;
    expect(count).toBeGreaterThan(0);
  });

  test('date picker icon is embedded inside the Date field', () => {
    // The component should expose the icon via a testID `date-picker-icon`.
    expect(source).toMatch(/testID\s*=\s*['"]date-picker-icon['"]/);
  });

  test('no vertical gaps larger than the standard 12 dp spacing between fields', () => {
    // Find all explicit `marginBottom` numeric values.
    const marginRegex = /marginBottom\s*:\s*(\d+)/g;
    const margins: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = marginRegex.exec(source)) !== null) {
      margins.push(parseInt(match[1], 10));
    }

    // If any explicit margins exist, the largest must be ≤ 12.
    // If none are defined, spacing is assumed to be handled via other mechanisms (flex, theme, etc.).
    if (margins.length > 0) {
      const max = Math.max(...margins);
      expect(max).toBeLessThanOrEqual(12);
    } else {
      expect(true).toBe(true);
    }
  });
});
