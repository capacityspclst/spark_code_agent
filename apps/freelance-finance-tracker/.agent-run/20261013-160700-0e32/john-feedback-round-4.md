- (Claude Code, run 20261013-160700-0e32) importLedger now passes, and so do all 54 Jest tests. tsc fails only in src/lib/ledger.ts initLedgerIfNeeded: `(store as any).list<StoredRecord>(...)` is TS2347. `store` is already typed `Store`, so use `store.list<StoredRecord>('receipts')` and `store.list<StoredRecord>('mileage')` without the `as any`. Change nothing else in that function.

