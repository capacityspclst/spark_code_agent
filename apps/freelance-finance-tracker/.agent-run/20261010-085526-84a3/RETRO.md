# Retrospective: run 20261010-085526-84a3

Task: Build a new local-first freelance finance tracker phone app with Expo (React Native) for iOS and Android. Privacy is the product: all of the user's data stays on their device. There is no server, no accounts, no sign-up or login, no analytics, tracking or crash reporting, and the app never sends user data anywhere. Must-haves: (1) Policy agreement gate: on first launch, and whenever the policy version changes, the user must read the Terms of Use and Privacy Policy and tick "I agree" before anything else in the app is reachable; acceptance (policy version and date) is stored on the device. The policy says plainly that data stays on the device and the developer never receives it, that the user is responsible for their own backups, and that the app is not tax, legal or financial advice. (2) Receipts: photograph with the camera (photo-library fallback) and record amount, date, category, type (expense by default, or income) and notes; photos are kept in the app's private storage. (3) Mileage log: date, miles and purpose, with the deduction at a configurable rate per mile (default: the current IRS standard business rate, labeled "verify for your tax year"). (4) Dashboard: income, expenses, mileage deduction and estimated tax at a configurable rate (never negative), recent activity, and every primary action one tap away. (5) Exports: tax-ready CSV and PDF generated on the device and shared through the share sheet. (6) Encrypted on-device storage: the database is encrypted at rest with a key kept in the device keychain/keystore (expo-secure-store). (7) Backup and restore: export one encrypted backup file containing all records and photos, protected by a passphrase the user chooses (strong key derivation and authenticated encryption from an audited JavaScript library such as @noble/ciphers and @noble/hashes), shared wherever the user chooses (Files, iCloud Drive, Google Drive); restore from such a file with the passphrase after a clear confirmation, with an integrity check and a friendly message for a wrong passphrase or damaged file. Cloud-provider sync is out of scope for now. (8) Optional app lock with Face ID, Touch ID or fingerprint (expo-local-authentication), OFF by default and switchable in Settings. (9) Settings: app lock, mileage rate, tax rate, backup and restore, view the policy, and delete all data (with confirmation). The app must be visually appealing, polished and very easy to use: React Native Paper (Material 3) with a theme and shared components, generous spacing, a clear visual hierarchy, friendly empty states and a bottom tab bar to every main area. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests of the on-device logic.

Outcome: success after 8 rounds, 4.3 h

## Observations

- vision scores flat across the run: first rounds [7.8, 8.0, 7.9], last rounds [7.9, 7.9, 7.9]
- slowest round 7 took 46 min; average 32 min

## Went well

- All unit/integration tests passed and final validation succeeded, showing the end‑to‑end functional requirements were met.
- Security scanners (trivy, semgrep) and the static type‑checker eventually cleared without any blocking findings after issues were fixed.
- The UI reviewer approved the design by round 8, indicating the visual design and navigation flow converged to an acceptable state.
- The pipeline successfully iterated through 8 review cycles, automatically applying bug fixes and gradually improving the codebase.

## Improvements for the next run

1. **[high] Make TypeScript validator feedback actionable**
   - Evidence: Rounds 3 and 5 reported "typescript (tsc)" failures: missing property `FileSystem.cacheDirectory` (round 3) and unresolved module `./crypto` (round 5). The same errors persisted across rounds, causing the coder to waste two full cycles.
   - Change: Update `validate.py` (static validator) to parse `tsc` output, extract file name, line/column, and suggested fix (e.g., use `FileSystem.documentDirectory` or correct relative import). Immediately feed this enriched diagnostic as a separate *fix suggestion* message to the coder before the reviewer step.
   - Expected effect: Reduces the number of rounds spent on simple TypeScript compile errors and cuts token usage because the coder receives a pinpointed edit rather than having to infer from a raw error list.
2. **[medium-high] Add domain‑specific backup & file‑system validator**
   - Evidence: Reviewer raised in round 2 that backup does not include receipt photos; in round 6 flagged incorrect use of `Paths.cache` and missing temporary‑file cleanup; round 5 flagged an import path error that is essentially a file‑system issue.
   - Change: Extend `validate.py` with a new rule set (e.g., `backup_validator.py`) that statically inspects `src/lib/backup.ts`, `src/lib/files.ts`, and any `expo-file-system` usage to ensure: (1) photos are added to the encrypted backup archive, (2) temporary files are deleted after sharing, (3) only supported `FileSystem` APIs (`cacheDirectory`, `documentDirectory`) are referenced, and (4) import paths resolve correctly.
   - Expected effect: Catches backup‑logic and Expo‑file‑system misuse early, preventing the reviewer from surfacing them in later rounds and reducing the total number of revision cycles.
3. **[high] Trim coder prompt to diff‑only context**
   - Evidence: Coder consumed ~5 M prompt tokens across the run; round 7 (the slowest, 46 min) coincided with the highest cumulative token load and many reviewer messages. The model repeatedly processed the whole repository each turn.
   - Change: Modify the coder orchestration to send **only the files changed in the previous round** plus a concise project‑structure summary (≤ 200 tokens). Store the rest of the repo in a persistent cache the model can reference via a short identifier rather than in‑prompt text.
   - Expected effect: Lowers per‑turn token count dramatically, cuts CPU time, and reduces latency per round, making the pipeline faster and less prone to hitting context limits.
4. **[medium] Strengthen UI validator to enforce numeric safety and export throttling**
   - Evidence: Round 4 reviewer noted missing validation for numeric inputs (amount, mileage, tax rates). Round 2 flagged lack of export throttling, which could enable denial‑of‑service attacks.
   - Change: Enhance `ui_check.mjs` to include rules that detect: (a) numeric input components without `min={0}` or explicit value‑range checks, (b) export button handlers that do not disable the UI or rate‑limit calls, and (c) missing loading/spinner states during long‑running export operations.
   - Expected effect: Catches these UI‑related security and usability defects before the reviewer sees them, shortening the review loop and improving overall app robustness.
5. **[low] Detect silent password/phrase mutation in security validator**
   - Evidence: In round 4 the reviewer observed that `BackupPassphraseScreen` silently appends an exclamation mark to weak passphrases, violating the security requirement that the UI should reject weak passwords rather than mutate them.
   - Change: Add a rule to `security.py` that scans for any code pattern where a user‑provided password/pin is programmatically altered after validation (e.g., string concatenation, hashing with added characters) and raises a warning with the offending line.
   - Expected effect: Prevents subtle security regressions from slipping through, gives the coder a direct hint, and reduces the chance of repeated reviewer‑back‑and‑forth on the same issue.
