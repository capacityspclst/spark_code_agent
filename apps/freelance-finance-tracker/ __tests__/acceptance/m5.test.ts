import { validateBackupPassphrase } from '../../src/lib/validation';
import { 
  validateReceiptAmount, 
  validateMileageMiles, 
  validateMileageRate, 
  validateTaxRate 
} from '../../src/lib/validation';
import { validateBackupStructure } from '../../src/lib/backup';
import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { acceptPolicy, isPolicyAccepted } from '../../src/lib/policy';
import { clearAllData } from '../../src/lib/dataReset';

describe('M5: backup passphrase validation', () => {
  it('rejects passphrases shorter than 12 characters', () => {
    expect(validateBackupPassphrase('short')).toBe('Passphrase must be at least 12 characters');
    expect(validateBackupPassphrase('exactly12!!')).toBeNull();
  });
});

describe('M5: numeric field validation', () => {
  it('validates receipt amount correctly', () => {
    expect(validateReceiptAmount(0)).toBe('Amount must be > 0');
    expect(validateReceiptAmount(-5)).toBe('Amount must be > 0');
    expect(validateReceiptAmount(1000001)).toBe('Amount must be ≤ 1,000,000');
    expect(validateReceiptAmount(12.345)).toBe('Amount can have at most 2 decimal places');
    expect(validateReceiptAmount(99.99)).toBeNull();
  });
  it('validates mileage miles correctly', () => {
    expect(validateMileageMiles(0)).toBe('Miles must be > 0');
    expect(validateMileageMiles(-10)).toBe('Miles must be > 0');
    expect(validateMileageMiles(10001)).toBe('Miles must be ≤ 10,000');
    expect(validateMileageMiles(250)).toBeNull();
  });
  it('validates mileage rate correctly', () => {
    expect(validateMileageRate(-0.1)).toBe('Mileage rate must be between 0 and 5');
    expect(validateMileageRate(5.1)).toBe('Mileage rate must be between 0 and 5');
    expect(validateMileageRate(3)).toBeNull();
  });
  it('validates tax rate correctly', () => {
    expect(validateTaxRate(-1)).toBe('Tax rate must be between 0 and 100');
    expect(validateTaxRate(101)).toBe('Tax rate must be between 0 and 100');
    expect(validateTaxRate(22)).toBeNull();
  });
});

describe('M5: backup format validation', () => {
  const validBackup = {
    version: 1,
    receipts: [{ id: 'r1', amount: 100, date: '2023-01-01', category: 'Supplies', type: 'expense', notes: '' }],
    mileage: [{ id: 'm1', date: '2023-01-02', miles: 50, purpose: 'Travel' }],
  };
  const invalidBackup = {
    version: 1,
    receipts: [{ id: 'r1', amount: 'bad', date: 123, category: null, type: 'expense', notes: '' }],
    mileage: 'not-an-array',
  };
  it('accepts a well‑formed backup', () => {
    expect(validateBackupStructure(validBackup)).toBeNull();
  });
  it('rejects a malformed backup', () => {
    expect(validateBackupStructure(invalidBackup)).not.toBeNull();
  });
});

describe('M5: data reset preserves policy acceptance', () => {
  it('clears data but keeps policy acceptance flag', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await acceptPolicy(store);
    // simulate some data
    const dummy = { id: 'x', amount: 10, date: '2023-01-01', category: 'Test', type: 'expense', notes: '' };
    // (Assume receiptStore is used to store data)
    const { addReceipt } = await import('../../src/lib/receiptStore');
    await addReceipt(store, dummy);

    // perform full reset
    await clearAllData(store);

    // policy should still be accepted
    expect(await isPolicyAccepted(store)).toBe(true);
    // receipts should be gone
    const { getAllReceipts } = await import('../../src/lib/receiptStore');
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(0);
  });
});
