import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { initLedgerIfNeeded, getLedger, setLedger } from '../../src/lib/ledgerHelpers';
import { appendEntryForReceipt, appendEntryForMileage } from '../../src/lib/ledger';
import { verifyLedger } from '../../src/lib/ledgerVerification';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils.js';
import { clearAllData } from '../../src/lib/dataReset';
import path from 'path';
import fs from 'fs';

describe('M8: receipt ledger entry creation', () => {
  it('appends a receipt.created entry with required fields', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r100',
      amount: 100,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const ledger = await getLedger(store);
    const entry = ledger.find(e => e.recordId === receipt.id && e.kind === 'receipt.created');
    expect(entry).toBeDefined();
    expect(entry?.seq).toBeGreaterThan(0);
    // ISO timestamp format check (basic)
    expect(entry?.at).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    expect(entry?.recordId).toBe(receipt.id);
    expect(entry?.data).toEqual(receipt);
    expect(entry?.prevHash).toBeDefined();
    expect(entry?.hash).toBeDefined();
  });

  it('appends a receipt.corrected entry linking via prevHash', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r101',
      amount: 100,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const corrected = { ...receipt, amount: 110 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);
    const ledger = await getLedger(store);
    const createdEntry = ledger.find(e => e.kind === 'receipt.created' && e.recordId === receipt.id);
    const correctedEntry = ledger.find(e => e.kind === 'receipt.corrected' && e.recordId === receipt.id);
    expect(correctedEntry).toBeDefined();
    expect(correctedEntry?.data).toEqual(corrected);
    expect(correctedEntry?.prevHash).toBe(createdEntry?.hash);
  });

  it('appends a receipt.deleted entry with last content and correct prevHash', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r102',
      amount: 150,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    await appendEntryForReceipt('receipt.deleted', receipt.id, receipt, store);
    const ledger = await getLedger(store);
    const created = ledger.find(e => e.kind === 'receipt.created' && e.recordId === receipt.id);
    const deleted = ledger.find(e => e.kind === 'receipt.deleted' && e.recordId === receipt.id);
    expect(deleted).toBeDefined();
    expect(deleted?.data).toEqual(receipt);
    expect(deleted?.prevHash).toBe(created?.hash);
  });
});

describe('M8: mileage ledger entry creation', () => {
  it('appends a mileage.created entry with required fields', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const mileage = {
      id: 'm100',
      date: '2023-02-01',
      miles: 50,
      purpose: 'Travel',
    };
    await appendEntryForMileage('mileage.created', mileage.id, mileage, store);
    const ledger = await getLedger(store);
    const entry = ledger.find(e => e.recordId === mileage.id && e.kind === 'mileage.created');
    expect(entry).toBeDefined();
    expect(entry?.data).toEqual(mileage);
  });

  it('appends a mileage.corrected entry linking via prevHash', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const mileage = {
      id: 'm101',
      date: '2023-02-01',
      miles: 50,
      purpose: 'Travel',
    };
    await appendEntryForMileage('mileage.created', mileage.id, mileage, store);
    const corrected = { ...mileage, miles: 55 };
    await appendEntryForMileage('mileage.corrected', mileage.id, corrected, store);
    const ledger = await getLedger(store);
    const createdEntry = ledger.find(e => e.kind === 'mileage.created' && e.recordId === mileage.id);
    const correctedEntry = ledger.find(e => e.kind === 'mileage.corrected' && e.recordId === mileage.id);
    expect(correctedEntry).toBeDefined();
    expect(correctedEntry?.data).toEqual(corrected);
    expect(correctedEntry?.prevHash).toBe(createdEntry?.hash);
  });

  it('appends a mileage.deleted entry with correct prevHash', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const mileage = {
      id: 'm102',
      date: '2023-02-01',
      miles: 50,
      purpose: 'Travel',
    };
    await appendEntryForMileage('mileage.created', mileage.id, mileage, store);
    await appendEntryForMileage('mileage.deleted', mileage.id, mileage, store);
    const ledger = await getLedger(store);
    const created = ledger.find(e => e.kind === 'mileage.created' && e.recordId === mileage.id);
    const deleted = ledger.find(e => e.kind === 'mileage.deleted' && e.recordId === mileage.id);
    expect(deleted).toBeDefined();
    expect(deleted?.data).toEqual(mileage);
    expect(deleted?.prevHash).toBe(created?.hash);
  });
});

