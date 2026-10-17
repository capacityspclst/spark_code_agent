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
  // Use JSON.stringify with a replacer that orders keys alphabetically
  const keys = Object.keys(entry).sort();
  return JSON.stringify(entry, keys);
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
  // Prepare data object
  const data: any = { format, code, entries: seq, headHash: '' };
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = { seq, at, kind: 'export.created', recordId: '', data, prevHash };
  const hash = computeHash(entryWithoutHash);
  // Set headHash appropriately
  if (format === 'pdf') {
    data.headHash = hash; // PDF uses its own hash
  } else {
    data.headHash = prevHash; // CSV uses previous hash
  }
  const entry: LedgerEntry = { ...entryWithoutHash, hash };
  ledger.push(entry);
  await setLedger(store, ledger);
}
