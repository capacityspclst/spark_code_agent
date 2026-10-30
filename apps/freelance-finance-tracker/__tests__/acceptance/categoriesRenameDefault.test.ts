import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  getAllCategories,
  renameCategory,
  syncCategoriesWithReceipts,
  isCategoryInUse,
} from '../../src/lib/categories';

describe('M6: default category rename updates receipts and maintains other data', () => {
  it('renames a default category (case‑insensitive) and updates only receipts with that category', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Two receipts: one using the default category to be renamed, one using a different category.
    const receiptToRename = {
      id: 'rA',
      amount: 80,
      date: '2023-05-10',
      category: 'Meals',
      type: 'expense',
      notes: 'Lunch meeting',
    };
    const receiptUntouched = {
      id: 'rB',
      amount: 120,
      date: '2023-05-11',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receiptToRename);
    await addReceipt(store, receiptUntouched);

    // Ensure categories are current.
    await syncCategoriesWithReceipts(store);
    let categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Meals')).toBeDefined();

    // Rename the default category using a different case.
    const renameResult = await renameCategory(store, 'meals', 'Food & Dining');
    expect(renameResult).toBeFalsy();

    // Verify old name removed and new name added.
    categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Meals')).toBeUndefined();
    const newCat = categories.find(c => c.name === 'Food & Dining');
    expect(newCat).toBeDefined();

    // Verify receipts.
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(2);

    const updated = receipts.find(r => r.id === 'rA');
    const untouched = receipts.find(r => r.id === 'rB');

    // Updated receipt should have new category; all other fields unchanged.
    expect(updated?.category).toBe('Food & Dining');
    expect(updated?.amount).toBe(receiptToRename.amount);
    expect(updated?.date).toBe(receiptToRename.date);
    expect(updated?.type).toBe(receiptToRename.type);
    expect(updated?.notes).toBe(receiptToRename.notes);

    // Unchanged receipt should be exactly the same.
    expect(untouched?.category).toBe('Supplies');
    expect(untouched?.amount).toBe(receiptUntouched.amount);
    expect(untouched?.date).toBe(receiptUntouched.date);
    expect(untouched?.type).toBe(receiptUntouched.type);
    expect(untouched?.notes).toBe(receiptUntouched.notes);

    // Category in‑use checks.
    const inUseNew = await isCategoryInUse(store, 'Food & Dining');
    expect(inUseNew).toBe(true);
    const inUseOld = await isCategoryInUse(store, 'Meals');
    expect(inUseOld).toBe(false);

    // A subsequent sync should not resurrect the old name.
    await syncCategoriesWithReceipts(store);
    const afterSync = await getAllCategories(store);
    expect(afterSync.find(c => c.name === 'Meals')).toBeUndefined();
  });
});
