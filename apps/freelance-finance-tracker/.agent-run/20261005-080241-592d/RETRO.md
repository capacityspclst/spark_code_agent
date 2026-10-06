# Retrospective: run 20261005-080241-592d

Task: Build a new freelance finance tracking phone app: an Expo (React Native) app for iOS and Android that uses the phone's camera to photograph receipts (with a photo-library fallback), plus a Python FastAPI backend (PostgreSQL in production; SQLite via DATABASE_URL for tests and previews). Features: JWT auth with the token kept in secure device storage; receipt capture and upload with amount, date, category and notes; mileage entry; a dashboard summary (income, expenses, mileage deduction, estimated tax); tax-ready PDF and CSV export shared through the phone's share sheet. The UI must be polished and professional, with a best‑practice sign‑up and sign‑in flow and clear navigation to every action. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests.

Outcome: not approved after 11 rounds, 12.6 h

## Observations

- validator 'ui primary flow (expo-app)' blocked 10 of 11 rounds
- coder hit its turn limit in 5 of 11 rounds ([1, 2, 3, 6, 11])
- vision scores flat across the run: first rounds [6.9, 6.9, 7.0], last rounds [7.0, 6.7, 7.3]
- slowest round 2 took 134 min; average 68 min

## Went well

- All unit and integration tests passed throughout the run, showing that the test suite itself was not a bottleneck.
- Vision scores remained steady (≈7) across 11 rounds, indicating that the visual regression checks were stable and not a source of false negatives.
- The pipeline completed 11 iterative rounds, giving the coder many opportunities to apply reviewer feedback and gradually reduce TypeScript compilation errors.
- The reviewer consistently supplied actionable comments each round, keeping the dialogue alive and preventing dead‑ends.

## Improvements for the next run

1. **[high] Make UI validator report exact missing accessibility attributes**
   - Evidence: Rounds 2‑11 all failed with "ui primary flow (expo-app)" but only reported a generic timeout on step 25/33. The root cause (missing testID / accessibilityLabel on Date input and Export CSV button) was never surfaced, causing the coder to chase unrelated fixes (e.g., lazy Tab.Navigator).
   - Change: Update ui_check.mjs (UI validator) to, on timeout, inspect the Playwright locator error and output the selector that could not be found plus a hint like "Element with accessibilityLabel='Date' or testID='date-input' not found". Add a pre‑flight accessibility lint step that checks every TextInput/Button for testID or accessibilityLabel.
   - Expected effect: Coder will receive a precise target (e.g., add testID='date-input') instead of only seeing a timeout, eliminating repeated guesswork and reducing the number of rounds needed for UI flow to pass.
2. **[high] Require explicit accessibility attributes in the designer spec**
   - Evidence: Designer prompt produced ui_flow.json but did not mandate that UI components include testID / accessibilityLabel. Consequently, the coder never added them, leading to persistent UI validator failures (rounds 2‑11).
   - Change: Modify the Designer prompt and DESIGN.md template to include a mandatory section: "All interactive components must have a unique testID and an accessibilityLabel matching the label in DESIGN.md". Enforce this in a static validator that checks the generated source for missing attributes before any UI tests run.
   - Expected effect: The generated code will be UI‑testable from the start, preventing the UI flow validator from failing due to missing selectors and cutting down the number of UI‑related revisions.
3. **[medium] Add a static TypeScript sanity validator for stray escape sequences and implicit any errors**
   - Evidence: TypeScript compile errors persisted in rounds 1, 3, and 7 (invalid Unicode escape `\n` in App.tsx, implicit any on tabBarButton props, missing property `cacheDirectory`). The reviewer’s suggestions (add type annotation) were applied partially but the original stray `\n` remained, causing repeated failures.
   - Change: Extend validate.py to include a regex check for backslash‑escaped newlines or other illegal Unicode escape sequences and for any implicit any warnings. When detected, the validator should output a concrete fix (e.g., "Replace `\n` with a real line break or use `{`\n`}` in JSX string").
   - Expected effect: Compile errors will be caught early with a concrete correction, preventing the coder from expending turn limits on unrelated UI fixes and accelerating convergence.
4. **[medium] Refine reviewer feedback template to demand concrete, verifiable fixes and confirmation**
   - Evidence: Reviewer feedback in rounds 2, 4, 5 repeatedly suggested changing Tab.Navigator lazy rendering, which did not address the actual UI selector failures. The coder kept revisiting unrelated parts, leading to wasted turns and repeated UI validator failures.
   - Change: Update the reviewer prompt to require: (a) a single, testable change (e.g., "Add testID='date-input' to the Date TextInput"), (b) explicit confirmation that the change was applied (show diff), and (c) a brief verification step (run the UI validator locally). If the reviewer cannot point to a concrete change, the feedback should be flagged as "no actionable item" and the planner should re‑prioritize.
   - Expected effect: Feedback becomes directly actionable, reducing the number of speculative changes and the number of times the coder hits its turn limit.
5. **[low] Introduce an early‑exit summary when coder hits turn limit**
   - Evidence: Coder hit its turn limit in rounds 1, 2, 3, 6, and 11 (5 of 11 rounds). Each hit resulted in a large diff of changes but no concise “what’s still broken” summary, causing the next round to repeat the same debugging loop.
   - Change: When the turn‑limit guard fires, automatically inject a system message to the coder: "Summarize the last N changes, list remaining failures from validators, and propose a focused plan for the next round." Also lower the max turn count per round to 30 and require the coder to submit a diff file for review.
   - Expected effect: The next round starts with a clear problem list, preventing duplicate work, shortening overall runtime, and keeping the pipeline within its turn budget.
