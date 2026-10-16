import { Store } from './storage/types';

export interface LedgerVerificationResult {
  ok: boolean;
  entries: any[];
  firstBadSeq?: number;
  reason?: string;
}

/**
 * Very basic verification stub: checks that entries is an array and that each entry has a numeric seq.
 * Real implementation should recompute hashes and chain integrity.
 */
export async function verifyLedger(store: Store, entries: any[]): Promise<LedgerVerificationResult> {
  if (!Array.isArray(entries)) {
    return { ok: false, entries: [], reason: 'Ledger entries not an array' };
  }
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (typeof e.seq !== 'number') {
      return { ok: false, entries, firstBadSeq: i, reason: 'Missing seq' };
    }
    // further checks omitted for brevity
  }
  return { ok: true, entries };
}
