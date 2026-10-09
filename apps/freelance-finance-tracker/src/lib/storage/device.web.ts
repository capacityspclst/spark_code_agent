// Web implementation of storage using in-memory store.
import { randomBytes } from '../crypto';
import type { KeyProvider, RawStore } from './types';
import { createMemoryRawStore } from './memory';

// Simple key provider that generates a random key each session.
export function createDeviceKeyProvider(): KeyProvider {
  return {
    async getKey() {
      return randomBytes(32); // 256-bit key
    },
  };
}

export function createDeviceRawStore(): RawStore {
  // Use the same in‑memory raw store used for tests.
  return createMemoryRawStore();
}
