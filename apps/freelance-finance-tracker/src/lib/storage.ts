// src/lib/storage.ts
// Simple in-memory storage for the purpose of tests. In a real app this would wrap expo-sqlite and encrypt data.

type Record = any;

let receiptStore: Record[] = [];
let mileageStore: Record[] = [];
let configStore: any = {};

export const storage = {
  clearAll: () => {
    receiptStore = [];
    mileageStore = [];
    configStore = {};
  },
  // Receipt helpers
  addReceipt: (r: Record) => {
    receiptStore.push(r);
  },
  listReceipts: () => Promise.resolve([...receiptStore]),
  // Mileage helpers
  addMileage: (m: Record) => {
    mileageStore.push(m);
  },
  listMileage: () => Promise.resolve([...mileageStore]),
  // Config helpers
  setConfig: (cfg: any) => {
    configStore = { ...configStore, ...cfg };
  },
  getConfig: () => Promise.resolve({ ...configStore }),
};
