# Retrospective: run 20261006-164437-f16a

Task: Build a new freelance finance tracking phone app: an Expo (React Native) app for iOS and Android that uses the phone's camera to photograph receipts (with a photo-library fallback), plus a Python FastAPI backend (PostgreSQL in production; SQLite via DATABASE_URL for tests and previews). Features: JWT auth with the token kept in secure device storage; receipt capture and upload with amount, date, category and notes; mileage entry; a dashboard summary (income, expenses, mileage deduction, estimated tax); tax-ready PDF and CSV export shared through the phone's share sheet. The UI must be polished and professional, with a best‑practice sign‑up and sign‑in flow and clear navigation to every action. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests.

Outcome: not approved after 12 rounds, 7.5 h

## Observations

- validator 'accessibility, serious or critical (expo-app)' blocked 9 of 12 rounds
- coder hit its turn limit in 6 of 12 rounds ([1, 5, 6, 9, 10, 12])
- slowest round 2 took 54 min; average 37 min

## Went well

- Backend unit test failure (dashboard income) was fixed by round 2, allowing the test suite to pass for the remainder of the run.
- The TypeScript compiler errors were eventually reduced to only a few remaining issues, showing the validator‑feedback loop is at least capable of converging on compile‑ready code.
- The designer supplied a complete UI flow description (ui_flow.json) that the UI‑flow validator could execute, even though the link click failed.

## Improvements for the next run

1. **[high] Give the coder precise, line‑level accessibility fixes**
   - Evidence: Validator "accessibility, serious or critical (expo-app)" blocked 9/12 rounds (rounds 1,2,4,5,6,7,8,10,12).  Errors were broad, e.g., "color‑contrast: Elements must meet minimum ratio…", "role‑img‑alt: Image elements must have alternative text" without file/line hints, causing the coder to guess and miss many instances.
   - Change: Modify ui_check.mjs (accessibility validator) to report each issue with file path, line number, and a concrete fix suggestion (e.g., add `accessibilityLabel="Receipt preview"` or replace `#0066ff` with a contrast‑approved color).  Also adjust the feedback message to the coder to embed these actionable snippets directly.
   - Expected effect: Coder can apply the exact fix in one edit, reducing repeated accessibility failures and eliminating the need for multiple turn‑limit hits.  Faster convergence and fewer rounds spent on the same problem.
2. **[high] Make the design‑system requirement explicit in DESIGN.md and the designer prompt**
   - Evidence: Validator "design system in use" blocked rounds 1 and 2, repeatedly calling out raw React Native components (e.g., "expo-app/src/screens/MileageEntryScreen.tsx: raw React Native TextInput").  The coder kept using raw components despite the feedback.
   - Change: Update the designer prompt to require a component‑mapping table in DESIGN.md for every screen (e.g., `Screen → PaperScreen`, `TextInput → PaperTextInput`, `Button → PaperButton`).  Include sample code snippets.  Extend the design‑system validator to check for those exact imports and flag each missing mapping with file/line location.
   - Expected effect: Coder receives a clear spec of which Paper components replace each raw widget, can replace them in bulk, and the validator will confirm compliance, removing the design‑system blocker early in the pipeline.
3. **[high] Switch the coder to an incremental diff‑only workflow and expose exact dependency versions**
   - Evidence: Coder hit its turn limit in 6 of 12 rounds (1,5,6,9,10,12) and consumed 17 716 210 prompt tokens, causing the slowest round (2) to take 54 min.  The coder was fed the whole repository each turn, making it hard to stay within the 20‑60 turn budget.
   - Change: Rewrite the coder prompt to request only the files that changed since the previous round (use a git‑style diff).  Limit edits to ≤5 files per round and include a generated snippet showing the current versions of Expo SDK, react‑native‑paper, and other key packages (pulled via `npm view`).  Provide a small “dependency‑info” block in the prompt.
   - Expected effect: Token usage will drop dramatically, turn limits will no longer be hit, and each round will finish faster (average < 20 min).  The coder will also be aware of the exact library versions, reducing TypeScript import errors.
4. **[medium] Enforce security scanning every round and auto‑fix vulnerable transitive deps**
   - Evidence: Rounds 5 and 11 reported high‑severity vulnerable packages (braces@3.0.3, node‑forge@1.4.0) and an npm‑install error (sprintf‑js@2.0.0 not found), yet the "security" column shows "skipped" for all rounds, so fixes never happened.
   - Change: Activate the security scanner (trivy/semgrep) each round and treat any findings as a hard blocker.  Add a new validator that parses `package-lock.json`, removes or upgrades vulnerable packages, and runs `expo install` to regenerate a clean lockfile before compilation.
   - Expected effect: Security‑related failures will surface early, the npm‑install validator will succeed, and the pipeline will no longer waste rounds on dependency errors.
5. **[medium] Upgrade UI‑flow validator to normalise Unicode and require stable test IDs**
   - Evidence: UI primary flow validator failed in rounds 3 and 9 because the "Don’t have an account? Sign up" link timed out.  In round 9 the reviewer also flagged "no literal escapes in UI text" (e.g., `\u2019` appearing literally).  The link therefore never matched the expected label.
   - Change: Enhance the ui_flow.json validator to (a) normalise rendered text (convert escaped sequences to actual characters) before matching, and (b) require a dedicated `testID="signup-link"` (or similar) on navigation elements.  Update the reviewer prompt to remind the coder to use `Pressable`/`Button` with that `testID` and a plain‑text `accessibilityLabel`.
   - Expected effect: The sign‑up link will be reliably found, eliminating the repeated timeout failures, and the pipeline will progress past the UI‑flow stage without extra rounds.
