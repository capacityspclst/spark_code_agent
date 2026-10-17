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
  // Extract a 12‑char hex code fragment from the input, ignoring any surrounding text.
  // Accept full verification code which is 12-char prefix + headHash (total 76 hex chars)
  const match = code.match(/[0-9a-f]{12}[0-9a-f]{64}/i);
  const codeFragment = match ? match[0] : '';
  if (!codeFragment) {
    return { known: false, message: 'Invalid verification code format' };
  }
  const entry = ledger.find(
    (e: LedgerEntry) => e.kind === 'export.created' && e.data?.code === codeFragment,
  );
  if (!entry) {
    return { known: false, message: 'Verification code not from this app' };
  }
  // Determine if there are later ledger entries beyond this export.
  const laterChanges = ledger.length > (entry.data?.entries ?? entry.seq);
  // For both CSV and PDF the headHash stored in the entry data is the entry's own hash.
  const headHash = entry.data?.headHash ?? entry.hash;
  return {
    known: true,
    entries: entry.seq,
    headHash,
    laterChanges,
    message: 'Verification code matches an export created by this app',
  };
}
