# Retrospective: run 20261008-070615-9a8a

Task: Build a new local-first freelance finance tracker phone app with Expo (React Native) for iOS and Android. Privacy is the product: all of the user's data stays on their device. There is no server, no accounts, no sign-up or login, no analytics, tracking or crash reporting, and the app never sends user data anywhere. Must-haves: (1) Policy agreement gate: on first launch, and whenever the policy version changes, the user must read the Terms of Use and Privacy Policy and tick "I agree" before anything else in the app is reachable; acceptance (policy version and date) is stored on the device. The policy says plainly that data stays on the device and the developer never receives it, that the user is responsible for their own backups, and that the app is not tax, legal or financial advice. (2) Receipts: photograph with the camera (photo-library fallback) and record amount, date, category, type (expense by default, or income) and notes; photos are kept in the app's private storage. (3) Mileage log: date, miles and purpose, with the deduction at a configurable rate per mile (default: the current IRS standard business rate, labeled "verify for your tax year"). (4) Dashboard: income, expenses, mileage deduction and estimated tax at a configurable rate (never negative), recent activity, and every primary action one tap away. (5) Exports: tax-ready CSV and PDF generated on the device and shared through the share sheet. (6) Encrypted on-device storage: the database is encrypted at rest with a key kept in the device keychain/keystore (expo-secure-store). (7) Backup and restore: export one encrypted backup file containing all records and photos, protected by a passphrase the user chooses (strong key derivation and authenticated encryption from an audited JavaScript library such as @noble/ciphers and @noble/hashes), shared wherever the user chooses (Files, iCloud Drive, Google Drive); restore from such a file with the passphrase after a clear confirmation, with an integrity check and a friendly message for a wrong passphrase or damaged file. Cloud-provider sync is out of scope for now. (8) Optional app lock with Face ID, Touch ID or fingerprint (expo-local-authentication), OFF by default and switchable in Settings. (9) Settings: app lock, mileage rate, tax rate, backup and restore, view the policy, and delete all data (with confirmation). The app must be visually appealing, polished and very easy to use: React Native Paper (Material 3) with a theme and shared components, generous spacing, a clear visual hierarchy, friendly empty states and a bottom tab bar to every main area. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests of the on-device logic.

Outcome: not approved after 12 rounds, 6.5 h

## Observations

- validator 'ui primary flow (.)' blocked 11 of 12 rounds
- validator 'typescript (tsc)' blocked 7 of 12 rounds
- coder hit its turn limit in 3 of 12 rounds ([1, 2, 11])
- slowest round 2 took 53 min; average 32 min

## Went well

- All unit and integration tests passed on every round, confirming that the test infrastructure is reliable.
- The static validators (theme usage, TypeScript compilation, accessibility, UI primary flow) consistently caught regressions, demonstrating comprehensive coverage.
- The reviewer agent produced detailed feedback each round, keeping the iteration loop active.
- The pipeline respected round limits and guard thresholds, stopping after a reasonable number of attempts rather than entering an endless loop.
- Design specifications (DESIGN.md, ui_flow.json) were generated early and used as a concrete reference throughout the run.

## Improvements for the next run

1. **[high] Make reviewer feedback precise and non-contradictory**
   - Evidence: Rounds 1-4 show contradictory guidance: round 1 recommends renaming src/navigation/index.ts to .tsx, round 2 asks for a default export, round 4 blames a circular import created by 'export { default } from "./index"', and round 5 still points to accessibility props. This back‑and‑forth caused the coder to hit turn limits (round 1, 2, 11) and wasted iterations.
   - Change: Update the reviewer prompt to require the reviewer to (a) cite the exact line and file causing the failure, (b) propose a single minimal code change that fixes the issue, and (c) keep a short memory of previously suggested changes to avoid repetition. Add a directive: 'If you have already suggested a fix for this file, do not suggest another unless the problem persists after the fix.'
   - Expected effect: Reduces contradictory or redundant suggestions, allowing the coder to apply fixes efficiently and avoid hitting turn limits, thereby shortening round duration and improving convergence.
2. **[high] Add a naming‑convention validator for JSX files**
   - Evidence: The validator 'expo export' and TypeScript errors persisted from round 1 through round 10 due to JSX being placed in a .ts file (src/navigation/index.ts). The same syntax errors appear in rounds 1‑5, 8, 10, indicating the issue was not caught early.
   - Change: Introduce a static validator (e.g., validate_file_naming.py) that scans all source files for JSX syntax (detect '<' after an import) and asserts the file extension is .tsx. Fail the round with a clear message like 'File src/navigation/index.ts contains JSX; rename to .tsx.'
   - Expected effect: Catches the mismatch before the coder spends many turns on compilation errors, preventing repeated TypeScript failures and reducing the number of validator blocks.
3. **[medium] Enhance UI primary flow validator to report missing ARIA toggle state**
   - Evidence: Validator 'ui primary flow' blocked 11 of 12 rounds. The failure consistently mentions the policy checkbox never changing state (round 2, 12). Reviewer kept suggesting changes to the Pressable component but the core problem – missing aria‑checked/accessible toggle – remained.
   - Change: Extend ui_flow validation to (a) explicitly check that the element identified by its label has an accessible checked state that toggles on click, (b) when the check fails, output a suggestion such as 'Ensure the checkbox component sets aria‑checked (or accessibilityState.checked) and uses a component that supports it, e.g., React Native Paper Checkbox.'
   - Expected effect: Provides the coder with a direct, actionable fix for the primary flow, reducing the number of iterations needed to get the flow passing.
4. **[medium] Allow dynamic coder turn limit increase for persistent compile‑time failures**
   - Evidence: Coder hit its turn limit in rounds 1, 2, 11 (each lasting >30 min). In round 1 and 2 the issue was a naming error; in round 11 it was delayed navigation refactoring. The fixed turn cap forced the coder to stop mid‑fix, extending the overall run time.
   - Change: Modify the coder turn‑limit policy to detect when a round ends due to 'turn limit reached' and the failing validator is a compile‑time error (e.g., TypeScript). In such cases automatically grant an additional 20‑30 turns for that round before applying the nudges limit.
   - Expected effect: Gives the coder enough room to perform larger refactorings (renaming files, moving imports) without being cut off, reducing the need for extra rounds and speeding overall convergence.
5. **[low] Synchronize DESIGN.md labels with component accessibility names**
   - Evidence: Throughout rounds the UI flow test looked for the label 'I agree to the Terms of Use and Privacy Policy.' The checkbox component did not expose a matching accessible name, leading to timeout failures in every round (ui primary flow). The designer spec and implementation were out of sync.
   - Change: Revise the designer prompt to generate a mapping file (e.g., accessibility_map.json) that lists each interactive element’s accessible label as defined in DESIGN.md. Add a validator that cross‑checks component code for these labels, failing early if mismatched.
   - Expected effect: Ensures that design specifications and code stay aligned, preventing UI flow failures caused by label mismatches and reducing the number of revisions needed.
