import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  addCustomCategory,
  renameCategory,
  getAllCategories,
} from '../../src/lib/categories';

describe('M9: renameCategory failures do not modify receipts', () => {
  it('does not modify receipts when the new name is invalid (empty string)', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r1',
      amount: 20,
      date: '2023-04-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    });

    // Attempt rename with an invalid name (empty string)
    const result = await renameCategory(store, 'Meals', '');
    expect(result).toBeTruthy(); // should return an error message

    // Receipts must remain unchanged
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Meals');

    // Category list should still contain the original name
    const categories = await getAllCategories(store);
    expect(categories.find((c) => c.name === 'Meals')).toBeDefined();
  });

  it('does not modify receipts when the new name already exists', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a custom category and a receipt using it
    await addCustomCategory(store, 'Travel');
    await addReceipt(store, {
      id: 'r2',
      amount: 30,
      date: '2023-05-01',
      category: 'Travel',
      type: 'expense',
      notes: '',
    });

    // Attempt to rename to an existing default category name
    const result = await renameCategory(store, 'Travel', 'Meals');
    expect(result).toBeTruthy(); // should return an error message

    // Receipts must remain unchanged
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Travel');

    // Both the original custom category and the target existing category should still be present
    const categories = await getAllCategories(store);
    expect(categories.find((c) => c.name === 'Travel')).toBeDefined();
    expect(categories.find((c) => c.name === 'Meals')).toBeDefined();
  });

  it('does not modify receipts when the category to rename does not exist', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r3',
      amount: 45,
      date: '2023-06-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    });

    // Attempt to rename a non‑existent category
    const result = await renameCategory(store, 'NonexistentCategory', 'NewName');
    expect(result).toBeTruthy(); // should return an error message

    // Receipts must remain unchanged
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Supplies');

    // Original categories should still be present and the new name must not have been added
    const categories = await getAllCategories(store);
    expect(categories.find((c) => c.name === 'Supplies')).toBeDefined();
    expect(categories.find((c) => c.name === 'NewName')).toBeUndefined();
  });
});
