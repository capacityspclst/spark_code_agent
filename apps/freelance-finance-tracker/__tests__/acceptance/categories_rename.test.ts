import {
  createStore,
  createMemoryRawStore,
  createMemoryKeyProvider,
} from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  renameCategory,
  getAllCategories,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('Category rename updates receipts and category list', () => {
  it('renames a custom category and updates all receipts that used it', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a receipt that uses a custom category
    const receipt = {
      id: 'r100',
      amount: 50,
      date: '2023-03-01',
      category: 'Travel Concierge',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    // Ensure the custom category appears in the category list
    await syncCategoriesWithReceipts(store);
    let categories = await getAllCategories(store);
    expect(categories.map((c) => c.name)).toContain('Travel Concierge');

    // The category should be reported as in use
    expect(await isCategoryInUse(store, 'Travel Concierge')).toBe(true);

    // Perform the rename
    const renameResult = await renameCategory(
      store,
      'Travel Concierge',
      'Travel Pro'
    );
    // Successful rename returns undefined / falsy
    expect(renameResult).toBeFalsy();

    // Receipt should now reference the new category name
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Travel Pro');

    // Category list should no longer contain the old name
    categories = await getAllCategories(store);
    const names = categories.map((c) => c.name);
    expect(names).not.toContain('Travel Concierge');
    expect(names).toContain('Travel Pro');

    // Syncing again must not resurrect the old name
    await syncCategoriesWithReceipts(store);
    categories = await getAllCategories(store);
    expect(categories.map((c) => c.name)).not.toContain('Travel Concierge');

    // The new name must now be reported as in use
    expect(await isCategoryInUse(store, 'Travel Pro')).toBe(true);
  });

  it('does not modify any receipt or category when the rename fails', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a receipt that uses a default category
    const receipt = {
      id: 'r200',
      amount: 30,
      date: '2023-04-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    // Ensure default categories are present
    await syncCategoriesWithReceipts(store);
    const catsBefore = await getAllCategories(store);
    const namesBefore = catsBefore.map((c) => c.name);
    expect(namesBefore).toContain('Supplies');

    // Attempt an invalid rename (duplicate name)
    const renameResult = await renameCategory(store, 'Supplies', 'Supplies');

    // Expect a non‑empty error message
    expect(typeof renameResult).toBe('string');
    expect(renameResult).toMatch(/Category must/);

    // Receipts must stay unchanged
    const receiptsAfter = await getAllReceipts(store);
    expect(receiptsAfter).toHaveLength(1);
    expect(receiptsAfter[0].category).toBe('Supplies');

    // Category list must be unchanged
    const catsAfter = await getAllCategories(store);
    const namesAfter = catsAfter.map((c) => c.name);
    expect(namesAfter).toEqual(expect.arrayContaining(namesBefore));
    expect(namesAfter).toHaveLength(namesBefore.length);
  });
});
