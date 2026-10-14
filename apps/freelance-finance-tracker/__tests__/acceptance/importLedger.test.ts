import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt } from '../../src/lib/receiptStore';
import { addMileageEntry } from '../../src/lib/mileageStore';
import { initLedgerIfNeeded, verifyLedger } from '../../src/lib/ledger';

describe('M7: import existing data on first launch', () => {
  it('creates imported ledger entries for pre‑existing records exactly once', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());

    // Add records before the ledger is initialized
    await addReceipt(store, {
      id: 'r3',
      amount: 50,
      date: '2023-03-03',
      category: 'Meals',
      type: 'expense',
      notes: '',
    });
    await addMileageEntry(store, {
      id: 'm3',
      date: '2023-03-04',
      miles: 30,
      purpose: 'Client visit',
    });

    // First init should import them as 'imported' entries
    await initLedgerIfNeeded(store);
    let result = await verifyLedger(store);
    expect(result.ok).toBe(true);
    const imported = result.entries.filter(e => e.kind === 'imported');
    expect(imported.length).toBe(2);

    // Adding a new receipt after init should create a normal entry
    await addReceipt(store, {
      id: 'r4',
      amount: 75,
      date: '2023-03-05',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    });
    // Re‑run init – should NOT duplicate imports
    await initLedgerIfNeeded(store);

    result = await verifyLedger(store);
    expect(result.ok).toBe(true);
    const totalImported = result.entries.filter(e => e.kind === 'imported').length;
    expect(totalImported).toBe(2); // still only the original imports
  });
});
