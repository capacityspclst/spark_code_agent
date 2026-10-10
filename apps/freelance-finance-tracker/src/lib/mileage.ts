import type { MileageEntry } from './models';
import { getMileageRate } from './settings';
import { getStore } from './storage';

/** Calculate deduction for a single mileage entry. */
export function calculateMileageDeduction(miles: number, rate: number): number {
  return miles * rate;
}

/** Total deduction for a list of entries using the provided rate. */
export async function totalMileageDeduction(entries: MileageEntry[]): Promise<number> {
  const store = getStore();
  const rate = await getMileageRate(store);
  return entries.reduce((sum, e) => sum + calculateMileageDeduction(e.miles, rate), 0);
}
