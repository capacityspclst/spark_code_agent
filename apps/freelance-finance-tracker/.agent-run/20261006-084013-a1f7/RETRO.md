# Retrospective: run 20261006-084013-a1f7

Task: Fix security issues for freelance finance tracker: add authentication to upload endpoints, update vulnerable dependencies

Outcome: success after 6 rounds, 4.0 h

## Observations

- coder hit its turn limit in 1 of 6 rounds ([1])
- slowest round 2 took 66 min; average 37 min

## Went well

- The pipeline eventually produced a fully functional, secure app (tests, validators, and security scans all passed).
- The reviewer correctly identified critical security issues (static SECRET_KEY, bcrypt scheme) and the coder remedied them after a few rounds.
- The security scanner caught vulnerable dependencies early, allowing them to be updated before final approval.
- The documentation agent added relevant docs after the main work was done, showing the pipeline can handle ancillary tasks.
- Despite an early turn‑limit hit, the coder recovered and completed the required changes within six review cycles.

## Improvements for the next run

1. **[high] Add early static dependency validator**
   - Evidence: Round 1 failed with `RuntimeError: The starlette.testclient module requires the httpx2 package to be installed.` The reviewer’s first comment was merely “Add a dependency on httpx2 (or httpx) to requirements.” The missing package had to be discovered via a failing test run, costing an entire round and a turn‑limit hit.
   - Change: Pipeline part: static validators (validate.py). Add a new validator step after the planner that parses `requirements.txt` and the import statements in all source and test files; if any imported package is missing from the declared dependencies, emit a structured issue (e.g., `{file, missing_package, suggestion}`). This runs before the first test execution.
   - Expected effect: Missing runtime dependencies are caught pre‑test, preventing the first round from failing due to import errors and avoiding a coder turn‑limit hit. This reduces the number of revision cycles and the total runtime.
2. **[high] Enforce structured, complete reviewer feedback**
   - Evidence: In Round 3 the reviewer issue reads: "The password hashing implementation … fails … The test password \"Testpass123!\" is well under the length limit, so the error arises from the" – the message is truncated and does not name the root cause, leading to another revision round.
   - Change: Pipeline part: reviewer prompt. Update the prompt to require each issue be output as JSON with fields `file`, `line_range`, `description`, `cause`, `suggested_fix`. Add a post‑processing check that flags any missing fields or empty strings and forces the reviewer to elaborate before the feedback is sent to the coder.
   - Expected effect: Codeler receives precise, actionable guidance, eliminating ambiguity that currently forces extra rounds. Faster convergence and fewer unnecessary revisions.
3. **[medium] Dynamic coder turn allocation based on failure type**
   - Evidence: Round 1 shows `coder_turn_limit: true` while the test still failed due to a missing dependency. The coder could not finish installing the package and updating imports within the allotted turns.
   - Change: Pipeline part: coder turn limit logic. Introduce a rule: if the reviewer reports a missing dependency or the validator flags unresolved imports, extend the allowed turn count for that round by up to 40 extra turns (e.g., 20‑100 turns). Reset to the normal 20‑60 range for subsequent rounds.
   - Expected effect: The coder can resolve installation‑related issues in the same round rather than being cut off, cutting down the total number of rounds and the overall time spent on repeated test failures.
4. **[medium] Cache and parallelize security scans**
   - Evidence: Round 2 took 3970 seconds (≈66 min), the longest of the run, and `security: fail`. Security scans (Trivy, Semgrep) dominate the runtime in that round.
   - Change: Pipeline part: security scanner step. Implement file‑hash based caching so unchanged files reuse previous scan results, and run the security scan concurrently with test execution when possible. Only re‑scan files that changed since the last round.
   - Expected effect: Reduces the wall‑clock time of heavy security scans, shortening the longest round and decreasing total pipeline duration without compromising security enforcement.
5. **[low] Prioritize reviewer issues to a maximum of two per round**
   - Evidence: Round 2 reviewer listed three separate issues (static SECRET_KEY, bcrypt scheme, JWT key length) while the coder had to address all of them in a single iteration, contributing to longer coder work and the turn‑limit hit.
   - Change: Pipeline part: reviewer prompt. Add a constraint that the reviewer may surface at most two top‑priority issues per round, with an explicit `priority` field. Lower‑priority items are deferred to later rounds or grouped as a single “future work” note.
   - Expected effect: Coder focuses on the most critical fixes first, avoiding overload and reducing the chance of hitting turn limits. This streamlines the revision loop and improves convergence speed.
