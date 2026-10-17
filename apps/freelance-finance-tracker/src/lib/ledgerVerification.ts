import { Store } from './storage/types';
import { getLedger } from './ledgerHelpers';
import { sha256, utf8ToBytes, bytesToHex } from './hash';

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
  let prevHash = '0'.repeat(64);
  for (let i = 0; i < ledgerEntries.length; i++) {
    const e = ledgerEntries[i];
    const expectedSeq = i + 1;
    if (e.seq !== expectedSeq) {
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason: `Seq mismatch at ${e.seq}` };
    }
    if (e.prevHash !== prevHash) {
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason: 'prevHash mismatch' };
    }
    const { hash, ...withoutHash } = e;
    const json = JSON.stringify(Object.keys(withoutHash).sort().reduce((obj, key) => ({ ...obj, [key]: (withoutHash as any)[key] }), {}));
    const computed = bytesToHex(sha256(utf8ToBytes(json)));
    if (hash !== computed) {
      return { ok: false, entries: ledgerEntries, firstBadSeq: e.seq, reason: 'hash mismatch' };
    }
    prevHash = e.hash;
  }
  return { ok: true, entries: ledgerEntries };
}
