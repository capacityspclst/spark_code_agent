import {
  createStore,
  createMemoryRawStore,
  createMemoryKeyProvider,
} from '../../src/lib/storage/memory';
import {
  addReceipt,
  getAllReceipts,
} from '../../src/lib/receiptStore';
import {
  getAllCategories,
  renameCategory,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';
import { validateMileageMiles } from '../../src/lib/validation';

describe('pinned: category management and mileage validation (updated to new spec)', () => {
  /*** renameCategory ***/
  it('pinned: renameCategory updates the categories list and updates receipts accordingly', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // create a receipt that uses the default category "Meals"
    const receipt = {
      id: 'r1',
      amount: 40,
      date: '2023-09-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    // perform a successful rename
    const renameResult = await renameCategory(store, 'Meals', 'Food & Dining');
    expect(renameResult).toBeNull();

    // the receipt should now have the new category value
    const receiptsAfter = await getAllReceipts(store);
    expect(receiptsAfter).toHaveLength(1);
    const updatedReceipt = receiptsAfter[0];
    expect(updatedReceipt.category).toBe('Food & Dining');

    // the categories list should now show the new name and no entry with the old name
    const categories = await getAllCategories(store);
    const renamed = categories.find((c) => c.name === 'Food & Dining');
    const old = categories.find((c) => c.name === 'Meals');
    expect(renamed).toBeDefined();
    expect(old).toBeUndefined();
  });

  it('pinned: renameCategory prevents case‑insensitive duplicate names', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const before = await getAllCategories(store);
    const result = await renameCategory(store, 'Meals', 'meals'); // same name, different case
    expect(result).toBe('Category already exists.');

    // categories should be unchanged
    const after = await getAllCategories(store);
    expect(after).toEqual(before);
  });

  /*** isCategoryInUse ***/
  it('pinned: isCategoryInUse is case‑insensitive and the new name is considered in use after rename', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // receipt with lowercase category
    await addReceipt(store, {
      id: 'r2',
      amount: 30,
      date: '2023-09-02',
      category: 'meals',
      type: 'expense',
      notes: '',
    });

    // both forms should be recognised as in use before rename
    expect(await isCategoryInUse(store, 'Meals')).toBe(true);
    expect(await isCategoryInUse(store, 'MEALS')).toBe(true);

    // rename the default category (should update the receipt)
    await renameCategory(store, 'Meals', 'Food & Dining');

    // after rename the new name should be reported as in use
    expect(await isCategoryInUse(store, 'Food & Dining')).toBe(true);
    // the old name should no longer be reported as in use
    expect(await isCategoryInUse(store, 'Meals')).toBe(false);
  });

  /*** syncCategoriesWithReceipts ***/
  it('pinned: syncCategoriesWithReceipts does not resurrect an old custom category after a rename that updates receipts', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // receipt using a custom category
    const receipt = {
      id: 'r3',
      amount: 75,
      date: '2023-06-01',
      category: 'Travel Concierge',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    // first sync – picks up the custom category
    await syncCategoriesWithReceipts(store);
    const catsAfterFirstSync = await getAllCategories(store);
    const customBefore = catsAfterFirstSync.find((c) => c.name === 'Travel Concierge');
    expect(customBefore).toBeDefined();
    expect(customBefore?.custom).toBe(true);

    // rename the custom category (receipt should be updated)
    const renameResult = await renameCategory(store, 'Travel Concierge', 'Travel');
    expect(renameResult).toBeNull();

    // after rename the category list should only contain the new name
    const catsAfterRename = await getAllCategories(store);
    const oldAfterRename = catsAfterRename.find((c) => c.name === 'Travel Concierge');
    const newAfterRename = catsAfterRename.find((c) => c.name === 'Travel');
    expect(oldAfterRename).toBeUndefined();
    expect(newAfterRename).toBeDefined();

    // sync again – the old category should NOT re‑appear
    await syncCategoriesWithReceipts(store);
    const catsAfterResync = await getAllCategories(store);
    const resurrected = catsAfterResync.find((c) => c.name === 'Travel Concierge');
    const stillNew = catsAfterResync.find((c) => c.name === 'Travel');
    expect(resurrected).toBeUndefined();
    expect(stillNew).toBeDefined();
  });

  /*** validateMileageMiles ***/
  it('pinned: validateMileageMiles accepts decimal miles (≤1 decimal place) and rejects invalid inputs', () => {
    // valid one‑decimal place
    expect(validateMileageMiles(12.5)).toBeNull();
    // valid string representation
    expect(validateMileageMiles('12.5')).toBeNull();

    // too many decimal places
    expect(validateMileageMiles(12.55)).toBe('Miles can have at most 1 decimal place');

    // non‑numeric string
    expect(validateMileageMiles('abc')).toBe('Miles must be a number');

    // zero / negative values
    expect(validateMileageMiles(0)).toBe('Miles must be > 0');
    expect(validateMileageMiles(-5)).toBe('Miles must be > 0');

    // empty input
    expect(validateMileageMiles('')).toBe('Miles must be > 0');

    // optional upper bound (still enforced)
    expect(validateMileageMiles(10001)).toBe('Miles must be ≤ 10,000');
  });
});
