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
    } catch {}
  }
}

export async function editReceipt(store: Store, receipt: Receipt): Promise<void> {
  await store.put('receipts', receipt as unknown as StoredRecord);
  const init = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (init) {
    try {
      await addLedgerEntry(store, 'receipt.corrected', receipt.id, receipt);
    } catch {}
  }
}

export async function deleteReceipt(store: Store, receipt: Receipt): Promise<void> {
  // remove from store
  await store.delete('receipts', receipt.id);
  const init = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (init) {
    try {
      await addLedgerEntry(store, 'receipt.deleted', receipt.id, receipt);
    } catch {}
  }
}
