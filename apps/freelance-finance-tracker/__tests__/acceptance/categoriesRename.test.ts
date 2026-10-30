import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  getAllCategories,
  renameCategory,
  syncCategoriesWithReceipts,
  isCategoryInUse,
} from '../../src/lib/categories';

describe('Category renaming updates receipts and category state', () => {
  it('renames a custom category (case‑insensitive) and updates receipts accordingly', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a receipt that uses a custom category with mixed‑case spelling.
    const receipt = {
      id: 'r100',
      amount: 50,
      date: '2023-03-01',
      category: 'Travel Concierge',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    // Ensure the custom category exists via sync.
    await syncCategoriesWithReceipts(store);
    let categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Travel Concierge')).toBeDefined();

    // Rename the category using a different case for the old name.
    const renameResult = await renameCategory(store, 'travel concierge', 'Travel Services');
    // On success the function should not return an error string (null/undefined/falsy).
    expect(renameResult).toBeFalsy();

    // Old name must no longer be present in the category list.
    categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Travel Concierge')).toBeUndefined();

    // New name must be present.
    const renamedCat = categories.find(c => c.name === 'Travel Services');
    expect(renamedCat).toBeDefined();

    // All receipts that previously used the old name must now reference the new name.
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Travel Services');

    // isCategoryInUse should now be true for the new name.
    const inUse = await isCategoryInUse(store, 'Travel Services');
    expect(inUse).toBe(true);

    // Running syncCategoriesWithReceipts again must not bring the old name back.
    await syncCategoriesWithReceipts(store);
    const afterSync = await getAllCategories(store);
    expect(afterSync.find(c => c.name === 'Travel Concierge')).toBeUndefined();
  });

  it('fails to rename when the new name is invalid and leaves receipts untouched', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'r200',
      amount: 30,
      date: '2023-04-01',
      category: 'Office Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await syncCategoriesWithReceipts(store);

    // Attempt to rename to an empty string – should return an error message.
    const renameResult = await renameCategory(store, 'Office Supplies', '');
    expect(renameResult).toBeTruthy(); // non‑null error string

    // Receipts must remain unchanged.
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Office Supplies');
  });
});
