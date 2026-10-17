import { Store } from './storage/types';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';
import { getLedger, setLedger } from './ledgerHelpers';

export interface LedgerEntry {
  seq: number;
  at: string; // ISO timestamp
  kind: string;
  recordId: string;
  data: any;
  prevHash: string;
  hash: string;
}

/** Compute canonical JSON string with deterministic key order (excluding hash). */
export function canonicalJson(entry: Omit<LedgerEntry, 'hash'>): string {
  const sorted: any = {};
  const keys = Object.keys(entry).sort();
  for (const k of keys) {
    sorted[k] = (entry as any)[k];
  }
  return JSON.stringify(sorted);
}

/** Compute hash for entry (without hash field). */
export function computeHash(entry: Omit<LedgerEntry, 'hash'>): string {
  const json = canonicalJson(entry);
  return bytesToHex(sha256(utf8ToBytes(json)));
}

/** Append a new ledger entry and persist the ledger. */
export async function appendEntryForReceipt(kind: string, recordId: string, data: any, store: Store): Promise<void> {
  const ledger = await getLedger(store);
  const seq = ledger.length ? ledger[ledger.length - 1].seq + 1 : 1;
  const at = new Date().toISOString();
  const prevHash = ledger.length ? ledger[ledger.length - 1].hash : '0'.repeat(64);
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = { seq, at, kind, recordId, data, prevHash };
  const hash = computeHash(entryWithoutHash);
  const entry: LedgerEntry = { ...entryWithoutHash, hash };
  ledger.push(entry);
  await setLedger(store, ledger);
}

export async function appendEntryForMileage(kind: string, recordId: string, data: any, store: Store): Promise<void> {
  await appendEntryForReceipt(kind, recordId, data, store);
}

/** Append an export.created ledger entry and store relevant data. */
export async function appendEntryForExport(format: 'csv' | 'pdf', code: string, entriesCount: number, headHashPrev: string, store: Store): Promise<void> {
  const ledger = await getLedger(store);
  const seq = ledger.length ? ledger[ledger.length - 1].seq + 1 : 1;
  const at = new Date().toISOString();
  const prevHash = ledger.length ? ledger[ledger.length - 1].hash : '0'.repeat(64);
  // data includes format, code, entries count, and the previous headHash (as stored before this export)
  const data: any = { format, code, entries: entriesCount, headHash: headHashPrev };
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = { seq, at, kind: 'export.created', recordId: '', data, prevHash };
  const hash = computeHash(entryWithoutHash);
  const entry: LedgerEntry = { ...entryWithoutHash, hash };
  // No need to modify data fields; they already reflect correct values
  ledger.push(entry);
  await setLedger(store, ledger);
}
