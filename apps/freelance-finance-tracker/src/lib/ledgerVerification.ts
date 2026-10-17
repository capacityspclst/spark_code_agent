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
    // Sequence check
    if (e.seq !== expectedSeq) {
      // If the seq is greater than expected, entries are missing
      const reason = e.seq > expectedSeq ? 'missing entry' : 'seq mismatch';
      return { ok: false, entries: ledgerEntries, firstBadSeq: expectedSeq, reason };
    }
    // PrevHash check
    if (e.prevHash !== prevHash) {
      // If seq is correct but prevHash doesn't match, likely out‑of‑order
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason: 'out‑of‑order' };
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
  return { ok: true, entries: ledgerEntries };
}
