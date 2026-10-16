import { Store } from './storage/types';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { LedgerEntry, appendEntryForReceipt, appendEntryForMileage, appendEntryForExport } from './ledger';

/** Retrieve the ledger entries array from the encrypted store. */
export async function getLedger(store: Store): Promise<LedgerEntry[]> {
  const ledger = await store.get<LedgerEntry[]>('ledger');
  return ledger ?? [];
}

/** Store the ledger entries array back into the encrypted store. */
export async function setLedger(store: Store, entries: LedgerEntry[]): Promise<void> {
  await store.set('ledger', entries);
}

/**
 * On first launch, import existing receipts and mileage as ledger entries of kind 'imported'.
 * This runs only once: if a ledger already exists, it does nothing.
 */
export async function initLedgerIfNeeded(store: Store): Promise<void> {
  const existing = await store.get<any>('ledger');
  if (existing) return; // ledger already initialized

  const receipts = await getAllReceipts(store);
  const mileage = await getAllMileageEntries(store);

  const entries: LedgerEntry[] = [];
  const importDate = new Date().toISOString();
  // Helper to add an imported entry
  const addImported = async (kindPrefix: string, recordId: string, data: any) => {
    const seq = entries.length ? entries[entries.length - 1].seq + 1 : 1;
    const prevHash = entries.length ? entries[entries.length - 1].hash : '0'.repeat(64);
    const entryWithoutHash = {
      seq,
      at: importDate,
      kind: 'imported',
      recordId,
      data,
      prevHash,
    } as const;
    // compute hash using ledger module's helper
    const { computeHash } = await import('./ledger');
    const hash = (computeHash as any)(entryWithoutHash);
    const entry: LedgerEntry = { ...entryWithoutHash, hash };
    entries.push(entry);
  };

  for (const r of receipts) {
    await addImported('receipt', r.id, r);
  }
  for (const m of mileage) {
    await addImported('mileage', m.id, m);
  }

  await setLedger(store, entries);
}
