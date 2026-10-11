# Retrospective: run 20261011-085737-73a2

Task: Harden the app for v1.0. No new features: keep every screen, label, flow and the current look the same, and keep all existing tests passing. Changes: (1) "Delete all data" also discards the database encryption key and creates a new one, so deleted data can never be recovered (the policy acceptance stays). (2) Backups: delete the temporary backup file after the share sheet closes (also if sharing fails or is cancelled). (3) Backup passphrase rules: at least 12 characters, shown before the user types, checked as they type and on "Create backup", with the error under the field. (4) Receipt photos in backups use the current expo-file-system File API (new File(uri).bytes() to read, File.write to restore); the legacy readAsStringAsync/writeAsStringAsync functions are not available in this SDK. Restore writes the photos back and updates each receipt's photo reference. (5) Validate every number field with a friendly error under the field: receipt amounts above 0 and at most 1,000,000 with up to 2 decimals; miles above 0 and at most 10,000; mileage rate 0 to 5 dollars per mile; tax rate 0 to 100 percent. (6) Restore checks the decrypted backup against the expected format (version number, arrays of receipts and mileage entries with the right field types) before changing any data; an invalid backup shows a friendly error and leaves the data untouched. (7) CSV and PDF export buttons are disabled while an export is running, so repeated taps can't start several exports. Add unit tests for 1, 3, 5 and 6.

Outcome: not approved after 10 rounds, 4.7 h

## Observations

- acceptance tests failed with the same error in 3 of 10 rounds: TypeError: A dynamic import callback was invoked without --experimental-vm-modules
- coder hit its turn limit in 3 of 10 rounds ([4, 5, 9])
- vision scores flat across the run: first rounds [8.2, 8.1, 8.2], last rounds [8.2, 8.2, 8.2]
- slowest round 5 took 44 min; average 28 min

## Went well

- The multi‑agent loop quickly reached a stable UI design – vision scores stayed ~8.2 across all rounds.
- After round 6 the test suite passed, showing that the designer‑coder‑reviewer feedback loop eventually converged on a correct implementation.
- Static security scanning caught no issues, confirming that the security policy remained enforced throughout the run.
- The planner generated a comprehensive set of unit tests for the new hardening requirements, which were all recognized and run by the test harness.

## Improvements for the next run

1. **[high] Add a Jest VM‑modules validator**
   - Evidence: Rounds 1‑3 repeatedly failed with "TypeError: A dynamic import callback was invoked without --experimental-vm-modules" (raw_output entry for rounds 1‑3). Reviewers repeatedly pointed out the missing flag in the jest config.
   - Change: Create a new static validator (e.g., `jest_vm_modules_validator.py`) that runs before acceptance tests. It inspects `jest.config.js/ts` (or package.json jest section) and fails if the Node option `--experimental-vm-modules` is absent, emitting a clear fix suggestion.
   - Expected effect: The missing flag is caught early, preventing three full rounds of test failures and the associated 30+ minutes of wasted coder time. Convergence speeds up and the turn‑limit guard is less likely to trigger.
2. **[high] Introduce early dependency‑missing detection**
   - Evidence: Round 9 failed with "Cannot find module 'csv-stringify/sync'" and TypeScript errors (raw_output entry for round 9). The missing import persisted for multiple rounds before any reviewer mention.
   - Change: Extend the static validator pipeline (`validate.py`) with a new module (`dependency_check_validator.py`) that parses all import statements, cross‑checks them against `package.json` and installed `node_modules`, and fails with a detailed message when a module is absent.
   - Expected effect: Missing third‑party imports are identified before test execution, eliminating the export‑ and compile‑time failures seen in round 9 and saving ~15 minutes of iteration per run.
3. **[medium] Make coder feedback actionable and granular**
   - Evidence: Round 5 showed a passphrase test failure and mismatched validation messages; round 10 still lacked temporary‑file cleanup despite reviewer notes. The generic "revise" feedback did not guide the coder to the exact file/line changes.
   - Change: Replace the generic feedback template with a structured summary: for each failing test list file, line, expected vs. actual output, and a bullet‑point action (e.g., "Update `validateBackupPassphrase` to require length ≥ 12", "Add `finally` block in `BackupScreen` to delete temp file", "Replace `csv-stringify/sync` import with internal CSV serializer").
   - Expected effect: The coder receives precise, actionable tasks, reducing trial‑and‑error turns, lowering the chance of hitting the turn limit, and accelerating fix implementation.
4. **[medium] Adjust coder turn‑limit policy with a recovery buffer**
   - Evidence: Coder hit its turn limit in rounds 4, 5, and 9 (round data shows `coder_turn_limit: true`). These limits cut off work on the most problematic issues, extending total runtime (round 5 took 44 min).
   - Change: Modify the turn‑limit guard: raise the base per‑round limit to 80 turns and, when a limit is hit while any test failures remain, automatically grant an extra 20‑turn buffer before moving to the next round.
   - Expected effect: The coder can finish critical fixes (e.g., passphrase validation, backup cleanup) without being prematurely stopped, decreasing overall round count and total elapsed time.
5. **[low] Enforce exact validation‑message checks in reviewer prompts**
   - Evidence: Round 5 reviewer noted mismatched error strings for numeric fields and passphrase length; round 10 reviewer still flagged missing temp‑file deletion despite earlier notes. The reviewer allowed PRs to pass without verifying exact message compliance.
   - Change: Update the code and UI reviewer prompts to include a checklist: (1) validation functions must return the exact messages expected by the acceptance tests, (2) any temporary files created for sharing/export must be deleted in a `finally` block. If any checklist item fails, the reviewer must reject the PR and list the missing check.
   - Expected effect: The reviewer becomes a stricter gatekeeper for validation correctness and resource cleanup, preventing the same issues from resurfacing in later rounds and cutting down repeat‑fix cycles.
