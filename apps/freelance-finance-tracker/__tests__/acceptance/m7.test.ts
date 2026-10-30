import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
import { addMileageEntry, getAllMileageEntries } from '../../src/lib/mileageStore';
import { calculateMileageDeduction } from '../../src/lib/mileage';
import { validateMileageMiles } from '../../src/lib/validation';
import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
import {
  getAllCategories,
  renameCategory,
  isCategoryInUse,
  syncCategoriesWithReceipts,
} from '../../src/lib/categories';

describe('M7: rename default category updates receipts case‑insensitively', () => {
  it('updates a receipt whose category differs only in case from the renamed category', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Receipt uses a lowercase version of the default category name
    const receipt = {
      id: 'rCase',
      amount: 40,
      date: '2023-09-01',
      category: 'meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    // Rename the default category (exact case as stored in the defaults list)
    await renameCategory(store, 'Meals', 'Food & Dining');

    // Receipt should now reflect the new category name
    const receipts = await getAllReceipts(store);
    expect(receipts).toHaveLength(1);
    expect(receipts[0].category).toBe('Food & Dining');

    // Ensure the old name does not re‑appear after sync
    await syncCategoriesWithReceipts(store);
    const categories = await getAllCategories(store);
    expect(categories.some(c => c.name === 'Meals')).toBe(false);
    expect(categories.some(c => c.name === 'Food & Dining')).toBe(true);
  });
});

describe('M7: rename custom category updates receipts and preserves fields', () => {
  it('renames a custom category, updates receipt category, and leaves all other receipt fields untouched', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'r200',
      amount: 75,
      date: '2023-06-01',
      category: 'Travel Concierge',
      type: 'expense',
      notes: 'client travel',
    };

    await addReceipt(store, receipt);
    // Ensure the custom category is recognised by the system
    await syncCategoriesWithReceipts(store);

    const catsBefore = await getAllCategories(store);
    const customCat = catsBefore.find(c => c.name === 'Travel Concierge');
    expect(customCat).toBeDefined();

    const receiptsBefore = await getAllReceipts(store);
    const original = receiptsBefore[0];
    expect(original.category).toBe('Travel Concierge');

    // Perform the rename
    await renameCategory(store, 'Travel Concierge', 'Travel');

    // Verify receipt category changed and other fields stayed the same
    const receiptsAfter = await getAllReceipts(store);
    expect(receiptsAfter).toHaveLength(1);
    const updated = receiptsAfter[0];
    expect(updated.category).toBe('Travel');
    expect(updated.id).toBe(original.id);
    expect(updated.amount).toBe(original.amount);
    expect(updated.date).toBe(original.date);
    expect(updated.type).toBe(original.type);
    expect(updated.notes).toBe(original.notes);

    // Category list reflects the rename
    const catsAfter = await getAllCategories(store);
    expect(catsAfter.some(c => c.name === 'Travel Concierge')).toBe(false);
    expect(catsAfter.some(c => c.name === 'Travel')).toBe(true);

    // The new name is now considered "in use"
    const inUse = await isCategoryInUse(store, 'Travel');
    expect(inUse).toBe(true);

    // Sync should not resurrect the old name
    await syncCategoriesWithReceipts(store);
    const postSyncCats = await getAllCategories(store);
    expect(postSyncCats.some(c => c.name === 'Travel Concierge')).toBe(false);
    expect(postSyncCats.some(c => c.name === 'Travel')).toBe(true);
  });
});

