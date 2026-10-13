import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../src/lib/storage/memory';
import { getAllCategories, addCustomCategory, renameCategory, hideCategory, deleteCategory, syncCategoriesWithReceipts } from '../src/lib/categories';
import { addReceipt } from '../src/lib/receiptStore';
import { createBackup, restoreBackup } from '../src/lib/backup';

describe('Categories module', () => {
  it('provides default categories', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    const cats = await getAllCategories(store);
    const defaultNames = cats.filter(c => !c.custom).map(c => c.name);
    expect(defaultNames).toEqual(expect.arrayContaining([
      'Advertising & marketing',
      'Vehicle & fuel',
      'Meals',
      'Travel & lodging',
      'Office supplies',
      'Software & subscriptions',
      'Phone & internet',
      'Equipment & tools',
      'Professional services',
      'Insurance',
      'Education & training',
      'Bank & payment fees',
      'Other',
    ]));
  });

  it('adds, prevents duplicate, renames, hides, and protects deletion', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    // add custom
    expect(await addCustomCategory(store, 'My Category')).toBeNull();
    // duplicate (case-insensitive)
    expect(await addCustomCategory(store, 'my category')).toMatch(/already exists/i);
    // rename default
    expect(await renameCategory(store, 'Meals', 'Food & Dining')).toBeNull();
    const renamed = (await getAllCategories(store)).find(c => c.name === 'Food & Dining');
    expect(renamed).toBeDefined();
    // hide custom
    expect(await hideCategory(store, 'My Category')).toBeNull();
    const hid = (await getAllCategories(store)).find(c => c.name === 'My Category');
    expect(hid?.hidden).toBe(true);
    // add receipt using custom (still hidden)
    await addReceipt(store, { id: 'r1', amount: 10, date: '2023-01-01', category: 'My Category', type: 'expense', notes: '' });
    // attempt delete (should fail)
    expect(await deleteCategory(store, 'My Category')).toMatch(/in use/i);
  });

  it('syncs categories from receipts and backup restores', async () => {
    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    // receipt with unknown category
    await addReceipt(store, { id: 'r2', amount: 20, date: '2023-02-02', category: 'Extra Cat', type: 'expense', notes: '' });
    await syncCategoriesWithReceipts(store);
    const custom = (await getAllCategories(store)).find(c => c.name === 'Extra Cat');
    expect(custom?.custom).toBe(true);
    // rename default and hide custom, then backup
    await renameCategory(store, 'Meals', 'Food');
    await hideCategory(store, 'Extra Cat');
    const backup = await createBackup(store, 'Pass123!');
    // restore into fresh store
    const fresh = createStore(createMemoryRawStore(), createMemoryKeyProvider());
    await restoreBackup(fresh, backup, 'Pass123!');
    const restored = await getAllCategories(fresh);
    expect(restored.find(c => c.name === 'Food')).toBeDefined();
    const hidden = restored.find(c => c.name === 'Extra Cat');
    expect(hidden?.hidden).toBe(true);
  });
});
