import { Store } from './storage/types';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { getAllCategories } from './categories';
import { encryptText, decryptText, deriveKey, randomBytes, toBase64, fromBase64 } from './crypto';
import { verifyLedger, getAllLedgerEntries, LEDGER_ENTRY_PREFIX, LEDGER_INDEX_KEY, MAX_LEDGER_ENTRIES, ZERO_64, LEDGER_INIT_FLAG } from './ledger';

/**
 * Backup format version.
 */
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 10 * 1024 * 1024; // 10 MiB safety limit

/**
 * Shape of the unencrypted backup data.
 */
export interface BackupData {
  version: number;
  receipts: any[]; // Receipt objects
  mileage: any[]; // MileageEntry objects
  categories?: any; // optional categories data (raw storage shape)
  ledger?: any[]; // ledger entries
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

  // Validate receipts fields and sanitize photoUri
  for (const r of obj.receipts) {
    if (typeof r !== 'object' || r === null) return 'Invalid receipt entry';
    const allowed = ['id','amount','date','category','type','notes','photoUri'];
    for (const k of Object.keys(r)) {
      if (!allowed.includes(k)) return `Unexpected field ${k} in receipt`;
    }
    if (typeof r.id !== 'string') return 'Receipt id must be string';
    if (typeof r.amount !== 'number') return 'Receipt amount must be number';
    if (typeof r.date !== 'string') return 'Receipt date must be string';
    if (typeof r.category !== 'string') return 'Receipt category must be string';
    if (typeof r.type !== 'string') return 'Receipt type must be string';
    if (typeof r.notes !== 'string') return 'Receipt notes must be string';
    if (r.photoUri !== undefined) {
      if (typeof r.photoUri !== 'string') return 'photoUri must be string';
      if (r.photoUri.includes('..') || r.photoUri.startsWith('/') ) return 'Invalid photoUri path';
    }
  }
  // mileage checks
  for (const m of obj.mileage) {
    if (typeof m !== 'object' || m === null) return 'Invalid mileage entry';
    const allowed = ['id','date','miles','purpose'];
    for (const k of Object.keys(m)) {
      if (!allowed.includes(k)) return `Unexpected field ${k} in mileage`;
    }
    if (typeof m.id !== 'string') return 'Mileage id must be string';
    if (typeof m.date !== 'string') return 'Mileage date must be string';
    if (typeof m.miles !== 'number') return 'Mileage miles must be number';
    if (typeof m.purpose !== 'string') return 'Mileage purpose must be string';
  }
  if (obj.ledger !== undefined && !Array.isArray(obj.ledger)) return 'Ledger must be an array';
  if (obj.categories !== undefined && typeof obj.categories !== 'object') {
    return 'Categories must be an object';
  }
  return null;
}

/** Verify a ledger array (used during restore). */
function verifyLedgerArray(arr: any[]): {
  ok: boolean;
  firstBadSeq?: number;
  reason?: string;
} {
  if (arr.length > MAX_LEDGER_ENTRIES) return { ok: false, reason: 'ledger exceeds max entries' };
  for (let i = 0; i < arr.length; i++) {
    const entry = arr[i];
    const { hash, ...withoutHash } = entry;
    const keys = Object.keys(withoutHash).sort();
    const ordered: any = {};
    for (const k of keys) ordered[k] = (withoutHash as any)[k];
    const json = JSON.stringify(ordered);
    // compute hash using noble
    const { sha256 } = require('@noble/hashes/sha2.js');
    const { bytesToHex, utf8ToBytes } = require('@noble/hashes/utils.js');
    const expectedHash = bytesToHex(sha256(utf8ToBytes(json)));
    if (hash !== expectedHash) {
      return { ok: false, firstBadSeq: entry.seq, reason: 'hash mismatch' };
    }
    const expectedPrev = i === 0 ? ZERO_64 : arr[i - 1].hash;
    if (entry.prevHash !== expectedPrev) {
      return { ok: false, firstBadSeq: entry.seq, reason: 'prevHash mismatch' };
    }
  }
  return { ok: true };
}

/**
 * Create an encrypted backup string.
 * The backup includes receipts, mileage entries, raw categories storage, and the ledger.
 */
export async function createBackup(store: Store, passphrase: string): Promise<string> {
  const receipts = await getAllReceipts(store);
  const mileage = await getAllMileageEntries(store);
  const rawCategories = await store.get<any>('categories');
  const ledgerEntries = await getAllLedgerEntries(store);
  const data: BackupData = {
    version: BACKUP_VERSION,
    receipts,
    mileage,
    categories: rawCategories ?? { custom: [], hidden: [], rename: {} },
    ledger: ledgerEntries,
  };
  const json = JSON.stringify(data);
  if (json.length > MAX_BACKUP_BYTES) {
    throw new Error('Backup size exceeds maximum allowed size');
  }
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
  if (json.length > MAX_BACKUP_BYTES) {
    throw new Error('Backup size exceeds maximum allowed size');
  }
  let obj: any;
  try {
    obj = JSON.parse(json);
  } catch {
    throw new Error('Backup data corrupted');
  }
  const err = validateBackupStructure(obj);
  if (err) throw new Error(err);

  // Clear existing data first
  await store.clearAll();

  // Restore receipts, mileage, categories
  for (const r of obj.receipts) {
    await store.put('receipts', r);
  }
  for (const m of obj.mileage) {
    await store.put('mileage', m);
  }
  if (obj.categories) {
    await store.set('categories', obj.categories);
  }

  // Restore ledger if present and verify it
  if (obj.ledger) {
    const ledgerArr = obj.ledger;
    const verification = verifyLedgerArray(ledgerArr);
    if (!verification.ok) {
      throw new Error('Backup ledger verification failed');
    }
    // Write entries individually using same key pattern
    for (const entry of ledgerArr) {
      const key = `${LEDGER_ENTRY_PREFIX}${entry.seq}`;
      await store.setItem(key, entry);
    }
    // Recreate index
    const seqs = ledgerArr.map((e: any) => e.seq);
    await store.setItem(LEDGER_INDEX_KEY, seqs);
    // Mark ledger as initialized to avoid re-import
    await store.set<boolean>(LEDGER_INIT_FLAG, true);
  }
}
