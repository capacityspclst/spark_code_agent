import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  renameCategory,
  getAllCategories,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('M10: custom category rename updates receipts and preserves fields', () => {
  it('renames a custom category case‑insensitively, updates matching receipts, and leaves other fields untouched', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receiptCustom = {
      id: 'rcA',
      amount: 75,
      date: '2023-04-01',
      category: 'Travel Concierge',
      type: 'expense',
      notes: 'hotel booking',
    };
    const receiptOther = {
      id: 'roA',
      amount: 30,
      date: '2023-04-02',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receiptCustom);
    await addReceipt(store, receiptOther);

    // Ensure the custom category is recognized
    await syncCategoriesWithReceipts(store);
    const catsBefore = await getAllCategories(store);
    const customCatBefore = catsBefore.find(c => c.name === 'Travel Concierge');
    expect(customCatBefore).toBeDefined();

    // Rename the custom category using a different case for the old name
    const renameResult = await renameCategory(store, 'travel concierge', 'Travel Pro');
    expect(renameResult).toBeNull();

    // Category list should reflect the change
    const categories = await getAllCategories(store);
    expect(categories.find(c => c.name === 'Travel Concierge')).toBeUndefined();
    const newCat = categories.find(c => c.name === 'Travel Pro');
    expect(newCat).toBeDefined();

    // New name should be reported as in use
    expect(await isCategoryInUse('Travel Pro')).toBe(true);

    // Receipts should be updated correctly
    const receipts = await getAllReceipts(store);
    const updatedCustom = receipts.find(r => r.id === receiptCustom.id);
    expect(updatedCustom?.category).toBe('Travel Pro');
    // Verify other fields unchanged
    expect(updatedCustom?.amount).toBe(receiptCustom.amount);
    expect(updatedCustom?.date).toBe(receiptCustom.date);
    expect(updatedCustom?.type).toBe(receiptCustom.type);
    expect(updatedCustom?.notes).toBe(receiptCustom.notes);

    // Receipt with other category unchanged
    const other = receipts.find(r => r.id === receiptOther.id);
    expect(other?.category).toBe('Meals');

    // Sync should not bring back the old custom category name
    await syncCategoriesWithReceipts(store);
    const catsAfterSync = await getAllCategories(store);
    expect(catsAfterSync.find(c => c.name === 'Travel Concierge')).toBeUndefined();
  });
});
