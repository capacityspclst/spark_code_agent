# Security assurance: freelance-finance-tracker

Pipeline run `20261010-183844-b878`, 2026-10-10. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 9 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-10). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
| dependency-braces-high | high | deployment | open | 6 | `package-lock.json` | The `braces` library (version 3.0.3) has CVE‑2026‑93687 – a denial‑of‑service via stack overflow from deeply nested patterns. The library is present in the lockfile and could be invoked by any code that uses glob/regex u |
| dependency-node-forge-high | high | deployment | open | 6 | `package-lock.json` | `node-forge` (1.4.0) contains CVE‑2026‑85393 – a signature‑forgery flaw in RSA PKCS#1 v1.5 verification, which could allow an attacker to craft forged signatures if the library is used for any cryptographic verification. |
| data-reset-photo-leak-high | high | code | open | 6 | `src/lib/dataReset.ts` | The "Delete all data" flow deletes the encrypted KV store and the SecureStore encryption key but does not purge receipt photo files that are stored on the device’s file system, leaving potentially sensitive images on the |
| dependency-sprintf-js-medium | medium | deployment | open | 6 | `package-lock.json` | `sprintf-js` (1.0.3) is vulnerable to CVE‑2026‑97058 – denial‑of‑service via unbounded precision specifiers, potentially crashing the app if malicious format strings are processed. |
| dependency-uuid-medium | medium | code | open | 6 | `package-lock.json` | `uuid` (7.0.3) has CVE‑2026‑41907 – out‑of‑bounds write vulnerability that can corrupt memory and affect data integrity. |
| backup-restore-path-traversal-medium | medium | code | open | 6 | `src/lib/backup.ts` | During restore, receipt photo data could be written to an attacker‑controlled `photoUri` path if the backup payload includes arbitrary URIs, potentially leading to path‑traversal or overwriting of files outside the app s |
| backup-restore-size-dos-medium | medium | code | open | 6 | `src/lib/backup.ts` | The backup restore process decrypts the entire payload before checking its size, which could be abused with an extremely large backup file to exhaust memory and crash the app. |
| backup-passphrase-bruteforce-medium | medium | code | open | 6 | `src/screens/BackupPassphraseScreen.tsx` | There is no rate‑limiting or delay on consecutive failed passphrase attempts during restore, allowing offline brute‑force attacks on the encrypted backup. |
| csv-export-injection-weak-escaping-mediu | medium | code | open | 6 | `src/lib/exportCsv.ts` | CSV injection mitigation only prefixes a single quote to fields that start with `=`, `+`, `-`, or `@`. This does not fully escape commas, newlines, or other special characters and may still produce malformed CSV that can |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** dependency-braces-high: The `braces` library (version 3.0.3) has CVE‑2026‑93687 – a denial‑of‑service via stack overflow from deeply nested patterns. The library is present in the lockfile and could be invoked by any code that uses glob/regex utilities. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade `braces` to a version where the vulnerability is patched (>=3.0.4) or replace its usage with a safe alternative. If the library is not used directly, remove it from dependencies.
- [ ] **high** dependency-node-forge-high: `node-forge` (1.4.0) contains CVE‑2026‑85393 – a signature‑forgery flaw in RSA PKCS#1 v1.5 verification, which could allow an attacker to craft forged signatures if the library is used for any cryptographic verification. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Replace `node-forge` with the already‑used `@noble/*` libraries for all cryptographic operations, or await an upstream fix and upgrade when available. Ensure no code path still imports `node-forge`.
- [ ] **medium** dependency-sprintf-js-medium: `sprintf-js` (1.0.3) is vulnerable to CVE‑2026‑97058 – denial‑of‑service via unbounded precision specifiers, potentially crashing the app if malicious format strings are processed. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Replace `sprintf-js` with native template literals or a safer formatting library, or upgrade to a fixed version if one becomes available.

## Residual risk in the code (accepted, open)

- **high** data-reset-photo-leak-high: The "Delete all data" flow deletes the encrypted KV store and the SecureStore encryption key but does not purge receipt photo files that are stored on the device’s file system, leaving potentially sensitive images on the device after a reset. Recommended fix: Extend `clearAllData` (or `clearAllData` in `src/lib/dataReset.ts`) to enumerate all stored `photoUri` values (e.g., via the receipt store) and delete the corresponding files using `expo-file-system` (`FileSystem.deleteAsync`) before completing the reset.
- **medium** dependency-uuid-medium: `uuid` (7.0.3) has CVE‑2026‑41907 – out‑of‑bounds write vulnerability that can corrupt memory and affect data integrity. Recommended fix: Upgrade `uuid` to a safe version (>=13.0.1, or 12.0.1/11.0.1) and run the test suite to confirm no breaking changes.
- **medium** backup-restore-path-traversal-medium: During restore, receipt photo data could be written to an attacker‑controlled `photoUri` path if the backup payload includes arbitrary URIs, potentially leading to path‑traversal or overwriting of files outside the app sandbox. Recommended fix: In `restoreBackup`, ignore any `photoUri` from the backup payload and always write restored images to a trusted app‑internal directory (e.g., `FileSystem.documentDirectory`). Validate that any target path is confined to this directory before writing.
- **medium** backup-restore-size-dos-medium: The backup restore process decrypts the entire payload before checking its size, which could be abused with an extremely large backup file to exhaust memory and crash the app. Recommended fix: Add a size check on the encrypted backup blob (e.g., reject blobs >10 MiB) before decryption, and enforce a maximum number of receipts/mileage entries in `validateBackupStructure`.
- **medium** backup-passphrase-bruteforce-medium: There is no rate‑limiting or delay on consecutive failed passphrase attempts during restore, allowing offline brute‑force attacks on the encrypted backup. Recommended fix: Implement a simple throttling mechanism (e.g., exponential back‑off after each failed restore attempt) and/or lock the restore UI for a short period after a configurable number of consecutive failures.
- **medium** csv-export-injection-weak-escaping-mediu: CSV injection mitigation only prefixes a single quote to fields that start with `=`, `+`, `-`, or `@`. This does not fully escape commas, newlines, or other special characters and may still produce malformed CSV that can be used for injection attacks in spreadsheet software. Recommended fix: Replace the custom prefix logic with a robust CSV generation library such as `csv-stringify` that properly escapes all fields according to RFC 4180, ensuring commas, quotes, and line‑breaks are handled safely.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
