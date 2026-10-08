import { getPolicyAcceptance, setPolicyAcceptance, POLICY_VERSION } from '../../src/lib/policy';
import {
  addReceipt,
  listReceipts,
  Receipt,
  addMileage,
  listMileage,
  MileageEntry,
  setConfig,
} from '../../src/lib/records';
import {
  getTotalIncome,
  getTotalExpenses,
  getMileageDeduction,
  getEstimatedTax,
} from '../../src/lib/calculations';
import {
  exportCSV,
  exportPDF,
  createBackup,
  restoreBackup,
} from '../../src/lib/backup';
import * as FileSystem from 'expo-file-system';
import { deriveKey, encrypt, decrypt, randomBytes } from '../../src/lib/encryption';

describe('Freelance Finance Tracker Acceptance Tests', () => {
  test('Initial policy acceptance is null', async () => {
    const acceptance = await getPolicyAcceptance();
    expect(acceptance).toBeNull();
  });

  test('Setting and retrieving policy acceptance works', async () => {
    const now = new Date().toISOString();
    await setPolicyAcceptance(POLICY_VERSION, now);
    const acceptance = await getPolicyAcceptance();
    expect(acceptance).not.toBeNull();
    expect(acceptance?.version).toBe(POLICY_VERSION);
    expect(acceptance?.date).toBe(now);
  });

  test('Encryption round‑trip works', async () => {
    const passphrase = 'TestPass123!';
    const salt = randomBytes(16);
    const key = await deriveKey(passphrase, salt);
    const plaintext = new TextEncoder().encode('Hello world');
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted.ciphertext, key, encrypted.iv, encrypted.tag);
    const decoded = new TextDecoder().decode(decrypted);
    expect(decoded).toBe('Hello world');
  });

  test('Add and retrieve a receipt', async () => {
    const receipt: Receipt = {
      id: 'receipt-test-1',
      amount: 123.45,
      date: '2024-10-01',
      category: 'Supplies',
      type: 'expense',
      notes: 'Test receipt',
      photoUri: 'file:///dummy.jpg',
    };
    await addReceipt(receipt);
    const receipts = await listReceipts();
    const found = receipts.find(r => r.id === receipt.id);
    expect(found).toBeDefined();
    expect(found?.amount).toBeCloseTo(123.45);
    expect(found?.date).toBe('2024-10-01');
    expect(found?.category).toBe('Supplies');
    expect(found?.type).toBe('expense');
  });

  test('Add and retrieve a mileage entry', async () => {
    const entry: MileageEntry = {
      id: 'mileage-test-1',
      date: '2024-09-30',
      miles: 50,
      purpose: 'Client meeting',
    };
    await addMileage(entry);
    const entries = await listMileage();
    const found = entries.find(e => e.id === entry.id);
    expect(found).toBeDefined();
    expect(found?.miles).toBe(50);
  });

  test('Dashboard calculations are correct', async () => {
    // Configure rates
    await setConfig({ mileageRate: 0.58, taxRate: 0.22 });

    const income = await getTotalIncome();
    const expenses = await getTotalExpenses();
    const mileageDeduction = await getMileageDeduction(0.58);
    const tax = getEstimatedTax(0.22, income, expenses, mileageDeduction);

    // Based on the data added above:
    // One expense receipt of 123.45, no income receipts, 50 miles @ 0.58
    expect(income).toBeCloseTo(0);
    expect(expenses).toBeCloseTo(123.45);
    expect(mileageDeduction).toBeCloseTo(50 * 0.58);

    const taxable = income - expenses - mileageDeduction;
    const expectedTax = Math.max(0, taxable * 0.22);
    expect(tax).toBeCloseTo(expectedTax);
  });

  test('CSV export returns a file URI and contains data', async () => {
    const csvUri = await exportCSV();
    expect(csvUri).toMatch(/^file:/);
    const content = await FileSystem.readAsStringAsync(csvUri);
    expect(content).toContain('123.45'); // receipt amount
    expect(content).toContain('50'); // mileage miles
  });

  test('PDF export returns a file URI', async () => {
    const pdfUri = await exportPDF();
    expect(pdfUri).toMatch(/^file:/);
  });

  test('Backup and restore work without error', async () => {
    const backupUri = await createBackup('StrongPass!123');
    await restoreBackup('StrongPass!123', backupUri);
  });

  test('Restore with wrong passphrase throws', async () => {
    const backupUri = await createBackup('CorrectPass123!');
    await expect(restoreBackup('WrongPass123!', backupUri)).rejects.toThrow();
  });
});
