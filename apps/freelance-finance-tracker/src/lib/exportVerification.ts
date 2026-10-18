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
  // Normalize code: trim and lower case
  const codeNorm = code.trim().toLowerCase();
  // Basic validation: must be a hex string of appropriate length (at least 12 chars)
  if (!/^[0-9a-f]+$/i.test(codeNorm) || codeNorm.length < 12) {
    return { known: false, message: 'Invalid verification code format' };
  }
  // Find ledger entry with matching full verification code (12-char prefix + headHash)
  // Extract the raw 12‑character code if the input includes a label (e.g., "code=abcd1234ef56")
  const codeMatch = codeNorm.match(/([0-9a-f]{12})/);
  const cleanCode = codeMatch ? codeMatch[1] : codeNorm;
  const entry = ledger.find(
    (e: LedgerEntry) => e.kind === 'export.created' && e.data?.code?.toLowerCase() === cleanCode,
  );
  if (!entry) {
    return { known: false, message: 'Verification code not from this app' };
  }
  // Determine if there are later ledger entries beyond this export.
  const laterChanges = ledger.length > entry.seq;
  // The headHash is stored in the entry data (same as entry.hash)
  const headHash = entry.data?.headHash ?? entry.hash;
  return {
    known: true,
    entries: entry.seq,
    headHash,
    laterChanges,
    message: 'Verification code matches an export created by this app',
  };
}
