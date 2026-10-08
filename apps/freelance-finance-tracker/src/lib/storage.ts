// src/lib/storage.ts
// Real storage implementation using expo-sqlite on native platforms and AsyncStorage on web.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

let db: any = null;

function getDB() {
  if (db) return db;
  if (Platform.OS === 'web') {
    // No SQLite on web; use AsyncStorage fallback (handled in functions).
    return null;
  }
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabase('finance.db');
  // Initialize tables
  db.transaction((tx: any) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS mileage (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);'
    );
  });
  return db;
}

// Helper to run a SQL query and return a Promise of result rows.
function executeSql(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    if (Platform.OS === 'web') {
      // Web fallback will not use this function directly.
      reject(new Error('SQLite not available on web'));
      return;
    }
    db.transaction((tx: any) => {
      tx.executeSql(
        sql,
        params,
        (_tx: any, resultSet: any) => {
          const rows = resultSet.rows._array;
          resolve(rows);
        },
        (_tx: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

// ---------- Receipt helpers ----------
export async function addReceipt(r: any): Promise<void> {
  const data = JSON.stringify(r);
  await executeSql('INSERT OR REPLACE INTO receipts (id, data) VALUES (?, ?);', [r.id, data]);
}
export async function listReceipts(): Promise<any[]> {
  if (Platform.OS === 'web') {
    const { getItemAsync, setItemAsync } = require('@react-native-async-storage/async-storage');
    const json = await getItemAsync('receipts');
    return json ? JSON.parse(json) : [];
  }
  const rows = await executeSql('SELECT data FROM receipts;');
  return rows.map((r: any) => JSON.parse(r.data));
}
export async function clearReceipts(): Promise<void> {
  if (Platform.OS === 'web') {
    const { removeItemAsync } = require('@react-native-async-storage/async-storage');
    await removeItemAsync('receipts');
    return;
  }
  await executeSql('DELETE FROM receipts;');
}

// ---------- Mileage helpers ----------
export async function addMileage(m: any): Promise<void> {
  const data = JSON.stringify(m);
  await executeSql('INSERT OR REPLACE INTO mileage (id, data) VALUES (?, ?);', [m.id, data]);
}
export async function listMileage(): Promise<any[]> {
  if (Platform.OS === 'web') {
    const { getItemAsync } = require('@react-native-async-storage/async-storage');
    const json = await getItemAsync('mileage');
    return json ? JSON.parse(json) : [];
  }
  const rows = await executeSql('SELECT data FROM mileage;');
  return rows.map((r: any) => JSON.parse(r.data));
}
export async function clearMileage(): Promise<void> {
  if (Platform.OS === 'web') {
    const { removeItemAsync } = require('@react-native-async-storage/async-storage');
    await removeItemAsync('mileage');
    return;
  }
  await executeSql('DELETE FROM mileage;');
}

// ---------- Config helpers ----------
export async function setConfig(cfg: any): Promise<void> {
  const value = JSON.stringify(cfg);
  if (Platform.OS === 'web') {
    const { setItemAsync } = require('@react-native-async-storage/async-storage');
    await setItemAsync('config', value);
    return;
  }
  await executeSql('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?);', ['config', value]);
}
export async function getConfig(): Promise<any> {
  if (Platform.OS === 'web') {
    const { getItemAsync } = require('@react-native-async-storage/async-storage');
    const json = await getItemAsync('config');
    return json ? JSON.parse(json) : {};
  }
  const rows = await executeSql('SELECT value FROM config WHERE key = ?;', ['config']);
  if (rows.length === 0) return {};
  return JSON.parse(rows[0].value);
}
export async function clearAll(): Promise<void> {
  await clearReceipts();
  await clearMileage();
  if (Platform.OS === 'web') {
    const { removeItemAsync } = require('@react-native-async-storage/async-storage');
    await removeItemAsync('config');
    return;
  }
  await executeSql('DELETE FROM config;');
}
