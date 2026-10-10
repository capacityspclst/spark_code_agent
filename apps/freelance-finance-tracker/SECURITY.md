# Security assurance: freelance-finance-tracker

Pipeline run `20261009-203036-96d9`, 2026-10-10. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was not approved after 11 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-09). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
| high-deps-braces-2026-93687 | high | deployment | open | 4 | `package-lock.json` | `braces` v3.0.3 is vulnerable to a DoS via deeply nested regex patterns (CVE‑2026‑93687) and has no patched version yet. |
| high-deps-node-forge-2026-85393 | high | deployment | open | 4 | `package-lock.json` | `node-forge` v1.4.0 contains a signature‑forgery vulnerability in RSA PKCS#1 v1.5 verification (CVE‑2026‑85393) and is a transitive dependency of `expo-crypto`. |
| medium-backup-passphrase-policy | medium | code | open | 4 | `src/screens/BackupPassphraseScreen.tsx` | The backup UI accepts any non‑empty passphrase; there is no enforcement of length or character‑class complexity, making the encrypted backup vulnerable to brute‑force attacks. |
| medium-web-key-storage | medium | code | open | 4 | `src/lib/storage/device.web.ts` | On the optional web fallback the encryption key is persisted in `localStorage`, which is accessible to any script in the same origin and therefore not a secure vault. |
| medium-temp-backup-file-deletion | medium | code | open | 4 | `src/lib/backup.ts` | After creating an encrypted backup, the temporary file used for `expo-sharing` is never removed, leaving the encrypted blob (and possibly a plaintext temporary file) on the device filesystem. |
| medium-input-validation-numeric | medium | code | open | 4 | `src/screens/ReceiptEntryScreen.tsx` | Numeric inputs (amount, mileage, mileage rate, tax rate) permit negative numbers, non‑numeric strings, or excessively large values, which can corrupt calculations or cause overflow errors. |
| deployment-csp-header | medium | deployment | open | 4 | `public/index.html` | The optional web build does not send a Content‑Security‑Policy header or meta tag, leaving the fallback vulnerable to injection attacks if ever served on the web. |
| medium-image-size-validation-2026-00001 | medium | code | open | 4 | `src/lib/photoPicker.ts` | Photo picker allows arbitrarily large images; a malicious user could capture extremely high‑resolution photos that exhaust device storage and cause the app to become unusable. |
| medium-key-persistence-after-data-delete | medium | code | open | 4 | `src/lib/dataReset.ts` | "Delete all data" clears the SQLite tables but leaves the encryption key stored in `expo-secure-store`. If any encrypted remnants remain, the retained key could be used to recover them. |
| medium-deps-sprintf-js-2026-97058 | medium | deployment | open | 4 | `package-lock.json` | `sprintf-js` v1.0.3 is vulnerable to DoS via unbounded precision specifiers (CVE‑2026‑97058). It is pulled in transitively. |
| medium-record-count-limit | medium | code | open | 11 | `src/lib/storage/store.ts` | The app imposes no practical limit on the number of receipt or mileage records a user can create. An adversarial user could fill the device storage with thousands of entries, causing the app to become unusable or crash ( |
| medium-export-throttling | medium | code | open | 11 | `src/lib/exportCsv.ts` | CSV and PDF export functions can be invoked repeatedly without any rate‑limiting or queuing. Rapid repeated taps could spawn many async export jobs, consuming CPU, memory, and temporary storage, effectively a denial‑of‑s |
| high-csv-injection | high | code | fixed | 4 | `src/lib/exportCsv.ts` | CSV export concatenates raw user fields (e.g., receipt notes, categories) directly into the CSV without escaping leading characters or quoting fields. This enables CSV/Formula injection when a field starts with =, +, - o |
| high-pdf-html-injection | high | code | fixed | 4 | `src/lib/exportPdf.ts` | The PDF export generates an HTML string by interpolating user‑provided data (receipt notes, categories, etc.) directly into the markup without HTML‑escaping. PDF viewers that render the HTML can execute injected scripts  |
| medium-deps-uuid-2026-41907 | medium | code | fixed | 4 | `package-lock.json` | `uuid` v7.0.3 suffers from an out‑of‑bounds write (CVE‑2026‑41907) that can corrupt memory. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** high-deps-braces-2026-93687: `braces` v3.0.3 is vulnerable to a DoS via deeply nested regex patterns (CVE‑2026‑93687) and has no patched version yet. How: Monitor for an updated release; when available, upgrade to >= 3.0.4. If `braces` is only a build‑time dependency, consider removing it or replacing the dependent library with one that does not pull in `braces`.
- [ ] **high** high-deps-node-forge-2026-85393: `node-forge` v1.4.0 contains a signature‑forgery vulnerability in RSA PKCS#1 v1.5 verification (CVE‑2026‑85393) and is a transitive dependency of `expo-crypto`. How: Track an upstream fix (≥ 1.5.0) or replace `expo-crypto`/`node-forge` with a modern audited library such as `@noble/*` (already used for backup encryption). Ensure the replacement provides the needed cryptographic primitives.
- [ ] **medium** deployment-csp-header: The optional web build does not send a Content‑Security‑Policy header or meta tag, leaving the fallback vulnerable to injection attacks if ever served on the web. How: Configure the hosting platform to send a CSP header or add a meta tag in `public/index.html`, e.g.: `<meta http‑equiv="Content‑Security‑Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">`.
- [ ] **medium** medium-deps-sprintf-js-2026-97058: `sprintf-js` v1.0.3 is vulnerable to DoS via unbounded precision specifiers (CVE‑2026‑97058). It is pulled in transitively. How: Upgrade to >= 1.1.2 when released, or remove the dependency if it is not required.

## Residual risk in the code (accepted, open)

- **medium** medium-backup-passphrase-policy: The backup UI accepts any non‑empty passphrase; there is no enforcement of length or character‑class complexity, making the encrypted backup vulnerable to brute‑force attacks. Recommended fix: Add validation that requires a passphrase of at least 8 characters and at least three of the four character classes (uppercase, lowercase, digits, symbols). Disable the "Create backup" button until the policy is satisfied and show a clear validation error.
- **medium** medium-web-key-storage: On the optional web fallback the encryption key is persisted in `localStorage`, which is accessible to any script in the same origin and therefore not a secure vault. Recommended fix: Remove the `localStorage` persistence of the raw key. Derive the encryption key from the user‑provided passphrase each session (or store it encrypted in IndexedDB). Ensure no plain‑text key ever ends up in `localStorage`.
- **medium** medium-temp-backup-file-deletion: After creating an encrypted backup, the temporary file used for `expo-sharing` is never removed, leaving the encrypted blob (and possibly a plaintext temporary file) on the device filesystem. Recommended fix: After a successful `shareAsync` call, invoke `FileSystem.deleteAsync(tmpPath, { idempotent: true })`. Optionally overwrite the file before deletion for extra safety.
- **medium** medium-input-validation-numeric: Numeric inputs (amount, mileage, mileage rate, tax rate) permit negative numbers, non‑numeric strings, or excessively large values, which can corrupt calculations or cause overflow errors. Recommended fix: Add client‑side validation: amount must be > 0 and limited to, e.g., 9 digits with two decimal places; mileage ≥ 0; rates > 0; enforce an upper bound (e.g., < 1 000 000). Show `HelperText` errors and disable the Save button until validation passes.
- **medium** medium-image-size-validation-2026-00001: Photo picker allows arbitrarily large images; a malicious user could capture extremely high‑resolution photos that exhaust device storage and cause the app to become unusable. Recommended fix: Limit the image size/quality when invoking `ImagePicker.launchCameraAsync`/`launchImageLibraryAsync` (set `quality`, `allowsEditing`, or `maxWidth`/`maxHeight`). After selection, check the file size via `FileSystem.getInfoAsync` and reject or downscale images exceeding a safe threshold (e.g., 5 MB).
- **medium** medium-key-persistence-after-data-delete: "Delete all data" clears the SQLite tables but leaves the encryption key stored in `expo-secure-store`. If any encrypted remnants remain, the retained key could be used to recover them. Recommended fix: When wiping data, also delete the encryption key from SecureStore (`SecureStore.deleteItemAsync(KEY_NAME)`). Optionally overwrite the database file before deletion.
- **medium** medium-record-count-limit: The app imposes no practical limit on the number of receipt or mileage records a user can create. An adversarial user could fill the device storage with thousands of entries, causing the app to become unusable or crash (resource exhaustion). Recommended fix: Introduce configurable caps (e.g., max 10,000 receipts, max 5,000 mileage entries) and enforce them in the add‑record functions. Show a user‑friendly error when the limit is reached and provide a UI to archive or delete older records.
- **medium** medium-export-throttling: CSV and PDF export functions can be invoked repeatedly without any rate‑limiting or queuing. Rapid repeated taps could spawn many async export jobs, consuming CPU, memory, and temporary storage, effectively a denial‑of‑service. Recommended fix: Add a debounce/throttle wrapper around the export actions (e.g., disable the Export buttons while an export is in progress and enforce a minimum interval, such as one export per 5 seconds). Optionally queue subsequent requests and provide user feedback if the limit is reached.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