describe('M7: rename category failure does not modify receipts or categories', () => {
  it('leaves everything unchanged when the new name is invalid (empty string)', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'rInvalid',
      amount: 20,
      date: '2023-07-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    const beforeReceipt = (await getAllReceipts(store))[0];

    // Attempt an invalid rename; any error is ignored – the contract is that nothing changes
    try {
      await renameCategory(store, 'Meals', '');
    } catch {
      // ignore
    }

    const afterReceipt = (await getAllReceipts(store))[0];
    expect(afterReceipt.category).toBe('Meals');
    expect(afterReceipt.id).toBe(beforeReceipt.id);
    expect(afterReceipt.amount).toBe(beforeReceipt.amount);
    expect(afterReceipt.date).toBe(beforeReceipt.date);
    expect(afterReceipt.type).toBe(beforeReceipt.type);
    expect(afterReceipt.notes).toBe(beforeReceipt.notes);

    const categories = await getAllCategories(store);
    expect(categories.some(c => c.name === '')).toBe(false);
    expect(categories.some(c => c.name === 'Meals')).toBe(true);
  });

  it('leaves everything unchanged when the new name already exists', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'rDup',
      amount: 30,
      date: '2023-08-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    const beforeReceipt = (await getAllReceipts(store))[0];

    // "Supplies" is a default category and already exists
    try {
      await renameCategory(store, 'Meals', 'Supplies');
    } catch {
      // ignore
    }

    const afterReceipt = (await getAllReceipts(store))[0];
    expect(afterReceipt.category).toBe('Meals');
    expect(afterReceipt.id).toBe(beforeReceipt.id);
    expect(afterReceipt.amount).toBe(beforeReceipt.amount);
    expect(afterReceipt.date).toBe(beforeReceipt.date);
    expect(afterReceipt.type).toBe(beforeReceipt.type);
    expect(afterReceipt.notes).toBe(beforeReceipt.notes);

    const categories = await getAllCategories(store);
    expect(categories.some(c => c.name === 'Meals')).toBe(true);
    expect(categories.some(c => c.name === 'Supplies')).toBe(true);
    // No stray category was created
    expect(categories.some(c => c.name === 'NewName')).toBe(false);
  });

  it('leaves everything unchanged when the original category is not found', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    const receipt = {
      id: 'rMissing',
      amount: 45,
      date: '2023-09-01',
      category: 'Meals',
      type: 'expense',
      notes: '',
    };
    await addReceipt(store, receipt);

    const beforeReceipt = (await getAllReceipts(store))[0];

    // Attempt to rename a non‑existent category
    try {
      await renameCategory(store, 'NonexistentCategory', 'NewCategory');
    } catch {
      // ignore
    }

    const afterReceipt = (await getAllReceipts(store))[0];
    expect(afterReceipt.category).toBe('Meals');
    expect(afterReceipt.id).toBe(beforeReceipt.id);
    expect(afterReceipt.amount).toBe(beforeReceipt.amount);
    expect(afterReceipt.date).toBe(beforeReceipt.date);
    expect(afterReceipt.type).toBe(beforeReceipt.type);
    expect(afterReceipt.notes).toBe(beforeReceipt.notes);

    const categories = await getAllCategories(store);
    // Original category remains, new one is not added
    expect(categories.some(c => c.name === 'Meals')).toBe(true);
    expect(categories.some(c => c.name === 'NonexistentCategory')).toBe(false);
    expect(categories.some(c => c.name === 'NewCategory')).toBe(false);
  });
});

describe('M7: mileage entry accepts decimal miles', () => {
  it('validates decimal miles, rejects too many decimals and non‑numeric input, and stores a valid fractional entry', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

    // Validation: accept a single decimal place
    expect(validateMileageMiles(12.5)).toBeNull();
    // Reject more than one decimal place
    expect(validateMileageMiles(12.55)).toBe('Miles can have at most 1 decimal place');
    // Accept numeric string with one decimal place
    expect(validateMileageMiles('12.5')).toBeNull();
    // Reject non‑numeric string
    expect(validateMileageMiles('abc')).toBe('Miles must be a number');

    // Store a valid entry with fractional miles
    const entry = {
      id: 'm1',
      date: '2023-05-01',
      miles: 12.5,
      purpose: 'Client site visit',
    };

    await addMileageEntry(store, entry);
    const entries = await getAllMileageEntries(store);
    expect(entries).toHaveLength(1);
    expect(entries[0].miles).toBeCloseTo(12.5, 2);

    // Deduction uses the fractional value
    const rate = 0.585; // Default IRS rate
    const expectedDeduction = 12.5 * rate;
    const deduction = calculateMileageDeduction(entry.miles, rate);
    expect(deduction).toBeCloseTo(expectedDeduction, 5);
  });
});
