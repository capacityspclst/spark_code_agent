// Storage contract. The app only talks to Store; where bytes live is a RawStore (SQLite on phones,
// localStorage on the web build used for checks, memory in tests). Every value is encrypted before it
// reaches a RawStore, with a data key from a KeyProvider (the device keychain/keystore on phones).

export interface StoredRecord {
  id: string;
  [field: string]: unknown;
}

/** Plain string storage: no encryption here. */
export interface RawStore {
  getValue(key: string): Promise<string | null>;
  setValue(key: string, value: string): Promise<void>;
  deleteValue(key: string): Promise<void>;
  listRecords(collection: string): Promise<string[]>;
  putRecord(collection: string, id: string, value: string): Promise<void>;
  deleteRecord(collection: string, id: string): Promise<void>;
  clearAll(): Promise<void>;
}

/** Supplies the 32-byte data key, creating and saving it the first time. */
export interface KeyProvider {
  getKey(): Promise<Uint8Array>;
}

export interface Store {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  list<T extends StoredRecord>(collection: string): Promise<T[]>;
  put<T extends StoredRecord>(collection: string, record: T): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  /** Deletes every record and setting (the "delete all data" action). Keeps the data key. */
  clearAll(): Promise<void>;
}
