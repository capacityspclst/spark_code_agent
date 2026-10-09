import { getStore } from './storage';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { deriveKey, encrypt, decrypt, toBase64, fromBase64, utf8, fromUtf8, randomBytes } from './crypto';
import type { Receipt, MileageEntry } from './models';

/** Create an encrypted backup of all data.
 * Returns the file URI of the created backup file.
 */
export async function createBackup(passphrase: string): Promise<string> {
  const store = getStore();
  const receipts: Receipt[] = await getAllReceipts(store);
  const mileage: MileageEntry[] = await getAllMileageEntries(store);
  const payload = JSON.stringify({ receipts, mileage });
  // Generate random 16‑byte salt
  const salt = randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const encrypted = encrypt(key, utf8(payload));
  // prepend salt
  const combined = new Uint8Array(salt.length + encrypted.length);
  combined.set(salt, 0);
  combined.set(encrypted, salt.length);
  const b64 = toBase64(combined);

  // Lazy load native modules to avoid load errors in test environments
  const FileSystem = (await import('expo-file-system')) as any;
  const Sharing = (await import('expo-sharing')) as any;

  const fileUri = (FileSystem as any).cacheDirectory + 'backup.bak';
  await (FileSystem as any).writeAsStringAsync(fileUri, b64, { encoding: (FileSystem as any).EncodingType.UTF8 });
  await (Sharing as any).shareAsync(fileUri, { mimeType: 'application/octet-stream', dialogTitle: 'Backup' });
  return fileUri;
}

/** Restore data from an encrypted backup.
 * Passphrase is used to derive the key; throws on failure.
 */
export async function restoreBackup(fileUri: string, passphrase: string): Promise<void> {
  // Lazy load native modules
  const FileSystem = (await import('expo-file-system')) as any;
  const b64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
  const combined = fromBase64(b64);
  if (combined.length < 16) throw new Error('Invalid backup file');
  const salt = combined.subarray(0, 16);
  const ciphertext = combined.subarray(16);
  const key = deriveKey(passphrase, salt);
  const decrypted = fromUtf8(decrypt(key, ciphertext));
  const data = JSON.parse(decrypted) as { receipts: Receipt[]; mileage: MileageEntry[] };
  const store = getStore();
  // clear existing data
  await store.clearAll();
  for (const r of data.receipts) {
    await store.put('receipts', { ...(r as any), id: r.id } as any);
  }
  for (const m of data.mileage) {
    await store.put('mileage', { ...(m as any), id: m.id } as any);
  }
}
