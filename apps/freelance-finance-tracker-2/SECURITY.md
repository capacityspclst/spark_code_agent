# Security assurance: freelance-finance-tracker-2

Pipeline run `20261011-134259-fa33`, 2026-10-11. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was approved after 3 round(s).

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

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| missing-rate-limiting-download-delete | medium | code | open | 3 | `app/routers/upload.py` | GET /uploads/{file_id} and DELETE /uploads/{file_id} endpoints lack any rate‑limiting, allowing an authenticated user to repeatedly download or delete files and potentially exhaust bandwidth, CPU, or DB resources. |
| error-detail-info-leak | low | code | open | 3 | `app/routers/upload.py` | When an exception occurs while saving an upload, the HTTP 500 response includes the raw exception message (e.g., file system path), which can disclose internal implementation details. |
| unsanitized-upload-dir-env | low | code | open | 3 | `app/routers/upload.py` | The UPLOAD_DIR environment variable is used directly without validation; a maliciously set value could point to an arbitrary location (e.g., "../" or an absolute path) and cause files to be written outside the intended d |
| jwt-sub-claim-validation | low | code | open | 3 | `app/auth.py` | The JWT "sub" claim is cast to int without checking that the value is numeric; a malformed token could raise a ValueError and trigger an unhandled exception, leading to a 500 error and unnecessary logging. |
| insecure-password-storage | critical | code | fixed | 2 | `app/routers/auth.py` | Passwords are stored and verified in plain text using a simple equality check (`verify_password`). No cryptographic hashing or salting is applied, exposing user credentials if the database is compromised and allowing cre |
| unbounded-file-upload-memory | high | code | fixed | 2 | `app/routers/upload.py` | The upload handler reads the entire uploaded file into memory via `await file.read()` without any size checks, allowing an attacker to cause out‑of‑memory crashes by sending a large payload. |
| suspicious-dependency-httpx2 | high | code | fixed | 2 | `requirements.txt` | `requirements.txt` includes a package `httpx2>=0.0.1` that does not appear to be an official library. Installing an unknown package introduces a supply‑chain risk that could execute malicious code on import or during ins |
| missing-rate-limiting-auth | medium | code | fixed | 2 | `app/routers/auth.py` | The `/token` endpoint has no rate limiting or brute‑force protection, allowing unlimited credential‑guess attempts from any IP address. |
| missing-rate-limiting-upload | medium | code | fixed | 2 | `app/routers/upload.py` | The file‑upload endpoint (`POST /uploads`) accepts unlimited requests, enabling a malicious client to flood the service with uploads and exhaust resources. |
| questionable-jwt-algorithm-env | low | code | fixed | 2 | `app/auth.py` | The JWT signing algorithm is taken from the `JWT_ALGORITHM` environment variable without validation, which could be set to `none` or another insecure algorithm if the environment is compromised. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- none

## Residual risk in the code (accepted, open)

- **medium** missing-rate-limiting-download-delete: GET /uploads/{file_id} and DELETE /uploads/{file_id} endpoints lack any rate‑limiting, allowing an authenticated user to repeatedly download or delete files and potentially exhaust bandwidth, CPU, or DB resources. Recommended fix: Add a rate‑limiting decorator (e.g., @limiter.limit("5/minute")) to the download_file and delete_file routes, or apply a global limit that also covers these endpoints.
- **low** error-detail-info-leak: When an exception occurs while saving an upload, the HTTP 500 response includes the raw exception message (e.g., file system path), which can disclose internal implementation details. Recommended fix: Log the exception internally and return a generic error message such as "Failed to save upload" without exposing the exception string.
- **low** unsanitized-upload-dir-env: The UPLOAD_DIR environment variable is used directly without validation; a maliciously set value could point to an arbitrary location (e.g., "../" or an absolute path) and cause files to be written outside the intended directory. Recommended fix: Validate UPLOAD_DIR to be a relative path without path separators or use pathlib to resolve it against a known safe base directory, rejecting or normalising unsafe values.
- **low** jwt-sub-claim-validation: The JWT "sub" claim is cast to int without checking that the value is numeric; a malformed token could raise a ValueError and trigger an unhandled exception, leading to a 500 error and unnecessary logging. Recommended fix: Validate that the "sub" claim is an integer string before conversion, and raise an HTTPException 401 for invalid values.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
