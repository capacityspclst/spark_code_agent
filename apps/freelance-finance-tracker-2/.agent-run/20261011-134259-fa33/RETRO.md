# Retrospective: run 20261011-134259-fa33

Task: Fix security issues for freelance finance tracker: add authentication to upload endpoints, update vulnerable dependencies

Outcome: success after 3 rounds, 1.2 h

## Observations

- coder hit its turn limit in 1 of 3 rounds ([1])
- slowest round 3 took 33 min; average 22 min

## Went well

- The pipeline converged to a working solution in only three review rounds, achieving 100% test and validation success.
- All security findings were identified and fixed, with the security scanner reporting a failure in round 2 and passing in round 3.
- The reviewer correctly identified the missing FastAPI multipart dependency on the first round, providing a clear hint.
- Automated dependency installation per round functioned without manual intervention.
- The total number of rounds was low, indicating effective planning and design prompts.

## Improvements for the next run

1. **[high] Add a Missing‑Dependency validator for FastAPI Form/File usage**
   - Evidence: Round 1 failed with RuntimeError: "Form data requires \"python-multipart\" to be installed" (see raw_output). The coder also hit its turn limit in this round, spending many turns before the issue was discovered by the reviewer.
   - Change: Update static validators (validate.py) to scan the codebase for FastAPI Form or File handlers. If such usage is detected and `python-multipart` is not present in `requirements.txt` (or `pyproject.toml`), the validator should fail with a structured message: "Add `python-multipart` to the project dependencies (e.g., `pip install python-multipart`)."
   - Expected effect: The coder receives an actionable, early‑stage directive, preventing wasted turns and eliminating the turn‑limit hit. This should reduce round 1 time from 14 min to under 5 min and shorten overall run time.
2. **[high] Make round‑feedback to the coder a structured action list**
   - Evidence: In round 1 the reviewer replied with a free‑form note “Missing dependency… add `python-multipart`”, yet the coder still exhausted its turn budget before fixing it.
   - Change: Modify the feedback message delivered after each round so that for every validator failure the message includes a bullet‑point action: *Issue: <validator description>* → *Fix: <precise command or code change>* (e.g., "Fix: add `python-multipart` to `requirements.txt` and run `pip install -r requirements.txt`).
   - Expected effect: Clear, targeted instructions guide the coder directly to the required change, reducing the number of turns needed per issue and improving convergence speed.
3. **[medium] Cache and incrementally run security scans**
   - Evidence: Round 2 reported a security failure and round 3 took 33 min (the slowest round) despite no new code changes besides the fix, suggesting full scans were re‑executed each round.
   - Change: Enhance security.py to compute a hash for each source file and store previous scan results. On subsequent rounds only re‑scan files whose hash changed; reuse cached results for unchanged files. Also keep the overall scan summary in the session state.
   - Expected effect: Security scanning time can drop by roughly 30‑50 % per round, cutting the 33‑minute round 3 down to ~15‑20 min and lowering total pipeline runtime.
4. **[medium] Introduce a dynamic coder‑turn buffer based on validator severity**
   - Evidence: The coder hit its turn limit in round 1 (coder_turn_limit: true) right after a simple missing‑dependency error, forcing an extra round of nudging.
   - Change: Adjust the coder turn limit logic: start with the standard limit (planned_files + 10) but add a small buffer (+ 15 turns) if any validator in the previous round emitted a high‑severity error (e.g., missing dependency, security critical). The buffer is reset after a round with no high‑severity issues.
   - Expected effect: Prevents premature termination when the only problem is a straightforward fix, allowing the coder to apply the change within the same round and speeding up convergence.
