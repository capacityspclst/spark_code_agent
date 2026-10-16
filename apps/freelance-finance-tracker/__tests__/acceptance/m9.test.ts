import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt } from '../../src/lib/receiptStore';
import { generateCsv } from '../../src/lib/exportCsv';
import { initLedgerIfNeeded, getLedger } from '../../src/lib/ledgerHelpers';
import { appendEntryForReceipt } from '../../src/lib/ledger';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';
import { verifyExportCode } from '../../src/lib/exportVerification';

describe('M9: CSV export verification line format and content', () => {
  it('ends with a verification line <entryCount>,<headHash>,<verificationCode>', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r500',
      amount: 500,
      date: '2023-01-08',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines[lines.length - 1];
    const parts = verificationLine.split(',');
    expect(parts).toHaveLength(3);
    const [entriesStr, headHash, code] = parts;
    expect(Number(entriesStr)).toBeGreaterThan(0);
    expect(headHash).toMatch(/^[0-9a-f]{64}$/);
    // verificationCode = first 12 chars of hash(content) + headHash
    expect(code).toMatch(/^[0-9a-f]{76}$/);

    const contentWithoutVerification = lines.slice(0, -1).join('\n');
    const computedHash = bytesToHex(sha256(utf8ToBytes(contentWithoutVerification)));
    const expectedCode = computedHash.slice(0, 12) + headHash;
    expect(code).toBe(expectedCode);
  });
});

describe('M9: export verification routine finds matching ledger entry', () => {
  it('recognizes a valid CSV export and matches ledger entry', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r501',
      amount: 501,
      date: '2023-01-09',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines[lines.length - 1];
    const [entriesStr, headHash, code] = verificationLine.split(',');
    // use the export verification routine
    const result = await verifyExportCode(code, store);
    expect(result.known).toBe(true);
    expect(result.entries).toBe(Number(entriesStr));
    expect(result.headHash).toBe(headHash);
  });
});

describe('M9: detection of file alteration after export', () => {
  it('reports altered CSV when its content is changed', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r502',
      amount: 502,
      date: '2023-01-10',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const csv = await generateCsv(store);
    const lines = csv.trim().split('\n');
    const verificationLine = lines.pop()!;
    const content = lines.join('\n');
    const tamperedContent = content.replace('502', '503');
    const [entriesStr, headHash, code] = verificationLine.split(',');
    const recomputedHash = bytesToHex(sha256(utf8ToBytes(tamperedContent)));
    const recomputedCode = recomputedHash.slice(0, 12) + headHash;
    expect(recomputedCode).not.toBe(code);
  });
});

describe('M9: detection of later record corrections after export', () => {
  it('reports that records have been corrected since export', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r503',
      amount: 503,
      date: '2023-01-11',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const csv = await generateCsv(store);
    const ledgerBefore = await getLedger(store);
    const exportEntry = ledgerBefore.find(e => e.kind === 'export.created' && e.data?.format === 'csv');
    expect(exportEntry).toBeDefined();
    // now correct the receipt
    const corrected = { ...receipt, amount: 510 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);
    const ledgerAfter = await getLedger(store);
    const laterEntries = ledgerAfter.filter(e => e.seq > (exportEntry!.seq));
    const hasCorrections = laterEntries.some(e => e.kind === 'receipt.corrected');
    expect(hasCorrections).toBe(true);
  });
});

describe('M9: unknown verification code handling', () => {
  it('reports code as not from this app when unknown', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const unknownCode = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const result = await verifyExportCode(unknownCode, store);
    expect(result.known).toBe(false);
    expect(result.message?.toLowerCase()).toMatch(/not from this app/);
  });
});
