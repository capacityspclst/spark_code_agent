import {
  createStore,
  createMemoryRawStore,
  createMemoryKeyProvider,
} from '../../src/lib/storage/memory';
import { validateMileageMiles } from '../../src/lib/validation';
import {
  addMileageEntry,
  getAllMileageEntries,
} from '../../src/lib/mileageStore';
import { calculateMileageDeduction } from '../../src/lib/mileage';

describe('Mileage miles validation', () => {
  it('accepts a positive number with up to one decimal place', () => {
    expect(validateMileageMiles(12.5)).toBeNull();
  });

  it('rejects zero miles', () => {
    expect(validateMileageMiles(0)).toBe('Miles must be > 0');
  });

  it('rejects negative miles', () => {
    expect(validateMileageMiles(-3)).toBe('Miles must be > 0');
  });

  it('rejects values greater than 10 000', () => {
    expect(validateMileageMiles(10001)).toBe('Miles must be ≤ 10,000');
  });

  it('rejects numbers with more than one decimal place', () => {
    expect(validateMileageMiles(12.55)).toBe('Miles must have at most 1 decimal place');
  });
});

describe('Mileage entry accepts decimal miles and calculates correct deduction', () => {
  it('stores a mileage entry with a decimal miles value and computes the correct deduction', async () => {
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
    expect(entries[0].miles).toBeCloseTo(12.5);

    const rate = 0.585; // default IRS rate
    const deduction = calculateMileageDeduction(entry.miles, rate);
    expect(deduction).toBeCloseTo(7.3125, 4);
  });
});
