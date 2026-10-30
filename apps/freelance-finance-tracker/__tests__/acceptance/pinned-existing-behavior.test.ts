import {
  createStore,
  createMemoryRawStore,
  createMemoryKeyProvider,
} from '../../src/lib/storage/memory';
import { addReceipt } from '../../src/lib/receiptStore';
import {
  getAllCategories,
  renameCategory,
  isCategoryInUse,
  syncCategoriesWithReceipts,
  addCustomCategory,
} from '../../src/lib/categories';
import { validateMileageMiles } from '../../src/lib/validation';

describe('pinned: renameCategory – default category success', () => {
  it('pinned: renames a default category and reflects the new name in getAllCategories', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await renameCategory(store, 'Meals', 'Food & Dining');
    expect(result).toBeNull();

    const categories = await getAllCategories(store);
    const renamed = categories.find((c) => c.id === 'Meals');
    expect(renamed).toBeDefined();
    expect(renamed?.name).toBe('Food & Dining');

    // The old display name should no longer appear.
    const oldNameExists = categories.some((c) => c.name === 'Meals');
    expect(oldNameExists).toBe(false);
  });
});

describe('pinned: renameCategory – custom category success (exact case)', () => {
  it('pinned: renames a custom category (exact case) and updates getAllCategories', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // First create a custom category.
    const addResult = await addCustomCategory(store, 'Travel Concierge');
    expect(addResult).toBeNull();

    // Now rename it.
    const renameResult = await renameCategory(store, 'Travel Concierge', 'Travel Services');
    expect(renameResult).toBeNull();

    const categories = await getAllCategories(store);
    const renamed = categories.find((c) => c.name === 'Travel Services');
    expect(renamed).toBeDefined();
    expect(renamed?.custom).toBe(true);

    const oldExists = categories.some((c) => c.name === 'Travel Concierge');
    expect(oldExists).toBe(false);
  });
});

describe('pinned: renameCategory – duplicate name detection', () => {
  it('pinned: returns an error when the new name already exists (case‑insensitive) among categories', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Add a custom category that will clash.
    await addCustomCategory(store, 'Travel');

    // Attempt to rename a default category to the same name with different case.
    const result = await renameCategory(store, 'Meals', 'travel');
    expect(result).toBe('Category already exists.');
  });
});

describe('pinned: renameCategory – invalid new name handling', () => {
  it('pinned: returns an error when the new name is empty', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await renameCategory(store, 'Meals', '');
    expect(result).toBe('Category must be 1‑40 characters and not contain < or >.');
  });

  it('pinned: returns an error when the new name contains forbidden characters', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await renameCategory(store, 'Meals', '<Invalid>');
    expect(result).toBe('Category must be 1‑40 characters and not contain < or >.');
  });
});

describe('pinned: renameCategory – old name not found', () => {
  it('pinned: returns an error when the old category does not exist', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await renameCategory(store, 'Nonexistent', 'NewCategory');
    expect(result).toBe('Category not found.');
  });
});

describe('pinned: isCategoryInUse detection', () => {
  it('pinned: returns true when a receipt uses the category (case‑insensitive)', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r1',
      amount: 100,
      date: '2023-01-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    });

    const result = await isCategoryInUse(store, 'meals');
    expect(result).toBe(true);
  });

  it('pinned: returns false when no receipt uses the category', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await isCategoryInUse(store, 'Travel');
    expect(result).toBe(false);
  });
});

describe('pinned: syncCategoriesWithReceipts – adding missing custom categories', () => {
  it('pinned: adds a new custom category for a receipt with an unknown valid category', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r1',
      amount: 50,
      date: '2023-02-01',
      category: 'CustomCat',
      type: 'expense',
      notes: '',
    });

    // Before sync, the custom category should not exist.
    let categories = await getAllCategories(store);
    expect(categories.some((c) => c.name === 'CustomCat')).toBe(false);

    await syncCategoriesWithReceipts(store);

    categories = await getAllCategories(store);
    const custom = categories.find((c) => c.name === 'CustomCat');
    expect(custom).toBeDefined();
    expect(custom?.custom).toBe(true);
  });

  it('pinned: does not add a custom category for an invalid receipt category', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r2',
      amount: 30,
      date: '2023-02-02',
      category: '<Invalid>',
      type: 'expense',
      notes: '',
    });

    await syncCategoriesWithReceipts(store);

    const categories = await getAllCategories(store);
    const invalid = categories.find((c) => c.name === '<Invalid>');
    expect(invalid).toBeUndefined();
  });
});

describe('pinned: validateMileageMiles current validation rules', () => {
  it('pinned: accepts a valid integer mileage', () => {
    expect(validateMileageMiles(250)).toBeNull();
  });

  it('pinned: rejects zero mileage', () => {
    expect(validateMileageMiles(0)).toBe('Miles must be > 0');
  });

  it('pinned: rejects negative mileage', () => {
    expect(validateMileageMiles(-5)).toBe('Miles must be > 0');
  });

  it('pinned: rejects mileage above the maximum limit', () => {
    expect(validateMileageMiles(10001)).toBe('Miles must be ≤ 10,000');
  });

  it('pinned: rejects an empty string as mileage', () => {
    expect(validateMileageMiles('')).toBe('Miles must be > 0');
  });

  it('pinned: rejects non‑numeric string input', () => {
    expect(validateMileageMiles('abc' as any)).toBe('Miles must be > 0');
  });
});
