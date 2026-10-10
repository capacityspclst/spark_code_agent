import { createDeviceKeyProvider, createDeviceRawStore } from './device';
import { createStore } from './store';
import type { Store } from './types';

export * from './types';
export { createStore } from './store';

let store: Store | null = null;

/** The app's encrypted store on this device. */
export function getStore(): Store {
  return (store ??= createStore(createDeviceRawStore(), createDeviceKeyProvider()));
}

/** Tests: use an in-memory store instead of the device one. */
export function setStoreForTests(s: Store | null) {
  store = s;
}
