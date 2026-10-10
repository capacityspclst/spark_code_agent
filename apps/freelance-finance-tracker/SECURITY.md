# Security assurance: freelance-finance-tracker

Pipeline run `20261010-085526-84a3`, 2026-10-10. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was approved after 8 round(s).

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
| high-deps-braces-2026-93687 | high | deployment | open | 2 | `package-lock.json` | `braces` v3.0.3 is vulnerable to a DoS via deeply nested regex patterns (CVE‑2026‑93687) and has no patched version yet. |
| high-deps-node-forge-2026-85393 | high | deployment | open | 2 | `package-lock.json` | `node-forge` v1.4.0 contains a signature‑forgery vulnerability in RSA PKCS#1 v1.5 verification (CVE‑2026‑85393) and is pulled in transitively via `expo-crypto`. |
| medium-backup-passphrase-policy | medium | code | open | 2 | `src/screens/BackupPassphraseScreen.tsx` | The backup UI accepts any non‑empty passphrase; there is no enforcement of minimum length or character‑class complexity, making encrypted backups vulnerable to brute‑force attacks. |
| medium-web-key-storage | medium | code | open | 2 | `src/lib/storage/device.web.ts` | On the optional web fallback the encryption key is persisted in `localStorage`, which is readable by any script on the same origin and not a secure vault. |
| medium-temp-backup-file-deletion | medium | code | open | 2 | `src/lib/backup.ts` | After creating an encrypted backup, the temporary file used for `expo-sharing` is never removed, leaving the encrypted blob (and possibly a plaintext temporary file) on the device filesystem. |
| medium-input-validation-numeric | medium | code | open | 2 | `src/screens/ReceiptEntryScreen.tsx` | Numeric inputs (amount, mileage, mileage rate, tax rate) permit negative numbers, non‑numeric strings, or excessively large values, which can corrupt calculations or cause overflow errors. |
| deployment-csp-header | medium | deployment | open | 2 | `public/index.html` | The optional web build does not send a Content‑Security‑Policy header or meta tag, leaving the fallback vulnerable to injection attacks if ever served on the web. |
| medium-image-size-validation-2026-00001 | medium | code | open | 2 | `src/lib/photoPicker.ts` | Photo picker allows arbitrarily large images; a malicious user could capture extremely high‑resolution photos that exhaust device storage and cause the app to become unusable. |
| medium-key-persistence-after-data-delete | medium | code | open | 2 | `src/lib/dataReset.ts` | "Delete all data" clears the SQLite tables but leaves the encryption key stored in `expo-secure-store`. Persisted keys could be used to recover any leftover encrypted remnants. |
| medium-deps-sprintf-js-2026-97058 | medium | deployment | open | 2 | `package-lock.json` | `sprintf-js` v1.0.3 is vulnerable to DoS via unbounded precision specifiers (CVE‑2026‑97058) and is pulled in transitively. |
| medium-record-count-limit | medium | code | open | 2 | `src/lib/storage/store.ts` | The app imposes no practical limit on the number of receipt or mileage records, allowing a malicious user to fill device storage with thousands of entries, causing crashes or denial‑of‑service. |
| medium-export-throttling | medium | code | open | 2 | `src/lib/exportCsv.ts` | CSV and PDF export functions can be invoked repeatedly without rate‑limiting, allowing rapid taps to spawn many async export jobs that consume CPU, memory, and temporary storage, effectively a denial‑of‑service. |
| memory-exhaustion-backup-export | medium | code | open | 6 | `src/lib/backup.ts` | Backup creation serialises the entire data set into a JSON string, encrypts it and then Base64‑encodes the result. For large numbers of records this can consume excessive RAM, potentially crashing the app (resource exhau |
| memory-exhaustion-csv-export | medium | code | open | 6 | `src/lib/exportCsv.ts` | CSV export builds the whole file as an in‑memory string before sharing. When a user has many receipt/mileage records this can exhaust device memory and make the app unresponsive. |
| backup-unsafe-deserialization | medium | code | open | 7 | `src/lib/backup.ts` | Backup restore parses the decrypted JSON blob with JSON.parse and directly writes the data into the encrypted store without schema validation. A maliciously crafted (but correctly encrypted) backup could inject malformed |
| app-lock-resume-bypass | high | code | fixed | 1 | `src/App.tsx` | The optional biometric/app‑lock is only evaluated once when the app first becomes ready. If the user backgrounds the app and later returns, the lock is not re‑checked, allowing any person with physical access to the devi |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** high-deps-braces-2026-93687: `braces` v3.0.3 is vulnerable to a DoS via deeply nested regex patterns (CVE‑2026‑93687) and has no patched version yet. How: Monitor the `braces` project for a patched release (>=3.0.4) and upgrade when available. If `braces` is only a build‑time dependency, consider removing it or replacing the dependent library with one that does not pull in `braces`.
- [ ] **high** high-deps-node-forge-2026-85393: `node-forge` v1.4.0 contains a signature‑forgery vulnerability in RSA PKCS#1 v1.5 verification (CVE‑2026‑85393) and is pulled in transitively via `expo-crypto`. How: Track an upstream fix (>=1.5.0) and upgrade when released, or replace `expo-crypto`/`node‑forge` with modern audited libraries such as `@noble/*` which are already used for backup encryption.
- [ ] **medium** deployment-csp-header: The optional web build does not send a Content‑Security‑Policy header or meta tag, leaving the fallback vulnerable to injection attacks if ever served on the web. How: Configure the hosting platform to send a CSP header (e.g., `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`) or add a meta tag in `public/index.html` with the same policy.
- [ ] **medium** medium-deps-sprintf-js-2026-97058: `sprintf-js` v1.0.3 is vulnerable to DoS via unbounded precision specifiers (CVE‑2026‑97058) and is pulled in transitively. How: Upgrade to `sprintf-js` >= 1.1.2 when available, or remove the dependency if it is not required by the app.

## Residual risk in the code (accepted, open)

- **medium** medium-backup-passphrase-policy: The backup UI accepts any non‑empty passphrase; there is no enforcement of minimum length or character‑class complexity, making encrypted backups vulnerable to brute‑force attacks. Recommended fix: Add client‑side validation requiring ≥8 characters and at least three of four character classes (upper, lower, digit, symbol). Disable the "Create backup" button until the policy is satisfied and show clear validation errors.
- **medium** medium-web-key-storage: On the optional web fallback the encryption key is persisted in `localStorage`, which is readable by any script on the same origin and not a secure vault. Recommended fix: Remove raw key persistence from `localStorage`. Derive the encryption key from the user‑provided passphrase each session (or store it encrypted in IndexedDB). Ensure no plain‑text key ever ends up in persistent web storage.
- **medium** medium-temp-backup-file-deletion: After creating an encrypted backup, the temporary file used for `expo-sharing` is never removed, leaving the encrypted blob (and possibly a plaintext temporary file) on the device filesystem. Recommended fix: After a successful `shareAsync` call, invoke `FileSystem.deleteAsync(tmpPath, { idempotent: true })`. Optionally overwrite the file before deletion for extra safety.
- **medium** medium-input-validation-numeric: Numeric inputs (amount, mileage, mileage rate, tax rate) permit negative numbers, non‑numeric strings, or excessively large values, which can corrupt calculations or cause overflow errors. Recommended fix: Add client‑side validation: amount > 0 and limited to ≤9 digits with two decimal places; mileage ≥ 0 and ≤1 000 000; rates > 0 and ≤1 000 000. Show `HelperText` errors and disable the Save button until validation passes.
- **medium** medium-image-size-validation-2026-00001: Photo picker allows arbitrarily large images; a malicious user could capture extremely high‑resolution photos that exhaust device storage and cause the app to become unusable. Recommended fix: Limit image selection by setting `quality`, `maxWidth`, and `maxHeight` in the ImagePicker options. After selection, use `FileSystem.getInfoAsync` to check file size and reject or downscale images larger than a safe threshold (e.g., 5 MB).
- **medium** medium-key-persistence-after-data-delete: "Delete all data" clears the SQLite tables but leaves the encryption key stored in `expo-secure-store`. Persisted keys could be used to recover any leftover encrypted remnants. Recommended fix: When wiping all data, also delete the encryption key from SecureStore (`SecureStore.deleteItemAsync(KEY_NAME)`). Optionally overwrite the database file before deletion.
- **medium** medium-record-count-limit: The app imposes no practical limit on the number of receipt or mileage records, allowing a malicious user to fill device storage with thousands of entries, causing crashes or denial‑of‑service. Recommended fix: Introduce configurable caps (e.g., max 10 000 receipts, max 5 000 mileage entries) and enforce them in the add‑record functions. Show a user‑friendly "limit reached" UI and provide options to archive or delete older records.
- **medium** medium-export-throttling: CSV and PDF export functions can be invoked repeatedly without rate‑limiting, allowing rapid taps to spawn many async export jobs that consume CPU, memory, and temporary storage, effectively a denial‑of‑service. Recommended fix: Disable Export buttons while an export is in progress and enforce a minimum interval (e.g., one export per 5 seconds). Implement a debounce/throttle wrapper around the export actions and provide user feedback if a request is throttled.
- **medium** memory-exhaustion-backup-export: Backup creation serialises the entire data set into a JSON string, encrypts it and then Base64‑encodes the result. For large numbers of records this can consume excessive RAM, potentially crashing the app (resource exhaustion). Recommended fix: Implement streaming serialisation/encryption (write to a temporary file incrementally), enforce a sensible size limit for backups, or process the data in chunks rather than loading everything into memory.
- **medium** memory-exhaustion-csv-export: CSV export builds the whole file as an in‑memory string before sharing. When a user has many receipt/mileage records this can exhaust device memory and make the app unresponsive. Recommended fix: Stream rows to a file or use a generator to write the CSV incrementally, and optionally warn the user or impose a record‑count limit before exporting.
- **medium** backup-unsafe-deserialization: Backup restore parses the decrypted JSON blob with JSON.parse and directly writes the data into the encrypted store without schema validation. A maliciously crafted (but correctly encrypted) backup could inject malformed records, unexpected fields, or prototype‑polluted objects, potentially causing crashes, data corruption, or logic errors. Recommended fix: Validate the shape of the decrypted JSON against a strict schema (e.g., using a library like Zod or Joi) before inserting any data into the store. Ensure only known collections and fields are accepted, and reject objects containing prototype‑polluting keys (e.g., `__proto__`).

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
