import type { Store } from './storage/types';
import { keepingPolicy } from './dataReset';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { deriveKey, encrypt, decrypt, toBase64, fromBase64, utf8, fromUtf8, randomBytes } from './crypto';
import type { Receipt, MileageEntry } from './models';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';

/** Create an encrypted backup of all data, including receipt photos.
 * Returns a base64‑encoded string representing the encrypted payload.
 */
export async function createBackup(store: Store, passphrase: string): Promise<string> {
  const receipts: Receipt[] = await getAllReceipts(store);
  const mileage: MileageEntry[] = await getAllMileageEntries(store);
  const receiptsWithPhotos = await Promise.all(
    receipts.map(async (r) => {
      if (r.photoUri) {
        try {
          const b64 = await FileSystem.readAsStringAsync(r.photoUri, { encoding: FileSystem.EncodingType.Base64 });
          return { ...r, photoData: b64 };
        } catch {
          return { ...r };
        }
      }
      return { ...r };
    })
  );
  const payload = JSON.stringify({ receipts: receiptsWithPhotos, mileage });
  const salt = randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const encrypted = encrypt(key, utf8(payload));
  const combined = new Uint8Array(salt.length + encrypted.length);
  combined.set(salt, 0);
  combined.set(encrypted, salt.length);
  return toBase64(combined);
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
  const data = JSON.parse(decrypted) as { receipts: (Receipt & { photoData?: string })[]; mileage: MileageEntry[] };

  // Clean any existing cached photos before restoring new ones.
  const cacheDir = Paths.cache.uri;
  try {
    const entries = await FileSystem.readDirectoryAsync(cacheDir);
    await Promise.all(entries.map((e) => FileSystem.deleteAsync(`${cacheDir}${e}`, { idempotent: true })));
  } catch {
    // ignore errors – directory may be empty or inaccessible.
  }

  await keepingPolicy(store, async () => {
    await store.clearAll();
    for (const r of data.receipts) {
      const { photoData, ...rest } = r as any;
      await store.put('receipts', rest as any);
      if (photoData) {
        const uri = `${cacheDir}${rest.id}_photo`;
        try {
          await FileSystem.writeAsStringAsync(uri, photoData, { encoding: FileSystem.EncodingType.Base64 });
          await store.put('receipts', { ...rest, photoUri: uri } as any);
        } catch {}
      }
    }
    for (const m of data.mileage) {
      await store.put('mileage', m as any);
    }
  });
}
