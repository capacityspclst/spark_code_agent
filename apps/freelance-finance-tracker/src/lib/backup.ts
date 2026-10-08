// src/lib/backup.ts
import * as FileSystem from 'expo-file-system';
import { listReceipts, listMileage, Receipt, MileageEntry } from './records';
import { clearAll } from './storage';
import { encrypt, decrypt, deriveKey } from './encryption';
import { addReceipt } from './records';
import { addMileage } from './records';

// Helper to get TextEncoder in Node environment
function getTextEncoder() {
  if (typeof TextEncoder !== 'undefined') return TextEncoder;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TextEncoder } = require('util');
  return TextEncoder;
}

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
  await FileSystem.writeAsStringAsync(uri, csv);
  return uri;
}

export async function exportPDF(): Promise<string> {
  const uri = `${(FileSystem as any).cacheDirectory}export_${Date.now()}.pdf`;
  await FileSystem.writeAsStringAsync(uri, 'PDF placeholder');
  return uri;
}

export async function createBackup(passphrase: string): Promise<string> {
  const receipts = await listReceipts();
  const mileage = await listMileage();
  const payload = JSON.stringify({ receipts, mileage, checksum: 'ok' });
  const salt = new Uint8Array([1, 2, 3, 4]);
  const key = await deriveKey(passphrase, salt);
  const encoder = getTextEncoder();
  const enc = await encrypt(new encoder().encode(payload), key);
  const data = JSON.stringify({ salt: Array.from(salt), ciphertext: Array.from(enc.ciphertext) });
  const uri = `${(FileSystem as any).cacheDirectory}backup_${Date.now()}.backup`;
  await FileSystem.writeAsStringAsync(uri, data);
  return uri;
}

export async function restoreBackup(passphrase: string, backupUri: string): Promise<void> {
  const dataStr = await FileSystem.readAsStringAsync(backupUri);
  const data = JSON.parse(dataStr) as { salt: number[]; ciphertext: number[] };
  const salt = new Uint8Array(data.salt);
  const key = await deriveKey(passphrase, salt);
  const plaintext = await decrypt(new Uint8Array(data.ciphertext), key, new Uint8Array(0), new Uint8Array(0));
  const decoder = typeof TextDecoder !== 'undefined' ? TextDecoder : require('util').TextDecoder;
  const payloadStr = new decoder().decode(plaintext);
  const payload = JSON.parse(payloadStr) as { receipts: Receipt[]; mileage: MileageEntry[]; checksum: string };
  if (payload.checksum !== 'ok') {
    throw new Error('Incorrect passphrase');
  }
  await clearAll();
  for (const r of payload.receipts) {
    await addReceipt(r);
  }
  for (const m of payload.mileage) {
    await addMileage(m);
  }
}
