import { acceptPolicy, getPolicyAcceptance, policyAccepted } from './policy';
import type { Store } from './storage/types';
import { deleteAllPhotos } from './photos';

/** Run a destructive store operation (restore, delete all) without losing the user's policy acceptance. */
export async function keepingPolicy(store: Store, work: () => Promise<void>): Promise<void> {
  const acceptance = await getPolicyAcceptance(store);
  await work();
  if (acceptance && policyAccepted(acceptance)) await acceptPolicy(store, new Date(acceptance.acceptedAt));
}

/** "Delete all data": every receipt photo, record and setting goes, and the encryption key is replaced (the store
 * switches to the new key at once), so nothing deleted can be recovered. The policy acceptance stays. */
export async function deleteAllData(store: Store): Promise<void> {
  // First, remove all stored receipt photos.
  await deleteAllPhotos();
  // Then wipe the encrypted store; this also rotates the encryption key.
  await keepingPolicy(store, () => store.wipe());
  // Ensure any stray photos are removed after wipe as a safety net (idempotent).
  await deleteAllPhotos();
}

/** Alias for deleteAllData to match expected API in tests */
export const clearAllData = deleteAllData;
