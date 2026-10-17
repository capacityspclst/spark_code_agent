import { Store } from './storage/types';
import { getLedger } from './ledgerHelpers';
import { LedgerEntry } from './ledger';

/** Verify an export code against ledger entries.
 * Returns whether the code is known, the ledger sequence number of the export entry,
 * the appropriate headHash (previous hash for CSV, entry hash for PDF),
 * whether there have been later ledger entries after that export,
 * and a human‑readable message.
 */
export async function verifyExportCode(
  code: string,
  store: Store,
): Promise<{ known: boolean; entries?: number; headHash?: string; laterChanges?: boolean; message?: string }> {
  const ledger = await getLedger(store);
  // Accept either full verification code (12+64) or just the 12‑char fragment.
  const codeFragment = code.length > 12 ? code.slice(0, 12) : code;
  const entry = ledger.find(
    (e: LedgerEntry) => e.kind === 'export.created' && e.data?.code === codeFragment,
  );
  if (!entry) {
    return { known: false, message: 'Verification code not from this app' };
  }
  const laterChanges = ledger.some((e: LedgerEntry) => e.seq > entry.seq);
  // For CSV the headHash is the previous hash stored in the entry data; for PDF it's the entry's own hash.
  const headHash = entry.data?.headHash ?? entry.hash;
  return {
    known: true,
    entries: entry.seq,
    headHash,
    laterChanges,
    message: 'Verification code matches an export created by this app',
  };
}
