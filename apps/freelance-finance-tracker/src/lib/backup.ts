import type { Store } from './storage/types';
import { keepingPolicy } from './dataReset';
import { getAllReceipts } from './receiptStore';
import { getAllMileageEntries } from './mileageStore';
import { deriveKey, encrypt, decrypt, toBase64, fromBase64, utf8, fromUtf8, randomBytes } from './crypto';
import type { Receipt, MileageEntry } from './models';

/** Create an encrypted backup of all data.
 * Returns a base64‑encoded string representing the encrypted payload.
 */
export async function createBackup(store: Store, passphrase: string): Promise<string> {
  // Gather data
  const receipts: Receipt[] = await getAllReceipts(store);
  const mileage: MileageEntry[] = await getAllMileageEntries(store);
  const payload = JSON.stringify({ receipts, mileage });

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
  const data = JSON.parse(decrypted) as { receipts: Receipt[]; mileage: MileageEntry[] };
  // Replace everything with the backup's contents, keeping the user's policy acceptance.
  await keepingPolicy(store, async () => {
    await store.clearAll();
    for (const r of data.receipts) {
      await store.put('receipts', { ...(r as any), id: r.id } as any);
    }
    for (const m of data.mileage) {
      await store.put('mileage', { ...(m as any), id: m.id } as any);
    }
  });
}
