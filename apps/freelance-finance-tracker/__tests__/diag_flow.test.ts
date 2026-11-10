import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../src/lib/receiptStore';
import { getAllCategories, renameCategory, syncCategoriesWithReceipts } from '../src/lib/categories';

describe('diag', () => {
  it('simulates the ui flow rename', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await addReceipt(store, { id: 'r1', amount: 42.1, date: '2023-01-01', category: 'Supplies', type: 'expense', notes: '' });
    await addReceipt(store, { id: 'r2', amount: 123.45, date: '2023-01-01', category: 'Travel', type: 'expense', notes: '' });

    await syncCategoriesWithReceipts(store);
    const cats = await getAllCategories(store, { includeHidden: true });
    console.log('CATS', cats.map(c => c.name));

    await renameCategory(store, 'Travel', 'Driving');
    const cats2 = await getAllCategories(store, { includeHidden: true });
    console.log('CATS2', cats2.map(c => c.name));

    const receipts = await getAllReceipts(store);
    console.log('RECEIPTS', receipts.map(r => r.category));
  });
});
