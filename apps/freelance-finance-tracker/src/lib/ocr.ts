import { Platform } from 'react-native';
import { extractTextFromImage, isSupported } from 'expo-text-extractor';

/** Recognize receipt text using expo-text-extractor. */
export async function recognizeReceiptText(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Scanning is available in the phone app');
  }
  // extractTextFromImage returns an array of lines
  const lines = await extractTextFromImage(uri);
  return lines.join('\n');
}

export interface ParsedReceipt {
  merchant?: string;
  date?: string;
  total?: number;
  tax?: number;
}

/** Helper to parse a date string into ISO format. Returns undefined if not a recognized date. */
function parseDateString(raw: string): string | undefined {
  const s = raw.trim();
  // YYYY/MM/DD or YYYY-MM-DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // MM/DD/YYYY or MM-DD-YYYY
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // MM/DD/YY (assume 20xx)
  const mdyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (mdyy) {
    const [, m, d, yy] = mdyy;
    const y = `20${yy}`;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return undefined;
}

export function parseReceipt(text: string): ParsedReceipt {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result: ParsedReceipt = {};

  // Find first date line and its index
  let dateIdx: number | undefined;
  for (let i = 0; i < lines.length; i++) {
    const iso = parseDateString(lines[i]);
    if (iso) {
      result.date = iso;
      dateIdx = i;
      break;
    }
  }

  // Merchant: first non‑trivial line that is not a date line.
  for (let i = 0; i < lines.length; i++) {
    if (i === dateIdx) continue;
    const line = lines[i];
    if (line.length > 2 && !/receipt|session|order|thank/i.test(line) && !parseDateString(line)) {
      result.merchant = line;
      break;
    }
  }

  // Total detection (ignore subtotal lines)
  const totalRegex = /(TOTAL|AMOUNT DUE|BALANCE)\s*[:\-]?\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i;
  for (const line of lines) {
    if (/subtotal/i.test(line)) continue;
    const m = line.match(totalRegex);
    if (m) {
      result.total = parseFloat(m[2]);
      break;
    }
  }

  // Tax detection
  const taxRegex = /TAX\s*[:\-]?\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i;
  for (const line of lines) {
    const m = line.match(taxRegex);
    if (m) {
      result.tax = parseFloat(m[1]);
      break;
    }
  }

  return result;
}
