// src/lib/records.ts
import { storage } from './storage';

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
  storage.addReceipt(r);
}
export async function listReceipts(): Promise<Receipt[]> {
  return storage.listReceipts();
}
export async function deleteReceipt(id: string): Promise<void> {
  // simple filter
  const receipts = await storage.listReceipts();
  const filtered = receipts.filter(r => r.id !== id);
  // replace store
  // @ts-ignore - direct manipulation for test stub
  (storage as any).receiptStore = filtered;
}

// Mileage CRUD
export async function addMileage(m: MileageEntry): Promise<void> {
  storage.addMileage(m);
}
export async function listMileage(): Promise<MileageEntry[]> {
  return storage.listMileage();
}
export async function deleteMileage(id: string): Promise<void> {
  const entries = await storage.listMileage();
  const filtered = entries.filter(e => e.id !== id);
  (storage as any).mileageStore = filtered;
}

// Config
export async function setConfig(cfg: Config): Promise<void> {
  storage.setConfig(cfg);
}
export async function getConfig(): Promise<Config> {
  return storage.getConfig();
}
