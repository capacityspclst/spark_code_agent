import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  renameCategory,
  getAllCategories,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('M9: default category rename preserves receipt fields', () => {
  it('renames a default category case‑insensitively, updates receipts, preserves other receipt fields, and correctly handles subsequent renames using the original name', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'rX',
      amount: 123.45,
      date: '2023-05-01',
      category: 'Meals',
      type: 'expense',
      notes: 'team lunch',
    };
    await addReceipt(store, receipt);

    // First rename using a different case for the old name
    const firstResult = await renameCategory(store, 'meals', 'Food & Dining');
    expect(firstResult).toBeNull();

    // Category list reflects the first rename
    let categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Meals')).toBeUndefined();
    const firstRenamed = categories.find(c => c.name === 'Food & Dining');
    expect(firstRenamed).toBeDefined();

    // New name should be reported as in use
    expect(await isCategoryInUse('Food & Dining')).toBe(true);

    // Receipt should have updated category but unchanged other fields after first rename
    let receipts = await getAllReceipts(store);
    let updated = receipts.find(r => r.id === receipt.id);
    expect(updated?.category).toBe('Food & Dining');
    expect(updated?.amount).toBe(receipt.amount);
    expect(updated?.date).toBe(receipt.date);
    expect(updated?.type).toBe(receipt.type);
    expect(updated?.notes).toBe(receipt.notes);

    // Second rename using the original default name (case‑insensitive)
    const secondResult = await renameCategory(store, 'MEALS', 'Dining');
    expect(secondResult).toBeNull();

    // Category list reflects the second rename, and no old names remain
    categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Food & Dining')).toBeUndefined();
    const secondRenamed = categories.find(c => c.name === 'Dining');
    expect(secondRenamed).toBeDefined();

    // New name should be reported as in use
    expect(await isCategoryInUse('Dining')).toBe(true);

    // Receipt should now have the second new category, other fields unchanged
    receipts = await getAllReceipts(store);
    updated = receipts.find(r => r.id === receipt.id);
    expect(updated?.category).toBe('Dining');
    expect(updated?.amount).toBe(receipt.amount);
    expect(updated?.date).toBe(receipt.date);
    expect(updated?.type).toBe(receipt.type);
    expect(updated?.notes).toBe(receipt.notes);

    // Sync should not re‑introduce any old category name
    await syncCategoriesWithReceipts(store);
    const categoriesAfterSync = await getAllCategories(store);
    expect(categoriesAfterSync.find(c => c.name === 'Meals')).toBeUndefined();
    expect(categoriesAfterSync.find(c => c.name === 'Food & Dining')).toBeUndefined();
  });
});
