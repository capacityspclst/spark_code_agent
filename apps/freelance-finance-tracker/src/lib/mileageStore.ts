// Thin wrapper around Store for the "mileage" collection.
import type { Store, StoredRecord } from './storage/types';
import type { MileageEntry } from './models';
import { addLedgerEntry, LEDGER_INIT_FLAG } from './ledger';

export async function getAllMileageEntries(store: Store): Promise<MileageEntry[]> {
  return store.list<MileageEntry>('mileage');
}

export async function addMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.put('mileage', entry as unknown as StoredRecord);
  await addLedgerEntry(store, 'mileage.created', entry.id, entry);
}

/** Edit an existing mileage entry; logs a corrected ledger entry. */
export async function editMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.put('mileage', entry as unknown as StoredRecord);
  const init = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (init) {
    await addLedgerEntry(store, 'mileage.corrected', entry.id, entry);
  }
}

/** Delete a mileage entry; logs a deleted ledger entry with last known content. */
export async function deleteMileageEntry(store: Store, entryId: string): Promise<void> {
  const existing = await store.get<MileageEntry>(entryId);
  await store.delete('mileage', entryId);
  const init = await store.get<boolean>(LEDGER_INIT_FLAG);
  if (init && existing) {
    await addLedgerEntry(store, 'mileage.deleted', entryId, existing);
  }
}
