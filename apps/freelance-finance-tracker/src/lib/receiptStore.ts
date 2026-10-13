// Thin wrapper around Store for the "receipts" collection.
import type { Store, StoredRecord } from './storage/types';
import type { Receipt } from './models';
import { addLedgerEntry, LedgerEntry } from './ledger';

const LEDGER_KEY = 'ledger';

export async function getAllReceipts(store: Store): Promise<Receipt[]> {
  return store.list<Receipt>('receipts');
}

export async function addReceipt(store: Store, receipt: Receipt): Promise<void> {
  // Cast to StoredRecord to satisfy type constraints.
  await store.put('receipts', receipt as unknown as StoredRecord);
  // Only record ledger entry if ledger already has entries (i.e., not legacy import phase)
  const existing = await store.get<LedgerEntry[]>(LEDGER_KEY);
  if (existing && existing.length > 0) {
    await addLedgerEntry(store, 'receipt.created', receipt.id, receipt);
  }
}
