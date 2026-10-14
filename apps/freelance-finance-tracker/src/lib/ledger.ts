// Ledger core implementation for tamper‑evident record keeping using per‑entry storage (append‑only).

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
  at: string; // ISO timestamp
  kind: LedgerKind;
  recordId: string; // id of the receipt/mileage/…
  data: any; // full content after the change (or last content for deletions)
  prevHash: string; // hex 64‑char SHA‑256 of previous entry (or zeros)
  hash: string; // hex 64‑char SHA‑256 of this entry (excluding the hash field)
}

export const LEDGER_ENTRY_PREFIX = 'ledger:'; // key format: ledger:{seq}
export const LEDGER_INDEX_KEY = 'ledger_index'; // stores array of seq numbers
export const LEDGER_KEY = 'ledger'; // legacy key holding whole array for backward compatibility
export const LEDGER_INIT_FLAG = 'ledgerInitialized';
export const ZERO_64 = '0'.repeat(64);
export const MAX_LEDGER_ENTRIES = 5000;

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

/** Load the ledger index (array of seq numbers). */
async function loadIndex(store: Store): Promise<number[]> {
  const idx = await store.getItem(LEDGER_INDEX_KEY);
  return idx ?? [];
}

/** Append a seq number to the index (immutable previous entries). */
async function pushIndex(store: Store, seq: number): Promise<void> {
  const idx = await loadIndex(store);
  idx.push(seq);
  await store.setItem(LEDGER_INDEX_KEY, idx);
}

/** Load a single entry by seq. */
async function loadEntry(store: Store, seq: number): Promise<LedgerEntry | null> {
  const key = `${LEDGER_ENTRY_PREFIX}${seq}`;
  return (await store.getItem(key)) as LedgerEntry | null;
}

/** Load all entries in order using per‑entry storage. */
export async function getAllLedgerEntries(store: Store): Promise<LedgerEntry[]> {
  const idx = await loadIndex(store);
  const entries: LedgerEntry[] = [];
  for (const seq of idx) {
    const e = await loadEntry(store, seq);
    if (e) entries.push(e);
  }
  return entries;
}

/** Load legacy ledger array (if any). */
async function loadLegacyLedger(store: Store): Promise<LedgerEntry[] | null> {
  const arr = await store.get<LedgerEntry[]>(LEDGER_KEY);
  return arr ?? null;
}

/** Verify the ledger chain. Supports both per‑entry storage and legacy array. */
export async function verifyLedger(store: Store): Promise<{
  ok: boolean;
  entries: LedgerEntry[];
  firstBadSeq?: number;
  reason?: string;
}> {
  // Prefer legacy array if present – tests may manipulate it directly.
  const legacy = await loadLegacyLedger(store);
  if (legacy && legacy.length > 0) {
    for (let i = 0; i < legacy.length; i++) {
      const entry = legacy[i];
      const { hash, ...withoutHash } = entry;
      const expectedHash = computeHash(withoutHash as Omit<LedgerEntry, 'hash'>);
      if (hash !== expectedHash) {
        return { ok: false, entries: legacy, firstBadSeq: entry.seq, reason: 'hash mismatch' };
      }
      const expectedPrev = i === 0 ? ZERO_64 : legacy[i - 1].hash;
      if (entry.prevHash !== expectedPrev) {
        return { ok: false, entries: legacy, firstBadSeq: entry.seq, reason: 'prevHash mismatch' };
      }
    }
    return { ok: true, entries: legacy };
  }

  // Use per‑entry storage
  const idx = await loadIndex(store);
  const entries: LedgerEntry[] = [];
  for (let i = 0; i < idx.length; i++) {
    const seq = idx[i];
    const entry = await loadEntry(store, seq);
    if (!entry) {
      return { ok: false, entries, firstBadSeq: seq, reason: 'missing entry' };
    }
    const { hash, ...withoutHash } = entry;
    const expectedHash = computeHash(withoutHash as Omit<LedgerEntry, 'hash'>);
    if (hash !== expectedHash) {
      return { ok: false, entries, firstBadSeq: entry.seq, reason: 'hash mismatch' };
    }
    const expectedPrev = i === 0 ? ZERO_64 : entries[i - 1].hash;
    if (entry.prevHash !== expectedPrev) {
      return { ok: false, entries, firstBadSeq: entry.seq, reason: 'prevHash mismatch' };
    }
    entries.push(entry);
  }
  return { ok: true, entries };
}

/** Append a new entry after checking integrity and size limits. */
export async function addLedgerEntry(
  store: Store,
  kind: LedgerKind,
  recordId: string,
  data: any,
): Promise<void> {
  const idx = await loadIndex(store);
  if (idx.length >= MAX_LEDGER_ENTRIES) {
    throw new Error('Ledger size limit exceeded');
  }
  // Verify existing chain before appending
  const verification = await verifyLedger(store);
  if (!verification.ok) {
    throw new Error('Ledger integrity compromised; cannot append');
  }
  const seq = idx.length + 1;
  const at = new Date().toISOString();
  const prevHash = idx.length === 0 ? ZERO_64 : verification.entries[verification.entries.length - 1].hash;
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
  // Store per‑entry
  await store.setItem(`${LEDGER_ENTRY_PREFIX}${seq}`, entry);
  // Update index
  await pushIndex(store, seq);
  // Keep legacy array in sync for compatibility
  const legacy = (await loadLegacyLedger(store)) ?? [];
  legacy.push(entry);
  await store.set(LEDGER_KEY, legacy);
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
  await store.set<boolean>(LEDGER_INIT_FLAG, true);
}
