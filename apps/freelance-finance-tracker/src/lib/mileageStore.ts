// Thin wrapper around Store for the "mileage" collection.
import type { Store, StoredRecord } from './storage/types';
import type { MileageEntry } from './models';

const MAX_MILEAGE_ENTRIES = 5000;

export async function getAllMileageEntries(store: Store): Promise<MileageEntry[]> {
  return store.list<MileageEntry>('mileage');
}

export async function addMileageEntry(store: Store, entry: MileageEntry): Promise<void> {
  const existing = await store.list<MileageEntry>('mileage');
  if (existing.length >= MAX_MILEAGE_ENTRIES) {
    throw new Error('Maximum number of mileage entries reached');
  }
  await store.put('mileage', entry as unknown as StoredRecord);
}
