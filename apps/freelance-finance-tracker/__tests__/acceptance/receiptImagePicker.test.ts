import fs from 'fs';
import path from 'path';

const sourcePath = path.resolve(
  __dirname,
  '../../src/components/ui/ReceiptImagePicker.tsx',
);
const source = fs.readFileSync(sourcePath, 'utf8');

describe('ReceiptImagePicker – Scan receipt button visibility', () => {
  test('button is rendered only when OCR scanning is supported', () => {
    // The component must reference `isSupported` from expo-text-extractor.
    expect(source).toMatch(/isSupported/);
    // The button that triggers scanning must have the testID “scan-receipt-button”.
    expect(source).toMatch(/testID\s*=\s*['"]scan-receipt-button['"]/);
    // The rendering should be guarded by a conditional using `isSupported && …`.
    // A simple pattern check is enough for the source‑level contract.
    const conditionalPattern = /{?\s*isSupported\s*&&\s*<[^>]*testID\s*=\s*['"]scan-receipt-button['"][^>]*>/;
    expect(source).toMatch(conditionalPattern);
  });
});
