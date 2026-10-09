// Web implementation of storage using in-memory store.
import { randomBytes } from '../crypto';
import type { KeyProvider, RawStore } from './types';
import { createMemoryRawStore } from './memory';

// Persistent key for the session.
let cachedKey: Uint8Array | null = null;

/** Simple key provider that generates a random key once per session. */
export function createDeviceKeyProvider(): KeyProvider {
  return {
    async getKey() {
      if (!cachedKey) {
        cachedKey = randomBytes(32); // 256-bit key
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
