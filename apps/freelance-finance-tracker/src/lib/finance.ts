// Finance calculation helpers.
import type { Receipt } from './models';

export interface Totals {
  income: number;
  expenses: number;
  // Additional fields (mileage, tax) can be added later.
}

/** Compute total income and expenses from a list of receipts. */
export function computeTotals(receipts: Receipt[]): Totals {
  let income = 0;
  let expenses = 0;
  for (const r of receipts) {
    if (r.type === 'income') {
      income += r.amount;
    } else {
      expenses += r.amount;
    }
  }
  return { income, expenses };
}
