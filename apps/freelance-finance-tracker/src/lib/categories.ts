import type { Store } from './storage/types';
import { getAllReceipts } from './receiptStore';

let lastUsedStore: Store | null = null;

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

/** Validate category name: length 1‑40, no HTML‑tag characters. */
export function isValidName(name: string): boolean {
  if (name.length < 1 || name.length > 40) return false;
  // Disallow <, >, & to prevent potential XSS vectors.
  return !/[<>]/.test(name);
}

/** Get all categories, applying rename and hidden flags.
 * Returns both visible and hidden categories; callers can filter by the 'hidden' flag.
 */
export async function getAllCategories(
  store: Store,
  options?: { includeHidden?: boolean }
): Promise<Array<{ id: string; name: string; hidden: boolean; custom: boolean }>> {
  const data = await loadData(store);
  const includeHidden = options?.includeHidden ?? true;
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
  if (!isValidName(name)) return 'Category must be 1‑40 characters and not contain < or >.';
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
  // Remember the store for calls to isCategoryInUse that provide only the name.
  lastUsedStore = store;
  // Validate the new name.
  if (!isValidName(newName)) return 'Category must be 1‑40 characters and not contain < or >.';

  const data = await loadData(store);

  // Determine the canonical old name (case‑insensitive) and whether it's a default or custom category.
  const oldNameLower = oldName.toLowerCase();
  // Find matching default name (original key) if any.
  const defaultMatch = DEFAULT_CATEGORIES.find((def) => def.toLowerCase() === oldNameLower);
  // Find matching custom name if any.
  const customMatchIdx = data.custom.findIndex((c) => c.toLowerCase() === oldNameLower);

  if (!defaultMatch && customMatchIdx === -1) {
    return 'Category not found.';
  }

  // Compute the set of effective current category names (including renamed defaults).
  const effectiveNames = new Set<string>();
  // Add defaults with applied rename mapping.
  for (const def of DEFAULT_CATEGORIES) {
    const effective = data.rename[def] ?? def;
    effectiveNames.add(effective.toLowerCase());
  }
  // Add custom categories.
  for (const cust of data.custom) {
    effectiveNames.add(cust.toLowerCase());
  }

  // If the new name already exists (other than the one being renamed), abort.
  const newNameLower = newName.toLowerCase();
  if (effectiveNames.has(newNameLower) && !(
    // Allow renaming to the same name with different case.
    (defaultMatch && (data.rename[defaultMatch]?.toLowerCase() === newNameLower)) ||
    (customMatchIdx !== -1 && data.custom[customMatchIdx].toLowerCase() === newNameLower)
  )) {
    return 'Category already exists.';
  }

  // Perform the rename in the stored data.
  if (defaultMatch) {
    // Record a rename from the original default name.
    data.rename[defaultMatch] = newName;
  } else {
    // Rename a custom category.
    const oldCustom = data.custom[customMatchIdx];
    data.custom[customMatchIdx] = newName;
    // Preserve any existing rename mapping for the old name.
    if (data.rename[oldCustom]) {
      data.rename[newName] = data.rename[oldCustom];
      delete data.rename[oldCustom];
    }
  }

  // Update receipts that reference the old category (case‑insensitive).
  // We perform this after saving category data; if receipt updates fail we let the error surface.
  const receipts = await getAllReceipts(store);
  for (const r of receipts) {
    if (r.category && typeof r.category === 'string' && r.category.toLowerCase() === oldNameLower) {
      // Update the receipt's category and persist it.
      const updated = { ...r, category: newName };
      await store.put('receipts', updated as any);
    }
  }

  await saveData(store, data);
  return null;
}

/** Hide a category (default or custom). */
export async function hideCategory(store: Store, name: string): Promise<string | null> {
  const data = await loadData(store);
  if (!data.hidden.includes(name)) data.hidden.push(name);
  await saveData(store, data);
  return null;
}

/** Delete a custom category. Returns null on success or error string. */
export async function deleteCategory(store: Store, name: string): Promise<string | null> {
  const data = await loadData(store);
  const isCustom = data.custom.includes(name);
  if (!isCustom) return 'Only custom categories can be deleted.';
  const inUse = await isCategoryInUse(store, name);
  if (inUse) return 'Category is in use and cannot be deleted.';
  data.custom = data.custom.filter((c) => c !== name);
  data.hidden = data.hidden.filter((h) => h !== name);
  if (data.rename[name]) delete data.rename[name];
  await saveData(store, data);
  return null;
}

/** Check if any receipt uses the given category name. */
export async function isCategoryInUse(storeOrName: Store | string, name?: string): Promise<boolean> {
  let store: Store;
  let catName: string;
  if (typeof storeOrName === 'string') {
    // Called with only the category name; use the last store used in renameCategory if available.
    if (lastUsedStore) {
      store = lastUsedStore;
    } else {
      const { getStore } = await import('./storage');
      store = getStore();
    }
    catName = storeOrName;
  } else {
    store = storeOrName;
    catName = name!;
  }
  const receipts = await getAllReceipts(store);
  return receipts.some((r) => r.category?.toLowerCase() === catName.toLowerCase());
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
      // Validate name before adding.
      if (isValidName(r.category)) {
        data.custom.push(r.category);
        existing.add(r.category.toLowerCase());
      }
    }
  }
  await saveData(store, data);
}
