import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addMileageEntry, getAllMileageEntries } from '../../src/lib/mileageStore';
import { calculateMileageDeduction } from '../../src/lib/mileage';
import { validateMileageMiles } from '../../src/lib/validation';

describe('Mileage entry validation accepts decimal miles and stores them exactly', () => {
  it('validateMileageMiles accepts a number with a single decimal place', () => {
    expect(validateMileageMiles(12.5)).toBeNull();
  });

  it('validateMileageMiles accepts a string representation of a single‑decimal mile value', () => {
    expect(validateMileageMiles('12.5')).toBeNull();
  });

  it('validateMileageMiles rejects a number with more than one decimal place', () => {
    const result = validateMileageMiles(12.55);
    expect(result).toBeTruthy();
  });

  it('validateMileageMiles rejects non‑numeric input', () => {
    const result = validateMileageMiles('abc' as any);
    expect(result).toBeTruthy();
  });

  it('stores a mileage entry with decimal miles and calculates deduction correctly', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const entry = {
      id: 'mDecimal',
      date: '2023-05-01',
      miles: 12.5,
      purpose: 'Client visit',
    };

    await addMileageEntry(store, entry);
    const entries = await getAllMileageEntries(store);
    expect(entries).toHaveLength(1);
    expect(entries[0].miles).toBeCloseTo(12.5, 5);

    const rate = 0.585; // IRS mileage rate
    const deduction = calculateMileageDeduction(entries[0].miles, rate);
    // 12.5 miles * 0.585 = 7.3125
    expect(deduction).toBeCloseTo(7.3125, 4);
  });
});
