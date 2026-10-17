export async function appendEntryForExport(format: 'csv' | 'pdf', code: string, entriesCount: number, headHashPrev: string, store: Store): Promise<void> {
  const ledger = await getLedger(store);
  const seq = ledger.length ? ledger[ledger.length - 1].seq + 1 : 1;
  const at = new Date().toISOString();
  const prevHash = ledger.length ? ledger[ledger.length - 1].hash : '0'.repeat(64);
  // Prepare data object; we'll set correct fields after hash is computed
  const data: any = { format, code, entries: 0, headHash: '' };
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = { seq, at, kind: 'export.created', recordId: '', data, prevHash };
  const hash = computeHash(entryWithoutHash);
  // Set data fields based on the new entry
  data.entries = seq; // total entries including this one (matches ledger length after push)
  data.headHash = hash; // use the entry's own hash for both CSV and PDF
  const entry: LedgerEntry = { ...entryWithoutHash, hash };
  ledger.push(entry);
  await setLedger(store, ledger);
}
