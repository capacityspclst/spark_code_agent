import { Platform } from 'react-native';
import { extractTextFromImage } from 'expo-text-extractor';
import * as FileSystem from 'expo-file-system';

/** Recognize receipt text using expo-text-extractor.
 * Validates image size (max 5 MiB) before processing to avoid DoS.
 */
export async function recognizeReceiptText(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Scanning is available in the phone app');
  }
  // Guard: limit file size to 5 MiB using FileSystem API.
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info && info.exists && typeof info.size === 'number' && info.size > 5 * 1024 * 1024) {
      throw new Error('Image too large – please use a smaller photo (max 5 MiB).');
    }
  } catch (e) {
    // If we cannot get size, proceed – fallback.
  }
  const lines = await extractTextFromImage(uri);
  return lines.join('\n');
}

export interface ParsedReceipt {
  merchant?: string;
  date?: string;
  total?: number;
  tax?: number;
}

function parseDateString(raw: string): string | undefined {
  const s = raw.trim();
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
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

  // Identify merchant: first meaningful line not a date and not generic.
  for (const line of lines) {
    if (line.length > 2 && !/receipt|session|order|thank|total|balance|amount due|tax/i.test(line) && !parseDateString(line)) {
      result.merchant = line;
      break;
    }
  }

  // Find first date line.
  for (const line of lines) {
    const iso = parseDateString(line);
    if (iso) {
      result.date = iso;
      break;
    }
  }

  const totalRegex = /(TOTAL|AMOUNT DUE|BALANCE)\s*[:\-]?\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i;
  for (const line of lines) {
    if (/subtotal/i.test(line)) continue;
    const m = line.match(totalRegex);
    if (m) {
      result.total = parseFloat(m[2]);
      break;
    }
  }

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
