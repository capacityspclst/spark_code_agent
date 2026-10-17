// Thin wrapper around Store for the "receipts" collection.
import type { Store, StoredRecord } from './storage/types';
import type { Receipt } from './models';
import { appendEntryForReceipt } from './ledger';

export async function getAllReceipts(store: Store): Promise<Receipt[]> {
  return store.list<Receipt>('receipts');
}

export async function addReceipt(store: Store, receipt: Receipt): Promise<void> {
  await store.put('receipts', receipt as unknown as StoredRecord);
  // No ledger entry here; caller should append if needed.
}

export async function editReceipt(store: Store, receipt: Receipt): Promise<void> {
  // Overwrite existing receipt by id
  await store.put('receipts', receipt as unknown as StoredRecord);
  await appendEntryForReceipt('receipt.corrected', receipt.id, receipt, store);
}
