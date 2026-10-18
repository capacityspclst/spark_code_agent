import { Store } from './storage/types';
import { getLedger } from './ledgerHelpers';
import { computeHash } from './ledger';

export interface LedgerVerificationResult {
  ok: boolean;
  entries: any[];
  firstBadSeq?: number;
  reason?: string;
}

/** Verify the ledger chain */
export async function verifyLedger(store: Store, entries?: any[]): Promise<LedgerVerificationResult> {
  const ledgerEntries = entries ?? (await getLedger(store));
  if (!Array.isArray(ledgerEntries)) {
    return { ok: false, entries: [], reason: 'Ledger entries not an array' };
  }
  if (ledgerEntries.length === 0) {
    return { ok: false, entries: [], firstBadSeq: 1, reason: 'missing entry' };
  }
  const zeroHash = '0'.repeat(64);
  let prevHash = zeroHash;
  for (let i = 0; i < ledgerEntries.length; i++) {
    const e = ledgerEntries[i];
    const expectedSeq = i + 1;
    if (e.seq !== expectedSeq) {
      const hasExpectedSeqLater = ledgerEntries.some(entry => entry.seq === expectedSeq);
      const reason = hasExpectedSeqLater ? 'out‑of‑order' : 'missing entry';
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason };
    }
    if (e.prevHash !== prevHash) {
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason: 'prevhash mismatch' };
    }
    const recomputed = computeHash({
      seq: e.seq,
      at: e.at,
      kind: e.kind,
      recordId: e.recordId,
      data: e.data,
      prevHash: e.prevHash,
    } as any);
    if (e.hash !== recomputed) {
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason: 'hash mismatch' };
    }
    prevHash = e.hash;
  }
  // If a custom entries array was provided (e.g., from backup), skip storedSeqCount validation
  if (entries) {
    return { ok: true, entries: ledgerEntries };
  }
  const storedSeqCount = await store.get<number>('ledgerSeqCount');
  const highestSeq = ledgerEntries.length ? Math.max(...ledgerEntries.map(e => e.seq)) : 0;
  const expectedCount = storedSeqCount ?? highestSeq;
  if (expectedCount > ledgerEntries.length) {
    const existingSeqs = new Set(ledgerEntries.map(e => e.seq));
    for (let i = 1; i <= expectedCount; i++) {
      if (!existingSeqs.has(i)) {
        return { ok: false, entries: ledgerEntries, firstBadSeq: i, reason: 'missing entry' };
      }
    }
  }
  const seqSet = new Set(ledgerEntries.map(e => e.seq));
  const maxSeq = Math.max(...seqSet);
  for (let i = 1; i <= maxSeq; i++) {
    if (!seqSet.has(i)) {
      return { ok: false, entries: ledgerEntries, firstBadSeq: i, reason: 'missing entry' };
    }
  }
  return { ok: true, entries: ledgerEntries };
}
