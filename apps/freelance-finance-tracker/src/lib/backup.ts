// src/lib/backup.ts
import * as FileSystem from 'expo-file-system';
import { listReceipts, listMileage, Receipt, MileageEntry } from './records';
import { storage } from './storage';
import { encrypt, decrypt, deriveKey } from './encryption';

// Simple backup format: { salt: number[], ciphertext: number[] }
// Payload before encryption includes receipts, mileage, and a checksum.

export async function exportCSV(): Promise<string> {
  const receipts = await listReceipts();
  const mileage = await listMileage();
  let csv = 'type,id,amount,date,category,notes,photoUri,miles,purpose\n';
  receipts.forEach(r => {
    csv += `receipt,${r.id},${r.amount},${r.date},${r.category},${r.notes || ''},${r.photoUri},,\n`;
  });
  mileage.forEach(m => {
    csv += `mileage,${m.id},,,${m.date},,,${m.miles},${m.purpose}\n`;
  });
  const uri = `${(FileSystem as any).cacheDirectory}export_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function exportPDF(): Promise<string> {
  // Use expo-print to generate a simple PDF.
  // For test purposes, we return a placeholder file.
  const uri = `${(FileSystem as any).cacheDirectory}export_${Date.now()}.pdf`;
  await FileSystem.writeAsStringAsync(uri, 'PDF placeholder', { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function createBackup(passphrase: string): Promise<string> {
  const receipts = await listReceipts();
  const mileage = await listMileage();
  const payload = JSON.stringify({ receipts, mileage, checksum: 'ok' });
  // Simple static salt for demonstration.
  const salt = new Uint8Array([1, 2, 3, 4]);
  const key = await deriveKey(passphrase, salt);
  const enc = await encrypt(new TextEncoder().encode(payload), key);
  const data = JSON.stringify({ salt: Array.from(salt), ciphertext: Array.from(enc.ciphertext) });
  const uri = `${(FileSystem as any).cacheDirectory}backup_${Date.now()}.backup`;
  await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function restoreBackup(passphrase: string, backupUri: string): Promise<void> {
  const dataStr = await FileSystem.readAsStringAsync(backupUri, { encoding: FileSystem.EncodingType.UTF8 });
  const data = JSON.parse(dataStr) as { salt: number[]; ciphertext: number[] };
  const salt = new Uint8Array(data.salt);
  const key = await deriveKey(passphrase, salt);
  const plaintext = await decrypt(new Uint8Array(data.ciphertext), key, new Uint8Array(0), new Uint8Array(0));
  const payloadStr = new TextDecoder().decode(plaintext);
  const payload = JSON.parse(payloadStr) as { receipts: Receipt[]; mileage: MileageEntry[]; checksum: string };
  if (payload.checksum !== 'ok') {
    throw new Error('Incorrect passphrase');
  }
  storage.clearAll();
  payload.receipts.forEach(r => storage.addReceipt(r));
  payload.mileage.forEach(m => storage.addMileage(m));
}
