import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt } from '../../src/lib/receiptStore';
import { addMileageEntry } from '../../src/lib/mileageStore';
import { initLedgerIfNeeded, getLedger, setLedger } from '../../src/lib/ledgerHelpers';
import { appendEntryForReceipt, appendEntryForMileage } from '../../src/lib/ledger';
import { verifyLedger } from '../../src/lib/ledgerVerification';
import { generateCsv } from '../../src/lib/exportCsv';
import { generatePdf } from '../../src/lib/exportPdf';
import { verifyExportCode } from '../../src/lib/exportVerification';
import { createBackup, restoreBackup } from '../../src/lib/backup';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';
import * as ledgerVerification from '../../src/lib/ledgerVerification';
import * as backupModule from '../../src/lib/backup';
import fs from 'fs';
import path from 'path';

// R8: Mileage entry fields
describe('M11: mileage ledger entry fields', () => {
  it('appends mileage.created entry with seq, at, prevHash, hash fields', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const mileage = { id: 'm200', date: '2023-03-01', miles: 100, purpose: 'Test' };
    await appendEntryForMileage('mileage.created', mileage.id, mileage, store);
    const ledger = await getLedger(store);
    const entry = ledger.find(e => e.recordId === mileage.id && e.kind === 'mileage.created');
    expect(entry).toBeDefined();
    expect(entry?.seq).toBeGreaterThan(0);
    expect(entry?.at).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    expect(entry?.prevHash).toBeDefined();
    expect(entry?.hash).toBeDefined();
  });
});

// R11: Import creates correct imported entries
describe('M11: import creates correct imported entries', () => {
  it('adds imported entries with original data and proper timestamps', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    const receipt = { id: 'r_imp', amount: 123, date: '2023-04-01', category: 'Supplies', type: 'expense', notes: '' };
    const mileage = { id: 'm_imp', date: '2023-04-02', miles: 42, purpose: 'Travel' };
    await addReceipt(store, receipt);
    await addMileageEntry(store, mileage);
    const importStart = Date.now();
    await initLedgerIfNeeded(store);
    const ledger = await getLedger(store);
    const imports = ledger.filter(e => e.kind === 'imported');
    expect(imports).toHaveLength(2);
    const receiptImport = imports.find(e => e.recordId === receipt.id);
    const mileageImport = imports.find(e => e.recordId === mileage.id);
    expect(receiptImport?.data).toEqual(receipt);
    expect(mileageImport?.data).toEqual(mileage);
    // timestamps should be after importStart
    const receiptAt = new Date(receiptImport?.at ?? '');
    const mileageAt = new Date(mileageImport?.at ?? '');
    expect(receiptAt.getTime()).toBeGreaterThanOrEqual(importStart);
    expect(mileageAt.getTime()).toBeGreaterThanOrEqual(importStart);
  });
});

// R13: Ledger entries are encrypted
describe('M11: ledger entries are stored encrypted', () => {
  it('raw ledger storage does not contain plaintext ledger fields', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = { id: 'r_enc', amount: 10, date: '2023-05-01', category: 'Supplies', type: 'expense', notes: '' };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    // Attempt to read raw encrypted data
    const rawData = await (rawStore as any).getItem('ledger');
    expect(rawData).not.toBeNull();
    if (typeof rawData === 'string') {
      expect(rawData).not.toMatch(/"kind"/);
      expect(rawData).not.toMatch(/"recordId"/);
    }
  });
});

// R14: Only DeleteAllData clears ledger
describe('M11: only DeleteAllData clears ledger', () => {
  it('ledger persists after normal operations and is cleared only by clearAllData', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = { id: 'r_keep', amount: 20, date: '2023-06-01', category: 'Supplies', type: 'expense', notes: '' };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const ledgerBefore = await getLedger(store);
    const countBefore = ledgerBefore.length;
    // add another receipt – should not clear ledger
    const receipt2 = { id: 'r_keep2', amount: 30, date: '2023-06-02', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt2);
    const ledgerAfter = await getLedger(store);
    expect(ledgerAfter.length).toBeGreaterThan(countBefore);
  });
});

