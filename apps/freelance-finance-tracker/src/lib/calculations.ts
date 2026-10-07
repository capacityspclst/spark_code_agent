// src/lib/calculations.ts
import { listReceipts, listMileage, Config, getConfig } from './records';

export async function getTotalIncome(): Promise<number> {
  const receipts = await listReceipts();
  return receipts.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
}

export async function getTotalExpenses(): Promise<number> {
  const receipts = await listReceipts();
  return receipts.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
}

export async function getMileageDeduction(rate: number): Promise<number> {
  const mileage = await listMileage();
  const totalMiles = mileage.reduce((sum, m) => sum + m.miles, 0);
  return totalMiles * rate;
}

export function getEstimatedTax(taxRate: number, income: number, expenses: number, mileageDeduction: number): number {
  const taxable = income - expenses - mileageDeduction;
  const tax = taxable * taxRate;
  return tax > 0 ? tax : 0;
}
