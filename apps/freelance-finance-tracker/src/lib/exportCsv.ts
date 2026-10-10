import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import type { Receipt, MileageEntry } from './models';
import type { Store } from './storage/types';

/** Escape a cell for CSV output.
 * - Numbers are output as plain numbers.
 * - undefined/null become empty string.
 * - For strings, if it starts with = + - @ \t \r, prefix with a single quote to prevent formula injection.
 * - If the resulting string contains commas, double quotes, or line breaks, wrap the entire cell in double quotes.
 *   Escape internal double quotes by doubling them.
 */
function csvEscape(value: any): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') return String(value);
  let s = String(value);
  // Neutralise CSV injection formulas.
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }
  const needsWrap = /[",\r\n]/.test(s);
  if (needsWrap) {
    // Escape inner double quotes by doubling them.
    s = s.replace(/"/g, '""');
    return `"${s}"`;
  }
  return s;
}

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
      const line = [
        csvEscape(r.id),
        csvEscape(r.amount),
        csvEscape(r.date),
        csvEscape(r.category),
        csvEscape(r.type),
        csvEscape(r.notes),
      ].join(',');
      lines.push(line);
    }
    lines.push('id,miles,date,purpose');
    for (const m of mileage) {
      const line = [
        csvEscape(m.id),
        csvEscape(m.miles),
        csvEscape(m.date),
        csvEscape(m.purpose),
      ].join(',');
      lines.push(line);
    }
    return lines.join('\n');
  } catch {
    // Return minimal CSV structure on failure.
    return 'id,amount,date,category,type,notes\nid,miles,date,purpose';
  }
}
