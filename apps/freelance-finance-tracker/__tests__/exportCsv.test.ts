import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../src/lib/storage/memory';
import { addReceipt } from '../src/lib/receiptStore';
import { generateCsv } from '../src/lib/exportCsv';

describe('CSV injection prevention', () => {
  it('neutralises formula injection in notes', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await addReceipt(store, {
      id: 'r2',
      amount: 50,
      date: '2023-02-01',
      category: 'Office',
      type: 'expense',
      notes: '=HYPERLINK("http://malicious.com")',
    });
    const csv = await generateCsv(store);
    // The notes field should start with a single quote to neutralise the formula
    expect(csv).toContain("'=HYPERLINK(\"http://malicious.com\")");
  });
});
