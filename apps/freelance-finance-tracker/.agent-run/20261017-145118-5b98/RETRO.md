# Retrospective: run 20261017-145118-5b98

Task: Evidence ledger: tamper-evident, contemporaneous records that stay on the device. Keep every existing screen, flow, the local-first design and the current look; keep all existing tests passing; never change src/lib/crypto.ts (it is locked). Changes: (1) Ledger core in src/lib/ledger.ts: every receipt and mileage entry, and every edit or deletion of one, appends a ledger entry {seq, at (ISO time), kind ("receipt.created", "receipt.corrected", "receipt.deleted", "mileage.created", "mileage.corrected", "mileage.deleted", "imported", "export.created"), recordId, data (the record's full content after the change; for a deletion, the last content), prevHash, hash}. hash = SHA-256 from @noble/hashes ^2.4.0 (already a dependency; never write your own hashing): import { sha256 } from '@noble/hashes/sha2.js' and { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js', hash = bytesToHex(sha256(utf8ToBytes(canonicalJson))) over a canonical JSON of every field except hash, hex-encoded; the first entry's prevHash is 64 zeros. Entries are stored encrypted through the Store, append-only: nothing ever rewrites or removes an entry (Delete all data is the only exception, and it starts a new ledger). An edit is a "corrected" entry with the new content, so the history shows the original and each dated correction; a receipt's OCR pre-fill and the user's confirmation are both recorded in the data. On first launch after this update, every existing receipt and mileage entry is added once as an "imported" entry (with the import date), so old records are clearly marked as not contemporaneous. verifyLedger(store) recomputes the chain and returns {ok, entries, firstBadSeq?, reason?}. (2) Screens: each receipt and trip gets a "History" view (from its detail/edit screen) listing its original entry and every correction with date and time, newest last. Settings shows the ledger status: "Verified · N entries · intact" or, if verification fails, a clear warning that records may have been altered, naming the first bad entry. (3) Verifiable exports: every CSV and PDF export ends with a verification line: the ledger's entry count, its head hash and a verification code = the first 12 hex characters of SHA-256 over the export's content without that line, plus the head hash. Each export also appends an "export.created" ledger entry {format, code, entries, headHash}. Settings gets "Verify an export": either pick an exported CSV (pickFile; the app recomputes the code from the file without its verification line and finds the matching export entry) or type the code printed on a PDF. The answer says whether the code matches an export made by this app (and when, from how many entries), whether the CSV file was changed after export, and whether any records were corrected or deleted since that export. (4) Backups include the ledger; restore runs verifyLedger on the restored data before replacing anything and refuses a backup whose ledger does not verify, with a friendly error (older backups without a ledger restore and are then imported as "imported" entries). Unit tests: hash chaining and canonical JSON; verify detects a changed field, a removed entry, a reordered entry and a changed prevHash, and reports the first bad seq; corrections keep the original; import runs once; a CSV export verifies, fails after a one-character change to the file, and reports records changed after a later correction; a typed PDF code is found; an unknown code is reported as not from this app; backup round trip keeps a verifying ledger; a tampered backup ledger is refused. Update ui_flow.json so the primary flow edits a receipt, opens its History and sees the correction, and sees the "Verified" status in Settings.

Outcome: not approved after 12 rounds, 10.6 h

## Observations

- acceptance tests failed with the same error in 3 of 12 rounds: failing: __tests__/acceptance/m11.test.ts: M11: CSV verification recompute matches ledger recomputes verificationCode from CSV content and matches ledger entry; __tests__/acceptance/m11.test.ts: M11: PDF export creates ledger entry with verification code adds export.created entry for PDF with a verification code; __tests__/acceptance/m11.test.ts: M11: backup contains ledger entries restoring backup yields ledger entries; __tests__/acceptance/m11.test.ts: M11: export.created ledger entry after CSV export records export.created entry with correct fields for CSV; __tests__/acceptance/m11.test.ts: M11: exp
- validator 'ui primary flow (.)' blocked 12 of 12 rounds
- coder hit its turn limit in 5 of 12 rounds ([1, 2, 5, 9, 10])
- vision scores flat across the run: first rounds [7.8, 7.8, 8.0], last rounds [7.6, 7.6, 7.6]
- slowest round 7 took 92 min; average 53 min

## Went well

- The pipeline ran a full 12‑round iterative loop (≈10 h) and kept all agents active, showing robust orchestration across planner, designer, coder and reviewers.
- The UI validator consistently flagged broken UI flows, preventing regressions from reaching the test suite.
- Acceptance‑test execution was reliable; each round produced a complete Jest summary with explicit failing test names, giving a clear signal of what was still broken.
- The code reviewer detected a wide range of issues (CSV export format, ledger entry creation, TypeScript errors) and supplied detailed diagnostic text each round.
- Static validation (TypeScript compilation) caught errors early, stopping the coder from shipping code that would not even compile.

## Improvements for the next run

1. **[high] Make UI validator emit precise, actionable diagnostics**
   - Evidence: Rounds 1‑12: validator 'ui primary flow (.)' blocked every round. Example round 1: "click button \"Save receipt\"" failed because the button was DISABLED and required fields were empty; round 12: "click tab \"Dashboard\"" failed with "0 matching element(s)". The validator only reported a timeout, giving the coder no guidance on why the UI was disabled or missing.
   - Change: Modify ui_check.mjs (UI validator) to parse Playwright errors and output a structured report: element selector, visibility state, disabled reason (e.g., missing required field), and a one‑line synthesis suggestion (e.g., "Enable Save button when Amount, Date and Category are non‑empty"). Include the affected screen name and a short fix hint.
   - Expected effect: Coder receives concrete UI‑fix instructions instead of a generic timeout, allowing the UI flow to pass after one iteration and eliminating the 12‑round UI blocker.
2. **[high] Enforce structured, checklist‑style reviewer feedback**
   - Evidence: Reviewer messages (round 1, 2, 5, 7, 10…) are long paragraphs with multiple issues combined (e.g., CSV export line format, ledger entry missing, TypeScript missing imports). The coder repeatedly failed to act on the same CSV verification issue across rounds 2‑7, indicating the feedback was not parsed into actionable steps.
   - Change: Update the code‑reviewer prompt to require a Markdown checklist per round: each item must contain file path, line range, exact symptom, expected behaviour, and a suggested code change snippet. Example:
```
- **src/lib/exportCsv.ts: line 42** – verification line includes "# verification:" prefix; test expects plain "<N>,<hash>,<code>". Replace with `${entryCount},${headHash},${code12}`.
```
   - Expected effect: Coder can copy‑paste or directly apply the suggested edits, reducing repeated failures and cutting down the number of rounds needed to converge.
3. **[medium] Raise and make coder turn limit dynamic**
   - Evidence: Observations: coder hit its turn limit in 5 of 12 rounds (rounds 1, 2, 5, 9, 10). Each time the round ended with the message "coder_turn_limit": true, causing the pipeline to pause and waste ~30 min per pause (see round 1 = 2002 s, round 2 = 2697 s).
   - Change: Increase the per‑round turn ceiling from 20‑60 to 30‑80 turns and add a policy: if the coder reaches the upper bound, automatically grant an extra 20‑turn buffer for the same round before forcing a new round.
   - Expected effect: Fewer forced round breaks, lower total runtime, and smoother progress, especially for complex ledger‑hash logic that needs many small edits.
4. **[medium] Break acceptance‑test requirements into atomic sub‑tasks in the planner**
   - Evidence: Across rounds 1‑12, the same families of acceptance failures recur (CSV export verification format, ledger "imported" entry creation, export‑created entry code, backup verification). The planner’s acceptance‑test rules treat these as a monolithic block, so the coder receives overwhelming, unrelated failures each round.
   - Change: Revise the planner prompt and acceptance‑test rule generator to decompose each high‑level requirement (e.g., "CSV export must contain verification line") into separate, versioned test goals with explicit expected values. Emit a roadmap like:
1. Implement CSV verification line format.
2. Add ledger entry on receipt creation.
3. Generate export.created ledger entry with 12‑char code.
4. Verify backup restore calls verifyLedger.
Each round the planner should surface only the next unfinished sub‑task as the primary acceptance target.
   - Expected effect: Coder focuses on one concrete goal per round, fixes it, and sees that specific test pass before moving on, dramatically reducing repeated unrelated failures.
5. **[high] Upgrade static validator to surface concrete fix suggestions**
   - Evidence: Round 5 and 10 TypeScript errors (e.g., "Cannot find name 'getAllReceipts'" and "Cannot find name 'PrimaryButton'") were reported only as a generic "validator: typescript (tsc)" failure. The coder never added the missing imports despite repeated reports, indicating the error details were not actionable.
   - Change: Enhance validate.py to parse tsc output and for each error emit a JSON block with fields: file, line, error code, missing identifier, and a one‑line fix hint (e.g., "Add `import { getAllReceipts } from '../../src/lib/receiptStore'` at the top of the file"). Feed this block into the reviewer feedback so it appears in the checklist style.
   - Expected effect: Missing imports and type errors are corrected immediately, allowing the code to compile and subsequent acceptance tests to run, cutting down many failure cycles.
