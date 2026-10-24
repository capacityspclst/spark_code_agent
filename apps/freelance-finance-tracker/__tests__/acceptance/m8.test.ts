import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addMileageEntry, getAllMileageEntries } from '../../src/lib/mileageStore';
import { calculateMileageDeduction } from '../../src/lib/mileage';
import { validateMileageMiles } from '../../src/lib/validation';

describe('M8: mileage accepts decimal miles', () => {
  it('accepts a valid decimal mileage and stores it', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const miles = 12.5;
    expect(validateMileageMiles(miles)).toBeNull();

    const entry = {
      id: 'mDec',
      date: '2023-04-01',
      miles,
      purpose: 'Client visit',
    };
    await addMileageEntry(store, entry);

    const entries = await getAllMileageEntries(store);
    expect(entries).toHaveLength(1);
    expect(entries[0].miles).toBeCloseTo(12.5, 5);

    const deduction = calculateMileageDeduction(entries[0].miles, 0.585);
    expect(deduction).toBeCloseTo(7.3125, 4);
  });

  it('rejects a mileage with more than one decimal place', () => {
    expect(validateMileageMiles(12.55)).toBe('Miles can have at most 1 decimal place');
    expect(validateMileageMiles('12.55')).toBe('Miles can have at most 1 decimal place');
  });
});
