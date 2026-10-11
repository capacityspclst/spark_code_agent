import { acceptPolicy, getPolicyAcceptance, policyAccepted } from './policy';
import type { Store } from './storage/types';
import { deleteAllPhotos } from './photos';
import * as FileSystem from 'expo-file-system';
import { getAllReceipts } from './receiptStore';

/** Run a destructive store operation (restore, delete all) without losing the user's policy acceptance. */
export async function keepingPolicy(store: Store, work: () => Promise<void>): Promise<void> {
  const acceptance = await getPolicyAcceptance(store);
  await work();
  if (acceptance && policyAccepted(acceptance)) await acceptPolicy(store, new Date(acceptance.acceptedAt));
}

/** "Delete all data": every receipt photo, record and setting goes, and the encryption key is replaced (the store
 * switches to the new key at once), so nothing deleted can be recovered. The policy acceptance stays.
 */
export async function deleteAllData(store: Store): Promise<void> {
  // First remove the photo folder entirely.
  await deleteAllPhotos();
  // As an extra safety measure, also delete any lingering photo files referenced in receipts.
  try {
    const receipts = await getAllReceipts(store);
    await Promise.all(
      receipts.map(async (r) => {
        if (r.photoUri) {
          await FileSystem.deleteAsync(r.photoUri, { idempotent: true });
        }
      })
    );
  } catch {
    // ignore errors – we already attempted folder deletion.
  }
  await keepingPolicy(store, () => store.wipe());
}

/** Alias for deleteAllData to match expected API in tests */
export const clearAllData = deleteAllData;
