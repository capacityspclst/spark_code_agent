import { Store } from './storage/types';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { getAllCategories } from './categories';
import { encryptText, decryptText, deriveKey, randomBytes, toBase64, fromBase64 } from './crypto';
import { initLedgerIfNeeded } from './ledgerHelpers';

/**
 * Backup format version.
 */
const BACKUP_VERSION = 1;

/**
 * Shape of the unencrypted backup data.
 */
export interface BackupData {
  version: number;
  receipts: any[]; // Receipt objects
  mileage: any[]; // MileageEntry objects
  categories?: any; // optional categories data (raw storage shape)
  // ledger is intentionally omitted; it will be regenerated on restore via initLedgerIfNeeded
}

/**
 * Validate the shape of a backup object (not encrypted).
 * Returns null if valid, otherwise an error string.
 */
export function validateBackupStructure(obj: any): string | null {
  if (typeof obj !== 'object' || obj === null) return 'Backup must be an object';
  if (obj.version !== BACKUP_VERSION) return 'Unsupported backup version';
  if (!Array.isArray(obj.receipts)) return 'Receipts must be an array';
  if (!Array.isArray(obj.mileage)) return 'Mileage must be an array';
  // simple field checks for receipts
  for (const r of obj.receipts) {
    if (typeof r !== 'object' || r === null) return 'Invalid receipt entry';
    if (typeof r.id !== 'string') return 'Receipt id must be string';
    if (typeof r.amount !== 'number') return 'Receipt amount must be number';
    if (typeof r.date !== 'string') return 'Receipt date must be string';
    if (typeof r.category !== 'string') return 'Receipt category must be string';
    if (typeof r.type !== 'string') return 'Receipt type must be string';
    if (typeof r.notes !== 'string') return 'Receipt notes must be string';
  }
  // mileage checks
  for (const m of obj.mileage) {
    if (typeof m !== 'object' || m === null) return 'Invalid mileage entry';
    if (typeof m.id !== 'string') return 'Mileage id must be string';
    if (typeof m.date !== 'string') return 'Mileage date must be string';
    if (typeof m.miles !== 'number') return 'Mileage miles must be number';
    if (typeof m.purpose !== 'string') return 'Mileage purpose must be string';
  }
  // categories, if present, should be an object (light validation)
  if (obj.categories !== undefined && typeof obj.categories !== 'object') {
    return 'Categories must be an object';
  }
  return null;
}

/**
 * Create an encrypted backup string.
 * The backup includes receipts, mileage entries, and raw categories storage.
 */
export async function createBackup(store: Store, passphrase: string): Promise<string> {
  const receipts = await getAllReceipts(store);
  const mileage = await getAllMileageEntries(store);
  const rawCategories = await store.get<any>('categories');
  const data: BackupData = {
    version: BACKUP_VERSION,
    receipts,
    mileage,
    categories: rawCategories ?? { custom: [], hidden: [], rename: {} },
  };
  const json = JSON.stringify(data);
  const salt = randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const ciphertext = encryptText(key, json);
  const saltB64 = toBase64(salt);
  return `${saltB64}:${ciphertext}`;
}

/**
 * Restore from an encrypted backup string.
 * Throws on validation failure or decryption errors.
 */
export async function restoreBackup(store: Store, backupString: string, passphrase: string): Promise<void> {
  const [saltB64, cipher] = backupString.split(':');
  if (!saltB64 || !cipher) throw new Error('Invalid backup format');
  const salt = fromBase64(saltB64);
  const key = deriveKey(passphrase, salt);
  const json = decryptText(key, cipher);
  let obj: any;
  try {
    obj = JSON.parse(json);
  } catch {
    throw new Error('Backup data corrupted');
  }
  const err = validateBackupStructure(obj);
  if (err) throw new Error(err);

  // Replace current data with backup contents.
  await store.clearAll();
  for (const r of obj.receipts) {
    await store.put('receipts', r);
  }
  for (const m of obj.mileage) {
    await store.put('mileage', m);
  }
  if (obj.categories) {
    await store.set('categories', obj.categories);
  }
  // After restoring raw data, re‑initialize ledger (imports existing records).
  await initLedgerIfNeeded(store);
}
