import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addLedgerEntry, verifyLedger } from '../../src/lib/ledger';
import { createBackup, restoreBackup } from '../../src/lib/backup';

describe('M7: backup includes ledger and verifies on restore', () => {
  const passphrase = 'Testpass123!';

  it('creates a backup with a verifiable ledger and restores it correctly', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a ledger entry
    await addLedgerEntry(store, 'receipt.created', 'r5', {
      id: 'r5',
      amount: 300,
      date: '2023-04-01',
      category: 'Equipment',
      type: 'expense',
      notes: '',
    });

    const backupBlob = await createBackup(store, passphrase);
    expect(typeof backupBlob).toBe('string');

    // Clear the store to simulate a fresh install
    await store.clearAll();

    // Restore from backup
    await restoreBackup(store, backupBlob, passphrase);
    const result = await verifyLedger(store);
    expect(result.ok).toBe(true);
    expect(result.entries.length).toBe(1);
    expect(result.entries[0].kind).toBe('receipt.created');
  });

  it('rejects a backup whose ledger has been tampered', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addLedgerEntry(store, 'receipt.created', 'r6', {
      id: 'r6',
      amount: 400,
      date: '2023-04-02',
      category: 'Services',
      type: 'expense',
      notes: '',
    });

    const backupBlob = await createBackup(store, passphrase);

    // Restore first so we have a normal store to tamper
    const restoreStore = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await restoreBackup(restoreStore, backupBlob, passphrase);

    // Tamper the ledger entry in the restored store
    const raw = await restoreStore.getItem('ledger');
    raw[0].data.amount = 9999;
    await restoreStore.setItem('ledger', raw);

    // Verification should now fail
    const result = await verifyLedger(restoreStore);
    expect(result.ok).toBe(false);
    expect(result.firstBadSeq).toBe(1);
  });
});
