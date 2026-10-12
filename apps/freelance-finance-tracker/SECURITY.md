# Security assurance: freelance-finance-tracker

Pipeline run `20261012-090553-53fe`, 2026-10-12. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was approved after 2 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-12). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
- **Suppression check.** `nosemgrep`, `trivy:ignore` and scanner ignore files are rejected.
- **Security review** by an AI reviewer each round once tests and scanners passed, against a fixed severity rubric, tracking every finding to fixed or open.
- **Isolation.** All generated code, tests and scanners ran in a sandbox container with no secrets.

Blocking rules: any secret; high/critical dependency vulnerabilities with a fix available; high/critical misconfigurations; Semgrep errors; critical/high review findings.

## Scanner results (final round)

- scanner suppressions: **pass**
- semgrep (security errors): **pass**
- trivy secrets: **pass**
- trivy dependency vulnerabilities (high/critical, fixable): **pass**
- trivy misconfigurations (high/critical): **pass**
- trivy dependency vulnerabilities (other): **warnings**
  - `package-lock.json: braces 3.0.3 CVE-2026-93687 HIGH (no fix yet): braces: braces: Denial of Service via Stack Overflow from Deeply Nested Patterns`
  - `package-lock.json: node-forge 1.4.0 CVE-2026-85393 HIGH (no fix yet): node-forge: node-forge: Signature forgery vulnerability in RSA PKCS#1 v1.5 verification`
  - `package-lock.json: sprintf-js 1.0.3 CVE-2026-97058 MEDIUM (no fix yet): sprintf-js: sprintf-js: Denial of Service via unbounded precision specifiers`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| dependency-braces-high | high | deployment | open | 2 | `package-lock.json` | `braces` 3.0.3 is vulnerable to CVE‑2026‑93687 (Denial‑of‑Service via stack overflow from deeply nested patterns). The library is present in the production bundle and could be invoked by any code that uses glob/regex uti |
