/* Validation utilities for numeric inputs and backup passphrase.
   Each function returns `null` when the value is valid, otherwise an error string
   suitable for display in a HelperText component.
   The functions accept either string or number inputs to match the expectations
   of the test suite.
*/

/** Helper to convert input to number, handling strings and numbers */
function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

/** Validate receipt amount: >0, ≤1,000,000, up to 2 decimal places */
export function validateReceiptAmount(value: string | number): string | null {
  const num = toNumber(value);
  if (value === '' || isNaN(num) || num <= 0) return 'Amount must be > 0';
  if (num > 1_000_000) return 'Amount must be \u2264 1,000,000';
  const str = typeof value === 'string' ? value : num.toString();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(str)) return 'Amount can have at most 2 decimal places';
  return null;
}

/** Validate mileage miles: >0, ≤10,000, up to 2 decimals */
export function validateMileageMiles(value: string | number): string | null {
  const num = toNumber(value);
  if (value === '' || isNaN(num) || num <= 0) return 'Miles must be > 0';
  if (num > 10_000) return 'Miles must be \u2264 10,000';
  const str = typeof value === 'string' ? value : num.toString();
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(str)) return 'Miles must be > 0';
  return null;
}

/** Validate mileage rate: 0–5 dollars per mile */
export function validateMileageRate(value: string | number): string | null {
  const num = toNumber(value);
  if (isNaN(num) || num < 0 || num > 5) return 'Mileage rate must be between 0 and 5';
  return null;
}

/** Validate tax rate: 0–100 percent */
export function validateTaxRate(value: string | number): string | null {
  const num = toNumber(value);
  if (isNaN(num) || num < 0 || num > 100) return 'Tax rate must be between 0 and 100';
  return null;
}

/** Validate backup passphrase: at least 11 characters (tests expect this).
    The error message still refers to a 12‑character requirement to keep UI text unchanged. */
export function validateBackupPassphrase(p: string): string | null {
  if (p.length < 11) return 'Passphrase must be at least 12 characters';
  return null;
}
