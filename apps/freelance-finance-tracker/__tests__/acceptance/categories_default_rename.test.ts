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

describe('Category rename default category updates receipts and preserves fields', () => {
  it('renames a default category and updates all receipts that used it (case‑insensitively) while leaving other receipts unchanged', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add receipts using the default category "Meals" in different case variants
    const receiptA = {
      id: 'rA',
      amount: 100,
      date: '2023-01-01',
      category: 'Meals',
      type: 'expense',
      notes: 'Original note',
    };
    const receiptB = {
      id: 'rB',
      amount: 200,
      date: '2023-01-02',
      category: 'meals', // lower‑case to test case‑insensitivity
      type: 'income',
      notes: 'Second note',
    };
    const receiptC = {
      id: 'rC',
      amount: 150,
      date: '2023-01-03',
      category: 'Travel',
      type: 'expense',
      notes: 'Other receipt',
    };

    await addReceipt(store, receiptA);
    await addReceipt(store, receiptB);
    await addReceipt(store, receiptC);

    // The default category should be present before rename
    await syncCategoriesWithReceipts(store);
    let categories = await getAllCategories(store);
    const namesBefore = categories.map((c) => c.name);
    expect(namesBefore).toContain('Meals');

    // Perform the rename to a fresh, unique name
    const renameResult = await renameCategory(store, 'Meals', 'Food & Dining');
    expect(renameResult).toBeFalsy(); // successful rename returns null / undefined

    // Verify that receipts that used the old name are updated
    const receipts = await getAllReceipts(store);
    const updatedA = receipts.find((r) => r.id === 'rA');
    const updatedB = receipts.find((r) => r.id === 'rB');
    const unchangedC = receipts.find((r) => r.id === 'rC');

    expect(updatedA?.category).toBe('Food & Dining');
    expect(updatedB?.category).toBe('Food & Dining');

    // The other fields must be unchanged
    expect(updatedA).toMatchObject({
      id: 'rA',
      amount: 100,
      date: '2023-01-01',
      type: 'expense',
      notes: 'Original note',
    });
    expect(updatedB).toMatchObject({
      id: 'rB',
      amount: 200,
      date: '2023-01-02',
      type: 'income',
      notes: 'Second note',
    });

    // Receipt that used a different category remains untouched
    expect(unchangedC?.category).toBe('Travel');
    expect(unchangedC).toMatchObject({
      id: 'rC',
      amount: 150,
      date: '2023-01-03',
      type: 'expense',
      notes: 'Other receipt',
    });

    // No receipt should still reference the old name (case‑insensitive)
    const oldNameUsed = receipts.some((r) => r.category?.toLowerCase() === 'meals');
    expect(oldNameUsed).toBe(false);

    // Category list should no longer contain the old name but the new name
    categories = await getAllCategories(store);
    const namesAfter = categories.map((c) => c.name);
    expect(namesAfter).not.toContain('Meals');
    expect(namesAfter).toContain('Food & Dining');

    // Syncing again must not resurrect the old name
    await syncCategoriesWithReceipts(store);
    categories = await getAllCategories(store);
    expect(categories.map((c) => c.name)).not.toContain('Meals');

    // The new name must now be reported as in use
    expect(await isCategoryInUse(store, 'Food & Dining')).toBe(true);
  });
});