describe('M8: ledger hash chain properties', () => {
  it('first entry has prevHash of 64 zeros and each entry links via prevHash', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r200',
      amount: 200,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const corrected = { ...receipt, amount: 210 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);
    const ledger = await getLedger(store);
    const entries = ledger.filter(e => e.recordId === receipt.id).sort((a, b) => a.seq - b.seq);
    expect(entries[0].prevHash).toBe('0'.repeat(64));
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].prevHash).toBe(entries[i - 1].hash);
    }
  });

  it('hash is correctly computed from canonical JSON', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r201',
      amount: 123,
      date: '2023-01-02',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const ledger = await getLedger(store);
    const entry = ledger.find(e => e.recordId === receipt.id && e.kind === 'receipt.created');
    expect(entry).toBeDefined();
    const { seq, at, kind, recordId, data, prevHash } = entry!;
    const obj = { seq, at, kind, recordId, data, prevHash };
    // Canonical JSON: keys sorted at every level, no whitespace. (A key array as JSON.stringify's replacer
    // also filters nested objects, so it would hash the record data as {}.)
    const canon = (v: any): string => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
      : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}'
      : JSON.stringify(v);
    const canonical = canon(obj);
    const expectedHash = bytesToHex(sha256(utf8ToBytes(canonical)));
    expect(entry?.hash).toBe(expectedHash);
  });
});

describe('M8: ledger verification detects tampering and reports reasons', () => {
  it('detects changed data field and reports hash mismatch', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r300',
      amount: 300,
      date: '2023-01-03',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const ledger = await getLedger(store);
    const tampered = ledger.map(e => (e.kind === 'receipt.created' ? { ...e, data: { ...e.data, amount: 999 } } : e));
    await setLedger(store, tampered);
    const verification = await verifyLedger(store);
    expect(verification.ok).toBe(false);
    expect(verification.firstBadSeq).toBe(ledger[0].seq);
    expect(verification.reason?.toLowerCase()).toContain('hash mismatch');
  });

  it('detects missing entry and reports missing entry', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r301',
      amount: 301,
      date: '2023-01-04',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    let ledger = await getLedger(store);
    const removedSeq = ledger[ledger.length - 1].seq;
    ledger = ledger.filter(e => e.seq !== removedSeq);
    await setLedger(store, ledger);
    const verification = await verifyLedger(store);
    expect(verification.ok).toBe(false);
    expect(verification.firstBadSeq).toBe(removedSeq);
    expect(verification.reason?.toLowerCase()).toContain('missing');
  });

  it('detects reordered entries and reports out‑of‑order', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r302',
      amount: 302,
      date: '2023-01-05',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const corrected = { ...receipt, amount: 303 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);
    let ledger = await getLedger(store);
    if (ledger.length >= 2) {
      const temp = ledger[0];
      ledger[0] = ledger[1];
      ledger[1] = temp;
    }
    await setLedger(store, ledger);
    const verification = await verifyLedger(store);
    expect(verification.ok).toBe(false);
    expect(verification.firstBadSeq).toBe(ledger[0].seq);
    expect(verification.reason?.toLowerCase()).toContain('order');
  });

  it('detects incorrect prevHash and reports prevHash mismatch', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r303',
      amount: 303,
      date: '2023-01-06',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const corrected = { ...receipt, amount: 304 };
    await appendEntryForReceipt('receipt.corrected', receipt.id, corrected, store);
    let ledger = await getLedger(store);
    if (ledger.length >= 2) {
      ledger[1] = { ...ledger[1], prevHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' };
    }
    await setLedger(store, ledger);
    const verification = await verifyLedger(store);
    expect(verification.ok).toBe(false);
    expect(verification.firstBadSeq).toBe(ledger[1].seq);
    expect(verification.reason?.toLowerCase()).toContain('prevhash');
  });
});

describe('M8: clearAllData resets ledger', () => {
  it('clears ledger entries after data reset', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await initLedgerIfNeeded(store);
    const receipt = {
      id: 'r400',
      amount: 400,
      date: '2023-01-07',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await appendEntryForReceipt('receipt.created', receipt.id, receipt, store);
    const ledger = await getLedger(store);
    expect(ledger.length).toBeGreaterThan(0);
    await clearAllData(store);
    const ledgerAfter = await getLedger(store);
    expect(ledgerAfter).toHaveLength(0);
  });
});

describe('M8: SettingsScreen imports and invokes verifyLedger', () => {
  it('contains a reference to verifyLedger', async () => {
    const content = fs.readFileSync(path.resolve(__dirname, '../../src/screens/SettingsScreen.tsx'), 'utf8');
    expect(content).toMatch(/verifyLedger/);
  });
});
