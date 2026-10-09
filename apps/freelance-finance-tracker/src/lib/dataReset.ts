import { acceptPolicy, getPolicyAcceptance, policyAccepted } from './policy';
import type { Store } from './storage/types';

/** Run a destructive store operation (restore, delete all) without losing the user's policy acceptance. */
export async function keepingPolicy(store: Store, work: () => Promise<void>): Promise<void> {
  const acceptance = await getPolicyAcceptance(store);
  await work();
  if (acceptance && policyAccepted(acceptance)) await acceptPolicy(store, new Date(acceptance.acceptedAt));
}

/** "Delete all data": every record and setting goes; the policy acceptance stays. */
export async function deleteAllData(store: Store): Promise<void> {
  await keepingPolicy(store, () => store.clearAll());
}
