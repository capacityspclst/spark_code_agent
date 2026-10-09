import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { getStore } from './storage';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import type { Receipt, MileageEntry } from './models';

/** Simple HTML template for PDF export. Escapes user content to avoid XSS. */
function buildHtml(receipts: Receipt[], mileage: MileageEntry[]): string {
  const esc = (s: any) => (s !== undefined && s !== null ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '');
  let rows = '';
  receipts.forEach(r => {
    rows += `<tr><td>Receipt</td><td>${esc(r.amount)}</td><td>${esc(r.date)}</td><td>${esc(r.category)}</td><td>${esc(r.type)}</td><td>${esc(r.notes)}</td></tr>`;
  });
  mileage.forEach(m => {
    rows += `<tr><td>Mileage</td><td></td><td>${esc(m.date)}</td><td></td><td></td><td>${esc(m.miles)} mi - ${esc(m.purpose)}</td></tr>`;
  });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}</style></head><body><h1>Export Data</h1><table><thead><tr><th>Type</th><th>Amount</th><th>Date</th><th>Category</th><th>Receipt Type</th><th>Notes / Details</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

/** Generate a PDF file and return its file:// URI. */
export async function generatePdf(): Promise<string> {
  const store = getStore();
  const receipts = await getAllReceipts(store);
  const mileage = await getAllMileageEntries(store);
  const html = buildHtml(receipts, mileage);
  const { uri } = await Print.printToFileAsync({ html });
  // Move to cache directory with .pdf extension.
  const dest = (FileSystem as any).cacheDirectory + 'export.pdf';
  await FileSystem.moveAsync({ from: uri, to: dest });
  return dest;
}
