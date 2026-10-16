// Thin wrapper around Store for the "receipts" collection.
import type { Store, StoredRecord } from './storage/types';
import type { Receipt } from './models';

export async function getAllReceipts(store: Store): Promise<Receipt[]> {
  return store.list<Receipt>('receipts');
}

export async function addReceipt(store: Store, receipt: Receipt): Promise<void> {
  await store.put('receipts', receipt as unknown as StoredRecord);
}

export async function editReceipt(store: Store, receipt: Receipt): Promise<void> {
  // Overwrite existing receipt by id
  await store.put('receipts', receipt as unknown as StoredRecord);
}
