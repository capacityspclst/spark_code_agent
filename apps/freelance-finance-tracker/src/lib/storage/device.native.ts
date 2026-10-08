// iOS/Android: SQLite (expo-sqlite, current async API) holds only ciphertext; the data key lives in the
// device keychain/keystore (expo-secure-store) and never leaves the device.
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import { fromBase64, KEY_BYTES, randomBytes, toBase64 } from '../crypto';
import type { KeyProvider, RawStore } from './types';

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
  let ready: Promise<SQLite.SQLiteDatabase> | null = null;
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
      const row = await (await db()).getFirstAsync<{ v: string }>('SELECT v FROM kv WHERE k = ?', k);
      return row?.v ?? null;
    },
    async setValue(k, v) {
      await (await db()).runAsync('INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)', k, v);
    },
    async deleteValue(k) {
      await (await db()).runAsync('DELETE FROM kv WHERE k = ?', k);
    },
    async listRecords(c) {
      const rows = await (await db()).getAllAsync<{ v: string }>('SELECT v FROM records WHERE collection = ?', c);
      return rows.map((r) => r.v);
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
