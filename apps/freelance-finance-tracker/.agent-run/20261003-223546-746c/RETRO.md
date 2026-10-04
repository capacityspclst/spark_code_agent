# Retrospective: run 20261003-223546-746c

Task: Build a new freelance finance tracking app: Python FastAPI backend with PostgreSQL, React+Vite frontend, JWT auth (store token in localStorage and attach Authorization header to all API calls), include a Confirm password field in the Register component, fix token expiration to be a numeric timestamp (use datetime.timestamp), ensure TypeScript compiles without errors, add top‑level requirements.txt with fastapi, uvicorn, python-jose[cryptography], passlib[bcrypt], sqlalchemy, pydantic, pydantic-settings, psycopg2-binary, and include unit and integration tests. Apply lessons learned: make Ruff warnings non‑blocking, increase coder turn limit, auto‑generate missing ui‑backend.json, and tighten TypeScript config handling.

Outcome: not approved after 7 rounds, 4.8 h

## Observations

- validator 'trivy dependency vulnerabilities (high/critical, fixable)' blocked 7 of 7 rounds
- validator 'typescript (tsc)' blocked 5 of 7 rounds
- validator 'ui primary flow (ui)' blocked 4 of 7 rounds
- validator 'ruff' blocked 3 of 7 rounds
- coder hit its turn limit in 6 of 7 rounds ([1, 2, 3, 4, 6, 7])
- vision scores flat across the run: first rounds [3.0, 3.5, 3.5], last rounds [3.5, 3.5, 3.5]
- slowest round 6 took 55 min; average 36 min

## Went well

- Planner produced a complete high‑level plan in only 2 calls, staying under the token budget.
- Designer generated a detailed DESIGN.md and a UI flow (ui_flow.json) that covered all required screens.
- Reviewer identified key missing dependencies (httpx2, email‑validator, bcrypt) and UI configuration gaps early in the run.
- Vision scores stayed steady (3.0‑3.5) across all rounds, showing consistent UI quality assessment.
- Coder emitted a large amount of source code (≈10 M tokens) despite hitting the turn limit.

## Improvements for the next run

1. **[high] Make Trivy vulnerability checks non‑blocking and enable automatic dependency upgrades**
   - Evidence: Validator 'trivy dependency vulnerabilities (high/critical, fixable)' blocked every round (1‑7). The same CVEs (e.g., axios, @remix-run/router) were reported each time, preventing any progress.
   - Change: Modify the security‑scanner step (trivy) to (a) treat high‑severity CVEs in dev‑only dependencies as warnings rather than hard failures, and (b) automatically run `npm update`/`pip install --upgrade` for any package with a fixable CVE before validation. Adjust the pipeline config to allow the run to continue after upgrade, only aborting on unfixable vulnerabilities.
   - Expected effect: Stops the pipeline from stalling on the same known vulnerabilities, reduces wasted rounds, and yields a cleaner dependency tree that passes security validation on the first try.
2. **[high] Increase coder turn limit and allow dynamic allocation based on task complexity**
   - Evidence: Coder hit its turn limit in rounds 1, 2, 3, 4, 6, 7 (6 of 7 rounds). Each time the coder could not finish the required changes, leading to extra rounds and longer total runtime (average 36 min per round).
   - Change: Raise the `coder_turns` setting from the current value to at least 800 turns per round, and add a heuristic that grants extra turns when the current round’s token usage exceeds 75% of the limit. This change is applied in the coder agent configuration.
   - Expected effect: Allows the coder to finish larger patches (e.g., dependency upgrades, UI fixes) within a single round, cutting the number of rounds and overall runtime dramatically.
3. **[medium] Treat Ruff warnings as non‑blocking and auto‑apply `--fix` where possible**
   - Evidence: Ruff validator blocked rounds 1, 6, 7 with F401 unused‑import errors, even though these are merely warnings and the requirement explicitly asked to make Ruff warnings non‑blocking.
   - Change: Update the static validator `validate.py` for Ruff to run with `--exit-zero` and to invoke `ruff --fix` automatically on any fixable warning. Adjust the code‑reviewer prompt to ignore warnings unless they are marked as errors (e.g., E‑codes).
   - Expected effect: Removes unnecessary blocking on harmless style issues, letting the pipeline focus on functional failures and speeding up convergence.
4. **[medium] Auto‑generate missing `ui-backend.json` and enforce its location**
   - Evidence: Validator 'ui backend config' failed in round 1 because the file was missing or placed in the wrong directory. Subsequent UI‑flow checks kept failing (rounds 3, 5‑7). Reviewer also noted the mismatch between expected root location and designer output.
   - Change: Add a pre‑validation step that, if `ui-backend.json` does not exist at the repo root, writes a default configuration file using the template described in the reviewer feedback. Also update the designer prompt to explicitly include this file in the DESIGN.md output. The `ui_check.mjs` script will now read the generated file before UI validation.
   - Expected effect: Eliminates the repetitive UI‑backend configuration error, allows UI primary‑flow validation to run, and reduces the number of rounds spent fixing this structural issue.
5. **[high] Introduce a dependency‑install sanity check before running tests**
   - Evidence: Round 1: RuntimeError – missing `httpx2`; round 2: ImportError – missing `email-validator`; round 3: AttributeError – bcrypt `__about__` missing. These errors halted test execution repeatedly.
   - Change: Extend `validate.py` with a new validator that runs `pip install -r requirements.txt` and `npm ci` in a clean sandbox, captures any install failures, and reports them as early blocking issues. The validator also normalises common mistakes (e.g., replace `httpx2` with `httpx`, add the `[email]` extra to `pydantic`). If install succeeds, the pipeline proceeds to functional tests.
   - Expected effect: Catches missing or mis‑named dependencies before the test runner is invoked, preventing the coder from wasting turns on unrelated fixes and ensuring a stable runtime environment from the start.
