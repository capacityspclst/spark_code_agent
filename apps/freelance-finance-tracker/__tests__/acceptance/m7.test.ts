import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import { addMileageEntry } from '../../src/lib/mileageStore';
import { initLedgerIfNeeded, getLedger, setLedger } from '../../src/lib/ledgerHelpers';
import { appendEntryForReceipt, appendEntryForMileage } from '../../src/lib/ledger';
import { verifyLedger } from '../../src/lib/ledgerVerification';
import { generateCsv } from '../../src/lib/exportCsv';
import { createBackup, restoreBackup } from '../../src/lib/backup';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';

describe('M7: ledger import on first launch', () => {
  it('adds imported entries for existing receipts and mileage only once', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // add data before ledger initialization
    const receipt = { id: 'r1', amount: 100, date: '2023-01-01', category: 'Supplies', type: 'expense', notes: '' };
    const mileage = { id: 'm1', date: '2023-01-02', miles: 50, purpose: 'Travel' };
    await addReceipt(store, receipt);
    await addMileageEntry(store, mileage);

    // first initialization should import existing records
    await initLedgerIfNeeded(store);
    let ledger = await getLedger(store);
    expect(ledger.filter(e => e.kind === 'imported')).toHaveLength(2);
    const ids = ledger.map(e => e.recordId);
    expect(ids).toEqual(expect.arrayContaining(['r1', 'm1']));

    // second initialization must not duplicate entries
    await initLedgerIfNeeded(store);
    ledger = await getLedger(store);
    expect(ledger.filter(e => e.kind === 'imported')).toHaveLength(2);
  });
});

describe('M7: ledger entry creation and verification', () => {
  it('creates created, corrected, deleted entries and verifies chain', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);

    const receipt = { id: 'r2', amount: 200, date: '2023-02-01', category: 'Travel', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);

    const corrected = { ...receipt, amount: 210 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);

    await appendEntryForReceipt('receipt.deleted', receipt.id, corrected, store);

    const ledger = await getLedger(store);
    const receiptEntries = ledger.filter(e => e.recordId === 'r2');
    expect(receiptEntries).toHaveLength(3);
    expect(receiptEntries[0].kind).toBe('receipt.created');
    expect(receiptEntries[1].kind).toBe('receipt.corrected');
    expect(receiptEntries[2].kind).toBe('receipt.deleted');

    const verification = await verifyLedger(store);
    expect(verification.ok).toBe(true);
  });
});

describe('M7: ledger verification detects tampering', () => {
  it('detects changed data in an entry', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);

    const receipt = { id: 'r3', amount: 300, date: '2023-03-01', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);

    // Retrieve and tamper the ledger
    const ledger = await getLedger(store);
    const tampered = ledger.map((e, idx) => (idx === 0 ? { ...e, data: { ...e.data, amount: 999 } } : e));
    await setLedger(store, tampered);

    const verification = await verifyLedger(store);
    expect(verification.ok).toBe(false);
    expect(verification.firstBadSeq).toBe(1);
  });
});

describe('M7: CSV export verification line', () => {
  it('generates verification line and validates it', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    const receipt = { id: 'r4', amount: 400, date: '2023-04-01', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    const csv = await generateCsv(store);

    const lines = csv.trim().split('\n');
    const verificationLine = lines[lines.length - 1];
    expect(verificationLine.startsWith('# verification:')).toBe(true);

    const match = verificationLine.match(/entries=(\d+).*headHash=([0-9a-f]{64}).*code=([0-9a-f]{12})/i);
    expect(match).not.toBeNull();
    const [, entriesStr, headHash, code] = match!;
    const entriesCount = Number(entriesStr);

    const contentWithoutVerification = lines.slice(0, -1).join('\n');
    const computedHash = bytesToHex(sha256(utf8ToBytes(contentWithoutVerification)));
    const expectedCode = computedHash.slice(0, 12);
    expect(code).toBe(expectedCode);

    const ledger = await getLedger(store);
    expect(entriesCount).toBe(ledger.length);
    expect(headHash).toBe(ledger[ledger.length - 1].hash);
  });

  it('fails verification after file tampering', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    const receipt = { id: 'r5', amount: 500, date: '2023-05-01', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    let csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines.pop()!;
    let content = lines.join('\n');

    // tamper a value in the CSV content
    content = content.replace('500', '501');
    const tamperedCsv = content + '\n' + verificationLine;

    const match = verificationLine.match(/code=([0-9a-f]{12})/i);
    expect(match).not.toBeNull();
    const originalCode = match![1];
    const newHash = bytesToHex(sha256(utf8ToBytes(content)));
    const newCode = newHash.slice(0, 12);
    expect(newCode).not.toBe(originalCode);
  });
});

describe('M7: backup includes ledger verification', () => {
  it('creates backup with ledger and restores successfully', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = { id: 'r6', amount: 600, date: '2023-06-01', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);

    const passphrase = 'Testpass123!';
    const backupBlob = await createBackup(store, passphrase);

    await store.clearAll();
    await restoreBackup(store, backupBlob, passphrase);

    const verification = await verifyLedger(store);
    expect(verification.ok).toBe(true);
    const ledger = await getLedger(store);
    expect(ledger.find(e => e.recordId === 'r6' && e.kind === 'receipt.created')).toBeDefined();
  });

  it('rejects restoration of tampered backup ledger', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    const receipt = { id: 'r7', amount: 700, date: '2023-07-01', category: 'Supplies', type: 'expense', notes: '' };
    await addReceipt(store, receipt);
    const passphrase = 'Testpass123!';
    const backupBlob = await createBackup(store, passphrase);

    // tamper the backup string slightly
    const tampered = backupBlob.slice(0, -1) + (backupBlob.slice(-1) === 'A' ? 'B' : 'A');
    await store.clearAll();
    await expect(restoreBackup(store, tampered, passphrase)).rejects.toThrow();
  });
});
