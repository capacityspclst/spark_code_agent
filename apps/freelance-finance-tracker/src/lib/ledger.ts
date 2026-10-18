import { Store } from './storage/types';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';

export interface LedgerEntry {
  seq: number;
  at: string; // ISO timestamp
  kind: string;
  recordId: string;
  data: any;
  prevHash: string;
  hash: string;
}

/** Produce canonical JSON with sorted keys (excluding hash). */
export function canonicalJson(entry: Omit<LedgerEntry, 'hash'>): string {
  const keys = Object.keys(entry).sort();
  const ordered: any = {};
  for (const k of keys) ordered[k] = (entry as any)[k];
  return JSON.stringify(ordered);
}

/** Compute hash for a ledger entry (without the hash field). */
export function computeHash(entry: Omit<LedgerEntry, 'hash'>): string {
  // Deep canonical JSON: recursively sort object keys
  function sortDeep(value: any): any {
    if (Array.isArray(value)) {
      return value.map(sortDeep);
    } else if (value && typeof value === 'object') {
      const ordered: any = {};
      const keys = Object.keys(value).sort();
      for (const k of keys) {
        ordered[k] = sortDeep(value[k]);
      }
      return ordered;
    }
    return value;
  }
  const canonical = sortDeep(entry);
  const json = JSON.stringify(canonical);
  return bytesToHex(sha256(utf8ToBytes(json)));
}

/** Generic append function used by receipt and mileage helpers. */
async function appendEntry(kind: string, recordId: string, data: any, store: Store): Promise<void> {
  const existing = await store.get<LedgerEntry[]>('ledger');
  const ledger = existing ?? [];
  const seq = ledger.length ? ledger[ledger.length - 1].seq + 1 : 1;
  const at = new Date().toISOString();
  const prevHash = ledger.length ? ledger[ledger.length - 1].hash : '0'.repeat(64);
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = { seq, at, kind, recordId, data, prevHash };
  const hash = computeHash(entryWithoutHash);
  const entry: LedgerEntry = { ...entryWithoutHash, hash };
  ledger.push(entry);
  await store.set('ledger', ledger);
  // Track the highest sequence number ever assigned to detect deletions
  await store.set('ledgerSeqCount', seq);
}

/** Append a receipt ledger entry. */
export async function appendEntryForReceipt(kind: string, recordId: string, data: any, store: Store): Promise<void> {
  // Always append, even for created entries, to satisfy tests that log them explicitly.
  await appendEntry(kind, recordId, data, store);
}

/** Append a mileage ledger entry. */
export async function appendEntryForMileage(kind: string, recordId: string, data: any, store: Store): Promise<void> {
  // Always append, even for created entries.
  await appendEntry(kind, recordId, data, store);
}

/** Append an export.created ledger entry. The ledger entry records format, code, entries count, and headHash.
 * The function computes the current ledger length and head hash after adding the entry.
 */
export async function appendEntryForExport(format: 'csv' | 'pdf', code12: string, store: Store): Promise<void> {
  const ledger = (await store.get<LedgerEntry[]>('ledger')) ?? [];
  const seq = ledger.length ? ledger[ledger.length - 1].seq + 1 : 1;
  const at = new Date().toISOString();
  const prevHash = ledger.length ? ledger[ledger.length - 1].hash : '0'.repeat(64);
  // Prepare data with 12‑character code placeholder
  const data: any = { format, code: code12, entries: seq, headHash: '' };
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = { seq, at, kind: 'export.created', recordId: '', data, prevHash };
  const hash = computeHash(entryWithoutHash);
  // Set headHash after hash is known
  data.headHash = hash;
  const entry: LedgerEntry = { ...entryWithoutHash, hash };
  ledger.push(entry);
  await store.set('ledger', ledger);
  await store.set('ledgerSeqCount', entry.seq);
}


