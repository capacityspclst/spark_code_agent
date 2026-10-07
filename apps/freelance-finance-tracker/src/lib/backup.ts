// src/lib/backup.ts
import * as FileSystem from 'expo-file-system';
import { listReceipts, listMileage, Receipt, MileageEntry } from './records';
import { storage } from './storage';

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
  const uri = `${FileSystem.documentDirectory}export_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function exportPDF(): Promise<string> {
  const uri = `${FileSystem.documentDirectory}export_${Date.now()}.pdf`;
  await FileSystem.writeAsStringAsync(uri, 'PDF placeholder', { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function createBackup(passphrase: string): Promise<string> {
  const receipts = await listReceipts();
  const mileage = await listMileage();
  const payload = JSON.stringify({ receipts, mileage, passphrase });
  const uri = `${FileSystem.documentDirectory}backup_${Date.now()}.backup`;
  await FileSystem.writeAsStringAsync(uri, payload, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function restoreBackup(passphrase: string, backupUri: string): Promise<void> {
  const dataStr = await FileSystem.readAsStringAsync(backupUri, { encoding: FileSystem.EncodingType.UTF8 });
  const payload = JSON.parse(dataStr) as { receipts: Receipt[]; mileage: MileageEntry[]; passphrase: string };
  if (payload.passphrase !== passphrase) {
    throw new Error('Incorrect passphrase');
  }
  storage.clearAll();
  payload.receipts.forEach(r => storage.addReceipt(r));
  payload.mileage.forEach(m => storage.addMileage(m));
}
