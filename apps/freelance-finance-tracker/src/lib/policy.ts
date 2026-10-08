// Terms of Use / Privacy Policy gate. Bump POLICY_VERSION whenever the text changes: everyone must accept again.
import type { Store } from './storage';

export const POLICY_VERSION = '1';
const KEY = 'policy.acceptance';

export interface PolicyAcceptance {
  version: string;
  acceptedAt: string; // ISO date-time
}

export async function getPolicyAcceptance(store: Store): Promise<PolicyAcceptance | null> {
  return store.get<PolicyAcceptance>(KEY);
}

export function policyAccepted(acceptance: PolicyAcceptance | null): boolean {
  return acceptance?.version === POLICY_VERSION;
}

export async function acceptPolicy(store: Store, now: Date = new Date()): Promise<PolicyAcceptance> {
  const acceptance = { version: POLICY_VERSION, acceptedAt: now.toISOString() };
  await store.set(KEY, acceptance);
  return acceptance;
}
