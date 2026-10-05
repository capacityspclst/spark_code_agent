# Retrospective: run 20261004-160830-dc8e

Task: Build a new freelance finance tracking phone app: an Expo (React Native) app for iOS and Android that uses the phone's camera to photograph receipts (with a photo-library fallback), plus a Python FastAPI backend (PostgreSQL in production; SQLite via DATABASE_URL for tests and previews). Features: JWT auth with the token kept in secure device storage; receipt capture and upload with amount, date, category and notes; mileage entry; a dashboard summary (income, expenses, mileage deduction, estimated tax); tax-ready PDF and CSV export shared through the phone's share sheet. The UI must be polished and professional, with a best‑practice sign‑up and sign‑in flow and clear navigation to every action. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests.

Outcome: not approved after 6 rounds, 5.0 h

## Observations

- validator 'ui primary flow (expo-app)' blocked 6 of 6 rounds
- coder hit its turn limit in 3 of 6 rounds ([1, 2, 3])
- vision scores flat across the run: first rounds [6.5, 6.5, 6.0], last rounds [6.0, 6.0, 6.0]
- slowest round 2 took 85 min; average 49 min

## Went well

- All unit and integration tests passed, showing that the test suite is reliable.
- The UI primary‑flow validator consistently detected the root problem (unable to locate the "Email address" field) across every round, giving a stable signal of failure.
- The reviewer supplied concrete, actionable hints (e.g., remove invalid accessibilityRole, add proper labels) that were relevant to the failures.
- The pipeline respected the coder turn‑limit and the repeat‑failure guard (no runaway loops).
- Vision scores remained stable, indicating the visual evaluation component was not a bottleneck.

## Improvements for the next run

1. **[high] Add a UI accessibility static validator**
   - Evidence: Rounds 1‑6 all failed the UI primary‑flow validator on the same step (fill field "Email address"); reviewer repeatedly pointed to missing <label>, missing accessibilityLabel, invalid accessibilityRole, and Unicode whitespace (round 2‑5‑6). The coder hit its turn limit in rounds 1‑3, suggesting the issues were not caught early enough.
   - Change: Extend validate.py (or add a new validator file) with a static checker that scans all JSX/TSX files for: • TextInput components with invalid accessibilityRole values (e.g., "textbox"); • Missing accessibilityLabel / placeholder / aria‑label that would expose a name to the web DOM; • nativeID misuse on web (nativeID not reflected as id attribute); • Presence of non‑ASCII whitespace (e.g., U+202F) in source strings. The validator must output file:line messages with a one‑sentence fix suggestion.
   - Expected effect: These UI‑accessibility errors are caught before the Playwright UI flow runs, giving the coder precise repair tasks, reducing turn‑limit hits, cutting token usage, and allowing the UI validator to pass earlier.
2. **[medium-high] Make UI primary‑flow validator output actionable diagnostics**
   - Evidence: Raw validator output (rounds 1‑6) only reports a generic timeout: "locator.fill: Timeout 10000ms exceeded" without explaining why the field was invisible. Reviewers had to infer the cause, leading to overlapping advice each round.
   - Change: Update ui_check.mjs to, on failure to locate a field, dump the ARIA/accessible name tree and report the specific missing attribute (e.g., "No element with accessible name 'Email address' found – check for accessibilityLabel, placeholder, or associated <label> with htmlFor linking to id"). Include a short recommendation (add accessibilityLabel or proper <label>).
   - Expected effect: Coder receives a clear root‑cause hint instead of a generic timeout, dramatically reduces guesswork, and speeds up convergence.
3. **[medium] Tighten repeat‑failure guard for persistent UI validator failures**
   - Evidence: The same UI primary‑flow failure persisted for six consecutive rounds (rounds 1‑6). The pipeline allowed six attempts before stopping, consuming >5 hours and 143 coder calls.
   - Change: Adjust the pipeline configuration so that if the exact same validator (e.g., "ui primary flow (expo‑app)") fails for 4 consecutive rounds, the run is halted and a redesign request is issued to the designer to amend ui_flow.json/DESIGN.md (e.g., add testIDs or explicit label mapping).
   - Expected effect: Prevents endless iteration on an unsolvable UI spec, forces an early design revision, and saves both compute time and token budget.
4. **[medium] Consolidate reviewer feedback into a persistent prioritized TODO list**
   - Evidence: Reviewer issues changed each round (round 2: add <label>; round 3: nativeID↔id mismatch; round 5: add accessibilityLabel; round 6: remove Unicode narrow‑no‑break spaces). The coder received overlapping, sometimes contradictory hints, leading to repeated missed fixes.
   - Change: Modify the reviewer prompt to output a structured "Pending Fixes" section that persists across rounds, marking items as resolved when a diff shows the change. Only new, unmet items are added each round. Present this list to the coder as the primary feedback message.
   - Expected effect: Provides the coder with a clear, incremental checklist, reduces duplicated suggestions, lowers token churn, and improves convergence speed.
5. **[low] Add a Unicode‑whitespace linter to static validation**
   - Evidence: Round 6 reviewer identified narrow‑no‑break spaces (U+202F) in helper text that caused bundling and label‑association errors, a problem that only surfaced after many iterations.
   - Change: Extend the static validator suite (validate.py) with a rule that scans source files for non‑ASCII whitespace characters (e.g., U+202F, U+00A0) and reports file:line locations with a suggestion to replace them with normal spaces.
   - Expected effect: Catches invisible character bugs early, preventing bundling/parsing failures that break UI tests, thereby reducing wasted rounds.
