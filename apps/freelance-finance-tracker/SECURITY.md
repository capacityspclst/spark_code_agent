# Security assurance: freelance-finance-tracker

Pipeline run `20261007-072131-d056`, 2026-10-07. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 12 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-07). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
  - `expo-app/package-lock.json: sprintf-js 1.1.3 CVE-2026-97058 MEDIUM (no fix yet): sprintf-js: sprintf-js: Denial of Service via unbounded precision specifiers`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| web-jwt-storage-insecure | high | code | open | 11 | `expo-app/src/auth.ts` | When running in a web environment the JWT token is persisted in localStorage. localStorage is accessible to any JavaScript on the page, making the token trivially stealable via XSS, leading to account compromise. |
| dependency-decode-uri-component | medium | code | open | 2 | `expo-app/package-lock.json` | The `decode-uri-component` package version 0.2.2 is vulnerable to a Denial‑of‑Service via crafted input (CVE‑2026‑45822). |
| dependency-uuid | medium | code | open | 2 | `expo-app/package-lock.json` | `uuid` version 7.0.3 has an out‑of‑bounds write vulnerability (CVE‑2026‑41907). |
| dependency-sprintf-js | medium | deployment | open | 2 | `expo-app/package-lock.json` | `sprintf-js` version 1.0.3 is vulnerable to Denial‑of‑Service via unbounded precision specifiers (CVE‑2026‑97058) and has no current fix. |
| unbounded-notes-field | medium | code | open | 4 | `backend/app/schemas.py` | The optional `notes` fields in ReceiptCreate, ReceiptRead, MileageCreate, and MileageRead have no length constraints, permitting arbitrarily large payloads that could exhaust memory or storage. |
| unpaginated-list-endpoints | medium | code | open | 4 | `backend/app/main.py` | The `/receipts` and `/mileage` endpoints return the full list of records for a user without pagination, which can cause high memory usage and slow responses for large datasets. |
| csv-export-memory | medium | code | open | 4 | `backend/app/main.py` | The CSV export endpoint builds the entire CSV string in memory before streaming it, leading to potential memory exhaustion for users with many receipts/mileage entries. |
| pdf-export-memory | medium | code | open | 4 | `backend/app/main.py` | The PDF export endpoint creates the complete PDF in an in‑memory `BytesIO` buffer before sending it, which can exhaust memory for large numbers of records. |
| dependency-decode-uri-component-2 | medium | code | open | 5 | `expo-app/package-lock.json` | Version 0.2.2 of `decode-uri-component` is vulnerable to DoS via crafted input (CVE‑2026‑45822). |
| dependency-uuid-2 | medium | code | open | 5 | `expo-app/package-lock.json` | `uuid` 7.0.3 has an out‑of‑bounds write vulnerability (CVE‑2026‑41907). |
| dependency-sprintf-js-2 | medium | deployment | open | 5 | `expo-app/package-lock.json` | `sprintf-js` 1.0.3 can cause DoS via unbounded precision specifiers (CVE‑2026‑97058) and has no current fix. |
| unbounded-notes-field-2 | medium | code | open | 5 | `backend/app/schemas.py` | `notes` fields for receipts and mileage entries have no length limits, permitting arbitrarily large payloads that could exhaust memory or storage. |
| unpaginated-list-endpoints-2 | medium | code | open | 5 | `backend/app/main.py` | `/receipts` and `/mileage` return the complete list of a user's records without pagination, risking high memory usage and slow responses for large datasets. |
| csv-export-memory-2 | medium | code | open | 5 | `backend/app/main.py` | CSV export builds the whole CSV string in a `StringIO` buffer before streaming, which can exhaust memory for users with many records. |
| pdf-export-memory-2 | medium | code | open | 5 | `backend/app/main.py` | PDF export creates the complete PDF in an in‑memory `BytesIO` buffer before returning, leading to possible memory exhaustion with many records. |
| missing-request-size-limit | medium | code | open | 7 | `backend/app/main.py` | The multipart/form‑data and JSON endpoints (e.g., /receipts, /mileage, login, signup) do not enforce a maximum request body size. An attacker could send arbitrarily large payloads (e.g., huge JSON strings in notes or cat |
| unlimited-user-storage | medium | code | open | 7 | `backend/app/models.py` | There is no quota on the number or total size of receipt images or mileage records a user may create. A malicious or compromised account could exhaust server disk space, leading to service degradation or failure. |
| signup-email-enumeration | low | code | open | 4 | `backend/app/main.py` | The /auth/signup endpoint returns a distinct "Email already registered" error, allowing attackers to confirm whether an email address is registered. |
| signup-email-enumeration-2 | low | code | open | 5 | `backend/app/main.py` | The `/auth/signup` endpoint returns a distinct "Email already registered" error, allowing attackers to confirm registered accounts. |
| unbounded-category-field | low | code | open | 5 | `backend/app/schemas.py` | `category` field for receipts is unlimited in length, which could be abused to consume resources. |
| health-endpoint-public | low | code | open | 5 | `backend/app/main.py` | The `/health` endpoint is publicly accessible, revealing service status to unauthenticated callers. |
| receipt-filename-collision | low | code | open | 5 | `backend/app/main.py` | Receipt filenames are generated solely from a timestamp; concurrent uploads within the same second could overwrite each other's files. |
| auth-signup-token-leak | critical | code | fixed | 2 | `backend/app/main.py` | `/auth/signup` returns a JWT for an existing email without checking a password, allowing an attacker who knows a user's email to obtain a valid authentication token and access the account. |
| jwt-secret-weak | medium | code | fixed | 2 | `backend/app/auth.py` | The JWT secret key length is only warned about if it is shorter than 32 bytes; the application continues to run with a weak secret, making brute‑force attacks feasible. |
| jwt-secret-logging | medium | code | fixed | 6 | `backend/app/auth.py` | The JWT secret is printed to stdout when it is missing or deemed too short, which could expose the secret via application logs and enable token forgery. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **medium** dependency-sprintf-js: `sprintf-js` version 1.0.3 is vulnerable to Denial‑of‑Service via unbounded precision specifiers (CVE‑2026‑97058) and has no current fix. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Replace usage of `sprintf-js` with native template literals or an alternative safe formatting library, then remove `sprintf-js` from dependencies and update the lockfile.
- [ ] **medium** dependency-sprintf-js-2: `sprintf-js` 1.0.3 can cause DoS via unbounded precision specifiers (CVE‑2026‑97058) and has no current fix. How: No fixed release exists yet: monitor the advisory and upgrade as soon as one ships; confirm whether the package is only a build-time dependency. Remove the dependency entirely and replace its usage with native template literals or a safe alternative; if required, upgrade to a version that patches the issue (none exists currently).

## Residual risk in the code (accepted, open)

- **high** web-jwt-storage-insecure: When running in a web environment the JWT token is persisted in localStorage. localStorage is accessible to any JavaScript on the page, making the token trivially stealable via XSS, leading to account compromise. Recommended fix: Do not store JWTs in localStorage for web. Use httpOnly, Secure, SameSite=Strict cookies for authentication, or employ a short‑lived token stored in memory only. If persistence is required, consider using the Web Crypto API with encrypted IndexedDB storage and enforce a strong Content‑Security‑Policy to mitigate XSS.
- **medium** dependency-decode-uri-component: The `decode-uri-component` package version 0.2.2 is vulnerable to a Denial‑of‑Service via crafted input (CVE‑2026‑45822). Recommended fix: Upgrade `decode-uri-component` to version >=0.5.0 (or remove it if not directly used) and regenerate the lockfile. Update `expo-app/package.json` accordingly.
- **medium** dependency-uuid: `uuid` version 7.0.3 has an out‑of‑bounds write vulnerability (CVE‑2026‑41907). Recommended fix: Upgrade `uuid` to a safe version (>=13.0.1) in `expo-app/package.json` and regenerate the lockfile.
- **medium** unbounded-notes-field: The optional `notes` fields in ReceiptCreate, ReceiptRead, MileageCreate, and MileageRead have no length constraints, permitting arbitrarily large payloads that could exhaust memory or storage. Recommended fix: Add a Pydantic `Field(max_length=500)` (or an appropriate limit) to each `notes` attribute to bound the size of user‑provided text.
- **medium** unpaginated-list-endpoints: The `/receipts` and `/mileage` endpoints return the full list of records for a user without pagination, which can cause high memory usage and slow responses for large datasets. Recommended fix: Introduce pagination parameters (e.g., `skip` and `limit` query params) and return a bounded subset of records, optionally including total count metadata.
- **medium** csv-export-memory: The CSV export endpoint builds the entire CSV string in memory before streaming it, leading to potential memory exhaustion for users with many receipts/mileage entries. Recommended fix: Yield each CSV row directly from the generator (use `io.StringIO` per row or `csv.writer` on a stream) so that the response is streamed row‑by‑row without loading the whole file into memory.
- **medium** pdf-export-memory: The PDF export endpoint creates the complete PDF in an in‑memory `BytesIO` buffer before sending it, which can exhaust memory for large numbers of records. Recommended fix: Stream the PDF generation using ReportLab's `canvas` directly to the response (e.g., by writing to the response's raw stream) or impose reasonable limits on the number of records included.
- **medium** dependency-decode-uri-component-2: Version 0.2.2 of `decode-uri-component` is vulnerable to DoS via crafted input (CVE‑2026‑45822). Recommended fix: Update the package to >=0.5.0 (e.g., `npm install decode-uri-component@^0.5.0`) and regenerate the lockfile.
- **medium** dependency-uuid-2: `uuid` 7.0.3 has an out‑of‑bounds write vulnerability (CVE‑2026‑41907). Recommended fix: Upgrade to a patched version (>=11.1.1, 12.0.1 or later) and update the lockfile.
- **medium** unbounded-notes-field-2: `notes` fields for receipts and mileage entries have no length limits, permitting arbitrarily large payloads that could exhaust memory or storage. Recommended fix: Add a maximum length constraint (e.g., `Field(None, max_length=2000)`) in the Pydantic schemas and enforce the same limit in the database (use `VARCHAR(2000)` or a check constraint). Validate the size in the endpoint before persisting.
- **medium** unpaginated-list-endpoints-2: `/receipts` and `/mileage` return the complete list of a user's records without pagination, risking high memory usage and slow responses for large datasets. Recommended fix: Implement pagination (limit/offset or cursor) on both endpoints and return paginated results with total counts.
- **medium** csv-export-memory-2: CSV export builds the whole CSV string in a `StringIO` buffer before streaming, which can exhaust memory for users with many records. Recommended fix: Stream rows directly by yielding each line as it's generated (e.g., use a generator that writes to the response line‑by‑line) instead of accumulating the entire output in memory.
- **medium** pdf-export-memory-2: PDF export creates the complete PDF in an in‑memory `BytesIO` buffer before returning, leading to possible memory exhaustion with many records. Recommended fix: Generate the PDF in a streamed fashion (e.g., use `ReportLab`'s `canvas.showPage()` with incremental writes to a temporary file or a streaming response) or limit the number of records that can be exported at once.
- **medium** missing-request-size-limit: The multipart/form‑data and JSON endpoints (e.g., /receipts, /mileage, login, signup) do not enforce a maximum request body size. An attacker could send arbitrarily large payloads (e.g., huge JSON strings in notes or category) causing excessive memory consumption and potential denial‑of‑service. Recommended fix: Add a request size limit middleware (e.g., Starlette's `LimitUploadSize`) or configure FastAPI's `max_body_size` to a reasonable value (e.g., 5 MiB for JSON/form fields) and return a 413 response when exceeded.
- **medium** unlimited-user-storage: There is no quota on the number or total size of receipt images or mileage records a user may create. A malicious or compromised account could exhaust server disk space, leading to service degradation or failure. Recommended fix: Introduce per‑user storage quotas (e.g., max number of receipts, max total image size). Enforce the limits in the receipt‑creation logic and reject uploads that would exceed the quota with a clear error message.
- **low** signup-email-enumeration: The /auth/signup endpoint returns a distinct "Email already registered" error, allowing attackers to confirm whether an email address is registered. Recommended fix: Return a generic error message (e.g., "Unable to create account") for both duplicate‑email and other validation failures, avoiding disclosure of account existence.
- **low** signup-email-enumeration-2: The `/auth/signup` endpoint returns a distinct "Email already registered" error, allowing attackers to confirm registered accounts. Recommended fix: Return a generic success message (e.g., "If the email is not already registered you will receive a confirmation") without indicating existence, or always return the same HTTP status code.
- **low** unbounded-category-field: `category` field for receipts is unlimited in length, which could be abused to consume resources. Recommended fix: Add a reasonable `max_length` constraint (e.g., `Field(..., max_length=100)`) to the `ReceiptBase` schema and enforce it at the database level.
- **low** health-endpoint-public: The `/health` endpoint is publicly accessible, revealing service status to unauthenticated callers. Recommended fix: Restrict the health check to internal networks (e.g., via IP allow‑list) or require a lightweight token; alternatively, keep it public but ensure no sensitive information is exposed.
- **low** receipt-filename-collision: Receipt filenames are generated solely from a timestamp; concurrent uploads within the same second could overwrite each other's files. Recommended fix: Include additional entropy such as the user ID or a UUID in the filename (e.g., `receipt_{user.id}_{uuid4().hex}{ext}`) to guarantee uniqueness.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
