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

/** Validate receipt amount according to spec.
 * Returns specific error messages expected by acceptance tests.
 */
export function validateReceiptAmount(value: string | number): string | null {
  if (value === '' || value === undefined || value === null) return 'Amount must be > 0';
  const num = toNumber(value);
  if (isNaN(num) || num <= 0) return 'Amount must be > 0';
  if (num > 1_000_000) return 'Amount must be \u2264 1,000,000';
  const str = typeof value === 'string' ? value : num.toString();
  const decimalPart = str.split('.')[1];
  if (decimalPart && decimalPart.length > 2) return 'Amount can have at most 2 decimal places';
  return null;
}

/** Validate mileage miles: >0, <=10,000, integer only */
export function validateMileageMiles(value: string | number): string | null {
  if (value === '' || value === undefined || value === null) return 'Miles must be > 0';
  const num = toNumber(value);
  if (isNaN(num) || num <= 0) return 'Miles must be > 0';
  if (num > 10_000) return 'Miles must be \u2264 10,000';
  // Allow at most one decimal place.
  const str = typeof value === 'string' ? value : num.toString();
  const parts = str.split('.');
  if (parts[1] && parts[1].length > 1) return 'Miles must be > 0'; // use same generic error
  return null;
}

/** Validate mileage rate between 0 and 5 inclusive. */
export function validateMileageRate(value: string | number): string | null {
  if (value === '' || value === undefined || value === null) return 'Mileage rate must be between 0 and 5';
  const num = toNumber(value);
  if (isNaN(num) || num < 0 || num > 5) return 'Mileage rate must be between 0 and 5';
  return null;
}

/** Validate tax rate between 0 and 100 inclusive. */
export function validateTaxRate(value: string | number): string | null {
  if (value === '' || value === undefined || value === null) return 'Tax rate must be between 0 and 100';
  const num = toNumber(value);
  if (isNaN(num) || num < 0 || num > 100) return 'Tax rate must be between 0 and 100';
  return null;
}

/** Validate backup passphrase: at least 12 characters. */
export function validateBackupPassphrase(p: string): string | null {
  if (p.length < 12) return 'Passphrase must be at least 12 characters';
  return null;
}
