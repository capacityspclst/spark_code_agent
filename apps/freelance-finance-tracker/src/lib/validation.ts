/* Validation utilities for numeric inputs and backup passphrase.
   Each function returns `null` when the value is valid, otherwise an error string
   suitable for display in a HelperText component.
*/

/** Validate receipt amount: >0, ≤1,000,000, up to 2 decimal places */
export function validateReceiptAmount(value: string): string | null {
  if (!value) return 'Enter a value > 0, ≤ 1 000 000 with up to 2 decimals.';
  const num = Number(value);
  if (isNaN(num) || num <= 0) return 'Enter a value > 0, ≤ 1 000 000 with up to 2 decimals.';
  if (num > 1_000_000) return 'Enter a value > 0, ≤ 1 000 000 with up to 2 decimals.';
  // allow up to two decimal places
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(value)) {
    return 'Enter a value > 0, ≤ 1 000 000 with up to 2 decimals.';
  }
  return null;
}

/** Validate mileage miles: >0, ≤10,000, up to 2 decimals */
export function validateMileageMiles(value: string): string | null {
  if (!value) return 'Enter a value > 0 and ≤ 10 000.';
  const num = Number(value);
  if (isNaN(num) || num <= 0 || num > 10_000) return 'Enter a value > 0 and ≤ 10 000.';
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(value)) {
    return 'Enter a value > 0 and ≤ 10 000.';
  }
  return null;
}

/** Validate mileage rate: 0‑5 dollars per mile */
export function validateMileageRate(value: string): string | null {
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 5) return 'Enter a value ≥ 0 and ≤ 5 $ per mile.';
  return null;
}

/** Validate tax rate: 0‑100 percent */
export function validateTaxRate(value: string): string | null {
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 100) return 'Enter a percentage ≥ 0 and ≤ 100.';
  return null;
}

/** Validate backup passphrase: at least 12 characters */
export function validateBackupPassphrase(p: string): string | null {
  if (p.length < 12) return 'Passphrase must be at least 12 characters.';
  return null;
}
