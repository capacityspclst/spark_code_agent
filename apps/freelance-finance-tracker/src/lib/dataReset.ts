import { acceptPolicy, getPolicyAcceptance, policyAccepted } from './policy';
import type { Store } from './storage/types';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { getAllReceipts } from './receiptStore';

/** Run a destructive store operation (restore, delete all) without losing the user's policy acceptance. */
export async function keepingPolicy(store: Store, work: () => Promise<void>): Promise<void> {
  const acceptance = await getPolicyAcceptance(store);
  await work();
  if (acceptance && policyAccepted(acceptance)) await acceptPolicy(store, new Date(acceptance.acceptedAt));
}

/** "Delete all data": every record and setting goes; the policy acceptance stays. */
export async function deleteAllData(store: Store): Promise<void> {
  await keepingPolicy(store, async () => {
    // First, delete any receipt photos stored on the file system.
    try {
      const receipts = await getAllReceipts(store);
      await Promise.all(
        receipts.map(async (r) => {
          if (r.photoUri) {
            try {
              // Ensure we only delete files within the app's document directory.
              await FileSystem.deleteAsync(r.photoUri, { idempotent: true });
            } catch {
              // ignore failures – best effort cleanup.
            }
          }
        })
      );
    } catch {}
    await store.clearAll();
    // Also delete the encryption key from SecureStore so a full wipe removes all secrets.
    try {
      await SecureStore.deleteItemAsync('app.data-key.v1');
    } catch {}
  });
}

/** Alias for deleteAllData to match expected API in tests */
export const clearAllData = deleteAllData;
