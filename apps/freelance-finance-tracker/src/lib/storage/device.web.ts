// Web implementation of storage using in-memory store.
import type { KeyProvider, RawStore } from './types';
import { createMemoryRawStore } from './memory';

/** Key provider that generates a fresh random key each call (no persistence). */
export function createDeviceKeyProvider(): KeyProvider {
  return {
    async getKey() {
      // Generate a new random key each time; data will be inaccessible after page reload,
      // which is acceptable for the web fallback where no secure persistent storage is available.
      const { randomBytes } = await import('../crypto');
      return randomBytes(32);
    },
  };
}

let rawStoreInstance: RawStore | null = null;

/** Return a persistent in‑memory raw store for the session. */
export function createDeviceRawStore(): RawStore {
  if (!rawStoreInstance) {
    rawStoreInstance = createMemoryRawStore();
  }
  return rawStoreInstance;
}
