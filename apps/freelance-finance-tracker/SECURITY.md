# Security assurance: freelance-finance-tracker

Pipeline run `20261027-132403-7f5b`, 2026-10-27. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was approved after 4 round(s).

## What was checked

- **Semgrep** (unknown, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-27). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
- **Suppression check.** `nosemgrep`, `trivy:ignore` and scanner ignore files are rejected.
- **Security review** by an AI reviewer each round once tests and scanners passed, against a fixed severity rubric, tracking every finding to fixed or open.
- **Isolation.** All generated code, tests and scanners ran in a sandbox container with no secrets.

Blocking rules: any secret; high/critical dependency vulnerabilities with a fix available; high/critical misconfigurations; Semgrep errors; critical/high review findings.

## Scanner results (final round)

- scanner suppressions: **pass**
- semgrep: **warnings**
  - `semgrep did not produce a report:`
  - `FileNotFoundError: [Errno 2] No such file or directory: '/home/johnplatais/llm-stack/openclaw/workspace/agent-pipeline/tools/semgrep/bin/semgrep'`
- trivy secrets: **pass**
- trivy dependency vulnerabilities (high/critical, fixable): **pass**
- trivy misconfigurations (high/critical): **pass**
- trivy dependency vulnerabilities (other): **warnings**
  - `package-lock.json: node-forge 1.4.0 CVE-2026-85393 HIGH (no fix yet): node-forge: node-forge: Signature forgery vulnerability in RSA PKCS#1 v1.5 verification`
  - `package-lock.json: zod 3.25.76 CVE-2023-54404 HIGH fixed in 4.6.6: zod: zod: Denial of service via unbounded array validation [no fixed release fits its users (@expo/cli wants ^3.25.76); not fixable f`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| dependency-node-forge-sigforge-vuln | high | deployment | open | 4 | `package-lock.json` | node‑forge 1.4.0 contains CVE‑2026‑85393 (signature forgery in RSA PKCS#1 v1.5 verification); no fixed release exists. |
| backup-restore-path-traversal | medium | code | open | 4 | `src/lib/backup.ts` | restoreBackup writes files using the photoUri values stored in the backup payload, allowing an attacker‑controlled path to be written outside the app’s sandbox (path‑traversal). |
| backup-restore-size-dos | medium | code | open | 4 | `src/lib/backup.ts` | No size checks on the encrypted backup blob or on the number of receipts/mileage entries, enabling a maliciously large backup to exhaust memory or CPU during restore. |
| backup-passphrase-bruteforce | medium | code | open | 4 | `src/lib/backup.ts` | restoreBackup allows unlimited incorrect passphrase attempts, permitting offline brute‑force attacks on the backup encryption key. |
| csv-injection | medium | code | open | 4 | `src/lib/exportCsv.ts` | CSV export concatenates user‑provided fields without proper escaping, allowing CSV injection (e.g., formulas like =cmd\|…) when the file is opened in spreadsheet software. |
| data-reset-photo-leak | high | code | fixed | 4 | `src/lib/dataReset.ts` | clearAllData removes encrypted records but does not delete photo files referenced by receipt.photoUri, leaving images on the device after a data reset and exposing user‑private data. |
| dependency-braces-dos | high | code | dismissed | 4 | `package-lock.json` | braces 3.0.3 is vulnerable to CVE‑2026‑93687 (Denial‑of‑Service via deeply nested glob patterns); no fix is currently available. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** dependency-node-forge-sigforge-vuln: node‑forge 1.4.0 contains CVE‑2026‑85393 (signature forgery in RSA PKCS#1 v1.5 verification); no fixed release exists. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Replace node‑forge with a maintained crypto library (e.g., noble‑ciphers) for any RSA/PKCS#1 operations, or wait for a patched version and update the dependency accordingly.

## Residual risk in the code (accepted, open)

- **medium** backup-restore-path-traversal: restoreBackup writes files using the photoUri values stored in the backup payload, allowing an attacker‑controlled path to be written outside the app’s sandbox (path‑traversal). Recommended fix: Ignore any photoUri in the backup data; when restoring images, always write to a trusted internal directory (FileSystem.documentDirectory) and verify the resolved path stays within that directory.
- **medium** backup-restore-size-dos: No size checks on the encrypted backup blob or on the number of receipts/mileage entries, enabling a maliciously large backup to exhaust memory or CPU during restore. Recommended fix: Reject encrypted backup blobs larger than 10 MiB before decryption and enforce sensible caps (e.g., ≤10 000 receipts and ≤5 000 mileage entries) in validateBackupStructure.
- **medium** backup-passphrase-bruteforce: restoreBackup allows unlimited incorrect passphrase attempts, permitting offline brute‑force attacks on the backup encryption key. Recommended fix: Implement exponential back‑off after each failed attempt (1 s, 2 s, 4 s, …) and lock the restore UI after five consecutive failures; store the failure count in memory and reset on app restart.
- **medium** csv-injection: CSV export concatenates user‑provided fields without proper escaping, allowing CSV injection (e.g., formulas like =cmd|…) when the file is opened in spreadsheet software. Recommended fix: Replace the manual string building with a robust CSV library such as csv‑stringify, ensuring commas, quotes, newlines and leading characters are escaped according to RFC 4180.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
