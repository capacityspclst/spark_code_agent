import { parseReceipt } from '../src/lib/ocr';

const fixtures = [
  // Grocery
  {
    text: `Whole Foods Market\n04/15/2023\nTOTAL $45.67`,
    expected: { merchant: 'Whole Foods Market', date: '2023-04-15', total: 45.67 },
  },
  // Fuel
  {
    text: `Shell Gas Station\n2023-06-01\nBALANCE $30.00`,
    expected: { merchant: 'Shell Gas Station', date: '2023-06-01', total: 30.0 },
  },
  // Restaurant with tip
  {
    text: `La Petite Table\n06/20/2023\nTOTAL $85.20\nTIP $15.00`,
    expected: { merchant: 'La Petite Table', date: '2023-06-20', total: 85.20 },
  },
  // Hardware store
  {
    text: `Home Depot\n07/05/2023\nAMOUNT DUE $120.55`,
    expected: { merchant: 'Home Depot', date: '2023-07-05', total: 120.55 },
  },
  // Online order
  {
    text: `Amazon.com\n2023/08/10\nTOTAL $250.99`,
    expected: { merchant: 'Amazon.com', date: '2023-08-10', total: 250.99 },
  },
  // Faded/partial text (missing total)
  {
    text: `Quick Stop\n08/12/2023\nTHANK YOU`,
    expected: { merchant: 'Quick Stop', date: '2023-08-12' },
  },
  // Multiple dates (pick first)
  {
    text: `Store XYZ\n01/01/2023\n02/02/2023\nTOTAL $10.00`,
    expected: { merchant: 'Store XYZ', date: '2023-01-01', total: 10.0 },
  },
  // No total line
  {
    text: `Coffee Shop\n09/09/2023\nSUBTOTAL $5.00`,
    expected: { merchant: 'Coffee Shop', date: '2023-09-09' },
  },
];

describe('OCR parseReceipt', () => {
  fixtures.forEach((f, idx) => {
    test(`fixture ${idx + 1}`, () => {
      const result = parseReceipt(f.text);
      expect(result.merchant).toBe(f.expected.merchant);
      if (f.expected.date) expect(result.date).toBe(f.expected.date);
      else expect(result.date).toBeUndefined();
      if (f.expected.total !== undefined) expect(result.total).toBeCloseTo(f.expected.total!);
      else expect(result.total).toBeUndefined();
    });
  });
});
