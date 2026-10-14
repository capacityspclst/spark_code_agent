// Ledger core implementation for tamper‑evident record keeping with true append‑only storage.

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

export const LEDGER_KEY_PREFIX = 'ledger:'; // per‑entry storage
export const LEDGER_HEAD_KEY = 'ledgerHead';
export const LEDGER_INIT_FLAG = 'ledgerInitialized';
export const ZERO_64 = '0'.repeat(64);
export const MAX_LEDGER_ENTRIES = 5000;

/** Helper: deterministic JSON with sorted keys (excluding hash). */
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

/** Load a specific entry by sequence number. */
async function loadEntry(store: Store, seq: number): Promise<LedgerEntry | null> {
  return store.get<LedgerEntry>(`${LEDGER_KEY_PREFIX}${seq}`);
}

/** Get the current head sequence number. */
async function getHead(store: Store): Promise<number> {
  const head = await store.get<number>(LEDGER_HEAD_KEY);
  return head ?? 0;
}

/** Verify the entire ledger chain up to the current head. */
export async function verifyLedger(store: Store): Promise<{
  ok: boolean;
  entries: LedgerEntry[];
  firstBadSeq?: number;
  reason?: string;
}> {
  const head = await getHead(store);
  const entries: LedgerEntry[] = [];
  for (let i = 1; i <= head; i++) {
    const entry = await loadEntry(store, i);
    if (!entry) {
      return { ok: false, entries, firstBadSeq: i, reason: 'missing entry' };
    }
    entries.push(entry);
  }
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const { hash, ...withoutHash } = entry;
    const expectedHash = computeHash(withoutHash as Omit<LedgerEntry, 'hash'>);
    if (hash !== expectedHash) {
      return { ok: false, entries, firstBadSeq: entry.seq, reason: 'hash mismatch' };
    }
    const expectedPrev = i === 0 ? ZERO_64 : entries[i - 1].hash;
    if (entry.prevHash !== expectedPrev) {
      return { ok: false, entries, firstBadSeq: entry.seq, reason: 'prevHash mismatch' };
    }
  }
  return { ok: true, entries };
}

/** Append a new ledger entry after verifying integrity and size limits. */
export async function addLedgerEntry(
  store: Store,
  kind: LedgerKind,
  recordId: string,
  data: any,
): Promise<void> {
  // Verify current chain before appending.
  const verification = await verifyLedger(store);
  if (!verification.ok) {
    throw new Error('Ledger integrity compromised; cannot append new entry');
  }
  const entries = verification.entries;
  if (entries.length >= MAX_LEDGER_ENTRIES) {
    throw new Error('Ledger size limit exceeded');
  }
  const seq = entries.length + 1;
  const at = new Date().toISOString();
  const prevHash = entries.length === 0 ? ZERO_64 : entries[entries.length - 1].hash;
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
  // Store entry under its own key and update head.
  await store.set(`${LEDGER_KEY_PREFIX}${seq}`, entry);
  await store.set(LEDGER_HEAD_KEY, seq);
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
