                import { createStore, createMemoryRawStore, createMemoryKeyProvider } from '../../src/lib/storage/memory';
                import { recognizeReceiptText, parseReceipt } from '../../src/lib/ocr';
                import { addReceipt, getAllReceipts } from '../../src/lib/receiptStore';
                import { getAllCategories, addCustomCategory, renameCategory, hideCategory, syncCategoriesWithReceipts } from '../../src/lib/categories';
                import * as TextExtractor from 'expo-text-extractor';
                import { Platform } from 'react-native';

                jest.mock('expo-text-extractor');

                describe('M6: OCR integration', () => {
                  it('recognizes receipt text and parses fields correctly', async () => {
                    const sampleText = `
SuperMart
04/15/2023
TOTAL $23.45
`;
                    // mock the extractor to return the sample receipt text
                    (TextExtractor.extractAsync as jest.Mock).mockResolvedValue(sampleText);

                    const uri = 'file:///tmp/receipt.jpg';
                    const raw = await recognizeReceiptText(uri);
                    expect(raw).toContain('SuperMart');

                    const parsed = parseReceipt(raw);
                    expect(parsed.merchant).toBe('SuperMart');
                    expect(parsed.date).toBe('2023-04-15');
                    expect(parsed.total).toBeCloseTo(23.45);
                    expect(parsed.tax).toBeUndefined();
                  });
                });

                describe('M6: categories backup and management', () => {
                  it('adds custom category, renames, hides, and persists through backup', async () => {
                    const store = createStore(createMemoryRawStore(), createMemoryKeyProvider());

                    // add a receipt with a custom category
                    const receipt = {
                      id: 'r100',
                      amount: 50,
                      date: '2023-03-01',
                      category: 'Travel Concierge',
                      type: 'expense',
                      notes: '',
                    };
                    await addReceipt(store, receipt);

                    // sync categories – should add the custom category automatically
                    await syncCategoriesWithReceipts(store);

                    const allCats1 = await getAllCategories(store);
                    const customCat = allCats1.find(c => c.name === 'Travel Concierge');
                    expect(customCat).toBeDefined();
                    expect(customCat?.custom).toBe(true);

                    // rename a default category
                    await renameCategory(store, 'Meals', 'Food & Dining');

                    // attempt to hide the custom category (should fail because it's in use)
                    const hideResult = await hideCategory(store, 'Travel Concierge');
                    expect(hideResult).toMatch(/cannot hide.*in use/i);

                    // create a backup that includes categories
                    const passphrase = 'Testpass123!';
                    const { createBackup, restoreBackup } = await import('../../src/lib/backup');
                    const backupBlob = await createBackup(store, passphrase);
                    expect(typeof backupBlob).toBe('string');

                    // clear the store and restore
                    await store.clearAll();
                    await restoreBackup(store, backupBlob, passphrase);

                    // after restore, categories should persist
                    const allCats2 = await getAllCategories(store);
                    const renamed = allCats2.find(c => c.name === 'Food & Dining');
                    expect(renamed).toBeDefined();

                    const customAfter = allCats2.find(c => c.name === 'Travel Concierge');
                    expect(customAfter).toBeDefined();
                  });
                });
