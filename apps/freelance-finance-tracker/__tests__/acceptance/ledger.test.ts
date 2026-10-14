import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addLedgerEntry, verifyLedger } from '../../src/lib/ledger';

describe('M7: ledger hash chain and verification', () => {
  it('creates entries with correct chaining and verifies successfully', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add first entry
    await addLedgerEntry(store, 'receipt.created', 'r1', {
      id: 'r1',
      amount: 100,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    });

    // Add second entry (a correction)
    await addLedgerEntry(store, 'receipt.corrected', 'r1', {
      id: 'r1',
      amount: 150,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    });

    const result = await verifyLedger(store);
    expect(result.ok).toBe(true);
    expect(result.entries.length).toBe(2);

    // First entry prevHash should be zeros
    expect(result.entries[0].prevHash).toBe('0'.repeat(64));
    // Second entry prevHash should equal first entry's hash
    expect(result.entries[1].prevHash).toBe(result.entries[0].hash);
    // Hashes should be non‑empty hex strings of length 64
    expect(result.entries[0].hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.entries[1].hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
