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
  // After processing all entries, detect any missing sequence numbers
  if (ledgerEntries.length > 0) {
    const seqSet = new Set(ledgerEntries.map(e => e.seq));
    const maxSeq = Math.max(...seqSet);
    for (let i = 1; i <= maxSeq; i++) {
      if (!seqSet.has(i)) {
        return { ok: false, entries: ledgerEntries, firstBadSeq: i, reason: 'missing entry' };
      }
    }
  }
  return { ok: true, entries: ledgerEntries };
}
