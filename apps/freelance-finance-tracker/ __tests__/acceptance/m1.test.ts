import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { isPolicyAccepted, acceptPolicy, POLICY_VERSION } from '../../src/lib/policy';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import { computeTotals } from '../../src/lib/finance';

describe('M1: policy gate', () => {
  it('should be not accepted initially and become accepted after acceptance', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    expect(await isPolicyAccepted(store)).toBe(false);
    await acceptPolicy(store);
    expect(await isPolicyAccepted(store)).toBe(true);
  });
});

describe('M1: receipt entry and totals', () => {
  it('adds receipts and computes income / expense totals', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt1 = {
      id: 'r1',
      amount: 100,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    const receipt2 = {
      id: 'r2',
      amount: 250,
      date: '2023-01-15',
      category: 'Consulting',
      type: 'income',
      notes: '',
    };

    await addReceipt(store, receipt1);
    await addReceipt(store, receipt2);

    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(2);

    const totals = computeTotals(receipts);
    expect(totals.income).toBe(250);
    expect(totals.expenses).toBe(100);
  });
});
