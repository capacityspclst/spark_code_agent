import { clearAllData } from '../src/lib/dataReset';
import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../src/lib/storage/memory';
import { acceptPolicy, isPolicyAccepted } from '../src/lib/policy';
import { addReceipt } from '../src/lib/receiptStore';
import * as SecureStore from 'expo-secure-store';
import { getAllReceipts } from '../src/lib/receiptStore';

jest.mock('expo-secure-store');

describe('dataReset module', () => {
  it('clears data but keeps policy acceptance flag and deletes encryption key', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await acceptPolicy(store);
    // add dummy receipt
    await addReceipt(store, { id: 'r1', amount: 10, date: '2023-01-01', category: 'Test', type: 'expense', notes: '' });
    // set a mock key in SecureStore
    await SecureStore.setItemAsync('app.data-key.v1', 'secret');

    await clearAllData(store);

    expect(await isPolicyAccepted(store)).toBe(true);
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(0);
    // key should be deleted
    const key = await SecureStore.getItemAsync('app.data-key.v1');
    expect(key).toBeNull();
  });
});
