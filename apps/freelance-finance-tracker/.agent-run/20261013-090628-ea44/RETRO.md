# Retrospective: run 20261013-090628-ea44

Task: Faster receipt and trip entry: scan receipts on the device, pick dates from a calendar, and choose categories from a list. Keep every existing screen, flow, the local-first design and the current look; keep all existing tests passing. Changes: (1) Receipt scanning (OCR), entirely on the device: after the user takes or chooses a receipt photo, read its text with expo-text-extractor ^2.0.0 (Apple Vision on iOS, ML Kit on Android; no network, no cloud). Put it behind src/lib/ocr.ts with recognizeReceiptText(uri) and a pure parseReceipt(text) that returns {merchant, date, total, tax} with each field optional (find the total from lines like TOTAL / AMOUNT DUE / BALANCE, not SUBTOTAL; dates in common US formats; merchant from the first meaningful line). Pre-fill the receipt form with what was found, mark the pre-filled fields with "Check these details" until the user edits or confirms them, and never save automatically. If nothing is found, say so and let the user type the details. On the web, and wherever text recognition is unavailable, the scan button explains "Scanning is available in the phone app" and the manual form still works. Unit-test parseReceipt with at least 8 realistic receipt texts (grocery, fuel, restaurant with tip, hardware store, online order, faded/partial text, a receipt with several dates, one with no total); mock expo-text-extractor in Jest via __mocks__. (2) Date picker: replace typed dates on receipts and mileage entries with react-native-paper-dates ^0.24.1 (a date field that opens a calendar; today by default; no future dates for receipts). (3) Categories: the receipt category is a dropdown pre-loaded with Advertising & marketing, Vehicle & fuel, Meals, Travel & lodging, Office supplies, Software & subscriptions, Phone & internet, Equipment & tools, Professional services, Insurance, Education & training, Bank & payment fees, Other. The dropdown's last option "Add category..." lets the user add their own (1-40 characters, no duplicates ignoring case). Settings gets "Categories" to rename or hide categories; a category used by any receipt can't be deleted, only hidden. Custom categories and changes are stored encrypted through the Store and included in backups and restores (older backups without categories still restore, with the defaults). Existing receipts keep their category text; a category not in the list is added as a custom one. Add unit tests for categories (defaults, add, duplicate, rename, hide, in-use protection, backup round trip) and update ui_flow.json so the primary flow picks a date from the calendar and a category from the dropdown, and adds a custom category.

Outcome: success after 3 rounds, 1.4 h

## Observations

- coder hit its turn limit in 1 of 3 rounds ([1])
- vision scores flat across the run: first rounds [7.9, 8.2, 8.1], last rounds [7.9, 8.2, 8.1]
- slowest round 2 took 43 min; average 24 min

## Went well

- All acceptance tests passed by the final round, resulting in a successful overall run.
- UI flow validator eventually succeeded after the initial fix, confirming that the UI changes were correctly integrated.
- Vision scores stayed stable across rounds, showing that the code generation remained consistent.
- The reviewer correctly identified the missing backup exports and the passphrase validation bug, providing useful diagnostic clues.
- The pipeline completed within the allowed time budget (≈84 min) despite the early setbacks.

## Improvements for the next run

1. **[high] Add pre‑coding export validation to catch missing module exports**
   - Evidence: Round 1 failed the `typescript (tsc)` validator: missing exported members `createBackup`, `restoreBackup`, `validateBackupStructure`, `deleteCategory` (see raw_output round 1). The coder hit its turn limit (64 calls) and spent ~14 min before the issue was discovered.
   - Change: Static validator (validate.py) – introduce an `export_check` step that parses all test imports and the DESIGN.md to build a required‑exports list per file. Run this validator **before** the coder starts (round 0). If any export is missing, fail with a clear message and a stub implementation suggestion.
   - Expected effect: Missing exports are detected early, eliminating wasted coder turns and preventing turn‑limit hits. Convergence speeds up because the coder can start with a correct module skeleton.
2. **[high] Make reviewer feedback actionable with file paths and stub code**
   - Evidence: Reviewer issues in round 1 were generic (e.g., "Missing exported functions createBackup…") leading to the coder’s trial‑and‑error (64 calls). Round 2 still required a separate fix for the passphrase validator, adding 42 min of work.
   - Change: Reviewer prompt – require feedback in the form:
```
File: src/lib/backup.ts
Add export const createBackup = async (store, passphrase) => { /* stub */ };
```
Include line numbers and short code snippets for every issue (exports, validation logic, etc.).
   - Expected effect: Coder receives precise, ready‑to‑copy fixes, reducing the number of iterations and overall round time.
3. **[medium] Enforce a detailed implementation blueprint in the planner output**
   - Evidence: The coder consumed 1 859 113 prompt tokens in round 1 and hit the turn limit, indicating an under‑specified plan. The missing backup exports and the ambiguous validation logic were not listed in the planner’s initial plan.
   - Change: Planner prompt – add a requirement to output a table of all new/modified files with exact function signatures and required export statements. Example:
| File | Exported symbols | Signature |
|------|-----------------|-----------|
| src/lib/backup.ts | createBackup, restoreBackup, validateBackupStructure, deleteCategory | async (store: Store, passphrase: string) => Promise<string> |
Pass this blueprint as the first context for the coder.
   - Expected effect: Provides a clear, low‑entropy roadmap, reduces token usage, and prevents missing‑export bugs, leading to faster convergence.
4. **[medium] Run targeted unit tests for critical validators early**
   - Evidence: Round 2 failed the passphrase validation test (`validateBackupPassphrase('exactly12!!')` returned an error) after a long 42 min iteration. The bug stemmed from an off‑by‑one length check.
   - Change: Add a lightweight validator step that runs the `passphraseRules.test.ts` unit test before the coder begins work on the backup module. If it fails, surface the exact expected behavior (minimum length = 12) to the coder.
   - Expected effect: Detects the boundary‑condition bug before any coding, avoiding the 42‑minute round 2 delay.
5. **[low] Split large tasks into focused phases with lower turn limits**
   - Evidence: Coder hit its turn limit in round 1 (64 calls) and overall round 2 lasted 2554 s (≈43 min). The combined tasks (backup refactor, OCR addition, date picker, category UI) overloaded a single round.
   - Change: Planner – break the overall feature set into separate phases (e.g., "Backup API fixes", "Passphrase validation", "OCR & date picker integration", "Category UI updates"). For each phase set a tighter turn limit (≈30 turns) and restart the coder with the phase‑specific blueprint.
   - Expected effect: Prevents turn‑limit exhaustion, keeps each round short and focused, and improves overall pipeline throughput.
