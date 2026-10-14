// Ledger core implementation for tamper‑evident record keeping.
// Stores entries in an encrypted array under the key "ledger". Each append verifies
// the chain to maintain append‑only guarantees and enforces a max size.

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
const MAX_LEDGER_ENTRIES = 5000; // safety limit to avoid unbounded growth

/** Produce deterministic JSON with sorted keys (excluding hash). */
function canonical(entry: Omit<LedgerEntry, 'hash'>): string {
  const ordered: any = {};
  const keys = Object.keys(entry).sort();
  for (const k of keys) {
    ordered[k] = (entry as any)[k];
  }
  return JSON.stringify(ordered);
}

function computeHash(entryWithoutHash: Omit<LedgerEntry, 'hash'>): string {
  const json = canonical(entryWithoutHash);
  const hashBytes = sha256(utf8ToBytes(json));
  return bytesToHex(hashBytes);
}

async function loadLedger(store: Store): Promise<LedgerEntry[]> {
  const existing = await store.get<LedgerEntry[]>(LEDGER_KEY);
  return existing ?? [];
}

async function saveLedger(store: Store, ledger: LedgerEntry[]): Promise<void> {
  await store.set(LEDGER_KEY, ledger);
}

/** Verify the current ledger chain; used before each append. */
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

/** Append a new entry after verifying integrity and size limits. */
export async function addLedgerEntry(
  store: Store,
  kind: LedgerKind,
  recordId: string,
  data: any,
): Promise<void> {
  // Verify existing chain to enforce append‑only guarantee.
  const verification = await verifyLedger(store);
  if (!verification.ok) {
    throw new Error('Ledger integrity compromised; cannot append new entry');
  }
  const ledger = verification.entries;
  if (ledger.length >= MAX_LEDGER_ENTRIES) {
    throw new Error('Ledger size limit exceeded');
  }
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

/** Initialise ledger on first launch: import existing receipts/mileage as "imported" entries. */
export async function initLedgerIfNeeded(store: Store): Promise<void> {
  const initFlag = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (initFlag) return;

  const receipts = await store.list<StoredRecord>('receipts');
  for (const r of receipts) {
    await addLedgerEntry(store, 'imported', r.id, r);
  }
  const mileage = await store.list<StoredRecord>('mileage');
  for (const m of mileage) {
    await addLedgerEntry(store, 'imported', m.id, m);
  }
  await store.set(LEDGER_INIT_FLAG, true);
}
