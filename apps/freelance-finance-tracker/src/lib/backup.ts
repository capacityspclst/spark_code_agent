import type { Store } from './storage/types';
import { keepingPolicy } from './dataReset';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { deriveKey, encrypt, decrypt, toBase64, fromBase64, utf8, fromUtf8, randomBytes } from './crypto';
import type { Receipt, MileageEntry } from './models';
import * as FileSystem from 'expo-file-system';

/** Create an encrypted backup of all data, including receipt photos.
 * Returns a base64‑encoded string representing the encrypted payload.
 */
export async function createBackup(store: Store, passphrase: string): Promise<string> {
  // Gather data
  const receipts: Receipt[] = await getAllReceipts(store);
  const mileage: MileageEntry[] = await getAllMileageEntries(store);

  // Attach photo data (base64) to receipts that have a photoUri.
  const receiptsWithPhotos = await Promise.all(
    receipts.map(async (r) => {
      if (r.photoUri) {
        try {
          // Read file as base64 string.
          const b64 = await FileSystem.readAsStringAsync(r.photoUri, { encoding: FileSystem.EncodingType.Base64 });
          return { ...r, photoData: b64 };
        } catch {
          // If reading fails, omit photoData.
          return { ...r };
        }
      }
      return { ...r };
    })
  );

  const payload = JSON.stringify({ receipts: receiptsWithPhotos, mileage });

  // Derive encryption key from passphrase with a fresh random salt
  const salt = randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const encrypted = encrypt(key, utf8(payload));

  // Envelope: salt | ciphertext+tag (GCM already includes tag)
  const combined = new Uint8Array(salt.length + encrypted.length);
  combined.set(salt, 0);
  combined.set(encrypted, salt.length);
  const b64 = toBase64(combined);

  return b64;
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
  // Replace everything with the backup's contents, keeping the user's policy acceptance.
  await keepingPolicy(store, async () => {
    await store.clearAll();
    // Restore receipts and write photos if present.
    for (const r of data.receipts) {
      const { photoData, ...rest } = r as any;
      const newId = rest.id;
      await store.put('receipts', rest as any);
      if (photoData) {
        // Write photo to app's cache directory.
        const uri = `${FileSystem.cacheDirectory}${newId}_photo`;
        try {
          await FileSystem.writeAsStringAsync(uri, photoData, { encoding: FileSystem.EncodingType.Base64 });
          // Update the stored receipt with the new uri.
          await store.put('receipts', { ...rest, photoUri: uri } as any);
        } catch {
          // ignore write errors – photo will be missing.
        }
      }
    }
    for (const m of data.mileage) {
      await store.put('mileage', m as any);
    }
  });
}
