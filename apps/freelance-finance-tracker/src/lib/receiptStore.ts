// Thin wrapper around Store for the "receipts" collection.
import type { Store, StoredRecord } from './storage/types';
import type { Receipt } from './models';
import { addLedgerEntry, LEDGER_INIT_FLAG } from './ledger';

export async function getAllReceipts(store: Store): Promise<Receipt[]> {
  return store.list<Receipt>('receipts');
}

export async function addReceipt(store: Store, receipt: Receipt): Promise<void> {
  await store.put('receipts', receipt as unknown as StoredRecord);
  // Record ledger entry for creation only after ledger is initialized
  const init = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (init) {
    try {
      await addLedgerEntry(store, 'receipt.created', receipt.id, receipt);
    } catch (e) {
      // If ledger size exceeded, surface a friendly error (could be caught by UI)
      console.error('Failed to add ledger entry for receipt creation:', e);
      throw e;
    }
  }
}

/** Edit an existing receipt; logs a corrected ledger entry. */
export async function editReceipt(store: Store, receipt: Receipt): Promise<void> {
  await store.put('receipts', receipt as unknown as StoredRecord);
  const init = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (init) {
    try {
      await addLedgerEntry(store, 'receipt.corrected', receipt.id, receipt);
    } catch (e) {
      console.error('Failed to add ledger entry for receipt correction:', e);
      throw e;
    }
  }
}

/** Delete a receipt; logs a deleted ledger entry containing last known content. */
export async function deleteReceipt(store: Store, receiptId: string): Promise<void> {
  // Retrieve last known content before deletion for ledger record
  const existing = await store.get<Receipt>(receiptId);
  await store.delete('receipts', receiptId);
  const init = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (init && existing) {
    try {
      await addLedgerEntry(store, 'receipt.deleted', receiptId, existing);
    } catch (e) {
      console.error('Failed to add ledger entry for receipt deletion:', e);
      throw e;
    }
  }
}
