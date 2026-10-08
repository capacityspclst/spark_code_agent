import { createMemoryKeyProvider, createMemoryRawStore } from '../../src/lib/storage/memory';
import { createStore } from '../../src/lib/storage';

describe('encrypted store', () => {
  it('stores settings and records, encrypted at rest', async () => {
    const raw = createMemoryRawStore();
    const store = createStore(raw, createMemoryKeyProvider());
    await store.set('settings.rate', { perMile: 0.7 });
    await store.put('items', { id: 'a', name: 'Office chair', amount: 129.99 });
    await store.put('items', { id: 'b', name: 'Train ticket', amount: 18.5 });

    expect(await store.get('settings.rate')).toEqual({ perMile: 0.7 });
    expect((await store.list<{ id: string; amount: number }>('items')).map((r) => r.id).sort()).toEqual(['a', 'b']);
    expect(raw.dump()).not.toContain('Office chair');
    expect(raw.dump()).not.toContain('perMile');

    await store.delete('items', 'a');
    expect((await store.list('items')).map((r) => r.id)).toEqual(['b']);
    await store.clearAll();
    expect(await store.list('items')).toEqual([]);
    expect(await store.get('settings.rate')).toBeNull();
  });

  it("can't read data with a different key", async () => {
    const raw = createMemoryRawStore();
    await createStore(raw, createMemoryKeyProvider()).set('x', 1);
    await expect(createStore(raw, createMemoryKeyProvider()).get('x')).rejects.toThrow();
  });
});
