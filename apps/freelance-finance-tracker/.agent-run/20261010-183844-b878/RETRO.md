# Retrospective: run 20261010-183844-b878

Task: Harden the app for v1.0. No new features: keep every screen, label, flow and the current look the same, and keep all existing tests passing. Changes: (1) "Delete all data" also discards the database encryption key and creates a new one, so deleted data can never be recovered (the policy acceptance stays). (2) Backups: delete the temporary backup file after the share sheet closes (also if sharing fails or is cancelled). (3) Backup passphrase rules: at least 12 characters, shown before the user types, checked as they type and on "Create backup", with the error under the field. (4) Receipt photos in backups use the current expo-file-system File API (new File(uri).bytes() to read, File.write to restore); the legacy readAsStringAsync/writeAsStringAsync functions are not available in this SDK. Restore writes the photos back and updates each receipt's photo reference. (5) Validate every number field with a friendly error under the field: receipt amounts above 0 and at most 1,000,000 with up to 2 decimals; miles above 0 and at most 10,000; mileage rate 0 to 5 dollars per mile; tax rate 0 to 100 percent. (6) Restore checks the decrypted backup against the expected format (version number, arrays of receipts and mileage entries with the right field types) before changing any data; an invalid backup shows a friendly error and leaves the data untouched. (7) CSV and PDF export buttons are disabled while an export is running, so repeated taps can't start several exports. Add unit tests for 1, 3, 5 and 6.

Outcome: not approved after 9 rounds, 5.4 h

## Observations

- validator 'ui primary flow (.)' blocked 4 of 9 rounds
- coder hit its turn limit in 4 of 9 rounds ([1, 2, 3, 8])
- vision scores flat across the run: first rounds [7.8, 8.1, 8.5], last rounds [8.2, 8.2, 8.1]
- slowest round 3 took 54 min; average 35 min

## Went well

- The UI design (ui_flow.json and DESIGN.md) remained stable across the run, allowing the coder to focus on functional changes rather than redesign.
- Vision scores stayed high (≈8.0) throughout, indicating reliable screenshot capture and layout detection.
- Static validation eventually cleared: after addressing core issues, both expo export and TypeScript checks passed, demonstrating that the validator suite can recover from earlier failures.
- All unit and acceptance tests passed by round 5, showing that the reviewer feedback loop was effective in guiding the coder toward a working solution.
- The security validator caught a high‑severity issue (data‑reset‑photo‑leak) early, preventing a potential data‑leak from being merged.

## Improvements for the next run

1. **[high] Add early static validator for disallowed Node core modules in Expo projects**
   - Evidence: Rounds 3, 4, and 5 repeatedly failed with "Unable to resolve module buffer" (expo export validator) and TypeScript errors about missing 'crypto' and 'Buffer' (validator: typescript). The same root cause persisted across three rounds, consuming ~35 min each round.
   - Change: Pipeline > static validators: introduce `no_node_core.js` that scans source files for imports from Node built‑ins ('crypto', 'buffer', 'module', etc.) when `expo` is a dependency. On detection, abort the run with a clear message and suggest using `expo-crypto` or Expo File APIs. Register this validator as a blocking step before the coder starts.
   - Expected effect: The incompatibility is caught before code generation, eliminating the repeated expo export and TypeScript failures. Expected reduction of at least 3 failing rounds and ~90 min of total runtime.
2. **[high] Enrich UI flow validator feedback with precise element diagnostics**
   - Evidence: UI primary flow validator failed in rounds 1, 2, 4, and 5 with generic messages like "click button 'Receipt' timed out". The coder spent multiple turns attempting to locate or create the button without concrete guidance, leading to turn‑limit hits.
   - Change: Pipeline > UI validator (ui_check.mjs): on step failure, output the component hierarchy of the current screen, the selector used, and any matching accessibility IDs. Include a suggestion to check the JSX source for the missing element. Make this detailed output part of the reviewer’s message.
   - Expected effect: Coder can directly address the missing UI element, reducing wasted iterations and preventing turn‑limit exhaustion on UI tasks. Anticipated saving of 2‑3 rounds per UI change.
3. **[medium] Adaptive coder turn allocation with automatic summarization on limit exhaustion**
   - Evidence: Coder hit its turn limit in rounds 1‑4 (turn limit flag true). Each hit forced a reset of the work in progress, elongating the run (round 3 lasted 54 min).
   - Change: Pipeline > coder settings: increase default `coder_turns` range to 60‑100 for tasks estimating >10 file changes, and add a checkpoint at 80 % of allocated turns where the coder must output a concise progress summary and request next‑step clarification. This prevents silent truncation.
   - Expected effect: Reduces forced cut‑offs, ensures complete implementations within a round, and cuts overall runtime by ~10‑15 min per early round.
4. **[medium] Pre‑test environment validator for Jest dynamic‑import support**
   - Evidence: Rounds 2 and 4 showed acceptance test failures: "TypeError: A dynamic import callback was invoked without --experimental-vm-modules". The same configuration issue persisted across rounds, requiring manual fixes.
   - Change: Pipeline > test runner step: add a validator that parses `package.json` and the Jest config to verify that the test script includes the `--experimental-vm-modules` flag (or that `transform` is set for ESM). If missing, automatically inject the flag or emit a precise fix suggestion before tests run.
   - Expected effect: Prevents the repeatable Jest configuration error, eliminating at least one round of failure and the associated coder work.
5. **[low] Reviewer‑spec consistency guard to avoid contradictory guidance**
   - Evidence: Round 6 reviewer flagged the passphrase length as off‑by‑one (min 12), while round 7 reviewer advised matching the existing test that expects an 11‑character string, creating a loop of conflicting revisions.
   - Change: Pipeline > reviewer prompt: add a step that cross‑checks any reviewer suggestion against the original task specification. If a suggestion contradicts a spec clause, the system warns the reviewer and asks for clarification before the message is sent to the coder.
   - Expected effect: Eliminates contradictory revision cycles, speeds up convergence on spec‑compliant implementations, especially for edge‑case validation rules.
