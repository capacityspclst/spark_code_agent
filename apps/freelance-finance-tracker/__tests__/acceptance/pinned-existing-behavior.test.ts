import {
  createStore,
  createMemoryRawStore,
  createMemoryKeyProvider,
} from '../../src/lib/storage/memory';
import {
  addCustomCategory,
  getAllCategories,
  renameCategory,
  hideCategory,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';
import { addReceipt } from '../../src/lib/receiptStore';
import { validateMileageMiles } from '../../src/lib/validation';

describe('Pinned behavior: getAllCategories', () => {
  it('pinned: returns default categories with correct fields and respects hidden flag', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const categories = await getAllCategories(store);
    const meals = categories.find((c) => c.id === 'Meals');
    expect(meals).toBeDefined();
    expect(meals?.name).toBe('Meals');
    expect(meals?.hidden).toBe(false);
    expect(meals?.custom).toBe(false);

    // hide a default category and verify hidden handling
    await hideCategory(store, 'Meals');

    const withHidden = await getAllCategories(store);
    const hiddenMeals = withHidden.find((c) => c.id === 'Meals');
    expect(hiddenMeals?.hidden).toBe(true);

    const withoutHidden = await getAllCategories(store, { includeHidden: false });
    const omitted = withoutHidden.find((c) => c.id === 'Meals');
    expect(omitted).toBeUndefined();
  });
});

describe('Pinned behavior: renameCategory validation and mapping', () => {
  it('pinned: rejects rename when new name already exists (case‑insensitive)', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // create a custom category that would conflict
    await addCustomCategory(store, 'Travel Concierge');

    const result = await renameCategory(store, 'Meals', 'Travel Concierge');
    expect(result).toBe('Category already exists.');
  });

  it('pinned: rejects rename with an invalid new name', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await renameCategory(store, 'Meals', '<Invalid>');
    // exact message from the source (includes a non‑breaking hyphen)
    expect(result).toBe('Category must be 1‑40 characters and not contain < or >.');
  });

  it('pinned: rejects rename when the old name cannot be found', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await renameCategory(store, 'Nonexistent', 'NewName');
    expect(result).toBe('Category not found.');
  });

  it('pinned: successfully renames a default category and updates the visible list', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const result = await renameCategory(store, 'Meals', 'Food & Dining');
    expect(result).toBeFalsy();

    const categories = await getAllCategories(store);
    const entry = categories.find((c) => c.id === 'Meals');
    expect(entry).toBeDefined();
    expect(entry?.name).toBe('Food & Dining');
    expect(entry?.custom).toBe(false);
  });

  it('pinned: successfully renames a custom category and keeps it marked as custom', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addCustomCategory(store, 'Travel Concierge');

    const result = await renameCategory(store, 'Travel Concierge', 'Travel Pro');
    expect(result).toBeFalsy();

    const categories = await getAllCategories(store);
    const oldEntry = categories.find((c) => c.id === 'Travel Concierge');
    expect(oldEntry).toBeUndefined();

    const newEntry = categories.find((c) => c.id === 'Travel Pro');
    expect(newEntry).toBeDefined();
    expect(newEntry?.custom).toBe(true);
    expect(newEntry?.name).toBe('Travel Pro');
  });
});

describe('Pinned behavior: isCategoryInUse case‑insensitivity', () => {
  it('pinned: reports usage irrespective of case', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    await addReceipt(store, {
      id: 'r1',
      amount: 100,
      date: '2023-01-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    });
    await addReceipt(store, {
      id: 'r2',
      amount: 50,
      date: '2023-01-02',
      category: 'Travel',
      type: 'expense',
      notes: '',
    });

    expect(await isCategoryInUse(store, 'meals')).toBe(true);
    expect(await isCategoryInUse(store, 'MEALS')).toBe(true);
    expect(await isCategoryInUse(store, 'travel')).toBe(true);
    expect(await isCategoryInUse(store, 'TRAVEL')).toBe(true);
    expect(await isCategoryInUse(store, 'Unknown')).toBe(false);
  });
});

describe('Pinned behavior: syncCategoriesWithReceipts adds missing valid custom categories', () => {
  it('pinned: extracts unknown receipt categories as custom entries (valid names only) and deduplicates them', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // receipts with a new valid category and an invalid category
    await addReceipt(store, {
      id: 'r1',
      amount: 10,
      date: '2023-01-01',
      category: 'FooBar',
      type: 'expense',
      notes: '',
    });
    await addReceipt(store, {
      id: 'r2',
      amount: 20,
      date: '2023-01-02',
      category: '<Bad>',
      type: 'expense',
      notes: '',
    });
    // another receipt using the same valid category (should not create duplicate)
    await addReceipt(store, {
      id: 'r3',
      amount: 30,
      date: '2023-01-03',
      category: 'FooBar',
      type: 'expense',
      notes: '',
    });

    await syncCategoriesWithReceipts(store);
    const categories = await getAllCategories(store);
    const customNames = categories.filter((c) => c.custom).map((c) => c.name);

    expect(customNames).toContain('FooBar');
    expect(customNames).not.toContain('<Bad>');
    // should appear only once
    expect(customNames.filter((n) => n === 'FooBar')).toHaveLength(1);
  });
});

describe('Pinned behavior: validateMileageMiles integer handling', () => {
  it('pinned: accepts positive integer values', () => {
    expect(validateMileageMiles(1)).toBeNull();
    expect(validateMileageMiles('42')).toBeNull();
  });

  it('pinned: rejects zero or negative values with the correct message', () => {
    expect(validateMileageMiles(0)).toBe('Miles must be > 0');
    expect(validateMileageMiles(-5)).toBe('Miles must be > 0');
    expect(validateMileageMiles('0')).toBe('Miles must be > 0');
    expect(validateMileageMiles('-3')).toBe('Miles must be > 0');
  });

  it('pinned: rejects values greater than 10 000 with the proper message', () => {
    expect(validateMileageMiles(10_001)).toBe('Miles must be ≤ 10,000');
    expect(validateMileageMiles('10001')).toBe('Miles must be ≤ 10,000');
  });
});
