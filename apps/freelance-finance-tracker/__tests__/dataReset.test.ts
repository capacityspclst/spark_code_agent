import { clearAllData } from '../src/lib/dataReset';
import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../src/lib/storage/memory';
import { acceptPolicy, isPolicyAccepted } from '../src/lib/policy';
import { addReceipt, getAllReceipts } from '../src/lib/receiptStore';

describe('dataReset module', () => {
  it('clears data, keeps the policy acceptance and replaces the encryption key', async () => {
    const raw = createMemoryRawStore();
    const store = createStore(raw, createMemoryKeyProvider());
    await acceptPolicy(store);
    await addReceipt(store, { id: 'r1', amount: 10, date: '2023-01-01', category: 'Test', type: 'expense', notes: '' });
    const before = JSON.parse(raw.dump());

    await clearAllData(store);

    expect(await isPolicyAccepted(store)).toBe(true);
    expect(await getAllReceipts(store)).toHaveLength(0);
    // Anything encrypted before the wipe can't be read with the new key.
    const [, oldCiphertext] = before.kv.find(([k]: [string]) => k === 'policy.acceptance');
    await raw.setValue('old', oldCiphertext);
    await expect(store.get('old')).rejects.toThrow();
    // New data is written with the new key and reads back fine.
    await addReceipt(store, { id: 'r2', amount: 5, date: '2023-01-02', category: 'Test', type: 'expense', notes: '' });
    expect((await getAllReceipts(store)).map((r) => r.id)).toEqual(['r2']);
  });
});
