// src/lib/storage.ts
// Unified storage using AsyncStorage for all platforms (web and native).
import * as AsyncStorage from '@react-native-async-storage/async-storage';

type Key = 'receipts' | 'mileage' | 'config';

// Helper to get array from storage
async function getArray<T>(key: Key): Promise<T[]> {
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : [];
}

// Helper to set array to storage
async function setArray<T>(key: Key, arr: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(arr));
}

// ---------- Receipt helpers ----------
export async function addReceipt(r: any): Promise<void> {
  const receipts = await getArray<any>('receipts');
  const filtered = receipts.filter((it: any) => it.id !== r.id);
  filtered.push(r);
  await setArray('receipts', filtered);
}
export async function listReceipts(): Promise<any[]> {
  return getArray<any>('receipts');
}
export async function clearReceipts(): Promise<void> {
  await AsyncStorage.removeItem('receipts');
}

// ---------- Mileage helpers ----------
export async function addMileage(m: any): Promise<void> {
  const mileage = await getArray<any>('mileage');
  const filtered = mileage.filter((it: any) => it.id !== m.id);
  filtered.push(m);
  await setArray('mileage', filtered);
}
export async function listMileage(): Promise<any[]> {
  return getArray<any>('mileage');
}
export async function clearMileage(): Promise<void> {
  await AsyncStorage.removeItem('mileage');
}

// ---------- Config helpers ----------
export async function setConfig(cfg: any): Promise<void> {
  await AsyncStorage.setItem('config', JSON.stringify(cfg));
}
export async function getConfig(): Promise<any> {
  const json = await AsyncStorage.getItem('config');
  return json ? JSON.parse(json) : {};
}
export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(['receipts', 'mileage', 'config']);
}
