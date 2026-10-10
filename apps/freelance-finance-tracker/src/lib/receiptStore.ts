// Thin wrapper around Store for the "receipts" collection.
import type { Store, StoredRecord } from './storage/types';
import type { Receipt } from './models';

const MAX_RECEIPTS = 10000;

export async function getAllReceipts(store: Store): Promise<Receipt[]> {
  return store.list<Receipt>('receipts');
}

export async function addReceipt(store: Store, receipt: Receipt): Promise<void> {
  const existing = await store.list<Receipt>('receipts');
  if (existing.length >= MAX_RECEIPTS) {
    throw new Error('Maximum number of receipts reached');
  }
  // Cast to StoredRecord to satisfy type constraints.
  await store.put('receipts', receipt as unknown as StoredRecord);
}
