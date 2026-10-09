import { getStore } from './storage';

// Keys for settings stored in the encrypted store.
const MILEAGE_RATE_KEY = 'settings.mileageRate';
const TAX_RATE_KEY = 'settings.taxRate';
const APP_LOCK_KEY = 'settings.appLockEnabled';

/** Default values used if no setting is persisted yet. */
export const DEFAULT_MILEAGE_RATE = 0.655; // USD per mile (example IRS rate)
export const DEFAULT_TAX_RATE = 0.22; // 22% default tax rate

/** Getters */
export async function getMileageRate(): Promise<number> {
  const stored = await getStore().get<number>(MILEAGE_RATE_KEY);
  return stored ?? DEFAULT_MILEAGE_RATE;
}
export async function getTaxRate(): Promise<number> {
  const stored = await getStore().get<number>(TAX_RATE_KEY);
  return stored ?? DEFAULT_TAX_RATE;
}
export async function getAppLockEnabled(): Promise<boolean> {
  const stored = await getStore().get<boolean>(APP_LOCK_KEY);
  return stored ?? false;
}

/** Setters */
export async function setMileageRate(rate: number): Promise<void> {
  await getStore().set(MILEAGE_RATE_KEY, rate);
}
export async function setTaxRate(rate: number): Promise<void> {
  await getStore().set(TAX_RATE_KEY, rate);
}
export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  await getStore().set(APP_LOCK_KEY, enabled);
}
