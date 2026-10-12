# Retrospective: run 20261010-140319-3cd7

Task: Harden the app for v1.0. No new features: keep every screen, label, flow and the current look the same, and keep all existing tests passing. Changes: (1) "Delete all data" also discards the database encryption key and creates a new one, so deleted data can never be recovered (the policy acceptance stays). (2) Backups: delete the temporary backup file after the share sheet closes (also if sharing fails or is cancelled). (3) Backup passphrase rules: at least 12 characters, shown before the user types, checked as they type and on "Create backup", with the error under the field. (4) Receipt photos in backups use the current expo-file-system File API (new File(uri).bytes() to read, File.write to restore); the legacy readAsStringAsync/writeAsStringAsync functions are not available in this SDK. Restore writes the photos back and updates each receipt's photo reference. (5) Validate every number field with a friendly error under the field: receipt amounts above 0 and at most 1,000,000 with up to 2 decimals; miles above 0 and at most 10,000; mileage rate 0 to 5 dollars per mile; tax rate 0 to 100 percent. (6) Restore checks the decrypted backup against the expected format (version number, arrays of receipts and mileage entries with the right field types) before changing any data; an invalid backup shows a friendly error and leaves the data untouched. (7) CSV and PDF export buttons are disabled while an export is running, so repeated taps can't start several exports. Add unit tests for 1, 3, 5 and 6.

Outcome: not approved after 5 rounds, 3.6 h

## Observations

- acceptance tests failed with the same error in 5 of 5 rounds: UnicodeEncodeError: 'utf-N' codec can't encode characters in position N-N: surrogates not allowed
- validator 'ui primary flow (.)' blocked 5 of 5 rounds
- validator 'typescript (tsc)' blocked 2 of 5 rounds
- validator 'accessibility, serious or critical (.)' blocked 2 of 5 rounds
- coder hit its turn limit in 5 of 5 rounds ([1, 2, 3, 4, 5])
- slowest round 3 took 51 min; average 39 min

## Went well

- The pipeline surface‑level failures across multiple dimensions (UnicodeEncodeError, UI flow timeouts, TypeScript compile errors, and accessibility violations) in every round, giving clear visibility into the blockers.
- The reviewer consistently produced concrete observations about missing exports, empty screen components, and nested interactive elements, which is valuable guidance for the coder.
- The UI primary‑flow validator was active and detected click timeouts on both phone and desktop sizes, confirming the end‑to‑end UI testing harness is functional.
- The coder was able to generate a large amount of code (over 8 M prompt tokens) and attempted many of the required hardening changes, showing the coding agent can handle the workload.
- The acceptance test runner produced the same UnicodeEncodeError each round, making the root‑cause deterministic and easy to target.

## Improvements for the next run

1. **[high] Prevent UnicodeEncodeError in acceptance test runner**
   - Evidence: Rounds 1‑5 all failed with `UnicodeEncodeError: 'utf-8' codec can't encode characters in position 0-1: surrogates not allowed` (see raw_output round 1). Reviewer repeatedly points out the surrogate emoji in `test_acceptance.py` (round 1, reviewer issue).
   - Change: Sandbox/runner image: set `PYTHONIOENCODING=utf-8` globally. Update `test_acceptance.py` to replace the surrogate emoji `\ud83d\ude80` with a proper code point (`\U0001F680`) or remove it. Add a static validator in `validate.py` that scans all source and test files for surrogate pairs or invalid Unicode characters and fails early with a clear message.
   - Expected effect: Acceptance tests will start without crashing, allowing UI, TypeScript, and other validators to run. Early detection of illegal Unicode prevents repeated round restarts, cutting total runtime by up to 30 %.
2. **[high] Enhance UI validator to pinpoint nested‑interactive accessibility violations and flow blockages**
   - Evidence: Rounds 3‑4 UI validator reported `nested-interactive` errors (see raw_output rounds 3‑4) and UI primary‑flow timed out on clicking "Add"/"Mileage" buttons. Reviewer flagged the FAB component nesting (round 3 reviewer issue).
   - Change: Update `ui_check.mjs` (or add a new UI validator) to: (a) detect any pressable element containing another pressable element, outputting file path, line number, and component name; (b) extend the primary‑flow validator to include element‑hierarchy info when a click times out, linking the failure to the offending JSX node.
   - Expected effect: Coder receives precise, file‑level guidance, can refactor nested buttons in one go, and UI flow tests will pass faster. Reduces UI‑related turn count by ~50 % and eliminates repeated accessibility failures.
3. **[medium] Add TypeScript export audit validator**
   - Evidence: Rounds 1‑2 `typescript (tsc)` validator errors: missing export `validateBackupStructure` (round 1), missing `clearAllData` (round 1), and missing default export in `DashboardScreen.tsx` (round 2). Reviewer highlighted these missing exports in both rounds.
   - Change: Implement a new static validator (e.g., `ts_export_audit.py`) that parses all test files for import statements, cross‑checks them against the source module's exported symbols, and emits a clear error like `File src/lib/dataReset.ts: missing export 'clearAllData'`. Run this validator before the main TypeScript compile step.
   - Expected effect: Export‑related TypeScript errors are caught early, preventing the coder from wasting turns on unrelated fixes. Expected reduction of compile‑error turns by ~30 % and earlier convergence on functional changes.
4. **[medium] Enforce planned test file creation immediately after design**
   - Evidence: Round 1 validator `planned files present` reported missing test files `__tests__/dataReset.test.ts`, `__tests__/passphraseRules.test.ts`, `__tests__/restoreValidation.test.ts`. The same issue persisted through later rounds.
   - Change: Add a post‑designer validator that reads the planner's file list (or `DESIGN.md`) and aborts the round if any planned file is absent, returning the missing file list as feedback to the coder. Increase the missing‑file repeat‑failure guard to 2 before stopping the run.
   - Expected effect: Ensures all required test files are created early, avoiding delayed test‑suite failures and reducing the number of rounds needed to achieve full test coverage.
5. **[medium] Structure reviewer feedback for direct coder action**
   - Evidence: Reviewer issues across rounds were verbose and sometimes bundled several problems in one bullet (e.g., round 1 reviewer issue about `src/lib/validation.ts` signatures). This contributed to the coder hitting its turn limit in every round.
   - Change: Revise the reviewer prompt to require output in a strict format: `FILE: <path> | ISSUE: <short description> | FIX: <code snippet or precise instruction>`. Implement a parser that turns each line into a focused coder instruction for the next turn.
   - Expected effect: Coder receives unambiguous, actionable tasks, cutting the average number of turns per round from ~30 to <15 and reducing overall runtime.
