import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  getAllCategories,
  renameCategory,
  syncCategoriesWithReceipts,
  isCategoryInUse,
} from '../../src/lib/categories';

describe('M6: renameCategory failure modes preserve updated state', () => {
  it('updates receipts on a successful rename and does not revert them on a subsequent failure', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a receipt using a default category.
    const receipt = {
      id: 'rX',
      amount: 100,
      date: '2023-08-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await syncCategoriesWithReceipts(store);

    // Successful rename (case‑insensitive old name).
    const success = await renameCategory(store, 'meals', 'Food & Dining');
    expect(success).toBeFalsy();

    // Receipt should now reference the new category.
    let receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Food & Dining');

    // Attempt a failing rename: new name already exists.
    const fail = await renameCategory(store, 'Food & Dining', 'Supplies');
    expect(fail).toBeTruthy();

    // Receipt must still reference the new name – it must not revert.
    receipts = await getAllReceipts(store);
    expect(receipts[0].category).toBe('Food & Dining');

    // The category list should still contain the new name and not the old one.
    const cats = await getAllCategories(store);
    expect(cats.find(c => c.name === 'Food & Dining')).toBeDefined();
    expect(cats.find(c => c.name === 'Meals')).toBeUndefined();
  });

  it('fails when the new name already exists and leaves data untouched', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'rC',
      amount: 75,
      date: '2023-06-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await syncCategoriesWithReceipts(store);

    const renameResult = await renameCategory(store, 'Meals', 'Supplies');
    expect(renameResult).toBeTruthy();

    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Meals');

    const categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Meals')).toBeDefined();
    expect(categories.find(c => c.name === 'Supplies')).toBeDefined();
  });

  it('fails when the old category does not exist and leaves data untouched', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'rD',
      amount: 40,
      date: '2023-07-01',
      category: 'Travel',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await syncCategoriesWithReceipts(store);

    const renameResult = await renameCategory(store, 'NonExistentCategory', 'NewCategory');
    expect(renameResult).toBeTruthy();

    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Travel');

    const categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'NewCategory')).toBeUndefined();
    expect(categories.find(c => c.name === 'Travel')).toBeDefined();
  });

  it('fails when the new name is invalid and leaves receipts and categories unchanged', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'rE',
      amount: 50,
      date: '2023-09-01',
      category: 'Advertising & marketing',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);
    await syncCategoriesWithReceipts(store);

    // Attempt to rename to an invalid name containing forbidden characters.
    const renameResult = await renameCategory(store, 'Advertising & marketing', '<Invalid>');
    expect(renameResult).toBeTruthy();

    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Advertising & marketing');

    const categories = await getAllCategories(store);
    const oldCat = categories.find(c => c.name === 'Advertising & marketing');
    expect(oldCat).toBeDefined();
    const invalidCat = categories.find(c => c.name === '<Invalid>');
    expect(invalidCat).toBeUndefined();
  });
});
