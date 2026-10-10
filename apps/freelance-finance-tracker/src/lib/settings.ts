import type { Store } from './storage/types';

// Keys for settings stored in the encrypted store.
const MILEAGE_RATE_KEY = 'settings.mileageRate';
const TAX_RATE_KEY = 'settings.taxRate';
const APP_LOCK_KEY = 'settings.appLockEnabled';

/** Default values used if no setting is persisted yet. */
export const DEFAULT_MILEAGE_RATE = 0.655; // USD per mile (example IRS rate)
export const DEFAULT_TAX_RATE = 0.22; // 22% default tax rate

/** Resolve store: if a Store is provided use it, otherwise lazily import and use the global encrypted store. */
function resolveStore(store?: Store): Store {
  if (store) return store;
  // Lazy require to avoid loading expo-sqlite in test environments where it's not needed.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getStore } = require('./storage');
  return getStore();
}

/** Getters */
export async function getMileageRate(store?: Store): Promise<number> {
  const s = resolveStore(store);
  const stored = await s.get<number>(MILEAGE_RATE_KEY);
  return stored ?? DEFAULT_MILEAGE_RATE;
}
export async function getTaxRate(store?: Store): Promise<number> {
  const s = resolveStore(store);
  const stored = await s.get<number>(TAX_RATE_KEY);
  return stored ?? DEFAULT_TAX_RATE;
}
export async function getAppLockEnabled(store?: Store): Promise<boolean> {
  const s = resolveStore(store);
  const stored = await s.get<boolean>(APP_LOCK_KEY);
  return stored ?? false;
}

/** Setters: support (rate) or (store, rate) signatures */
export async function setMileageRate(arg1: number | Store, arg2?: number): Promise<void> {
  let store: Store;
  let rate: number;
  if (typeof arg1 === 'object' && 'get' in arg1) {
    store = arg1 as Store;
    rate = arg2 as number;
  } else {
    store = resolveStore();
    rate = arg1 as number;
  }
  await store.set(MILEAGE_RATE_KEY, rate);
}
export async function setTaxRate(arg1: number | Store, arg2?: number): Promise<void> {
  let store: Store;
  let rate: number;
  if (typeof arg1 === 'object' && 'get' in arg1) {
    store = arg1 as Store;
    rate = arg2 as number;
  } else {
    store = resolveStore();
    rate = arg1 as number;
  }
  await store.set(TAX_RATE_KEY, rate);
}
export async function setAppLockEnabled(arg1: boolean | Store, arg2?: boolean): Promise<void> {
  let store: Store;
  let enabled: boolean;
  if (typeof arg1 === 'object' && 'get' in arg1) {
    store = arg1 as Store;
    enabled = arg2 as boolean;
  } else {
    store = resolveStore();
    enabled = arg1 as boolean;
  }
  await store.set(APP_LOCK_KEY, enabled);
}
