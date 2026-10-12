import { Platform } from 'react-native';
import * as TextExtractor from 'expo-text-extractor';

/**
 * Recognize text from a receipt image URI using expo-text-extractor.
 * On web platform, throws an error indicating unavailability.
 */
export async function recognizeReceiptText(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Scanning is available in the phone app');
  }
  // expo-text-extractor provides extractTextFromImage which returns an array of lines
  const lines = await TextExtractor.extractTextFromImage(uri);
  // Join lines with newline to form full text
  return lines.join('\n');
}

/**
 * Simple parser for receipt text.
 * Returns optional fields: merchant, date (ISO string), total (number), tax (number).
 */
export interface ParsedReceipt {
  merchant?: string;
  date?: string;
  total?: number;
  tax?: number;
}

export function parseReceipt(text: string): ParsedReceipt {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const result: ParsedReceipt = {};
  // Merchant: first non‑trivial line (ignore common headers)
  for (const line of lines) {
    if (line.length > 2 && !/receipt|store|session|order|thank/i.test(line)) {
      result.merchant = line;
      break;
    }
  }
  // Date detection (US formats)
  const dateRegex = /(?:0?[1-9]|1[0-2])[\/-](?:0?[1-9]|[12][0-9]|3[01])[\/-]\d{2,4}|\d{4}[\/-](?:0?[1-9]|1[0-2])[\/-](?:0?[1-9]|[12][0-9]|3[01])/i;
  for (const line of lines) {
    const m = line.match(dateRegex);
    if (m) {
      const raw = m[0];
      const parts = raw.split(/[\/-]/);
      let iso = '';
      if (parts[0].length === 4) {
        iso = `${parts[0].padStart(4, '0')}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        iso = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
      result.date = iso;
      break;
    }
  }
  // Total detection
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
