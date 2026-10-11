import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import type { Receipt, MileageEntry } from './models';
import type { Store } from './storage/types';

/** Escape a cell for CSV output.
 * Numbers output as plain numbers.
 * null/undefined become empty string.
 * Strings starting with = + - @ or tab carriage return get prefixed with a single quote to prevent formula injection.
 * If the resulting string contains commas, double quotes, or line breaks, wrap in double quotes (doubling inner quotes).
 */
function csvEscape(value: any): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') return String(value);
  let s = String(value);
  // Escape formula injection
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  } else if (s.includes('"')) {
    s = s.replace(/"/g, '""');
  }
  const needsWrap = /[",\r\n]/.test(s);
  if (needsWrap) return `"${s}"`;
  return s;
}

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
    const lines: string[] = [];
    // Header for receipts
    lines.push('id,amount,date,category,type,notes');
    for (const r of receipts) {
      lines.push([
        csvEscape(r.id),
        csvEscape(r.amount),
        csvEscape(r.date),
        csvEscape(r.category),
        csvEscape(r.type),
        csvEscape(r.notes),
      ].join(','));
    }
    // Header for mileage
    lines.push('id,miles,date,purpose');
    for (const m of mileage) {
      lines.push([
        csvEscape(m.id),
        csvEscape(m.miles),
        csvEscape(m.date),
        csvEscape(m.purpose),
      ].join(','));
    }
    return lines.join('\n');
  } catch {
    // Minimal CSV on failure
    return 'id,amount,date,category,type,notes\nid,miles,date,purpose';
  }
}
