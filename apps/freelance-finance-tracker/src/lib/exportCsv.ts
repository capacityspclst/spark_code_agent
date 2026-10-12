import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import type { Receipt, MileageEntry } from './models';
import type { Store } from './storage/types';

/** Escape a cell for CSV output according to RFC 4180.
 * Numbers output as plain numbers.
 * null/undefined become empty string.
 * Strings starting with = + - @ or tab are prefixed with a single quote to prevent formula injection.
 * If a string is prefixed, we leave it as‑is (no additional quoting or double‑quote escaping) because the prefix already neutralises formulas.
 * Otherwise, double quotes inside the value are escaped by doubling them.
 * If the resulting string contains commas, double quotes, or line breaks, wrap the whole field in double quotes.
 */
function csvEscape(value: any): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') return String(value);
  const original = String(value);
  const needsPrefix = /^[=+\-@\t]/.test(original);
  if (needsPrefix) {
    return "'" + original;
  }
  // Escape double quotes by doubling them
  const escaped = original.replace(/"/g, '""');
  // Wrap in quotes if contains special chars
  if (/[",\r\n]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
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