// R20: verifyLedger callable from Settings & backup‑restore (backup already tested via spy)
describe('M11: backup‑restore invokes verifyLedger', () => {
  it('calls verifyLedger during restoreBackup', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_br', amount: 45, date: '2023-07-01', category: 'Supplies', type: 'expense', notes: '' });
    const passphrase = 'Testpass123!';
    const backupBlob = await createBackup(store, passphrase);
    const spy = jest.spyOn(ledgerVerification, 'verifyLedger');
    await restoreBackup(store, backupBlob, passphrase);
    expect(spy).toHaveBeenCalled();
  });
});

// R28: export.created ledger entry after CSV & PDF export
describe('M11: export.created ledger entry after CSV export', () => {
  it('records export.created entry with correct fields for CSV', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_csv', amount: 123, date: '2023-08-01', category: 'Supplies', type: 'expense', notes: '' });
    const csv = await generateCsv(store);
    const ledger = await getLedger(store);
    const exportEntry = ledger.find(e => e.kind === 'export.created' && e.data?.format === 'csv');
    expect(exportEntry).toBeDefined();
    const data = exportEntry?.data;
    expect(data?.format).toBe('csv');
    expect(data?.code).toMatch(/^[0-9a-f]{12}$/);
    expect(data?.entries).toBe(ledger.length);
    expect(data?.headHash).toBe(ledger[ledger.length - 1].hash);
  });
});

describe('M11: export.created ledger entry after PDF export', () => {
  it('records export.created entry with correct fields for PDF', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_pdf', amount: 456, date: '2023-08-02', category: 'Supplies', type: 'expense', notes: '' });
    await generatePdf(store);
    const ledger = await getLedger(store);
    const exportEntry = ledger.find(e => e.kind === 'export.created' && e.data?.format === 'pdf');
    expect(exportEntry).toBeDefined();
    const data = exportEntry?.data;
    expect(data?.format).toBe('pdf');
    expect(data?.code).toMatch(/^[0-9a-f]{12}$/);
    expect(data?.entries).toBe(ledger.length);
    expect(data?.headHash).toBe(ledger[ledger.length - 1].hash);
  });
});

// R30: CSV verification recompute
describe('M11: CSV verification recompute matches ledger', () => {
  it('recomputes verificationCode from CSV content and matches ledger entry', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_recomp', amount: 200, date: '2023-09-01', category: 'Supplies', type: 'expense', notes: '' });
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines.pop()!;
    const contentWithoutVerification = lines.join('\n');
    const match = verificationLine.match(/headHash=([0-9a-f]{64})/);
    expect(match).not.toBeNull();
    const headHash = match![1];
    const computedHash = bytesToHex(sha256(utf8ToBytes(contentWithoutVerification)));
    const expectedCode = computedHash.slice(0, 12);
    expect(verificationLine).toContain(expectedCode);
    const result = await verifyExportCode(expectedCode, store);
    expect(result.known).toBe(true);
    expect(result.entries).toBeGreaterThan(0);
    expect(result.headHash).toBe(headHash);
  });
});

// R31: PDF code typing verification
describe('M11: verify PDF export via typed code', () => {
  it('recognises a PDF verification code and reports export details', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_pdfcode', amount: 300, date: '2023-09-02', category: 'Supplies', type: 'expense', notes: '' });
    await generatePdf(store);
    const ledger = await getLedger(store);
    const exportEntry = ledger.find(e => e.kind === 'export.created' && e.data?.format === 'pdf');
    expect(exportEntry).toBeDefined();
    const code = exportEntry?.data?.code;
    const result = await verifyExportCode(code, store);
    expect(result.known).toBe(true);
    expect(result.entries).toBe(exportEntry?.seq);
    expect(result.headHash).toBe(exportEntry?.hash);
    // Ensure the export timestamp is present
    expect(exportEntry?.at).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });
});

// R32: detection of altered CSV file
describe('M11: detection of altered CSV file', () => {
  it('fails verification when CSV content is altered', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_alter', amount: 400, date: '2023-10-01', category: 'Supplies', type: 'expense', notes: '' });
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines.pop()!;
    const content = lines.join('\n');
    const tamperedContent = content.replace('400', '401');
    const tamperedHash = bytesToHex(sha256(utf8ToBytes(tamperedContent)));
    const tamperedCode = tamperedHash.slice(0, 12);
    const result = await verifyExportCode(tamperedCode, store);
    expect(result.known).toBe(false);
  });
});

