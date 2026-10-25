import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  renameCategory,
  getAllCategories,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('M9: default category rename preserves receipt fields', () => {
  it('renames a default category case‑insensitively and leaves other receipt fields unchanged', async () => {
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

    // Rename using a different case for the old name
    await renameCategory(store, 'meals', 'Food & Dining');

    // Category list reflects the rename
    const categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Meals')).toBeUndefined();
    expect(categories.find(c => c.name === 'Food & Dining')).toBeDefined();

    // New name should be reported as in use
    expect(await isCategoryInUse('Food & Dining')).toBe(true);

    // Receipt should have updated category but unchanged other fields
    const receipts = await getAllReceipts(store);
    const updated = receipts.find(r => r.id === receipt.id);
    expect(updated?.category).toBe('Food & Dining');
    expect(updated?.amount).toBe(receipt.amount);
    expect(updated?.date).toBe(receipt.date);
    expect(updated?.type).toBe(receipt.type);
    expect(updated?.notes).toBe(receipt.notes);

    // Sync should not re‑introduce the old category name
    await syncCategoriesWithReceipts(store);
    const categoriesAfterSync = await getAllCategories(store);
    expect(categoriesAfterSync.find(c => c.name === 'Meals')).toBeUndefined();
  });
});
