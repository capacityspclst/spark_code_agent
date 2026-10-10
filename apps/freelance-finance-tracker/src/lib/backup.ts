import type { Store } from './storage/types';
import { keepingPolicy } from './dataReset';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { deriveKey, encrypt, decrypt, toBase64, fromBase64, utf8, fromUtf8, randomBytes } from './crypto';
import type { Receipt, MileageEntry } from './models';
import * as FileSystem from 'expo-file-system';
import { readFileBytes, writeFileBytes } from './files';
import { validateBackupPassphrase } from './validation';

const BACKUP_VERSION = 1;
const MIN_LENGTH = 12;
/** Validate passphrase policy */
function enforcePassphrasePolicy(p: string): void {
  const err = validateBackupPassphrase(p);
  if (err) throw new Error(`Invalid backup passphrase: ${err}`);
}

/** Create an encrypted backup of all data, including receipt photos.
 * Returns a base64‑encoded string representing the encrypted payload.
 */
export async function createBackup(store: Store, passphrase: string): Promise<string> {
  enforcePassphrasePolicy(passphrase);
  const receipts: Receipt[] = await getAllReceipts(store);
  const mileage: MileageEntry[] = await getAllMileageEntries(store);
  const receiptsWithPhotos = await Promise.all(
    receipts.map(async (r) => {
      if (r.photoUri) {
        try {
          const bytes = await readFileBytes(r.photoUri);
          const b64 = toBase64(bytes);
          return { ...r, photoData: b64 };
        } catch {
          return { ...r };
        }
      }
      return { ...r };
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
function validateBackupStructure(data: any): string | null {
  if (typeof data !== 'object' || data === null) return 'Backup data is not an object.';
  if (typeof data.version !== 'number') return 'Missing or invalid version.';
  if (!Array.isArray(data.receipts)) return 'Receipts should be an array.';
  if (!Array.isArray(data.mileage)) return 'Mileage should be an array.';
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

/** Restore data from an encrypted backup blob.
 * Throws an error with a friendly message if the passphrase is wrong or the file is corrupted.
 */
export async function restoreBackup(store: Store, backupBlob: string, passphrase: string): Promise<void> {
  const combined = fromBase64(backupBlob);
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

  const cacheDir = (FileSystem as unknown as any).cacheDirectory ?? '';
  try {
    const entries = await FileSystem.readDirectoryAsync(cacheDir);
    await Promise.all(entries.map((e) => FileSystem.deleteAsync(`${cacheDir}${e}`, { idempotent: true })));
  } catch {}

  await keepingPolicy(store, async () => {
    await store.clearAll();
    for (const r of data.receipts) {
      const { photoData, ...rest } = r as any;
      await store.put('receipts', rest as any);
      if (photoData) {
        const uri = `${cacheDir}${rest.id}_photo`;
        try {
          const bytes = Uint8Array.from(atob(photoData), c => c.charCodeAt(0));
          await writeFileBytes(uri, bytes);
          await store.put('receipts', { ...rest, photoUri: uri } as any);
        } catch {}
      }
    }
    for (const m of data.mileage) {
      await store.put('mileage', m as any);
    }
  });
}