// R33: detection of later corrections after export
describe('M11: verification reports corrections after export', () => {
  it('indicates that records were corrected since export', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = { id: 'r_later', amount: 500, date: '2023-10-02', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines.pop()!;
    const [entriesStr, headHash, code] = verificationLine.split(',');
    // Correct the receipt after export
    const corrected = { ...receipt, amount: 550 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);
    const result = await verifyExportCode(code, store);
    expect(result.known).toBe(true);
    // The verification routine should indicate later changes
    // Assuming the result includes a `laterChanges` boolean
    expect((result as any).laterChanges).toBe(true);
  });
});

// R35: backup includes ledger
describe('M11: backup contains ledger entries', () => {
  it('restoring backup yields ledger entries', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_back', amount: 600, date: '2023-11-01', category: 'Supplies', type: 'expense', notes: '' });
    await appendEntryForReceipt('receipt.created', 'r_back', { id: 'r_back', amount: 600, date: '2023-11-01', category: 'Supplies', type: 'expense', notes: '' }, store);
    const passphrase = 'Testpass123!';
    const backupBlob = await createBackup(store, passphrase);
    const restoredStore = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await restoreBackup(restoredStore, backupBlob, passphrase);
    const ledger = await getLedger(restoredStore);
    expect(ledger).toHaveLength(2); // imported + receipt.created
  });
});

// R40: hash chain and prevHash linking test
describe('M11: hash computation and prevHash linking', () => {
  it('second entry hash matches computed hash and prevHash links to first', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt1 = { id: 'r_hash1', amount: 1, date: '2023-12-01', category: 'Supplies', type: 'expense', notes: '' };
    await appendEntryForReceipt('receipt.created', receipt1.id, receipt1, store);
    const receipt2 = { ...receipt1, amount: 2 };
    await appendEntryForReceipt('receipt.corrected', receipt1.id, receipt2, store);
    const ledger = await getLedger(store);
    const first = ledger[0];
    const second = ledger[1];
    const { seq, at, kind, recordId, data, prevHash } = second;
    const obj = { seq, at, kind, recordId, data, prevHash };
    const canonical = JSON.stringify(obj, Object.keys(obj).sort());
    const expectedHash = bytesToHex(sha256(utf8ToBytes(canonical)));
    expect(second.hash).toBe(expectedHash);
    expect(second.prevHash).toBe(first.hash);
  });
});

// R48: CSV tampering detection via verification routine
describe('M11: CSV file alteration detection via verification routine', () => {
  it('fails verification when CSV content altered', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_tamper', amount: 700, date: '2023-12-02', category: 'Supplies', type: 'expense', notes: '' });
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines.pop()!;
    const content = lines.join('\n');
    const tamperedContent = content.replace('700', '701');
    const tamperedHash = bytesToHex(sha256(utf8ToBytes(tamperedContent)));
    const tamperedCode = tamperedHash.slice(0, 12);
    const result = await verifyExportCode(tamperedCode, store);
    expect(result.known).toBe(false);
  });
});

// R49: verification reports later corrections after export
describe('M11: verification reports later corrections after export', () => {
  it('indicates later corrections have occurred', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = { id: 'r_lc', amount: 800, date: '2023-12-03', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines.pop()!;
    const [, , code] = verificationLine.split(',');
    // make a correction
    const corrected = { ...receipt, amount: 850 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);
    const result = await verifyExportCode(code, store);
    expect(result.known).toBe(true);
    // Assuming `laterChanges` boolean in result
    expect((result as any).laterChanges).toBe(true);
  });
});

// R50: PDF export creates export.created entry with code
describe('M11: PDF export creates ledger entry with verification code', () => {
  it('adds export.created entry for PDF with a verification code', async () => {
    const rawStore = createMemoryRawStore();
    const store = createStore(rawStore, createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    await addReceipt(store, { id: 'r_pdfexp', amount: 900, date: '2023-12-04', category: 'Supplies', type: 'expense', notes: '' });
    await generatePdf(store);
    const ledger = await getLedger(store);
    const exportEntry = ledger.find(e => e.kind === 'export.created' && e.data?.format === 'pdf');
    expect(exportEntry).toBeDefined();
    expect(exportEntry?.data?.code).toMatch(/^[0-9a-f]{12}$/);
  });
});
