import { Store } from './storage/types';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { LedgerEntry, computeHash } from './ledger';

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
  // Run import only once, even if ledger already has entries.
  const flag = await store.get<boolean>('ledgerInitialized');
  if (flag) return;

  const receipts = await getAllReceipts(store);
  const mileage = await getAllMileageEntries(store);

  const entries: LedgerEntry[] = [];

  const addImported = (recordId: string, data: any) => {
    const seq = entries.length ? entries[entries.length - 1].seq + 1 : 1;
    const prevHash = entries.length ? entries[entries.length - 1].hash : '0'.repeat(64);
    const at = new Date().toISOString();
    const entryWithoutHash = {
      seq,
      at,
      kind: 'imported',
      recordId,
      data,
      prevHash,
    } as const;
    const hash = computeHash(entryWithoutHash as any);
    const entry: LedgerEntry = { ...entryWithoutHash, hash } as LedgerEntry;
    entries.push(entry);
  };

  for (const r of receipts) {
    addImported(r.id, r);
  }
  for (const m of mileage) {
    addImported(m.id, m);
  }

  await setLedger(store, entries);
  // Record the highest sequence number for verification of missing trailing entries
  await store.set('ledgerSeqCount', entries.length);
  await store.set('ledgerInitialized', true);
}

/** Import any missing receipts/mileage as 'imported' entries (used after restore). */
export async function importMissingAsImported(store: Store): Promise<void> {
  const ledger = await getLedger(store);
  const receipts = await getAllReceipts(store);
  const mileage = await getAllMileageEntries(store);

  const hasImported = (recordId: string) => ledger.some(e => e.recordId === recordId && e.kind === 'imported');

  const entries = [...ledger];

  const addImported = (recordId: string, data: any) => {
    const seq = entries.length ? entries[entries.length - 1].seq + 1 : 1;
    const prevHash = entries.length ? entries[entries.length - 1].hash : '0'.repeat(64);
    const at = new Date().toISOString();
    const entryWithoutHash = {
      seq,
      at,
      kind: 'imported',
      recordId,
      data,
      prevHash,
    } as const;
    const hash = computeHash(entryWithoutHash as any);
    const entry: LedgerEntry = { ...entryWithoutHash, hash } as LedgerEntry;
    entries.push(entry);
  };

  for (const r of receipts) {
    if (!hasImported(r.id)) addImported(r.id, r);
  }
  for (const m of mileage) {
    if (!hasImported(m.id)) addImported(m.id, m);
  }

  await setLedger(store, entries);
}
