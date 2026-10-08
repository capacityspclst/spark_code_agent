// Mileage calculation helpers.

import type { MileageEntry } from './models';

export const DEFAULT_MILEAGE_RATE = 0.585; // default IRS business rate (USD per mile)

/** Calculate deduction for a single mileage entry. */
export function calculateMileageDeduction(miles: number, rate: number = DEFAULT_MILEAGE_RATE): number {
  return miles * rate;
}

/** Total deduction for a list of entries. */
export function totalMileageDeduction(entries: MileageEntry[], rate: number = DEFAULT_MILEAGE_RATE): number {
  return entries.reduce((sum, e) => sum + calculateMileageDeduction(e.miles, rate), 0);
}
