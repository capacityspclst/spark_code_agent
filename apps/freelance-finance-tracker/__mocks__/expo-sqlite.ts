// Jest manual mock for expo-sqlite to avoid native module errors in test environment.
// Provides async API methods used by the storage layer.

export async function openDatabaseAsync(_name: string) {
  // Simple in‑memory mock store for kv and records tables.
  const kv = new Map<string, string>();
  const records = new Map<string, Map<string, string>>(); // collection -> (id -> v)

  return {
    async execAsync(_sql: string) {
      // No‑op for schema creation in mock.
    },
    async runAsync(_sql: string, ..._params: any[]) {
      // Very naive parser for the limited queries used.
      const sql = _sql.trim().toUpperCase();
      if (sql.startsWith('INSERT OR REPLACE INTO KV')) {
        const [k, v] = _params;
        kv.set(k, v);
      } else if (sql.startsWith('INSERT OR REPLACE INTO RECORDS')) {
        const [collection, id, v] = _params;
        let colMap = records.get(collection);
        if (!colMap) {
          colMap = new Map();
          records.set(collection, colMap);
        }
        colMap.set(id, v);
      } else if (sql.startsWith('DELETE FROM KV')) {
        const [k] = _params;
        kv.delete(k);
      } else if (sql.startsWith('DELETE FROM RECORDS WHERE COLLECTION = ? AND ID = ?')) {
        const [collection, id] = _params;
        const colMap = records.get(collection);
        colMap?.delete(id);
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
        return v ? { v } : null;
      }
      return null;
    },
    async getAllAsync(_sql: string, ...params: any[]) {
      const sql = _sql.trim().toUpperCase();
      if (sql.startsWith('SELECT V FROM RECORDS WHERE COLLECTION = ?')) {
        const [collection] = params;
        const colMap = records.get(collection);
        if (!colMap) return [];
        return Array.from(colMap.values()).map((v) => ({ v } as any));
      }
      return [];
    },
  };
}
