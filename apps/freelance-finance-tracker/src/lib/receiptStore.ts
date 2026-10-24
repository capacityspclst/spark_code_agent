// Thin wrapper around Store for the "receipts" collection.
import type { Store, StoredRecord } from './storage/types';
import type { Receipt } from './models';

export async function getAllReceipts(store: Store): Promise<Receipt[]> {
  return store.list<Receipt>('receipts');
}

export async function addReceipt(store: Store, receipt: Receipt): Promise<void> {
  await store.put('receipts', receipt as unknown as StoredRecord);
}

/** Update an existing receipt. */
export async function updateReceipt(store: Store, receipt: Receipt): Promise<void> {
  // Assuming receipt.id exists, replace the record.
  await store.put('receipts', receipt as unknown as StoredRecord);
}
