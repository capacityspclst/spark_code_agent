// Web implementation of storage using in-memory store.
import { randomBytes } from '../crypto';
import type { KeyProvider, RawStore } from './types';
import { createMemoryRawStore } from './memory';
// Note: Session storage is not used to avoid persisting keys insecurely.

let cachedKey: Uint8Array | null = null;

/** Simple key provider that generates a random key once per app session (in-memory only). */
export function createDeviceKeyProvider(): KeyProvider {
  return {
    async getKey() {
      if (!cachedKey) {
        // Generate a fresh 256‑bit key for this session; do not persist to any storage.
        cachedKey = randomBytes(32);
      }
      return cachedKey;
    },
  };
}

let rawStoreInstance: RawStore | null = null;

/** Return a persistent in‑memory raw store for the whole session. */
export function createDeviceRawStore(): RawStore {
  if (!rawStoreInstance) {
    rawStoreInstance = createMemoryRawStore();
  }
  return rawStoreInstance;
}
