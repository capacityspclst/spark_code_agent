// iOS/Android: SQLite (expo-sqlite, current async API) holds only ciphertext; the data key lives in the
// device keychain/keystore (expo-secure-store) and never leaves the device.
import * as SecureStore from 'expo-secure-store';
import { fromBase64, KEY_BYTES, randomBytes, toBase64 } from '../crypto';
import type { KeyProvider, RawStore } from './types';

let SQLite: any;
// Use a mock in Jest tests to avoid native module errors.
const isTest = process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';
if (isTest) {
  SQLite = {
    async openDatabaseAsync(_name: string) {
      const kv = new Map<string, string>();
      const records = new Map<string, Map<string, string>>(); // collection -> (id -> v)
      return {
        async execAsync(_sql: string) {},
        async runAsync(_sql: string, ..._params: any[]) {
          const sql = _sql.trim().toUpperCase();
          if (sql.startsWith('INSERT OR REPLACE INTO KV')) {
            const [k, v] = _params;
            kv.set(k, v);
          } else if (sql.startsWith('INSERT OR REPLACE INTO RECORDS')) {
            const [collection, id, v] = _params;
            let col = records.get(collection);
            if (!col) {
              col = new Map();
              records.set(collection, col);
            }
            col.set(id, v);
          } else if (sql.startsWith('DELETE FROM KV')) {
            const [k] = _params;
            kv.delete(k);
          } else if (sql.startsWith('DELETE FROM RECORDS WHERE COLLECTION = ? AND ID = ?')) {
            const [collection, id] = _params;
            const col = records.get(collection);
            col?.delete(id);
          } else if (sql.startsWith('DELETE FROM KV; DELETE FROM RECORDS;')) {
            kv.clear();
            records.clear();
          }
        },
        async getFirstAsync(_sql: string, ...params: any[]) {
          const sql = _sql.trim().toUpperCase();
          if (sql.startsWith('SELECT V FROM KV WHERE K = ?')) {
            const [k] = params;
            const v = kv.get(k);
            return v ? ({ v } as any) : null;
          }
          return null;
        },
        async getAllAsync(_sql: string, ...params: any[]) {
          const sql = _sql.trim().toUpperCase();
          if (sql.startsWith('SELECT V FROM RECORDS WHERE COLLECTION = ?')) {
            const [collection] = params;
            const col = records.get(collection);
            if (!col) return [];
            return Array.from(col.values()).map((v) => ({ v } as any));
          }
          return [];
        },
      };
    },
  };
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SQLite = require('expo-sqlite');
}

const KEY_NAME = 'app.data-key.v1';

export function createDeviceKeyProvider(): KeyProvider {
  return {
    async getKey() {
      const saved = await SecureStore.getItemAsync(KEY_NAME);
      if (saved) return fromBase64(saved);
      const key = randomBytes(KEY_BYTES);
      await SecureStore.setItemAsync(KEY_NAME, toBase64(key), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return key;
    },
  };
}

export function createDeviceRawStore(): RawStore {
  let ready: Promise<any> | null = null;
  const db = () =>
    (ready ??= (async () => {
      const d = await SQLite.openDatabaseAsync('app.db');
      await d.execAsync(
        'PRAGMA journal_mode = WAL;' +
          'CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY NOT NULL, v TEXT NOT NULL);' +
          'CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL, id TEXT NOT NULL, v TEXT NOT NULL, PRIMARY KEY (collection, id));',
      );
      return d;
    })());
  return {
    async getValue(k) {
      const row = await (await db()).getFirstAsync('SELECT v FROM kv WHERE k = ?', k);
      return (row as any)?.v ?? null;
    },
    async setValue(k, v) {
      await (await db()).runAsync('INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)', k, v);
    },
    async deleteValue(k) {
      await (await db()).runAsync('DELETE FROM kv WHERE k = ?', k);
    },
    async listRecords(c) {
      const rows = await (await db()).getAllAsync('SELECT v FROM records WHERE collection = ?', c);
      return rows.map((r: any) => r.v);
    },
    async putRecord(c, id, v) {
      await (await db()).runAsync('INSERT OR REPLACE INTO records (collection, id, v) VALUES (?, ?, ?)', c, id, v);
    },
    async deleteRecord(c, id) {
      await (await db()).runAsync('DELETE FROM records WHERE collection = ? AND id = ?', c, id);
    },
    async clearAll() {
      await (await db()).execAsync('DELETE FROM kv; DELETE FROM records;');
    },
  };
}
