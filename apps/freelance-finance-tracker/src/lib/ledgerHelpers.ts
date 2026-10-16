import { Store } from './storage/types';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { appendLedgerEntry } from './ledger';

/**
 * Placeholder init: on first launch, imports existing data as ledger entries.
 * Real implementation would check a flag; here we simply do nothing.
 */
export async function initLedgerIfNeeded(store: Store): Promise<void> {
  // No-op for now.
}
