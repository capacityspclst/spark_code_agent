// Web build: used only so the browser checks can walk the UI. localStorage holds ciphertext; the key is kept
// in localStorage too, so this is NOT a secure store - the real app runs on iOS/Android (device.native.ts).
import { fromBase64, KEY_BYTES, randomBytes, toBase64 } from '../crypto';
import type { KeyProvider, RawStore } from './types';

const PREFIX = 'app.v1.';
const ls = () => (globalThis as { localStorage?: Storage }).localStorage;

export function createDeviceKeyProvider(): KeyProvider {
  return {
    async getKey() {
      const saved = ls()?.getItem(PREFIX + 'key');
      if (saved) return fromBase64(saved);
      const key = randomBytes(KEY_BYTES);
      ls()?.setItem(PREFIX + 'key', toBase64(key));
      return key;
    },
  };
}

export function createDeviceRawStore(): RawStore {
  const kvKey = (k: string) => `${PREFIX}kv.${k}`;
  const recKey = (c: string) => `${PREFIX}rec.${c}`;
  const readCol = (c: string): Record<string, string> => JSON.parse(ls()?.getItem(recKey(c)) ?? '{}');
  const writeCol = (c: string, m: Record<string, string>) => ls()?.setItem(recKey(c), JSON.stringify(m));
  return {
    async getValue(k) { return ls()?.getItem(kvKey(k)) ?? null; },
    async setValue(k, v) { ls()?.setItem(kvKey(k), v); },
    async deleteValue(k) { ls()?.removeItem(kvKey(k)); },
    async listRecords(c) { return Object.values(readCol(c)); },
    async putRecord(c, id, v) { const m = readCol(c); m[id] = v; writeCol(c, m); },
    async deleteRecord(c, id) { const m = readCol(c); delete m[id]; writeCol(c, m); },
    async clearAll() {
      const s = ls();
      if (!s) return;
      for (const k of Object.keys(s)) if (k.startsWith(PREFIX) && k !== PREFIX + 'key') s.removeItem(k);
    },
  };
}
