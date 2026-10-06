# Retrospective: run 20261006-090519-f22a

Task: Fix security issues for freelance finance tracker: add authentication to upload endpoints, update vulnerable dependencies

Outcome: not approved after 8 rounds, 6.2 h

## Observations

- coder hit its turn limit in 5 of 8 rounds ([2, 3, 5, 6, 8])
- slowest round 7 took 60 min; average 46 min

## Went well

- The acceptance tests were ultimately passed (from round 3 onward) and the pipeline completed without deadlock after 8 rounds.
- Reviewer consistently provided detailed security and functional issues, enabling the coder to target specific problem areas.
- UI design artifacts (DESIGN.md and ui_flow.json) were generated early and used by the UI validator throughout the run.
- Static lint (ruff) errors were identified and subsequently reduced, showing the validator feedback loop works.
- The coder’s turn‑limit nudging mechanism prevented the run from aborting despite multiple turn‑limit hits.

## Improvements for the next run

1. **[high] Add pre‑run dependency resolver and auto‑add missing packages**
   - Evidence: Round 2: "ERROR: Unable to import FastAPI app: No module named 'slowapi'" – missing Python dependency.  Rounds 5‑6: npm ERESOLVE errors showing version conflicts for react/react‑test‑renderer, causing npm install to fail.  These errors repeatedly forced the coder to hit turn limits and stalled progress.
   - Change: static validators (validate.py): introduce a new validator `dependency_check.py` that runs `pip install -r backend/requirements.txt` and `npm install` before each coder turn, detects missing packages or version conflicts, and automatically appends missing Python packages to `requirements.txt` or suggests version adjustments in `package.json`.  The validator should output a concise fix suggestion that is fed to the coder.
   - Expected effect: ImportErrors and npm install failures are caught and resolved before the coder starts modifying code, eliminating repeated turn‑limit hits and cutting total round time dramatically.
2. **[high] Structured, prioritized feedback to coder after each round**
   - Evidence: Round 5 and 6 reviewer issued long lists of issues (ImportError, FastAPI signature, ruff lint errors, UI failures) but the coder still hit its turn limit, indicating the feedback was not actionable or ordered.
   - Change: feedback message to the coder after each round: replace the raw list with a synthesized summary that categorises issues (critical blockers, lint errors, UI failures, security), includes file/line references, and provides a one‑sentence fix suggestion for each.  Use a fixed template so the coder sees the most urgent items first.
   - Expected effect: Coder can focus on the highest‑impact fixes first, reduces wasted iterations, and improves convergence speed.
3. **[medium-high] Enrich validators with cause‑and‑fix suggestions**
   - Evidence: Validator output for ruff (round 3 & 5) lists undefined names (F821) and unused imports (F401) without guidance.  npm validator (round 5‑6) only prints the raw ERESOLVE log, leaving the coder to infer which package versions to change.
   - Change: static validators (validate.py): extend each validator to parse error codes and generate actionable recommendations.  For ruff, map F821 → "Add missing import: from fastapi import FastAPI"; F401 → "Remove unused import or use it".  For npm, parse the conflicting peer dependency lines and suggest the exact version bump or downgrade (e.g., "Set react-test-renderer to ^18.2.0" or run `expo install`).  Append these suggestions to the validator report.
   - Expected effect: Provides the coder with clear, concrete next steps, reducing guesswork and the number of turns needed to resolve each problem.
4. **[medium] Introduce backend readiness check before UI validation**
   - Evidence: Rounds 2‑3 UI validators failed because the FastAPI backend could not start (ImportError for slowapi, "name 'app' is not defined").  UI tests were repeatedly run on a non‑functional backend, consuming time (e.g., round 2 UI blocking count 7, round 3 UI blocking 5).
   - Change: validators: add a new pre‑validator step `backend_ready` that attempts to import and start the FastAPI app (`uvicorn backend.app.main:app --check-config`).  If it fails, block all UI‑related validators and return the precise import/startup error to the coder.
   - Expected effect: Avoids unnecessary UI validation runs while the backend is broken, shortening round duration and focusing effort on fixing core server issues first.
5. **[medium] Update planner prompt to enforce task ordering: core backend fixes before UI and security enhancements**
   - Evidence: The initial plan prioritized UI flow (DESIGN.md, ui_flow.json) while fundamental import and dependency problems persisted, causing the coder to bounce between backend crashes and UI failures across rounds 2‑6.  Security hardening was only tackled in later rounds, extending the run.
   - Change: planner prompt: require the planner to output a ranked task list with explicit ordering – (1) resolve import errors and missing dependencies, (2) implement missing auth endpoints (login, signup), (3) secure media endpoint, (4) update vulnerable dependencies, (5) validate UI primary flow, (6) final security hardening.  The planner should embed this ordering into the designer's output and pass it to the coder as a roadmap.
   - Expected effect: Provides a clear, top‑down roadmap; the coder works on blockers first, reducing back‑and‑forth, lowering the number of rounds and overall runtime.
