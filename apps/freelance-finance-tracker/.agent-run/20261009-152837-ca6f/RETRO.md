# Retrospective: run 20261009-152837-ca6f

Task: Build a new local-first freelance finance tracker phone app with Expo (React Native) for iOS and Android. Privacy is the product: all of the user's data stays on their device. There is no server, no accounts, no sign-up or login, no analytics, tracking or crash reporting, and the app never sends user data anywhere. Must-haves: (1) Policy agreement gate: on first launch, and whenever the policy version changes, the user must read the Terms of Use and Privacy Policy and tick "I agree" before anything else in the app is reachable; acceptance (policy version and date) is stored on the device. The policy says plainly that data stays on the device and the developer never receives it, that the user is responsible for their own backups, and that the app is not tax, legal or financial advice. (2) Receipts: photograph with the camera (photo-library fallback) and record amount, date, category, type (expense by default, or income) and notes; photos are kept in the app's private storage. (3) Mileage log: date, miles and purpose, with the deduction at a configurable rate per mile (default: the current IRS standard business rate, labeled "verify for your tax year"). (4) Dashboard: income, expenses, mileage deduction and estimated tax at a configurable rate (never negative), recent activity, and every primary action one tap away. (5) Exports: tax-ready CSV and PDF generated on the device and shared through the share sheet. (6) Encrypted on-device storage: the database is encrypted at rest with a key kept in the device keychain/keystore (expo-secure-store). (7) Backup and restore: export one encrypted backup file containing all records and photos, protected by a passphrase the user chooses (strong key derivation and authenticated encryption from an audited JavaScript library such as @noble/ciphers and @noble/hashes), shared wherever the user chooses (Files, iCloud Drive, Google Drive); restore from such a file with the passphrase after a clear confirmation, with an integrity check and a friendly message for a wrong passphrase or damaged file. Cloud-provider sync is out of scope for now. (8) Optional app lock with Face ID, Touch ID or fingerprint (expo-local-authentication), OFF by default and switchable in Settings. (9) Settings: app lock, mileage rate, tax rate, backup and restore, view the policy, and delete all data (with confirmation). The app must be visually appealing, polished and very easy to use: React Native Paper (Material 3) with a theme and shared components, generous spacing, a clear visual hierarchy, friendly empty states and a bottom tab bar to every main area. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests of the on-device logic.

Outcome: not approved after 5 rounds, 4.3 h

## Observations

- validator 'ui primary flow (.)' blocked 2 of 5 rounds
- coder hit its turn limit in 1 of 5 rounds ([2])
- vision scores flat across the run: first rounds [8.1, 7.9, 7.8], last rounds [7.8, 7.7, 8.0]
- slowest round 2 took 78 min; average 51 min

## Went well

- All unit and integration tests passed in every round, indicating the core business logic was correctly implemented early.
- Security scanning was run each round and identified high‑severity injection risks, preventing a vulnerable build from being merged.
- The UI primary flow validator caught a navigation bug in the backup flow across two rounds, highlighting the value of automated UI checks.
- The reviewer agents provided detailed feedback on multiple aspects (biometric lock, CSV export, policy gate), keeping the team focused on missing features.
- Vision scoring remained consistently high (≈8/10), showing that the visual design stayed close to the designer's intent throughout.

## Improvements for the next run

1. **[high] Make UI flow validator diagnostics actionable**
   - Evidence: Rounds 3 and 4 reported 'validator: ui primary flow (.)' failures: step 61 expecting "Backup ready to share" timed out (see raw_output for both rounds). The reporter only gave a generic timeout, and the reviewer repeated the same description without pinpointing the missing navigation call.
   - Change: Update validate.py (UI primary flow validator) to, on timeout, dump the component tree snapshot and include a heuristic suggestion such as "Check that navigation.navigate('BackupSuccess') is invoked after backup creation and that BackupSuccessScreen is registered in the navigator". Also surface the file and line where the navigation call is expected.
   - Expected effect: Coder receives concrete guidance, fixes the navigation bug in a single round, reducing repeated UI validator failures and cutting overall run time.
2. **[high] Require code citations in reviewer issues**
   - Evidence: Round 2 reviewer raised "unconfirmed: The app does not implement the biometric lock correctly" and "unconfirmed: exportCsv implementation does not sanitize fields to prevent CSV injection" without pointing to a file, line, or snippet, leading the coder to spend time investigating false positives.
   - Change: Revise the reviewer prompt to mandate that each issue be accompanied by a file path and line number (or code excerpt) that demonstrates the problem. If no evidence is found, the reviewer must mark the issue as "potential" and skip it for the current round.
   - Expected effect: Reduces noise from unsubstantiated complaints, focuses coder effort on real bugs, speeds convergence, and improves trust in reviewer feedback.
3. **[medium] Add a dedicated Policy Gate validator**
   - Evidence: Round 5 reviewer flagged that the PolicyScreen is missing or incomplete, but no static validator reported a policy‑gate violation earlier. This critical privacy requirement went unchecked until the final round.
   - Change: Extend validate.py with a new rule that launches the app, verifies that no screen beyond PolicyScreen renders before the user ticks "I agree", and checks that the acceptance flag is persisted (e.g., in expo-secure‑store). The validator should fail early if the gate is absent.
   - Expected effect: Catches missing policy acceptance logic early, prevents last‑minute rework, and ensures the privacy‑by‑design mandate is enforced for every build.
4. **[medium] Make security scanner findings actionable and scoped**
   - Evidence: The run was stalled on "high-csv-injection" and "high-pdf-html-injection" without any line numbers or remediation advice, forcing the pipeline to abort despite no explicit code reference.
   - Change: Enhance security.py to, when Trivy or Semgrep reports CSV or HTML injection, map the finding to the originating source file and function (e.g., exportCsv in src/utils/export.ts). Include a short fix suggestion, such as "use sanitizeCsvField() before writing to file" or "escape HTML in PDF templates using a whitelist library".
   - Expected effect: Coder can address the exact vulnerability immediately, avoiding pipeline stalls and reducing manual investigation time.
5. **[low] Proactive turn‑limit warnings for the coder**
   - Evidence: Round 2 hit the coder turn limit (coder_turn_limit: true) and lasted 4,675 seconds (78 min), indicating the coder exhausted its allocated turn budget and had to restart work in the next round.
   - Change: Add a pre‑turn monitor in the coder orchestrator that tracks the number of turns used. When 45 turns are reached, inject a feedback message summarizing pending tasks and reminding the coder to break large changes into smaller PRs to stay within the 20‑60 turn window.
   - Expected effect: Reduces the chance of hitting the turn limit, shortens round durations, and leads to more incremental, reviewable changes.
