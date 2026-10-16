// Minimal Ledger stub to satisfy build. Full implementation to be added later.
export interface LedgerEntry {
  seq: number;
  at: string; // ISO timestamp
  kind: string;
  recordId: string;
  data: any;
  prevHash: string;
  hash: string;
}

// Append a ledger entry (placeholder).
export async function appendLedgerEntry(entry: LedgerEntry): Promise<void> {
  // No-op: real implementation will store encrypted entry.
}
