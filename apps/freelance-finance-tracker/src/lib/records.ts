// src/lib/records.ts
import {
  addReceipt as dbAddReceipt,
  listReceipts as dbListReceipts,
  clearAll as dbClearAll,
  addMileage as dbAddMileage,
  listMileage as dbListMileage,
  setConfig as dbSetConfig,
  getConfig as dbGetConfig,
} from './storage';

export interface Receipt {
  id: string;
  amount: number;
  date: string; // ISO date
  category: string;
  type: 'expense' | 'income';
  notes?: string;
  photoUri: string;
}

export interface MileageEntry {
  id: string;
  date: string;
  miles: number;
  purpose: string;
}

export interface Config {
  mileageRate?: number;
  taxRate?: number;
  lockEnabled?: boolean;
}

// Receipt CRUD
export async function addReceipt(r: Receipt): Promise<void> {
  await dbAddReceipt(r);
}
export async function listReceipts(): Promise<Receipt[]> {
  return dbListReceipts();
}
export async function deleteReceipt(id: string): Promise<void> {
  const receipts = await dbListReceipts();
  const filtered = receipts.filter(r => r.id !== id);
  // Clear and re-add remaining receipts
  await dbClearAll();
  for (const r of filtered) {
    await dbAddReceipt(r);
  }
}

// Mileage CRUD
export async function addMileage(m: MileageEntry): Promise<void> {
  await dbAddMileage(m);
}
export async function listMileage(): Promise<MileageEntry[]> {
  return dbListMileage();
}
export async function deleteMileage(id: string): Promise<void> {
  const entries = await dbListMileage();
  const filtered = entries.filter(e => e.id !== id);
  await dbClearAll();
  for (const e of filtered) {
    await dbAddMileage(e);
  }
}

// Config
export async function setConfig(cfg: Config): Promise<void> {
  await dbSetConfig(cfg);
}
export async function getConfig(): Promise<Config> {
  return dbGetConfig();
}
