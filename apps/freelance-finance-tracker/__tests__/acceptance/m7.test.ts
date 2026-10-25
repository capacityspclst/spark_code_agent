import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  renameCategory,
  getAllCategories,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('M7: category rename updates receipts and categories', () => {
  it('renames a category and updates all receipts using it', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add receipts using the category to be renamed and another category
    const receiptA = {
      id: 'rA',
      amount: 100,
      date: '2023-01-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    const receiptB = {
      id: 'rB',
      amount: 200,
      date: '2023-01-02',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receiptA);
    await addReceipt(store, receiptB);

    // Perform the rename
    await renameCategory(store, 'Meals', 'Food & Dining');

    // Category list should reflect the rename
    const categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Meals')).toBeUndefined();
    expect(categories.find(c => c.name === 'Food & Dining')).toBeDefined();

    // The new name should be reported as in use
    expect(await isCategoryInUse('Food & Dining')).toBe(true);

    // Receipts should have been updated
    const receipts = await getAllReceipts(store);
    const updatedA = receipts.find(r => r.id === 'rA');
    expect(updatedA?.category).toBe('Food & Dining');

    const unchangedB = receipts.find(r => r.id === 'rB');
    expect(unchangedB?.category).toBe('Supplies');

    // Running syncCategoriesWithReceipts must not bring back the old name
    await syncCategoriesWithReceipts(store);
    const categoriesAfterSync = await getAllCategories(store);
    expect(categoriesAfterSync.find(c => c.name === 'Meals')).toBeUndefined();
  });

  it('does not rename when the target name already exists and leaves data untouched', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a receipt in a default category
    const receipt = {
      id: 'rC',
      amount: 150,
      date: '2023-01-03',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    // First rename a different category to create a target name
    await renameCategory(store, 'Meals', 'Food & Dining');

    // Attempt to rename 'Supplies' to the already‑taken name
    let renameError: any = null;
    try {
      await renameCategory(store, 'Supplies', 'Food & Dining');
    } catch (e) {
      renameError = e;
    }

    // No error is also acceptable – the function should simply do nothing.
    // Verify that the categories list still contains both original names
    const categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Supplies')).toBeDefined();
    expect(categories.find(c => c.name === 'Food & Dining')).toBeDefined();

    // Verify that the receipt's category was not changed
    const receipts = await getAllReceipts(store);
    const unchanged = receipts.find(r => r.id === 'rC');
    expect(unchanged?.category).toBe('Supplies');
  });
});
