import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { createBackup, restoreBackup } from '../../src/lib/backup';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';

describe('M4: encrypted backup and restore', () => {
  it('creates a backup and restores it with the correct passphrase', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r1',
      amount: 100,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    });

    const passphrase = 'Testpass123!';
    const backupBlob = await createBackup(store, passphrase);
    expect(typeof backupBlob).toBe('string');
    expect(backupBlob.length).toBeGreaterThan(0);

    // clear the store to simulate a fresh install
    await store.clearAll();

    await restoreBackup(store, backupBlob, passphrase);
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].id).toBe('r1');
  });

  it('fails to restore when an incorrect passphrase is supplied', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r1',
      amount: 100,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    });

    const backupBlob = await createBackup(store, 'CorrectPass123!');
    await store.clearAll();

    await expect(restoreBackup(store, backupBlob, 'WrongPass')).rejects.toThrow();
  });
});
