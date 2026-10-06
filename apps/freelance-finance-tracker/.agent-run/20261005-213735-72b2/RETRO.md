# Retrospective: run 20261005-213735-72b2

Task: Build a new freelance finance tracking phone app: an Expo (React Native) app for iOS and Android that uses the phone's camera to photograph receipts (with a photo-library fallback), plus a Python FastAPI backend (PostgreSQL in production; SQLite via DATABASE_URL for tests and previews). Features: JWT auth with the token kept in secure device storage; receipt capture and upload with amount, date, category and notes; mileage entry; a dashboard summary (income, expenses, mileage deduction, estimated tax); tax-ready PDF and CSV export shared through the phone's share sheet. The UI must be polished and professional, with a best‑practice sign‑up and sign‑in flow and clear navigation to every action. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests.

Outcome: not approved after 7 rounds, 6.2 h

## Observations

- validator 'ui primary flow (expo-app)' blocked 4 of 7 rounds
- coder hit its turn limit in 3 of 7 rounds ([1, 2, 3])
- vision scores flat across the run: first rounds [6.7, 7.0, 6.5], last rounds [7.0, 7.0, 6.8]
- slowest round 3 took 88 min; average 50 min

## Went well

- All unit and integration tests passed in every round, showing the core functionality was correct early on.
- The UI primary‑flow validator consistently caught UI mismatches, providing early signal that the design spec and implementation were out of sync.
- Security and code reviewers identified serious concerns (unauthenticated media upload, short JWT secret, vulnerable npm packages) before the final approval stage.
- The vision model ran on every round, confirming the UI stayed within design expectations (scores ~7/10) without regressions.
- The pipeline completed the full 7‑round cycle within ~6 hours, demonstrating that the multi‑agent orchestration (designer → coder → reviewers) was able to converge on a buildable project.

## Improvements for the next run

1. **[high] Supply exact Expo SDK and library API versions to the coder up‑front**
   - Evidence: Round 5 TypeScript errors: `FileSystem.cacheDirectory` and `FileSystem.Encoding` do not exist in the current Expo SDK (`expo-file-system` typings). The coder guessed outdated APIs, causing tsc failures and UI feature gaps (missing camera launch).
   - Change: Planner prompt: add a pre‑run step that runs `npm view expo version` and `npm view expo-file-system version` and injects the exact SDK version plus a short excerpt of the relevant API signatures into the coder prompt. Also add a tiny helper library to the sandbox that provides type stubs for that exact version.
   - Expected effect: Coder will use the correct Expo APIs, eliminating TS2339 errors and the missing camera functionality, reducing the need for later TypeScript‑related revision rounds.
2. **[high] Dynamic coder turn limits with richer “turn‑limit‑hit” feedback**
   - Evidence: Rounds 1‑3 hit the coder turn limit (20‑60 turns) and still left UI primary‑flow failures unresolved, leading to three costly rounds (total 11 600 s) and repeated validator blocks.
   - Change: Coder module: raise the turn limit for the first three rounds or allow an “extend‑turns” nudge. When the limit is reached, automatically generate a feedback message that lists every failing validator step (e.g., missing button label, missing heading, delayed navigation) with file paths and line numbers, and explicitly asks the coder to finish those tasks before the next round.
   - Expected effect: Coder can complete pending UI work without being cut off, cutting down the number of rounds and total runtime, and preventing repeated repro steps caused by premature turn termination.
3. **[medium] Make UI primary‑flow validator output actionable code suggestions**
   - Evidence: Round 1: validator reported "button labelled 'Add first receipt' but design expects 'Add receipt'" – reviewer had to infer the file to edit. Round 5: missing placeholder text caused another failure; the coder was left to guess the fix.
   - Change: Update `ui_check.mjs` to include the source file, line number, and a small code snippet template for each missing element (e.g., `// Add heading
<Text testID="receipt-title">New receipt</Text>`). Also map mismatched label names to the exact component property to rename.
   - Expected effect: Coder receives a ready‑to‑paste fix, reducing the back‑and‑forth revise cycles and lowering the UI validator’s blocking count from 4‑7 per round to 0 after the first fix.
4. **[high] Extend security scanner to enforce authentication on file‑upload endpoints and auto‑suggest safe dependency versions**
   - Evidence: Stalled list includes "unauthenticated‑media‑endpoint" (backend route for receipt upload lacked auth) and "vulnerable‑dependency‑braces" / "vulnerable‑dependency‑node‑forge" persisted through rounds 4‑7 despite security failures being reported.
   - Change: Security script (`security.py`): add a rule that parses FastAPI route definitions, flags any `@app.post` that accepts `UploadFile` or `File` without a `Depends(get_current_user)` dependency, and prints the file and line. Also integrate `npm audit` results to detect known vulnerable npm packages and suggest upgrade commands (e.g., `npm install braces@^3.0.0`).
   - Expected effect: Authentication gaps are fixed early (preventing the unauthenticated‑media‑endpoint stall) and vulnerable dependencies are upgraded before the final security check, eliminating the three stall reasons and allowing the run to finish successfully.
5. **[medium] Enforce explicit test‑friendly UI identifiers in the design phase**
   - Evidence: Round 2 UI failure: Category field implemented as `<Picker>` could not be filled by the generic test harness, leading to validator block. Round 1 mismatched button text and missing headings also stemmed from ambiguous design descriptions.
   - Change: Designer prompt and `ui_flow.json` generation: require each UI element to include a `testID` (or `accessibilityLabel`) and a clear component type (e.g., `TextInput` for fillable fields, `Picker` only if explicitly allowed). Add a validation step that cross‑checks the `DESIGN.md` labels against the `ui_flow.json` entries before handing off to the coder.
   - Expected effect: UI components will be built in a way that the automated UI tests can interact with them directly, removing the Picker‑fill failure and reducing UI validator blocks caused by missing or ambiguous identifiers.
