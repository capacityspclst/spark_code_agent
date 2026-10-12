# Retrospective: run 20261012-090553-53fe

Task: Harden the app for v1.0. No new features: keep every screen, label, flow and the current look the same, and keep all existing tests passing. Changes: (1) "Delete all data" also discards the database encryption key and creates a new one, so deleted data can never be recovered (the policy acceptance stays). (2) Backups: delete the temporary backup file after the share sheet closes (also if sharing fails or is cancelled). (3) Backup passphrase rules: at least 12 characters, shown before the user types, checked as they type and on "Create backup", with the error under the field. (4) Receipt photos in backups use the current expo-file-system File API (new File(uri).bytes() to read, File.write to restore); the legacy readAsStringAsync/writeAsStringAsync functions are not available in this SDK. Restore writes the photos back and updates each receipt's photo reference. (5) Validate every number field with a friendly error under the field: receipt amounts above 0 and at most 1,000,000 with up to 2 decimals; miles above 0 and at most 10,000; mileage rate 0 to 5 dollars per mile; tax rate 0 to 100 percent. (6) Restore checks the decrypted backup against the expected format (version number, arrays of receipts and mileage entries with the right field types) before changing any data; an invalid backup shows a friendly error and leaves the data untouched. (7) CSV and PDF export buttons are disabled while an export is running, so repeated taps can't start several exports. Add unit tests for 1, 3, 5 and 6.

Outcome: success after 2 rounds, 1.2 h

## Observations

- slowest round 2 took 43 min; average 34 min

## Went well

- All existing unit and integration tests continued to pass throughout the run.
- New unit tests for the added backup passphrase rules, data deletion handling, field validation, and backup format checking all passed.
- Security scanners (trivy, semgrep) completed with no findings in just two calls.
- The designer produced a usable UI_flow.json in only two calls, providing a solid baseline for the coder.
- Both rounds received reviewer approval; after the second round there were no blocking reviewer issues.

## Improvements for the next run

1. **[high] Enforce Complete UI Spec in Planner Acceptance Tests**
   - Evidence: Round 1 UI validator reported failure (ui: "fail", ui_blocking: 1), indicating missing UI specifications for the new backup passphrase field and export‑button disabling. This caused a second round to fix the UI.
   - Change: Modify the planner prompt and acceptance‑test rules to generate a detailed UI checklist from the task description and require the designer to include every new or modified screen/component in ui_flow.json before coding begins. The acceptance test should verify that entries for all required UI elements exist.
   - Expected effect: Reduces UI‑related rework and eliminates UI validator failures, allowing the coder to start with a complete UI spec and lowering the number of rounds needed.
2. **[high] Make UI Validator Output Descriptive, Actionable Errors**
   - Evidence: In round 1 the UI validator only returned a generic failure without specifying which UI element was missing, leading to 43 minutes of additional debugging before the issue was resolved in round 2.
   - Change: Enhance ui_check.mjs to pinpoint the exact missing or mismatched UI component (e.g., "Missing validation rule for backup passphrase length on BackupSettings screen") and suggest the required change in ui_flow.json.
   - Expected effect: Coders receive precise guidance, fixing UI issues in a single iteration and cutting round time.
3. **[high] Trim Coder Prompt Context to Incremental Diffs**
   - Evidence: Coder consumed 899,838 prompt tokens across 37 calls, accounting for ~905 seconds of processing time (≈21 % of round 2 duration).
   - Change: Revise the coder prompt to include only the diff of changed files plus a concise design summary (including relevant UI_flow.json excerpts). Introduce a token budget that prunes unchanged file content from the prompt.
   - Expected effect: Reduces token load and LLM inference latency, potentially cutting coder time per round by 30‑40 % and lowering overall pipeline runtime.
4. **[medium] Batch Reviewer and Vision Feedback Per Round**
   - Evidence: Round 2 involved 26 reviewer calls (554 s) and 38 vision calls (500 s), contributing heavily to the 2,574‑second total duration of that round.
   - Change: Adjust pipeline orchestration so reviewer and vision agents collect all issues across files and deliver a single aggregated feedback message for each round, rather than per‑file calls. When possible, run vision checks in parallel.
   - Expected effect: Fewer LLM calls and reduced network/latency overhead, shortening round duration and speeding convergence.
5. **[medium] Incremental Static Validation and Caching**
   - Evidence: Static validators were executed on the entire codebase each round despite no new lint/type failures, adding unnecessary compute time.
   - Change: Update validate.py to cache lint/type results keyed by file hash and re‑run validators only on files that changed since the previous round.
   - Expected effect: Cuts static validation time, lowering round overhead without sacrificing code quality.
