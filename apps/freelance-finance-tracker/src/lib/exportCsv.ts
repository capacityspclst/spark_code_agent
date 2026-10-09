import { getStore } from './storage';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { Receipt, MileageEntry } from './models';

/** Generate a CSV string containing receipts and mileage entries. */
export async function generateCsv(): Promise<string> {
  const store = getStore();
  const receipts: Receipt[] = await getAllReceipts(store);
  const mileage: MileageEntry[] = await getAllMileageEntries(store);
  const lines: string[] = [];
  // receipts header
  lines.push('type,amount,date,category,receiptType,notes,photoUri');
  for (const r of receipts) {
    const safe = (s: any) => (s !== undefined && s !== null ? String(s).replace(/"/g, '""') : '');
    lines.push(
      `receipt,"${safe(r.amount)}","${safe(r.date)}","${safe(r.category)}","${safe(r.type)}","${safe(r.notes)}","${safe(r.photoUri)}"`
    );
  }
  // mileage header
  lines.push('type,date,miles,purpose');
  for (const m of mileage) {
    const safe = (s: any) => (s !== undefined && s !== null ? String(s).replace(/"/g, '""') : '');
    lines.push(`mileage,"${safe(m.date)}","${safe(m.miles)}","${safe(m.purpose)}"`);
  }
  return lines.join('\n');
}
