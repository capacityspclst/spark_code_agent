import type { Store } from './storage/types';
import { getAllReceipts } from './receiptStore';

/** Shape stored under key 'categories' */
interface CategoriesData {
  custom: string[]; // custom category names
  hidden: string[]; // names (default or custom) that are hidden
  rename: Record<string, string>; // original default name -> new name
}

const STORAGE_KEY = 'categories';

/** Default built‑in categories */
export const DEFAULT_CATEGORIES = [
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
];

/** Ensure the storage has a structure, initialize if missing */
async function loadData(store: Store): Promise<CategoriesData> {
  const raw = await store.get<CategoriesData>(STORAGE_KEY);
  if (raw) return raw;
  const init: CategoriesData = { custom: [], hidden: [], rename: {} };
  await store.set(STORAGE_KEY, init);
  return init;
}

/** Save the whole categories object */
async function saveData(store: Store, data: CategoriesData): Promise<void> {
  await store.set(STORAGE_KEY, data);
}

/** Get all categories, applying rename and hidden flags. */
export async function getAllCategories(
  store: Store,
  options?: { includeHidden?: boolean }
): Promise<Array<{ id: string; name: string; hidden: boolean; custom: boolean }>> {
  const data = await loadData(store);
  const includeHidden = options?.includeHidden ?? false;
  const result: Array<{ id: string; name: string; hidden: boolean; custom: boolean }> = [];
  // defaults
  for (const def of DEFAULT_CATEGORIES) {
    const renamed = data.rename[def] ?? def;
    const hidden = data.hidden.includes(def);
    if (!includeHidden && hidden) continue;
    result.push({ id: def, name: renamed, hidden, custom: false });
  }
  // custom
  for (const cust of data.custom) {
    const hidden = data.hidden.includes(cust);
    if (!includeHidden && hidden) continue;
    result.push({ id: cust, name: cust, hidden, custom: true });
  }
  return result;
}

/** Add a new custom category. Returns null on success or error string. */
export async function addCustomCategory(store: Store, name: string): Promise<string | null> {
  if (name.length < 1 || name.length > 40) return 'Category must be 1–40 characters.';
  const data = await loadData(store);
  const allNames = [...DEFAULT_CATEGORIES, ...data.custom];
  const exists = allNames.some((n) => n.toLowerCase() === name.toLowerCase());
  if (exists) return 'Category already exists.';
  data.custom.push(name);
  await saveData(store, data);
  return null;
}

/** Rename a category (default or custom). */
export async function renameCategory(store: Store, oldName: string, newName: string): Promise<string | null> {
  if (newName.length < 1 || newName.length > 40) return 'Category must be 1–40 characters.';
  const data = await loadData(store);
  const allNames = [...DEFAULT_CATEGORIES, ...data.custom];
  const conflict = allNames.some((n) => n.toLowerCase() === newName.toLowerCase());
  if (conflict) return 'Category already exists.';
  if (DEFAULT_CATEGORIES.includes(oldName)) {
    data.rename[oldName] = newName;
  } else {
    const idx = data.custom.findIndex((c) => c === oldName);
    if (idx === -1) return 'Category not found.';
    data.custom[idx] = newName;
    if (data.rename[oldName]) {
      data.rename[newName] = data.rename[oldName];
      delete data.rename[oldName];
    }
  }
  await saveData(store, data);
  return null;
}

/** Hide a category (default or custom). */
export async function hideCategory(store: Store, name: string): Promise<string | null> {
  // Hiding is allowed even if the category is currently used by receipts.
  const data = await loadData(store);
  if (!data.hidden.includes(name)) data.hidden.push(name);
  await saveData(store, data);
  return null;
}

/** Delete a custom category. Returns null on success or error string. */
export async function deleteCategory(store: Store, name: string): Promise<string | null> {
  // Only custom categories can be deleted, and only if not in use.
  const data = await loadData(store);
  const isCustom = data.custom.includes(name);
  if (!isCustom) return 'Only custom categories can be deleted.';
  const inUse = await isCategoryInUse(store, name);
  if (inUse) return 'Category is in use and cannot be deleted.';
  // Remove from custom list
  data.custom = data.custom.filter((c) => c !== name);
  // Also remove any hidden flag or rename entry for this name
  data.hidden = data.hidden.filter((h) => h !== name);
  // Remove rename mapping if present (unlikely for custom but safe)
  if (data.rename[name]) {
    delete data.rename[name];
  }
  await saveData(store, data);
  return null;
}

/** Check if any receipt uses the given category name. */
export async function isCategoryInUse(store: Store, name: string): Promise<boolean> {
  const receipts = await getAllReceipts(store);
  return receipts.some((r) => r.category?.toLowerCase() === name.toLowerCase());
}

/** Ensure categories list includes any categories appearing in receipts (e.g., from older backups). */
export async function syncCategoriesWithReceipts(store: Store): Promise<void> {
  const receipts = await getAllReceipts(store);
  const data = await loadData(store);
  const existing = new Set([
    ...DEFAULT_CATEGORIES.map((c) => c.toLowerCase()),
    ...data.custom.map((c) => c.toLowerCase()),
  ]);
  for (const r of receipts) {
    if (r.category && !existing.has(r.category.toLowerCase())) {
      data.custom.push(r.category);
      existing.add(r.category.toLowerCase());
    }
  }
  await saveData(store, data);
}
