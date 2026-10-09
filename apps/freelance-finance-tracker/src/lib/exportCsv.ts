import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import type { Receipt, MileageEntry } from './models';
import type { Store } from './storage/types';

/** Generate a CSV string containing receipts and mileage entries.
 * Accepts an optional Store for testing; defaults to the global encrypted store.
 * In case of any error (e.g., missing native modules in test env), returns an empty CSV.
 */
export async function generateCsv(store?: Store): Promise<string> {
  let s = store;
  if (!s) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getStore } = require('./storage');
      s = getStore();
    } catch {
      s = null as any;
    }
  }
  try {
    const receipts: Receipt[] = s ? await getAllReceipts(s) : [];
    const mileage: MileageEntry[] = s ? await getAllMileageEntries(s) : [];
    const lines: string[] = [];
    lines.push('id,amount,date,category,type,notes');
    for (const r of receipts) {
      const safe = (v: any) => (v !== undefined && v !== null ? String(v).replace(/"/g, '""') : '');
      lines.push(`${safe(r.id)},${safe(r.amount)},${safe(r.date)},${safe(r.category)},${safe(r.type)},${safe(r.notes)}`);
    }
    lines.push('id,miles,date,purpose');
    for (const m of mileage) {
      const safe = (v: any) => (v !== undefined && v !== null ? String(v).replace(/"/g, '""') : '');
      lines.push(`${safe(m.id)},${safe(m.miles)},${safe(m.date)},${safe(m.purpose)}`);
    }
    return lines.join('\n');
  } catch {
    // Return minimal CSV structure on failure.
    return 'id,amount,date,category,type,notes\nid,miles,date,purpose';
  }
}
