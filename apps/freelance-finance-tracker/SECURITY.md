# Security assurance: freelance-finance-tracker

Pipeline run `20261011-085737-73a2`, 2026-10-11. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 10 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-11). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
  - `package-lock.json: uuid 7.0.3 CVE-2026-41907 MEDIUM fixed in 11.1.1, 12.0.1, 13.0.1: uuid: uuid: Out-of-bounds write vulnerability impacts data integrity and confidentiality`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| dependency-braces-high | high | deployment | open | 4 | `package-lock.json` | `braces` 3.0.3 has CVE‑2026‑93687 – a denial‑of‑service via stack overflow from deeply nested patterns. The library is present in the lockfile and could be invoked by any code that uses glob/regex utilities. |
| dependency-node-forge-high | high | deployment | open | 4 | `package-lock.json` | `node‑forge` 1.4.0 contains CVE‑2026‑85393 – a signature‑forgery flaw in RSA PKCS#1 v1.5 verification, potentially allowing forged signatures. |
| data-reset-photo-leak-high | high | code | open | 4 | `src/lib/dataReset.ts` | The "Delete all data" flow clears the encrypted KV store and deletes the SecureStore encryption key, but it does not delete receipt photo files stored on the device, leaving potentially sensitive images after a reset. |
| dependency-sprintf-js-medium | medium | deployment | open | 4 | `package-lock.json` | `sprintf-js` 1.0.3 is vulnerable to CVE‑2026‑97058 – denial‑of‑service via unbounded precision specifiers, which can crash the app if a malicious format string is processed. |
| dependency-uuid-medium | medium | code | open | 4 | `package-lock.json` | `uuid` 7.0.3 has CVE‑2026‑41907 – an out‑of‑bounds write vulnerability that can corrupt memory and affect data integrity. |
| backup-restore-size-dos-medium | medium | code | open | 4 | `src/lib/backup.ts` | The restore process decrypts the entire backup blob before checking its size, which can be abused with an extremely large file to exhaust memory and crash the app. |
| backup-passphrase-bruteforce-medium | medium | code | open | 4 | `src/screens/BackupPassphraseScreen.tsx` | There is no rate‑limiting or delay on consecutive failed passphrase attempts during restore, allowing offline brute‑force attacks on the encrypted backup. |
| csv-export-injection-weak-escaping-mediu | medium | code | open | 4 | `src/lib/exportCsv.ts` | CSV injection mitigation only prefixes a single quote to fields that start with `=`, `+`, `-`, or `@`. It does not fully escape commas, newlines, quotes, or other special characters, leaving the CSV vulnerable to injecti |
| backup-passphrase-min-length-missing-cod | medium | code | open | 10 | `src/lib/backup.ts` | The createBackup function does not enforce the UI‑enforced minimum 12‑character passphrase rule; a caller can supply a short passphrase programmatically, producing weakly‑protected backups that are easier to brute‑force  |
| restore-photo-path-traversal-medium | medium | code | open | 10 | `src/lib/backup.ts` | During restoreBackup the receipt photo bytes are written back using File.write(uri, data) where the uri comes from the backup payload. If the payload contains a malicious or absolute path, this can cause the app to write |
| backup-restore-path-traversal-medium | medium | code | fixed | 4 | `src/lib/backup.ts` | During restore, receipt photo data may be written to an attacker‑controlled `photoUri` path supplied in the backup payload, allowing path‑traversal or overwriting of files outside the app sandbox. |
| backup-temporary-file-cleanup-medium | medium | code | fixed | 4 | `src/lib/backup.ts` | Temporary backup files were not reliably deleted after the share sheet closed, especially on failure or cancellation, potentially leaving residual encrypted data on the device. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** dependency-braces-high: `braces` 3.0.3 has CVE‑2026‑93687 – a denial‑of‑service via stack overflow from deeply nested patterns. The library is present in the lockfile and could be invoked by any code that uses glob/regex utilities. How: Monitor for a patched release (>= 3.0.4) and upgrade when available, or replace the library with a safe alternative. If it is only a build‑time dependency, remove it from the production bundle.
- [ ] **high** dependency-node-forge-high: `node‑forge` 1.4.0 contains CVE‑2026‑85393 – a signature‑forgery flaw in RSA PKCS#1 v1.5 verification, potentially allowing forged signatures. How: Replace all uses of `node‑forge` with the already‑used `@noble/*` libraries or another vetted crypto library, and remove the package from dependencies. If the package is only a dev‑dependency, prune it from the final bundle.
- [ ] **medium** dependency-sprintf-js-medium: `sprintf-js` 1.0.3 is vulnerable to CVE‑2026‑97058 – denial‑of‑service via unbounded precision specifiers, which can crash the app if a malicious format string is processed. How: Replace usage of `sprintf-js` with native template literals or a safer formatting library. If it is only a transitive dependency, upgrade to a fixed version when released or prune it from the bundle.

