import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  renameCategory,
  getAllCategories,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('M7: category rename updates receipts and categories', () => {
  it('renames a default category, updates receipts, and correctly handles subsequent renames using the original name', async () => {
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

    // First rename: Meals -> Food & Dining
    const firstResult = await renameCategory(store, 'Meals', 'Food & Dining');
    expect(firstResult).toBeNull();

    // Category list should reflect the first rename
    let categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Meals')).toBeUndefined();
    const firstRenamed = categories.find(c => c.name === 'Food & Dining');
    expect(firstRenamed).toBeDefined();
    expect(firstRenamed?.id).toBe('Meals'); // default id stays the same

    // The new name should be reported as in use
    expect(await isCategoryInUse('Food & Dining')).toBe(true);

    // Receipts should have been updated
    let receipts = await getAllReceipts(store);
    const updatedA1 = receipts.find(r => r.id === 'rA');
    expect(updatedA1?.category).toBe('Food & Dining');
    const unchangedB1 = receipts.find(r => r.id === 'rB');
    expect(unchangedB1?.category).toBe('Supplies');

    // Second rename using the original default name: Meals -> Cuisine
    const secondResult = await renameCategory(store, 'Meals', 'Cuisine');
    expect(secondResult).toBeNull();

    // Category list should now reflect the second rename and no remnants of the first renamed name
    categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Food & Dining')).toBeUndefined();
    const secondRenamed = categories.find(c => c.name === 'Cuisine');
    expect(secondRenamed).toBeDefined();
    expect(secondRenamed?.id).toBe('Meals');

    // The new name should be reported as in use
    expect(await isCategoryInUse('Cuisine')).toBe(true);

    // Receipts should have been updated to the second new name
    receipts = await getAllReceipts(store);
    const updatedA2 = receipts.find(r => r.id === 'rA');
    expect(updatedA2?.category).toBe('Cuisine');
    const unchangedB2 = receipts.find(r => r.id === 'rB');
    expect(unchangedB2?.category).toBe('Supplies');

    // Running syncCategoriesWithReceipts must not bring back any old default name
    await syncCategoriesWithReceipts(store);
    const categoriesAfterSync = await getAllCategories(store);
    expect(categoriesAfterSync.find(c => c.name === 'Meals')).toBeUndefined();
    expect(categoriesAfterSync.find(c => c.name === 'Food & Dining')).toBeUndefined();
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
    const renameResult = await renameCategory(store, 'Supplies', 'Food & Dining');

    // renameCategory should signal a conflict (non‑null string) and not modify data
    expect(renameResult).toBe('Category already exists.');

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
