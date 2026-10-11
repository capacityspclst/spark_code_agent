import type { Store } from './storage/types';
import { keepingPolicy } from './dataReset';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { deriveKey, encrypt, decrypt, toBase64, fromBase64, utf8, fromUtf8, randomBytes } from './crypto';
import type { Receipt, MileageEntry } from './models';
import { deleteAllPhotos, readPhotoBase64, writePhotoBase64 } from './photos';
import { validateBackupPassphrase } from './validation';

const BACKUP_VERSION = 1;
/** Validate passphrase policy */
function enforcePassphrasePolicy(p: string): void {
  const err = validateBackupPassphrase(p);
  if (err) throw new Error(`Invalid backup passphrase: ${err}`);
}

/** Maximum backup file size before decryption (10 MiB). */
const MAX_BACKUP_SIZE = 10 * 1024 * 1024;
/** Maximum number of entries allowed in a backup to prevent DoS. */
const MAX_RECEIPTS = 10000;
const MAX_MILEAGE = 5000;

/** Create an encrypted backup of all data, including receipt photos. */
export async function createBackup(store: Store, passphrase: string): Promise<string> {
  enforcePassphrasePolicy(passphrase);
  const receipts: Receipt[] = await getAllReceipts(store);
  const mileage: MileageEntry[] = await getAllMileageEntries(store);
  const receiptsWithPhotos = await Promise.all(
    receipts.map(async (r) => {
      const photoData = r.photoUri ? await readPhotoBase64(r.photoUri) : null;
      return photoData ? { ...r, photoData } : { ...r };
    })
  );
  const payload = JSON.stringify({ version: BACKUP_VERSION, receipts: receiptsWithPhotos, mileage });
  const salt = randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const encrypted = encrypt(key, utf8(payload));
  const combined = new Uint8Array(salt.length + encrypted.length);
  combined.set(salt, 0);
  combined.set(encrypted, salt.length);
  return toBase64(combined);
}

/** Validate the structure of a decrypted backup. */
export function validateBackupStructure(data: any): string | null {
  if (typeof data !== 'object' || data === null) return 'Backup data is not an object.';
  if (typeof data.version !== 'number') return 'Missing or invalid version.';
  if (!Array.isArray(data.receipts)) return 'Receipts should be an array.';
  if (!Array.isArray(data.mileage)) return 'Mileage should be an array.';
  if (data.receipts.length > MAX_RECEIPTS) return `Too many receipts (max ${MAX_RECEIPTS}).`;
  if (data.mileage.length > MAX_MILEAGE) return `Too many mileage entries (max ${MAX_MILEAGE}).`;
  for (const r of data.receipts) {
    if (typeof r.id !== 'string' || typeof r.amount !== 'number' || typeof r.date !== 'string')
      return 'Invalid receipt entry.';
  }
  for (const m of data.mileage) {
    if (typeof m.id !== 'string' || typeof m.date !== 'string' || typeof m.miles !== 'number')
      return 'Invalid mileage entry.';
  }
  return null;
}

/** Restore data from an encrypted backup blob. */
export async function restoreBackup(store: Store, backupBlob: string, passphrase: string): Promise<void> {
  const combined = fromBase64(backupBlob);
  if (combined.length > MAX_BACKUP_SIZE) throw new Error('Backup file too large');
  if (combined.length < 16) throw new Error('Invalid backup file');
  const salt = combined.subarray(0, 16);
  const ciphertext = combined.subarray(16);
  const key = deriveKey(passphrase, salt);
  let decrypted: string;
  try {
    decrypted = fromUtf8(decrypt(key, ciphertext));
  } catch {
    throw new Error('Invalid passphrase or corrupted backup file');
  }
  const data = JSON.parse(decrypted) as any;

  // Validate structure before mutating store
  const structErr = validateBackupStructure(data);
  if (structErr) throw new Error('Invalid backup format: ' + structErr);

  // Replace everything: records and the photo folder.
  await deleteAllPhotos();
  await keepingPolicy(store, async () => {
    await store.clearAll();
    for (const r of data.receipts) {
      const { photoData, ...rest } = r as any;
      await store.put('receipts', rest as any);
      if (photoData) {
        try {
          await store.put('receipts', { ...rest, photoUri: await writePhotoBase64(rest.id, photoData) } as any);
        } catch {
          // keep receipt without photo if write fails
        }
      }
    }
    for (const m of data.mileage) {
      await store.put('mileage', m as any);
    }
  });
}