| dependency-node-forge-high | high | deployment | open | 2 | `package-lock.json` | `node‑forge` 1.4.0 contains CVE‑2026‑85393 (signature forgery in RSA PKCS#1 v1.5 verification), which could allow forged signatures and compromise cryptographic integrity. |
| dependency-sprintf-js-medium | medium | deployment | open | 2 | `package-lock.json` | `sprintf-js` 1.0.3 is vulnerable to CVE‑2026‑97058 (Denial‑of‑Service via unbounded precision specifiers) which can crash the app if a malicious format string is processed. |
| backup-restore-size-dos-medium | medium | code | open | 2 | `src/lib/backup.ts` | `restoreBackup` decrypts the entire encrypted backup blob before checking its size. An attacker can supply an extremely large backup (e.g., > 10 MiB) to exhaust memory and crash the app. |
| backup-passphrase-bruteforce-medium | medium | code | open | 2 | `src/lib/backup.ts` | There is no rate‑limiting or delay on consecutive failed passphrase attempts during restore, allowing offline brute‑force attacks on the encrypted backup. |
| csv-export-injection-weak-escaping-mediu | medium | code | open | 2 | `src/lib/exportCsv.ts` | CSV export only prefixes a single quote for fields starting with =, +, -, or @. It does not fully escape commas, newlines, quotes, or other special characters, leaving the CSV vulnerable to injection attacks in spreadshe |
| backup-passphrase-min-length-missing-cod | medium | code | open | 2 | `src/lib/backup.ts` | `createBackup` (and `restoreBackup`) accept any passphrase length; the UI enforces a 12‑character minimum, but a caller could invoke the function programmatically with a short passphrase, producing weakly protected backu |
| restore-photo-path-traversal-medium | medium | code | open | 2 | `src/lib/backup.ts` | `restoreBackup` writes receipt photos using the `photoUri` supplied in the backup payload via `File.write(uri, data)`. An attacker‑controlled URI could cause path‑traversal or overwrite files outside the app sandbox. |
| data-reset-photo-leak-high | high | code | fixed | 2 | `src/lib/dataReset.ts` | The "Delete all data" flow clears the encrypted KV store and deletes the SecureStore encryption key, but it never deletes receipt photo files stored on the device. Sensitive images remain after a reset. |
| dependency-uuid-medium | medium | code | dismissed | 2 | `package-lock.json` | `uuid` 7.0.3 has CVE‑2026‑141907 (out‑of‑bounds write) that can corrupt memory and affect data integrity. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** dependency-braces-high: `braces` 3.0.3 is vulnerable to CVE‑2026‑93687 (Denial‑of‑Service via stack overflow from deeply nested patterns). The library is present in the production bundle and could be invoked by any code that uses glob/regex utilities. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade `braces` to >= 3.0.4 (or remove it if unused). Update `package.json` and run `npm install`.
- [ ] **high** dependency-node-forge-high: `node‑forge` 1.4.0 contains CVE‑2026‑85393 (signature forgery in RSA PKCS#1 v1.5 verification), which could allow forged signatures and compromise cryptographic integrity. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Replace all usages of `node‑forge` with the already‑used `@noble/*` libraries or upgrade to a fixed version (>= 1.5.0) when released. Remove the package from `package.json` if not needed.
- [ ] **medium** dependency-sprintf-js-medium: `sprintf-js` 1.0.3 is vulnerable to CVE‑2026‑97058 (Denial‑of‑Service via unbounded precision specifiers) which can crash the app if a malicious format string is processed. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Replace usage of `sprintf-js` with native template literals or a safe formatting library. If it is only a transitive dependency, update to a patched version or prune it from the bundle.

## Residual risk in the code (accepted, open)

- **medium** backup-restore-size-dos-medium: `restoreBackup` decrypts the entire encrypted backup blob before checking its size. An attacker can supply an extremely large backup (e.g., > 10 MiB) to exhaust memory and crash the app. Recommended fix: Add a pre‑decryption size check (reject blobs > 10 MiB) and enforce limits on the number of receipts (e.g., ≤ 10 000) and mileage entries (≤ 5 000) in `validateBackupStructure`. Abort early if limits are exceeded.
- **medium** backup-passphrase-bruteforce-medium: There is no rate‑limiting or delay on consecutive failed passphrase attempts during restore, allowing offline brute‑force attacks on the encrypted backup. Recommended fix: Implement exponential back‑off (e.g., 1 s, 2 s, 4 s …) after each failed restore attempt and lock the restore UI after a configurable number of consecutive failures (e.g., 5). Store the failure count in memory and reset on app restart.
- **medium** csv-export-injection-weak-escaping-mediu: CSV export only prefixes a single quote for fields starting with =, +, -, or @. It does not fully escape commas, newlines, quotes, or other special characters, leaving the CSV vulnerable to injection attacks in spreadsheet software. Recommended fix: Replace the custom CSV generation with a robust library such as `csv-stringify` that correctly escapes all fields per RFC 4180, handling commas, quotes, line‑breaks, and leading characters.
- **medium** backup-passphrase-min-length-missing-cod: `createBackup` (and `restoreBackup`) accept any passphrase length; the UI enforces a 12‑character minimum, but a caller could invoke the function programmatically with a short passphrase, producing weakly protected backups. Recommended fix: Add an explicit length check at the start of `createBackup` (and optionally `restoreBackup`): if `passphrase.length < 12` throw an error with a clear message. This enforces the rule regardless of UI.
- **medium** restore-photo-path-traversal-medium: `restoreBackup` writes receipt photos using the `photoUri` supplied in the backup payload via `File.write(uri, data)`. An attacker‑controlled URI could cause path‑traversal or overwrite files outside the app sandbox. Recommended fix: Ignore the `photoUri` from the backup. Write restored photos to a trusted internal directory (e.g., `FileSystem.documentDirectory`) with a filename derived from the receipt ID. Validate that the target path stays within this directory before writing.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
