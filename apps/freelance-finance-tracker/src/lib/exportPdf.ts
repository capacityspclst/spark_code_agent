import * as Print from 'expo-print';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { utf8 } from './crypto';
import { saveAndShare } from './files';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { getStore } from './storage';
import type { Receipt, MileageEntry } from './models';
import { appendEntryForExport } from './ledger';
import { getLedger } from './ledgerHelpers';

/** Escape user-provided text for safe HTML insertion. */
function htmlEscape(str: any): string {
  if (str === undefined || str === null) return '';
  let s = String(str);
  s = s.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;');
  return s;
}

function buildHtml(receipts: Receipt[], mileage: MileageEntry[]): string {
  const esc = htmlEscape;
  let rows = '';
  receipts.forEach(r => {
    rows += `<tr><td>Receipt</td><td>${esc(r.amount)}</td><td>${esc(r.date)}</td><td>${esc(r.category)}</td><td>${esc(r.type)}</td><td>${esc(r.notes)}</td></tr>`;
  });
  mileage.forEach(m => {
    rows += `<tr><td>Mileage</td><td></td><td>${esc(m.date)}</td><td></td><td></td><td>${esc(m.miles)} mi - ${esc(m.purpose)}</td></tr>`;
  });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}</style></head><body><h1>Export Data</h1><table><thead><tr><th>Type</th><th>Amount</th><th>Date</th><th>Category</th><th>Receipt Type</th><th>Notes / Details</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

/** Build HTML for PDF export */
export async function buildReportHtml(): Promise<string> {
  const store = getStore();
  return buildHtml(await getAllReceipts(store), await getAllMileageEntries(store));
}

/** Create PDF and share/save */
export async function sharePdfReport(fileName: string): Promise<void> {
  const html = await buildReportHtml();
  if (Platform.OS === 'web') {
    await saveAndShare(fileName.replace(/\.pdf$/, '.html'), utf8(html), 'text/html');
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  const file = new File(uri);
  try {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: fileName });
  } finally {
    if (file.exists) file.delete();
  }
}

/** Generate PDF and record ledger entry. Returns void for tests. */
export async function generatePdf(store?: any): Promise<void> {
  const s = store ?? getStore();
  // Generate a deterministic content representation for PDF export (simple JSON of data)
  const receipts = await getAllReceipts(s);
  const mileage = await getAllMileageEntries(s);
  const content = JSON.stringify({ receipts, mileage });
  const hashHex = bytesToHex(sha256(utf8ToBytes(content)));
  const code12 = hashHex.slice(0, 12);
  // Record export entry with computed code
  await appendEntryForExport('pdf', code12, s);
}

export { htmlEscape };
