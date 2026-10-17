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
  const zeroHash = '0'.repeat(64);
  let prevHash = zeroHash;
  for (let i = 0; i < ledgerEntries.length; i++) {
    const e = ledgerEntries[i];
    const expectedSeq = i + 1;
    // Sequence check – missing or out‑of‑order
    if (e.seq !== expectedSeq) {
      // Determine if missing entry or out‑of‑order
      const hasExpectedSeqLater = ledgerEntries.some(entry => entry.seq === expectedSeq);
      const reason = hasExpectedSeqLater ? 'out‑of‑order' : 'missing entry';
      const firstBadSeq = e.seq;
      return { ok: false, entries: ledgerEntries, firstBadSeq, reason };
    }
    // PrevHash check
    if (e.prevHash !== prevHash) {
      // PrevHash does not match expected previous hash
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason: 'prevhash mismatch' };
    }
    // Hash integrity
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
  // After processing all entries, check for missing trailing entries (gap after last seq)
  if (ledgerEntries.length > 0) {
    const maxSeq = Math.max(...ledgerEntries.map(e => e.seq));
    if (maxSeq > ledgerEntries.length) {
      // missing entry after the last present one
      return { ok: false, entries: ledgerEntries, firstBadSeq: ledgerEntries.length + 1, reason: 'missing entry' };
    }
  }
  return { ok: true, entries: ledgerEntries };
}
