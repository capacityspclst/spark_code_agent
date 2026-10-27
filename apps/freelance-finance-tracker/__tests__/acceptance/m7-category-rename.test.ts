import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  getAllCategories,
  renameCategory,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('M7: renameCategory updates receipts case‑insensitively', () => {
  it('renames a default category and updates receipts that used the old name', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Store a receipt using the old category name in a different case.
    await addReceipt(store, {
      id: 'r1',
      amount: 20,
      date: '2023-04-01',
      category: 'MEALS', // Upper‑case version of the built‑in "Meals" category
      type: 'expense',
      notes: '',
    });

    // Verify the receipt is stored exactly as written.
    let receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('MEALS');

    // Perform a successful rename of the default category.
    const renameResult = await renameCategory(store, 'Meals', 'Food & Dining');
    expect(renameResult).toBeNull();

    // The receipt should now reference the new category name.
    receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Food & Dining');

    // Sync categories with receipts – the old name must not be re‑added.
    await syncCategoriesWithReceipts(store);

    // The old category name should not appear in the categories list.
    const categories = await getAllCategories(store);
    const oldCat = categories.find((c) => c.name.toLowerCase() === 'meals');
    expect(oldCat).toBeUndefined();

    // The new name must be present.
    const newCat = categories.find((c) => c.name === 'Food & Dining');
    expect(newCat).toBeDefined();

    // The new name should now be reported as “in use”.
    const inUse = await isCategoryInUse(store, 'Food & Dining');
    expect(inUse).toBe(true);
  });
});
