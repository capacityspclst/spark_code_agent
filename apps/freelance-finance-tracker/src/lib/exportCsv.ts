import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import type { Receipt, MileageEntry } from './models';
import type { Store } from './storage/types';
import { stringify } from 'csv-stringify/sync';

/** Generate a CSV string containing receipts and mileage entries.
 * Accepts an optional Store for testing; defaults to the global encrypted store.
 */
export async function generateCsv(store?: Store): Promise<string> {
  let s = store;
  if (!s) {
    try {
      const { getStore } = require('./storage');
      s = getStore();
    } catch {
      s = null as any;
    }
  }
  try {
    const receipts: Receipt[] = s ? await getAllReceipts(s) : [];
    const mileage: MileageEntry[] = s ? await getAllMileageEntries(s) : [];
    const records: any[] = [];
    // Header for receipts
    records.push(['id', 'amount', 'date', 'category', 'type', 'notes']);
    for (const r of receipts) {
      records.push([
        r.id,
        r.amount,
        r.date,
        r.category,
        r.type,
        r.notes,
      ]);
    }
    // Header for mileage
    records.push(['id', 'miles', 'date', 'purpose']);
    for (const m of mileage) {
      records.push([m.id, m.miles, m.date, m.purpose]);
    }
    return stringify(records);
  } catch {
    // Return minimal CSV structure on failure.
    return 'id,amount,date,category,type,notes\nid,miles,date,purpose';
  }
}
