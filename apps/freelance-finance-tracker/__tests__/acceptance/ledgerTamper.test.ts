import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addLedgerEntry, verifyLedger } from '../../src/lib/ledger';

describe('M7: ledger tamper detection', () => {
  it('detects a changed field in a ledger entry', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a single entry
    await addLedgerEntry(store, 'receipt.created', 'r2', {
      id: 'r2',
      amount: 200,
      date: '2023-02-02',
      category: 'Travel',
      type: 'expense',
      notes: '',
    });

    // Verify that the ledger is initially valid
    let result = await verifyLedger(store);
    expect(result.ok).toBe(true);

    // Tamper the stored ledger directly
    const raw = await store.getItem('ledger');
    // Assuming raw is an array of entries
    raw[0].data.amount = 9999;
    await store.setItem('ledger', raw);

    // Verification should now fail
    result = await verifyLedger(store);
    expect(result.ok).toBe(false);
    expect(result.firstBadSeq).toBe(1);
    expect(result.reason?.toLowerCase()).toContain('hash mismatch');
  });
});
