import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addMileageEntry, getAllMileageEntries } from '../../src/lib/mileageStore';
import { calculateMileageDeduction } from '../../src/lib/mileage';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';

describe('M2: mileage logging and deduction', () => {
  it('stores a mileage entry and calculates the deduction correctly', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const entry = {
      id: 'm1',
      date: '2023-02-01',
      miles: 120,
      purpose: 'Client meeting',
    };
    await addMileageEntry(store, entry);
    const entries = await getAllMileageEntries(store);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('m1');

    const rate = 0.585; // default IRS rate
    const deduction = calculateMileageDeduction(entry.miles, rate);
    expect(deduction).toBeCloseTo(70.2, 2);
  });
});

describe('M2: receipt with attached photo', () => {
  it('stores a receipt that includes a photoUri field', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    const receipt = {
      id: 'r3',
      amount: 45,
      date: '2023-03-01',
      category: 'Travel',
      type: 'expense',
      notes: '',
      photoUri: 'file:///tmp/photo.jpg',
    };
    await addReceipt(store, receipt);
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].photoUri).toBe('file:///tmp/photo.jpg');
  });
});
