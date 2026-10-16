import { Store } from './storage/types';
import { getLedger } from './ledgerHelpers';
import { LedgerEntry } from './ledger';

/** Verify an export code against ledger entries.
 * Returns whether the code is known, the number of entries and head hash from the matching export entry,
 * and whether there have been later ledger entries after that export (i.e., later changes).
 */
export async function verifyExportCode(code: string, store: Store): Promise<{ known: boolean; entries?: number; headHash?: string; laterChanges?: boolean }> {
  const ledger = await getLedger(store);
  const entry = ledger.find((e: LedgerEntry) => e.kind === 'export.created' && e.data?.code === code);
  if (!entry) {
    return { known: false };
  }
  const laterChanges = ledger.some((e: LedgerEntry) => e.seq > entry.seq);
  return { known: true, entries: entry.data?.entries, headHash: entry.data?.headHash, laterChanges };
}
