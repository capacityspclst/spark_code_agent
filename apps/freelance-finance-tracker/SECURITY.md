# Security assurance: freelance-finance-tracker

Pipeline run `20261009-152837-ca6f`, 2026-10-09. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 5 round(s).

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
| high-deps-braces-2026-93687 | high | deployment | open | 1 | `package-lock.json` | The `braces` package (v3.0.3) has a CVE‑2026‑93687 vulnerability (Denial‑of‑Service via deeply nested regex patterns). The library is pulled in as a transitive dependency and is unpatched. |
| high-deps-node-forge-2026-85393 | high | deployment | open | 1 | `package-lock.json` | `node-forge` (v1.4.0) contains CVE‑2026‑85393 (RSA PKCS#1 v1.5 signature forgery). It is a transitive dependency (currently pulled in by `expo-crypto`). |
| high-csv-injection | high | code | open | 1 | `src/lib/exportCsv.ts` | CSV export builds rows by concatenating raw user fields (receipt notes, categories, etc.) without sanitising leading characters. This enables CSV/Formula injection when a spreadsheet program interprets cells that start w |
| high-pdf-html-injection | high | code | open | 1 | `src/lib/exportPdf.ts` | PDF export creates an HTML string by interpolating user‑provided data (receipt notes, categories, etc.) directly into the markup without HTML escaping. Malicious markup could lead to script execution in PDF viewers that  |
| medium-deps-sprintf-js-2026-97058 | medium | deployment | open | 1 | `package-lock.json` | `sprintf-js` (v1.0.3) is vulnerable to a Denial‑of‑Service via unbounded precision specifiers (CVE‑2026‑97058). It is pulled in transitively (e.g., via a logging or formatting library). |
| medium-backup-passphrase-policy | medium | code | open | 1 | `src/screens/BackupPassphraseScreen.tsx` | The backup UI accepts any non‑empty passphrase; there is no enforcement of minimum length or character‑class complexity, allowing weak passwords that make the encrypted backup trivially bruteforceable. |
| medium-web-key-storage | medium | code | open | 1 | `src/lib/storage/device.web.ts` | On the optional web fallback the encryption key is persisted in `localStorage`, which is accessible to any script running in the same origin and therefore not a secure store. |
| medium-temp-backup-file-deletion | medium | code | open | 1 | `src/lib/backup.ts` | After creating an encrypted backup, the temporary file used for `expo-sharing` is never deleted, leaving the encrypted blob (and potentially the plaintext temporary file) on the device’s file system. |
| medium-input-validation-numeric | medium | code | open | 1 | `src/screens/ReceiptEntryScreen.tsx` | Numeric inputs (amount, mileage, mileage rate, tax rate) lack comprehensive validation – negative numbers, excessively large values, or non‑numeric strings can be entered, potentially corrupting calculations or causing o |
| deployment-csp-header | medium | deployment | open | 1 | `public/index.html` | The web fallback does not include a Content‑Security‑Policy (CSP) header/meta tag, leaving it vulnerable to injection attacks if the app ever runs in a browser. |
| medium-image-size-validation-2026-00001 | medium | code | open | 2 | `src/lib/photoPicker.ts` | Receipt photo capture via expo-image-picker accepts arbitrarily large image files. A malicious user could take extremely high‑resolution photos, exhausting device storage and potentially causing the app to become unusabl |
| medium-key-persistence-after-data-delete | medium | code | open | 2 | `src/lib/dataReset.ts` | The "Delete all data" action clears the SQLite tables but does not delete the encryption key stored in expo‑secure‑store. If any encrypted remnants remain on disk, the retained key could be used to recover them. |
| medium-deps-uuid-2026-41907 | medium | code | fixed | 1 | `package-lock.json` | `uuid` (v7.0.3) suffers from an out‑of‑bounds write (CVE‑2026‑41907) that can corrupt memory and affect data integrity. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** high-deps-braces-2026-93687: The `braces` package (v3.0.3) has a CVE‑2026‑93687 vulnerability (Denial‑of‑Service via deeply nested regex patterns). The library is pulled in as a transitive dependency and is unpatched. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade `braces` to a version >= 3.0.4 where the issue is fixed, or remove the dependency if not required. Run `npm update braces` and verify that the lockfile reflects the patched version.
- [ ] **high** high-deps-node-forge-2026-85393: `node-forge` (v1.4.0) contains CVE‑2026‑85393 (RSA PKCS#1 v1.5 signature forgery). It is a transitive dependency (currently pulled in by `expo-crypto`). How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade `node-forge` to >= 1.5.0 if a patched release exists, or replace the usage of `expo-crypto`/`node-forge` with a modern, audited library such as the `@noble/*` suite that is already used elsewhere in the app.
- [ ] **medium** medium-deps-sprintf-js-2026-97058: `sprintf-js` (v1.0.3) is vulnerable to a Denial‑of‑Service via unbounded precision specifiers (CVE‑2026‑97058). It is pulled in transitively (e.g., via a logging or formatting library). How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Upgrade to a version >= 1.1.2 where the issue is resolved. If the library is not essential, consider removing it.
- [ ] **medium** deployment-csp-header: The web fallback does not include a Content‑Security‑Policy (CSP) header/meta tag, leaving it vulnerable to injection attacks if the app ever runs in a browser. How: Add a CSP meta tag (or configure the hosting server to send an HTTP CSP header) that restricts sources to `'self'` for scripts, styles, images, etc. Example: `<meta http-equiv="Content‑Security‑Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">`.

## Residual risk in the code (accepted, open)

- **high** high-csv-injection: CSV export builds rows by concatenating raw user fields (receipt notes, categories, etc.) without sanitising leading characters. This enables CSV/Formula injection when a spreadsheet program interprets cells that start with `=`, `+`, `-`, or `@` as formulas. Recommended fix: Implement a sanitisation routine that prefixes a single quote (`'`) to any field starting with `=`, `+`, `-`, or `@`, or wrap all fields in double quotes and escape internal quotes. Ensure every value is escaped before joining them into the CSV string.
- **high** high-pdf-html-injection: PDF export creates an HTML string by interpolating user‑provided data (receipt notes, categories, etc.) directly into the markup without HTML escaping. Malicious markup could lead to script execution in PDF viewers that render the HTML. Recommended fix: HTML‑escape all user‑controlled fields before inserting them into the PDF template. Use a robust escaping utility (e.g., `escape-html`) and consider a strict whitelist of allowed characters.
- **medium** medium-backup-passphrase-policy: The backup UI accepts any non‑empty passphrase; there is no enforcement of minimum length or character‑class complexity, allowing weak passwords that make the encrypted backup trivially bruteforceable. Recommended fix: Add UI validation that requires a passphrase of at least 8 characters and at least three of the four character classes (uppercase, lowercase, digits, symbols). Show a validation error if the policy isn’t met before enabling the backup creation button.
- **medium** medium-web-key-storage: On the optional web fallback the encryption key is persisted in `localStorage`, which is accessible to any script running in the same origin and therefore not a secure store. Recommended fix: Derive the encryption key from the user‑provided passphrase on each session (i.e., don’t persist the raw key), or store the key in IndexedDB with proper encryption. Remove any `localStorage.setItem` calls that store the raw key.
- **medium** medium-temp-backup-file-deletion: After creating an encrypted backup, the temporary file used for `expo-sharing` is never deleted, leaving the encrypted blob (and potentially the plaintext temporary file) on the device’s file system. Recommended fix: After a successful `shareAsync` call, invoke `FileSystem.deleteAsync(tmpPath, { idempotent: true })` to securely remove the temporary file. Consider overwriting the file before deletion for extra safety.
- **medium** medium-input-validation-numeric: Numeric inputs (amount, mileage, mileage rate, tax rate) lack comprehensive validation – negative numbers, excessively large values, or non‑numeric strings can be entered, potentially corrupting calculations or causing overflows. Recommended fix: Add client‑side validation that enforces: amount > 0, amount has at most 9 digits, miles ≥ 0, rates are positive decimals, and enforce a sensible upper bound (e.g., < 1 000 000). Display `HelperText` errors and disable the Save button until validation passes.
- **medium** medium-image-size-validation-2026-00001: Receipt photo capture via expo-image-picker accepts arbitrarily large image files. A malicious user could take extremely high‑resolution photos, exhausting device storage and potentially causing the app to become unusable. Recommended fix: Enforce a maximum image size or resolution when picking/taking a photo (e.g., set `quality` or `allowsEditing` options, check `FileSystem.getInfoAsync` for size, reject or down‑scale images above a safe threshold).
- **medium** medium-key-persistence-after-data-delete: The "Delete all data" action clears the SQLite tables but does not delete the encryption key stored in expo‑secure‑store. If any encrypted remnants remain on disk, the retained key could be used to recover them. Recommended fix: When performing a full data wipe, also delete the encryption key from SecureStore (e.g., `SecureStore.deleteItemAsync(KEY_NAME)`) and optionally overwrite the database file to prevent residual data recovery.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
