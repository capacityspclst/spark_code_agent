import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { setMileageRate, getMileageRate, setTaxRate, getTaxRate } from '../../src/lib/settings';
import { generateCsv } from '../../src/lib/exportCsv';
import { addReceipt } from '../../src/lib/receiptStore';
import { addMileageEntry } from '../../src/lib/mileageStore';

describe('M3: settings persistence', () => {
  it('stores and retrieves mileageRate and taxRate correctly', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await setMileageRate(store, 0.6);
    const mileageRate = await getMileageRate(store);
    expect(mileageRate).toBeCloseTo(0.6);

    await setTaxRate(store, 0.15);
    const taxRate = await getTaxRate(store);
    expect(taxRate).toBeCloseTo(0.15);
  });
});

describe('M3: CSV export generation', () => {
  it('produces a CSV string that contains receipts and mileage entries', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r1',
      amount: 100,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    });
    await addMileageEntry(store, {
      id: 'm1',
      date: '2023-01-02',
      miles: 50,
      purpose: 'Travel',
    });

    const csv = await generateCsv(store);
    // Basic sanity checks
    expect(csv).toContain('id,amount,date,category,type,notes');
    expect(csv).toContain('r1,100,2023-01-01,Supplies,expense,');
    expect(csv).toContain('m1,50,2023-01-02,Travel');
  });
});
