// Thin wrapper around Store for the "mileage" collection.
import type { Store, StoredRecord } from './storage/types';
import type { MileageEntry } from './models';
import { addLedgerEntry } from './ledger';

export async function getAllMileageEntries(store: Store): Promise<MileageEntry[]> {
  return store.list<MileageEntry>('mileage');
}

export async function addMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.put('mileage', entry as unknown as StoredRecord);
  try {
    await addLedgerEntry(store, 'mileage.created', entry.id, entry);
  } catch {}
}

export async function editMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.put('mileage', entry as unknown as StoredRecord);
  try {
    await addLedgerEntry(store, 'mileage.corrected', entry.id, entry);
  } catch {}
}

export async function deleteMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  await store.delete('mileage', entry.id);
  try {
    await addLedgerEntry(store, 'mileage.deleted', entry.id, entry);
  } catch {}
}
