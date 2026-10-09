# Security assurance: freelance-finance-tracker

Pipeline run `20261008-144633-e203`, 2026-10-09. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was not approved after 19 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-08). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
| dependency-node-forge-high | high | deployment | open | 4 | `package.json` | node‑forge 1.4.0 (transitively pulled in) is vulnerable to CVE‑2026‑85393 – a signature forgery vulnerability in RSA PKCS#1 v1.5 verification. If any code in the app (or a future feature) uses RSA signatures, an attacker |
| dependency-braces-high | high | deployment | open | 4 | `package.json` | braces 3.0.3 has CVE‑2026‑93687 – denial‑of‑service via stack overflow caused by deeply nested patterns. The library is not used directly but is present in the dependency tree. |
| dependency-sprintf-js-medium | medium | deployment | open | 4 | `package.json` | sprintf‑js 1.0.3 is vulnerable to CVE‑2026‑97058 – denial‑of‑service via unbounded precision specifiers. Although not used directly, it appears in the lockfile. |
| dependency-uuid-medium | medium | code | open | 4 | `package.json` | uuid 7.0.3 contains an out‑of‑bounds write vulnerability (CVE‑2026‑41907). It is used for generating IDs for receipts/mileage entries. |
| insecure-web-key-storage-medium | medium | code | open | 4 | `src/lib/storage/device.web.ts` | The web fallback stores the 256‑bit encryption key and encrypted payloads in plain localStorage. This defeats the at‑rest encryption model for any web deployment and allows an attacker with access to the browser storage  |
| receipt-input-validation-medium | medium | code | open | 4 | `src/screens/ReceiptEntryScreen.tsx` | Numeric fields such as amount are not validated for type, range, or NaN/Infinity values. Users could enter negative, extremely large, or non‑numeric values causing incorrect totals, crashes, or potential DoS. |
| mileage-input-validation-medium | medium | code | open | 4 | `src/screens/MileageEntryScreen.tsx` | Mileage miles and rate are stored without validation. Malformed values (negative miles, non‑numeric strings) can corrupt mileage deduction calculations. |
| csv-export-injection-medium | medium | code | open | 7 | `src/lib/exportCsv.ts` | CSV export concatenates user‑provided fields (e.g., receipt notes, categories, purpose) directly into the CSV without escaping. When opened in spreadsheet software this can trigger CSV‑injection attacks (e.g., formula in |
| backup-passphrase-validation-low | low | code | open | 4 | `src/screens/BackupScreen.tsx` | The UI hints at a minimum 8‑character passphrase but enforcement is not guaranteed; weak passphrases make backup encryption vulnerable to brute‑force attacks. |
| missing-csp-header-low | low | deployment | open | 4 | `app.json (or web server config)` | The web build does not set a Content‑Security‑Policy header. While the app is a client‑side SPA, lacking CSP can allow injected scripts (e.g., from the PDF export issue) to run if any DOM XSS is introduced later. |
| static-backup-file-leak-low | low | code | open | 13 | `src/lib/backup.ts` | Backup files are written to a static path (cacheDirectory/backup.bak) and are not deleted after the user shares them, leaving an encrypted backup file on the device that could be accessed by other apps or a malicious act |
| pdf-export-xss-high | high | code | fixed | 4 | `src/lib/exportPdf.ts` | PDF export builds raw HTML strings that interpolate user‑provided text (receipt notes, categories, purpose, etc.) without escaping. When rendered by expo‑print, malicious HTML/JavaScript can be embedded in the generated  |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** dependency-node-forge-high: node‑forge 1.4.0 (transitively pulled in) is vulnerable to CVE‑2026‑85393 – a signature forgery vulnerability in RSA PKCS#1 v1.5 verification. If any code in the app (or a future feature) uses RSA signatures, an attacker could forge them. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade node‑forge to a version where the vulnerability is patched (>=1.5.0) or remove the dependency entirely if not needed.
- [ ] **high** dependency-braces-high: braces 3.0.3 has CVE‑2026‑93687 – denial‑of‑service via stack overflow caused by deeply nested patterns. The library is not used directly but is present in the dependency tree. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade braces to a non‑vulnerable version (>=3.0.4 or later) or prune it from the dependency tree if not required.
- [ ] **medium** dependency-sprintf-js-medium: sprintf‑js 1.0.3 is vulnerable to CVE‑2026‑97058 – denial‑of‑service via unbounded precision specifiers. Although not used directly, it appears in the lockfile. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade sprintf‑js to a fixed version (>=1.1.2) or replace its usage with a safer formatting library.
- [ ] **low** missing-csp-header-low: The web build does not set a Content‑Security‑Policy header. While the app is a client‑side SPA, lacking CSP can allow injected scripts (e.g., from the PDF export issue) to run if any DOM XSS is introduced later. How: Configure the web server or static host to serve a CSP header that restricts script sources to self and disallows unsafe‑inline code. For Expo web builds, add a meta CSP tag in index.html as a fallback.

## Residual risk in the code (accepted, open)

- **medium** dependency-uuid-medium: uuid 7.0.3 contains an out‑of‑bounds write vulnerability (CVE‑2026‑41907). It is used for generating IDs for receipts/mileage entries. Recommended fix: Upgrade uuid to a safe release (>=13.0.1) which includes the fix, or switch to a different UUID generator.
- **medium** insecure-web-key-storage-medium: The web fallback stores the 256‑bit encryption key and encrypted payloads in plain localStorage. This defeats the at‑rest encryption model for any web deployment and allows an attacker with access to the browser storage to decrypt all user data. Recommended fix: Either disable the web build for production or replace the fallback with a proper client‑side key derivation flow (e.g., ask the user for a passphrase and never persist the raw key). If a web version is required, store the key only in memory and protect it with a user‑provided secret.
- **medium** receipt-input-validation-medium: Numeric fields such as amount are not validated for type, range, or NaN/Infinity values. Users could enter negative, extremely large, or non‑numeric values causing incorrect totals, crashes, or potential DoS. Recommended fix: Add client‑side validation: enforce amount > 0, parseable as a finite number, limit max digits. Show error helper text on invalid input.
- **medium** mileage-input-validation-medium: Mileage miles and rate are stored without validation. Malformed values (negative miles, non‑numeric strings) can corrupt mileage deduction calculations. Recommended fix: Validate that miles and rate are non‑negative numbers within reasonable bounds before persisting.
- **medium** csv-export-injection-medium: CSV export concatenates user‑provided fields (e.g., receipt notes, categories, purpose) directly into the CSV without escaping. When opened in spreadsheet software this can trigger CSV‑injection attacks (e.g., formula injection) that may execute commands on the viewer’s machine. Recommended fix: Sanitize all CSV fields before writing: escape leading '=', '+', '-', '@' characters, wrap each value in double quotes, double‑escape any internal quotes, and optionally limit characters to a safe whitelist. Use a CSV library that handles escaping securely.
- **low** backup-passphrase-validation-low: The UI hints at a minimum 8‑character passphrase but enforcement is not guaranteed; weak passphrases make backup encryption vulnerable to brute‑force attacks. Recommended fix: Implement explicit validation: require a minimum length (e.g., ≥8 characters) and optionally strength checks (mix of character classes) before allowing backup creation.
- **low** static-backup-file-leak-low: Backup files are written to a static path (cacheDirectory/backup.bak) and are not deleted after the user shares them, leaving an encrypted backup file on the device that could be accessed by other apps or a malicious actor with device access. Recommended fix: Generate a unique temporary filename for each backup and delete the file after the share operation (e.g., using FileSystem.deleteAsync).

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
