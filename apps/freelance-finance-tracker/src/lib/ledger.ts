// Ledger core implementation for tamper‑evident record keeping.
// Stores an append‑only encrypted array under the key "ledger" in the Store.

import type { Store, StoredRecord } from './storage/types';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

export type LedgerKind =
  | 'receipt.created'
  | 'receipt.corrected'
  | 'receipt.deleted'
  | 'mileage.created'
  | 'mileage.corrected'
  | 'mileage.deleted'
  | 'imported'
  | 'export.created';

export interface LedgerEntry {
  seq: number; // 1‑based index
  at: string; // ISO timestamp when entry was created
  kind: LedgerKind;
  recordId: string; // id of the receipt/mileage/…
  data: any; // full content after the change (or last content for deletions)
  prevHash: string; // hex 64‑char SHA‑256 of previous entry (or zeros)
  hash: string; // hex 64‑char SHA‑256 of this entry (excluding the hash field)
}

export const LEDGER_KEY = 'ledger';
export const LEDGER_INIT_FLAG = 'ledgerInitialized';
const ZERO_64 = '0'.repeat(64);

/** Helper: produce a canonical JSON string with stable field order (excluding hash). */
function canonical(entry: Omit<LedgerEntry, 'hash'>): string {
  const ordered: any = {};
  const keys = Object.keys(entry).sort();
  for (const k of keys) {
    ordered[k] = (entry as any)[k];
  }
  return JSON.stringify(ordered);
}

/** Compute hash for a ledger entry (without its hash field). */
function computeHash(entryWithoutHash: Omit<LedgerEntry, 'hash'>): string {
  const json = canonical(entryWithoutHash);
  const hashBytes = sha256(utf8ToBytes(json));
  return bytesToHex(hashBytes);
}

/** Load the whole ledger array (decrypted) or return empty array if missing. */
async function loadLedger(store: Store): Promise<LedgerEntry[]> {
  const existing = await store.get<LedgerEntry[]>(LEDGER_KEY);
  return existing ?? [];
}

/** Persist the ledger array back to storage. */
async function saveLedger(store: Store, ledger: LedgerEntry[]): Promise<void> {
  await store.set(LEDGER_KEY, ledger);
}

/** Add a new entry to the ledger. */
export async function addLedgerEntry(
  store: Store,
  kind: LedgerKind,
  recordId: string,
  data: any,
): Promise<void> {
  const ledger = await loadLedger(store);
  const seq = ledger.length + 1;
  const at = new Date().toISOString();
  const prevHash = ledger.length === 0 ? ZERO_64 : ledger[ledger.length - 1].hash;
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = {
    seq,
    at,
    kind,
    recordId,
    data,
    prevHash,
  };
  const hash = computeHash(entryWithoutHash);
  const entry: LedgerEntry = { ...entryWithoutHash, hash };
  ledger.push(entry);
  await saveLedger(store, ledger);
}

/** Verify the full ledger chain. Returns an object describing the result. */
export async function verifyLedger(store: Store): Promise<{
  ok: boolean;
  entries: LedgerEntry[];
  firstBadSeq?: number;
  reason?: string;
}> {
  const ledger = await loadLedger(store);
  for (let i = 0; i < ledger.length; i++) {
    const entry = ledger[i];
    const { hash, ...withoutHash } = entry;
    const expectedHash = computeHash(withoutHash as Omit<LedgerEntry, 'hash'>);
    if (hash !== expectedHash) {
      return { ok: false, entries: ledger, firstBadSeq: entry.seq, reason: 'hash mismatch' };
    }
    const expectedPrev = i === 0 ? ZERO_64 : ledger[i - 1].hash;
    if (entry.prevHash !== expectedPrev) {
      return { ok: false, entries: ledger, firstBadSeq: entry.seq, reason: 'prevHash mismatch' };
    }
  }
  return { ok: true, entries: ledger };
}

/** Initialise ledger on first launch: import existing receipts/mileage as "imported" entries. */
export async function initLedgerIfNeeded(store: Store): Promise<void> {
  const initFlag = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (initFlag) return; // already initialized

  // Import existing receipts
  const receipts = await store.list<StoredRecord>('receipts');
  for (const r of receipts) {
    await addLedgerEntry(store, 'imported', r.id, r);
  }
  // Import existing mileage entries
  const mileage = await store.list<StoredRecord>('mileage');
  for (const m of mileage) {
    await addLedgerEntry(store, 'imported', m.id, m);
  }

  // Mark initialization
  await store.set(LEDGER_INIT_FLAG, true);
}
