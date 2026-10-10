// In-memory RawStore and KeyProvider: for tests only (the app never uses these).
import { KEY_BYTES, randomBytes } from '../crypto';
import type { KeyProvider, RawStore } from './types';

export function createMemoryRawStore(): RawStore & { dump(): string } {
  const kv = new Map<string, string>();
  const records = new Map<string, Map<string, string>>();
  const col = (c: string) => records.get(c) ?? records.set(c, new Map()).get(c)!;
  return {
    async getValue(k) { return kv.get(k) ?? null; },
    async setValue(k, v) { kv.set(k, v); },
    async deleteValue(k) { kv.delete(k); },
    async listRecords(c) { return [...col(c).values()]; },
    async putRecord(c, id, v) { col(c).set(id, v); },
    async deleteRecord(c, id) { col(c).delete(id); },
    async clearAll() { kv.clear(); records.clear(); },
    dump() { return JSON.stringify({ kv: [...kv], records: [...records].map(([c, m]) => [c, [...m]]) }); },
  };
}

export function createMemoryKeyProvider(key: Uint8Array = randomBytes(KEY_BYTES)): KeyProvider {
  return { getKey: async () => key };
}

// Re-export the encrypted Store factory for tests.
export { createStore } from './store';
