# Retrospective: run 20261007-072131-d056

Task: Build a new freelance finance tracking phone app: an Expo (React Native) app for iOS and Android that uses the phone's camera to photograph receipts (with a photo-library fallback), plus a Python FastAPI backend (PostgreSQL in production; SQLite via DATABASE_URL for tests and previews). Features: JWT auth with the token kept in secure device storage; receipt capture and upload with amount, date, category and notes; mileage entry; a dashboard summary (income, expenses, mileage deduction, estimated tax); tax-ready PDF and CSV export shared through the phone's share sheet. The UI must be polished and professional, with a best‑practice sign‑up and sign‑in flow and clear navigation to every action. Use the current Expo SDK (look up versions with npm view; never guess). Includes unit and integration tests.

Outcome: not approved after 12 rounds, 6.7 h

## Observations

- slowest round 11 took 61 min; average 34 min

## Went well

- Security scans recovered after early failures and passed in subsequent rounds, showing the security‑scanner integration works.
- The reviewer approved several rounds (4, 8, 9, 10), indicating the code base reached a stable, merge‑ready state for many components.
- The pipeline successfully identified and fixed concrete bugs such as the missing Pillow dependency (round 7), the media‑endpoint path typo (round 6), and the invalid TypeScript syntax in theme.ts (round 11).
- Iterative feedback loops eventually resolved the TypeScript import errors and the React runtime crash, demonstrating the self‑correcting nature of the multi‑agent loop.
- The dashboard test passed after round 2, showing that the acceptance‑test suite can be satisfied early and later regressions are detectable.

## Improvements for the next run

1. **[high] Make reviewer and validator feedback explicitly actionable**
   - Evidence: Round 1 reviewer issue: "Static validation fails the accessibility check (serious) for Expo app..." – the message was truncated and lacked file/line details. Round 3 reviewer issue: "TypeScript compilation error: expo-app/src/components/ui/FormField.tsx imports View from 'react-native-paper'..." – feedback did not include a concrete diff or exact line to edit, leading to repeated import mistakes across rounds 3‑4‑5.
   - Change: Update the reviewer prompt (and static validator output format) to require a concise, file‑specific fix suggestion: include the file path, line number, and the exact code snippet to replace (e.g., "Replace import { View } from 'react-native-paper' with import { View } from 'react-native' in src/components/ui/FormField.tsx"). Also enforce that every validator returns the offending file and line number when possible.
   - Expected effect: Coder receives a clear, one‑step patch instruction, reducing the number of revision rounds needed to fix import errors, accessibility issues, and dashboard logic bugs. This should cut total rounds by 30‑40% and lower token usage.
2. **[high] Add early TypeScript import linting to catch invalid imports before UI execution**
   - Evidence: Round 3 reported "TS2305: Module 'react-native-paper' has no exported member 'View'" and the same import caused a Minified React error #130 that broke the primary flow tests (round 3 UI validator failures). The issue persisted for multiple rounds before being fixed.
   - Change: Introduce a new static validator (typescript_import_lint.py) that runs after the planner and before the first coder turn. It should parse all .tsx files and flag any import of symbols not exported by the declared package (e.g., importing View from 'react-native-paper'). The validator’s error message must follow the actionable format from improvement 1.
   - Expected effect: Invalid imports are detected in round 0, preventing runtime crashes and UI flow test failures, thereby eliminating at least two full rounds of UI debugging and saving ~1 hour per run.
3. **[medium] Enforce dependency‑to‑manifest consistency**
   - Evidence: Round 7 revealed "Missing dependency: Pillow not listed in backend/requirements.txt", causing an ImportError when uploading receipts. The issue was only discovered after the coder had already committed code referencing PIL.
   - Change: Add a dependency consistency validator (dependency_check.py) to the static‑validation stage. It scans all import statements in both backend (Python) and Expo (JavaScript/TypeScript) source files, compares them against backend/requirements.txt and expo-app/package.json, and reports any missing entries with file/line details.
   - Expected effect: Missing packages are caught before code execution, preventing runtime import failures and reducing the need for post‑hoc dependency fixes, which should cut at least one revision round per missing package.
4. **[medium] Require secure JWT secret length at project generation**
   - Evidence: Both round 1 and round 12 test logs show warnings: "JWT_SECRET_KEY is shorter than 32 bytes; this is insecure for production" and the test suite still flagged a dashboard mismatch possibly tied to token handling.
   - Change: Modify the planner prompt to generate a JWT secret of at least 32 bytes (e.g., a 64‑character base64 string) and set it in the .env template. Add a validator (jwt_secret_length.py) that checks the length of JWT_SECRET_KEY at the start of each run and fails with a clear fix suggestion if it is too short.
   - Expected effect: Eliminates insecure‑key warnings, satisfies security policies on the first attempt, and removes the related test failure noise, improving both security‑scan pass rate and test stability.
5. **[low] Standardise accessibility handling for icon components**
   - Evidence: Round 1 accessibility validator reported serious issues: icons rendered as <div role="img"> lacked alternative text, and the reviewer’s suggestion was generic, resulting in the issue persisting through multiple rounds (still UI‑blocking in later rounds).
   - Change: Extend the designer prompt with a mandatory rule: "All icon components must be hidden from the accessibility tree (aria‑hidden) unless they convey meaning. The designer must add aria‑hidden to any <Icon>, <MaterialCommunityIcons>, or PaperProvider‑generated icon and document this in DESIGN.md. Include a sample snippet." Also enhance the UI validator to flag any role="img" without aria‑hidden/aria‑label and output file/line details.
   - Expected effect: Accessibility validator passes from round 1 onward, removing the need for repeated UI revisions related to icons and lowering the UI‑blocking count, which speeds up convergence of UI flow tests.
