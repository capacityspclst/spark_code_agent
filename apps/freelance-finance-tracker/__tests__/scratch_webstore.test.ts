import { createStore } from '../src/lib/storage/store';
import { createDeviceKeyProvider, createDeviceRawStore } from '../src/lib/storage/device.web';
import { addReceipt, getAllReceipts } from '../src/lib/receiptStore';
import { getAllCategories, renameCategory, syncCategoriesWithReceipts } from '../src/lib/categories';

describe('scratch web store repro', () => {
  it('renames and updates receipts using the web device store', async () => {
    const store = createStore(createDeviceRawStore(), createDeviceKeyProvider());
    await addReceipt(store, { id: 'r1', amount: 42.1, date: '2023-01-01', category: 'Supplies', type: 'expense', notes: '' });
    await addReceipt(store, { id: 'r2', amount: 123.45, date: '2023-01-01', category: 'Travel', type: 'expense', notes: '' });

    await syncCategoriesWithReceipts(store);
    const err = await renameCategory(store, 'Travel', 'Driving');
    console.log('ERR', err);

    const receipts = await getAllReceipts(store);
    console.log('RECEIPTS', receipts.map(r => r.category));
    const cats = await getAllCategories(store);
    console.log('CATS', cats.map(c => c.name));
  });
});
