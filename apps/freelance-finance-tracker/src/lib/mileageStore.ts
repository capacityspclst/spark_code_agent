// Thin wrapper around Store for the "mileage" collection.
import type { Store, StoredRecord } from './storage/types';
import type { MileageEntry } from './models';
import { appendEntryForMileage } from './ledger';

export async function getAllMileageEntries(store: Store): Promise<MileageEntry[]> {
  return store.list<MileageEntry>('mileage');
}

export async function addMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.put('mileage', entry as unknown as StoredRecord);
  await appendEntryForMileage('mileage.created', entry.id, entry, store);
}

export async function editMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.put('mileage', entry as unknown as StoredRecord);
  await appendEntryForMileage('mileage.corrected', entry.id, entry, store);
}

export async function deleteMileageEntry(store: Store, id: string, entry: MileageEntry): Promise<void> {
  await store.delete('mileage', id);
  await appendEntryForMileage('mileage.deleted', id, entry, store);
}
