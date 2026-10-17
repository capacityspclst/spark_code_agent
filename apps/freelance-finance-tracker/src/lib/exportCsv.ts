import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import type { Receipt, MileageEntry } from './models';
import type { Store } from './storage/types';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';
import { appendEntryForExport } from './ledger';
import { getLedger } from './ledgerHelpers';

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
  const escaped = original.replace(/"/g, '""');
  if (/[",\r\n]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

/** Generate a CSV string containing receipts and mileage entries, with a verification line formatted as "entries,headHash,code". */
export async function generateCsv(store?: Store): Promise<string> {
  const s = store ?? (await (await import('./storage')).getStore());
  const receipts: Receipt[] = await getAllReceipts(s);
  const mileage: MileageEntry[] = await getAllMileageEntries(s);
  const lines: string[] = [];
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
  lines.push('id,miles,date,purpose');
  for (const m of mileage) {
    lines.push([
      csvEscape(m.id),
      csvEscape(m.miles),
      csvEscape(m.date),
      csvEscape(m.purpose),
    ].join(','));
  }
  const contentWithoutVerification = lines.join('\n');
  const hashHex = bytesToHex(sha256(utf8ToBytes(contentWithoutVerification)));
  const codeFragment = hashHex.slice(0, 12);
  const ledger = await getLedger(s);
  const entriesCount = ledger.length + 1;
  const headHash = ledger.length ? ledger[ledger.length - 1].hash : '0'.repeat(64);
  const fullCode = codeFragment + headHash;
  await appendEntryForExport('csv', fullCode, entriesCount, headHash, s);
  lines.push(`${entriesCount},${headHash},${fullCode}`);
  return lines.join('\n');
}
