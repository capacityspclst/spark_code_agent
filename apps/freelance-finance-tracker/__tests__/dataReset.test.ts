import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../src/lib/storage/memory';
import { acceptPolicy, getPolicyAcceptance, isPolicyAccepted } from '../src/lib/policy';
import { clearAllData } from '../src/lib/dataReset';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

const KEY_NAME = 'app.data-key.v1';

test('clearAllData deletes encryption key and preserves policy acceptance', async () => {
  const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
  // set policy accepted
  await acceptPolicy(store);
  // set a key in SecureStore
  await SecureStore.setItemAsync(KEY_NAME, 'secret');

  await clearAllData(store);

  // policy still accepted
  expect(await isPolicyAccepted(store)).toBe(true);
  // key should be deleted
  const key = await SecureStore.getItemAsync(KEY_NAME);
  expect(key).toBeNull();
});
