import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { validateMileageMiles } from '../../src/lib/validation';
import { addMileageEntry, getAllMileageEntries } from '../../src/lib/mileageStore';
import { calculateMileageDeduction } from '../../src/lib/mileage';

describe('M7: mileage accepts decimal miles', () => {
  it('validates decimal mileage values correctly', () => {
    // Valid cases (number and numeric string)
    expect(validateMileageMiles(12.5)).toBeNull();
    expect(validateMileageMiles('12.5')).toBeNull();

    // Invalid cases: too many decimals, non‑numeric text, zero/negative
    expect(validateMileageMiles(12.55)).not.toBeNull();
    expect(validateMileageMiles('abc')).not.toBeNull();
    expect(validateMileageMiles(0)).toBe('Miles must be > 0');
    expect(validateMileageMiles(-3)).toBe('Miles must be > 0');
  });

  it('stores and calculates deduction for a decimal mileage entry', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const entry = {
      id: 'm2',
      date: '2023-05-01',
      miles: 12.5,
      purpose: 'Client visit',
    };
    await addMileageEntry(store, entry);

    const entries = await getAllMileageEntries(store);
    expect(entries).toHaveLength(1);
    // The stored miles should retain the decimal precision.
    expect(entries[0].miles).toBeCloseTo(12.5);

    const rate = 0.585; // default IRS rate
    const deduction = calculateMileageDeduction(entry.miles, rate);
    // 12.5 miles × 0.585 = 7.3125
    expect(deduction).toBeCloseTo(7.3125, 4);
  });
});
