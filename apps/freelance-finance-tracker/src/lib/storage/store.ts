import { decryptText, encryptText } from '../crypto';
import type { KeyProvider, RawStore, Store, StoredRecord } from './types';

/** An encrypted Store over any RawStore. */
export function createStore(raw: RawStore, keys: KeyProvider): Store {
  let key: Uint8Array | null = null;
  const dataKey = async () => (key ??= await keys.getKey());
  const seal = async (value: unknown) => encryptText(await dataKey(), JSON.stringify(value));
  const open = async <T>(text: string) => JSON.parse(decryptText(await dataKey(), text)) as T;

  return {
    async get<T>(k: string) {
      const v = await raw.getValue(k);
      return v === null ? null : open<T>(v);
    },
    async set<T>(k: string, value: T) {
      await raw.setValue(k, await seal(value));
    },
    async remove(k: string) {
      await raw.deleteValue(k);
    },
    async list<T extends StoredRecord>(collection: string) {
      const rows = await raw.listRecords(collection);
      return Promise.all(rows.map((r) => open<T>(r)));
    },
    async put<T extends StoredRecord>(collection: string, record: T) {
      await raw.putRecord(collection, record.id, await seal(record));
    },
    async delete(collection: string, id: string) {
      await raw.deleteRecord(collection, id);
    },
    async clearAll() {
      await raw.clearAll();
    },
  };
}
