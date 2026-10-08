// Core data models for the finance tracker app.

export type ReceiptType = 'expense' | 'income';

export interface Receipt {
  id: string;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  category: string;
  type: ReceiptType;
  notes: string;
  photoUri?: string;
  [field: string]: unknown; // allow indexing for StoredRecord compatibility
}

export interface MileageEntry {
  id: string;
  date: string; // ISO date
  miles: number;
  purpose: string;
  [field: string]: unknown;
}
