import { acceptPolicy, getPolicyAcceptance, POLICY_VERSION, policyAccepted } from '../../src/lib/policy';
import { createStore } from '../../src/lib/storage';
import { createMemoryKeyProvider, createMemoryRawStore } from '../../src/lib/storage/memory';

describe('policy gate', () => {
  it('requires acceptance of the current version', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    expect(policyAccepted(await getPolicyAcceptance(store))).toBe(false);
    const a = await acceptPolicy(store, new Date('2026-01-02T03:04:05Z'));
    expect(a).toEqual({ version: POLICY_VERSION, acceptedAt: '2026-01-02T03:04:05.000Z' });
    expect(policyAccepted(await getPolicyAcceptance(store))).toBe(true);
    expect(policyAccepted({ version: 'older', acceptedAt: a.acceptedAt })).toBe(false);
  });
});
