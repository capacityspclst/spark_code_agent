import { Store } from './storage/types';
import { getLedger } from './ledgerHelpers';

export interface LedgerVerificationResult {
  ok: boolean;
  entries: any[];
  firstBadSeq?: number;
  reason?: string;
}

/**
 * Verify the ledger chain.
 */
export async function verifyLedger(store: Store): Promise<LedgerVerificationResult> {
  const entries = await getLedger(store);
  if (!Array.isArray(entries)) {
    return { ok: false, entries: [], reason: 'Ledger entries not an array' };
  }
  let prevHash = '0'.repeat(64);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    // seq continuity
    const expectedSeq = i + 1;
    if (e.seq !== expectedSeq) {
      return { ok: false, entries, firstBadSeq: e.seq, reason: `Seq mismatch at ${e.seq}` };
    }
    // prevHash match
    if (e.prevHash !== prevHash) {
      return { ok: false, entries, firstBadSeq: e.seq, reason: 'prevHash mismatch' };
    }
    // recompute hash
    const { hash, ...withoutHash } = e;
    const json = JSON.stringify(Object.keys(withoutHash).sort().reduce((obj, key) => ({ ...obj, [key]: (withoutHash as any)[key] }), {}));
    const computed = bytesToHex(sha256(utf8ToBytes(json)));
    if (hash !== computed) {
      return { ok: false, entries, firstBadSeq: e.seq, reason: 'hash mismatch' };
    }
    prevHash = e.hash;
  }
  return { ok: true, entries };
}
