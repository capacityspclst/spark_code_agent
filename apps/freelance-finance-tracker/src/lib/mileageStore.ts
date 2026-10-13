// Thin wrapper around Store for the "mileage" collection.
import type { Store, StoredRecord } from './storage/types';
import type { MileageEntry } from './models';
import { addLedgerEntry } from './ledger';

export async function getAllMileageEntries(store: Store): Promise<MileageEntry[]> {
  return store.list<MileageEntry>('mileage');
}

export async function addMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.put('mileage', entry as unknown as StoredRecord);
  await addLedgerEntry(store, 'mileage.created', entry.id, entry);
}
