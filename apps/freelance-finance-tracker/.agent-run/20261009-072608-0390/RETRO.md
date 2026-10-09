# Retrospective: run 20261009-072608-0390

Task: Build a new local-first freelance finance tracker phone app with Expo (React Native) for iOS and Android. Privacy is the product: all of the user's data stays on their device. There is no server, no accounts, no sign-up or login, no analytics, tracking or crash reporting, and the app never sends user data anywhere. Must-haves: (1) Policy agreement gate: on first launch, and whenever the policy version changes, the user must read the Terms of Use and Privacy Policy and tick "I agree" before anything else in the app is reachable; acceptance (policy version and date) is stored on the device. The policy says plainly that data stays on the device and the developer never receives it, that the user is responsible for their own backups, and that the app is not tax, legal or financial advice. (2) Receipts: photograph with the camera (photo-library fallback) and record amount, date, category, type (expense by default, or income) and notes; photos are kept in the app's private storage. (3) Mileage log: date, miles and purpose, with the deduction at a configurable rate per mile (default: the current IRS standard business rate, labeled "verify for your tax year"). (4) Dashboard: income, expenses, mileage deduction and estimated tax at a configurable rate (never negative), recent activity, and every primary action one tap away. (5) Exports: tax-ready CSV and PDF generated on the device and shared through the share sheet. (6) Encrypted on-device storage: the database is encrypted at rest with a key kept in the device keychain/keystore (expo-secure-store). (7) Backup and restore: export one encrypted backup file containing all records and photos, protected by a passphrase the user chooses (strong key derivation and authenticated encryption from an audited JavaScript library such as @noble/ciphers and @noble/hashes), shared wherever the user chooses (Files, iCloud Drive, Google Drive); restore from such a file with the passphrase after a clear confirmation, with an integrity check and a friendly message for a wrong passphrase or damaged file. Cloud-provider sync is out of scope for now. (8) Optional app lock with Face ID, Touch ID or fingerprint (expo-local-authentication), OFF by default and switchable in Settings. (9) Settings: app lock, mileage rate, tax rate, backup and restore, view the policy, and delete all data (with confirmation). The app must be visually appealing, polished and very easy to use: React Native Paper (Material 3) with a theme and shared components, generous spacing, a clear visual hierarchy, friendly empty states and a bottom tab bar to every main area. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests of the on-device logic.

Outcome: not approved after 6 rounds, 6.9 h

## Observations

- validator 'ui primary flow (.)' blocked 6 of 6 rounds
- coder hit its turn limit in 2 of 6 rounds ([1, 5])
- vision scores flat across the run: first rounds [7.8, 7.8, 7.0], last rounds [7.1, 6.9, 7.8]
- slowest round 6 took 83 min; average 68 min

## Went well

- All unit and integration tests passed in every round, confirming that core business logic and data handling were correct.
- The designer delivered a complete ui_flow.json and DESIGN.md within 6 calls, giving the coder a clear navigation map.
- Vision model scores remained stable (average ~7.0) across the run, showing consistent visual quality of the UI mock‑ups.
- Static reviewers caught high‑severity security issues and disallowed raw HTML components, keeping the codebase on a secure baseline.
- Round and coder turn limits prevented unbounded token usage; only two turn‑limit hits occurred despite a large number of calls.

## Improvements for the next run

1. **[high] Make UI primary‑flow validator tolerant and more diagnostic for file‑picker and export actions**
   - Evidence: Rounds 1‑6 all failed on validator "ui primary flow (.)". Round 1 & 6: "upload button 'Select backup file' failed: page.waitForEvent: Timeout 10000ms". Rounds 3‑5: "click button 'Export'" produced "Maximum call stack size exceeded". Round 6: validator noted use of experimental `window.showOpenFilePicker` which does not fire Playwright's `filechooser` event.
   - Change: Modify ui_check.mjs to (a) recognize Expo DocumentPicker/WebFileInput patterns and treat a successful `DocumentPicker.getDocumentAsync` as a valid file‑chooser event, (b) add a fallback detection for a visible `<input type='file'>` element, and (c) surface the exact component identifier (file, line, accessibilityLabel) with a clear "expected‑behavior vs. observed" diff in the failure report.
   - Expected effect: Coder can implement a compliant file‑picker and export button in one focused edit, eliminating repeated UI‑flow failures and cutting the number of rounds needed to clear validator "ui primary flow".
2. **[high] Add static validator for circular exports and recursive component registration**
   - Evidence: Round 5 error: "Got an invalid value for 'component' prop for the screen 'Restore'. It must be a React component… infinite‑recursive getter" caused by `src/screens/RestoreScreen.web.tsx` re‑exporting its own default and `src/navigation/index.tsx` registering that as a screen. This circular export triggered UI validator failures at step 46.
   - Change: Extend validate.py with a new check named `detect_circular_exports` that parses ES6 export statements, flags re‑exports that resolve to the same file (or create import cycles) and reports the offending file/line. Include this check in the static‑validation pipeline before UI validation runs.
   - Expected effect: Circular import bugs are caught early, preventing runtime navigation crashes and the subsequent UI‑flow validator blocks, thus saving coder iterations.
3. **[medium] Introduce pre‑coding dependency vulnerability guard**
   - Evidence: Round 3 security scan reported high‑severity unfixed vulnerabilities in `braces@3.0.3`, `node-forge@1.4.0`, `sprintf-js@1.0.3` and a medium‑severity issue in `uuid@7.0.3`. Because security findings are blocking, the coder later had to replace or upgrade these packages, adding extra work.
   - Change: Add a pre‑run step in the planner phase that runs `npm audit` (or uses a curated CVE whitelist) and produces a "Dependency Constraints" document. Update the planner prompt to require selection of only vetted packages and disallow known vulnerable ones, offering alternatives (e.g., use `@noble/ciphers` instead of `node-forge`). Also add a static validator rule that flags imports of disallowed packages.
   - Expected effect: Vulnerable dependencies are avoided from the start, eliminating later security‑scanner blocks and reducing the need for mid‑run refactoring.
4. **[medium] Refine reviewer prompt to require precise, actionable fix instructions**
   - Evidence: Reviewer feedback was sometimes vague: e.g., round 2 "remove the unused WebFileInput.web.tsx and replace the <button>..." but the coder still left problematic picker logic; round 5 mentioned an "infinite‑recursive getter" without showing the exact code change needed.
   - Change: Update the reviewer prompt to mandate that each issue include (a) exact file path and line numbers, (b) a minimal before/after code snippet that resolves the failure, and (c) a brief rationale linking the snippet to the validator error. Enforce this format in the reviewer output.
   - Expected effect: Coder receives unambiguous, line‑level guidance, reducing guesswork and the number of revision rounds needed to satisfy validators.
5. **[low] Enhance coder turn‑limit feedback with a prioritized issue summary**
   - Evidence: Coder hit its turn limit in rounds 1 and 5, after which the only feedback was a generic "revise" flag. No concise list of remaining blockers was presented, leading to scattered edits and high token consumption (≈14 M prompt tokens).
   - Change: When the coder turn‑limit guard triggers, automatically generate a "Turn‑Limit Report" that lists (1) all failing validators, (2) the specific UI steps or files causing each failure, and (3) a suggested order of remediation. Attach this report to the feedback message sent to the coder for the next round.
   - Expected effect: Coder can focus on the most critical blockers in a structured way, avoid sprawling changes, reduce token usage, and converge faster.
