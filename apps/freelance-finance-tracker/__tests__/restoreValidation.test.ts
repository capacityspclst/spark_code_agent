import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../src/lib/storage/memory';
import { createBackup, restoreBackup } from '../src/lib/backup';
import { addReceipt, getAllReceipts } from '../src/lib/receiptStore';
import { acceptPolicy, isPolicyAccepted } from '../src/lib/policy';

test('restoreBackup validates structure before mutating store', async () => {
  const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
  await acceptPolicy(store);
  const receipt = { id: 'r1', amount: 100, date: '2023-01-01', category: 'Supplies', type: 'expense', notes: '' };
  await addReceipt(store, receipt);
  const pass = 'StrongPass123!';
  const backup = await createBackup(store, pass);

  // Attempt restore with wrong passphrase should fail and not change data
  await expect(restoreBackup(store, backup, 'wrongpass')).rejects.toThrow();

  // Ensure data unchanged and policy still accepted
  expect(await isPolicyAccepted(store)).toBe(true);
  const receipts = await getAllReceipts(store);
  expect(receipts).toHaveLength(1);
  expect(receipts[0].id).toBe('r1');
});