## Residual risk in the code (accepted, open)

- **high** data-reset-photo-leak-high: The "Delete all data" flow clears the encrypted KV store and deletes the SecureStore encryption key, but it does not delete receipt photo files stored on the device, leaving potentially sensitive images after a reset. Recommended fix: Extend `clearAllData` (or `clearAllData` in `src/lib/dataReset.ts`) to enumerate all `photoUri` values from the receipt store and delete the corresponding files using `expo-file-system` (`FileSystem.deleteAsync`) before completing the reset.
- **medium** dependency-uuid-medium: `uuid` 7.0.3 has CVE‑2026‑41907 – an out‑of‑bounds write vulnerability that can corrupt memory and affect data integrity. Recommended fix: Upgrade `uuid` to a safe version (>= 13.0.1, or 12.0.1/11.0.1) and verify that the code still works. Update any imports accordingly.
- **medium** backup-restore-size-dos-medium: The restore process decrypts the entire backup blob before checking its size, which can be abused with an extremely large file to exhaust memory and crash the app. Recommended fix: Add a pre‑decryption size check (e.g., reject blobs > 10 MiB). Also enforce maximum numbers of receipts (e.g., 10 000) and mileage entries (e.g., 5 000) in `validateBackupStructure` and abort early if limits are exceeded.
- **medium** backup-passphrase-bruteforce-medium: There is no rate‑limiting or delay on consecutive failed passphrase attempts during restore, allowing offline brute‑force attacks on the encrypted backup. Recommended fix: Implement exponential back‑off after each failed restore attempt (e.g., 1 s, 2 s, 4 s…) and lock the restore UI after a configurable number of consecutive failures (e.g., 5). Store the failure count in memory and reset it on app restart.
- **medium** csv-export-injection-weak-escaping-mediu: CSV injection mitigation only prefixes a single quote to fields that start with `=`, `+`, `-`, or `@`. It does not fully escape commas, newlines, quotes, or other special characters, leaving the CSV vulnerable to injection attacks in spreadsheet software. Recommended fix: Replace the custom prefix logic with a robust CSV generation library such as `csv-stringify` (or similar) that fully escapes fields according to RFC 4180, handling commas, quotes, line‑breaks, and leading characters safely.
- **medium** backup-passphrase-min-length-missing-cod: The createBackup function does not enforce the UI‑enforced minimum 12‑character passphrase rule; a caller can supply a short passphrase programmatically, producing weakly‑protected backups that are easier to brute‑force offline. Recommended fix: Add a length check (e.g., if (passphrase.length < 12) throw new Error('Passphrase must be at least 12 characters')) at the start of createBackup (and similarly in restoreBackup) so that the rule is enforced regardless of UI.
- **medium** restore-photo-path-traversal-medium: During restoreBackup the receipt photo bytes are written back using File.write(uri, data) where the uri comes from the backup payload. If the payload contains a malicious or absolute path, this can cause the app to write files outside its sandbox or overwrite existing files, re‑introducing a path‑traversal/write vulnerability. Recommended fix: Ignore any photoUri from the backup and always write restored photos to a safe, app‑controlled directory (e.g., FileSystem.documentDirectory) with filenames derived from the receipt id. Validate that the target path is within the allowed directory before writing.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
