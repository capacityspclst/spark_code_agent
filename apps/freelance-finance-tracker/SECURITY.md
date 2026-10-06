# Security assurance: freelance-finance-tracker

Pipeline run `20261006-084013-a1f7`, 2026-10-06. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was approved after 6 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-06). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
| missing-rate-limiting-auth | medium | code | open | 2 | `routers.py` | The `/auth/register` and `/auth/login` endpoints have no rate‑limiting. An attacker can brute‑force credentials or flood the service with registration attempts, leading to credential stuffing or denial‑of‑service. |
| missing-rate-limiting-uploads | medium | code | open | 2 | `routers.py` | The file‑upload endpoints (`/transactions/upload-csv` and `/transactions/upload-receipt`) are unauthenticated only by JWT but lack any request‑rate throttling, allowing an attacker with a valid token to exhaust server re |
| no-file-upload-size-limit | medium | code | open | 2 | `routers.py` | Uploaded files are accepted without any size validation. An attacker can send arbitrarily large CSV or image files, causing memory or disk exhaustion on the server (resource‑exhaustion DoS). |
| missing-security-headers | medium | deployment | open | 2 | `main.py` | The FastAPI application does not set common security HTTP headers (e.g., `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`). Browsers may be vulnerable to clickjacking or |
| email-enumeration-registration | low | code | open | 2 | `routers.py` | The registration endpoint returns a distinct error (`"Email already registered"`) when an email exists, enabling attackers to enumerate valid user accounts. |
| unvalidated-upload-content-type | low | code | open | 2 | `routers.py` | The upload endpoints accept any `UploadFile` without checking the MIME type or file extension. While files are not stored now, future changes could introduce unsafe handling of malicious content. |
| weak-password-hashing-algorithm | low | code | open | 4 | `auth.py` | Password hashing uses pbkdf2_sha256 which, while still secure, lacks the memory‑hard properties of modern recommended algorithms such as bcrypt or Argon2. This gives an attacker a marginally easier path to offline cracki |
| openapi-docs-exposed | low | code | open | 5 | `main.py` | FastAPI automatically serves interactive API documentation at /docs and the OpenAPI schema at /openapi.json without any authentication, exposing the complete set of endpoints to unauthenticated users and facilitating rec |
| cors-allow-credentials-enabled | low | code | open | 5 | `main.py` | CORS middleware is configured with `allow_credentials=True` while permitting all HTTP methods and all request headers. If the allowed origin were broadened in the future, browsers could automatically send credentials (co |
| hardcoded-secret-key | critical | code | fixed | 2 | `config.py` | A default JWT secret key (`"supersecretkey"`) is defined in source. If the environment variable `SECRET_KEY` is not set, the application uses this known value, enabling attackers to forge valid JWTs, bypass authenticatio |
| unvalidated-jwt-algorithm | critical | code | fixed | 4 | `config.py` | The JWT signing algorithm is sourced from the environment variable ALGORITHM without validation. An attacker who can influence environment variables (or a misconfiguration) could set ALGORITHM to "none", causing jwt.deco |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **medium** missing-security-headers: The FastAPI application does not set common security HTTP headers (e.g., `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`). Browsers may be vulnerable to clickjacking or MIME‑sniffing attacks. How: Configure a middleware or reverse‑proxy to add these headers. In code, you can use `starlette.middleware.httpsredirect.HTTPSRedirectMiddleware` for HSTS and a custom middleware to add the other headers, or handle it at the hosting layer (e.g., Nginx, Cloudflare).

## Residual risk in the code (accepted, open)

- **medium** missing-rate-limiting-auth: The `/auth/register` and `/auth/login` endpoints have no rate‑limiting. An attacker can brute‑force credentials or flood the service with registration attempts, leading to credential stuffing or denial‑of‑service. Recommended fix: Add a rate‑limiting middleware (e.g., using `slowapi` or `starlette-rate-limit`). Apply sensible limits such as `5/minute` per IP for login and `3/minute` for registration. Return HTTP 429 when limits are exceeded.
- **medium** missing-rate-limiting-uploads: The file‑upload endpoints (`/transactions/upload-csv` and `/transactions/upload-receipt`) are unauthenticated only by JWT but lack any request‑rate throttling, allowing an attacker with a valid token to exhaust server resources by repeatedly uploading large files. Recommended fix: Apply the same rate‑limiting middleware to the upload routes (e.g., `10/minute` per user/IP). Combine with the file‑size limit described below.
- **medium** no-file-upload-size-limit: Uploaded files are accepted without any size validation. An attacker can send arbitrarily large CSV or image files, causing memory or disk exhaustion on the server (resource‑exhaustion DoS). Recommended fix: Validate the uploaded file size before processing. For example, read the file in chunks and reject if size exceeds a safe limit (e.g., 5 MiB for CSV, 2 MiB for receipts). Alternatively, add a Starlette request‑body size middleware to enforce a global maximum.
- **low** email-enumeration-registration: The registration endpoint returns a distinct error (`"Email already registered"`) when an email exists, enabling attackers to enumerate valid user accounts. Recommended fix: Return a generic success/failure message that does not reveal whether the email is already in use (e.g., `"If the email is not already registered, you will receive a confirmation email"`). Optionally implement email verification to handle duplicates silently.
- **low** unvalidated-upload-content-type: The upload endpoints accept any `UploadFile` without checking the MIME type or file extension. While files are not stored now, future changes could introduce unsafe handling of malicious content. Recommended fix: Validate `file.content_type` against an allowed whitelist (`text/csv` for CSV uploads, `image/png`, `image/jpeg` for receipts). Reject any file with an unexpected content type with HTTP 400.
- **low** weak-password-hashing-algorithm: Password hashing uses pbkdf2_sha256 which, while still secure, lacks the memory‑hard properties of modern recommended algorithms such as bcrypt or Argon2. This gives an attacker a marginally easier path to offline cracking if the password hash database is ever exposed. Recommended fix: Configure CryptContext to use a stronger algorithm, e.g., `schemes=["bcrypt"]` (or Argon2 via `argon2-cffi`). Update `pwd_context` accordingly and re‑hash new passwords; optionally provide a migration path for existing hashes.
- **low** openapi-docs-exposed: FastAPI automatically serves interactive API documentation at /docs and the OpenAPI schema at /openapi.json without any authentication, exposing the complete set of endpoints to unauthenticated users and facilitating reconnaissance. Recommended fix: Disable the docs and OpenAPI endpoints in production (e.g., `app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)`) or protect them with authentication middleware.
- **low** cors-allow-credentials-enabled: CORS middleware is configured with `allow_credentials=True` while permitting all HTTP methods and all request headers. If the allowed origin were broadened in the future, browsers could automatically send credentials (cookies, Authorization header) to malicious origins. Recommended fix: Set `allow_credentials=False` unless credentials are required, or restrict origins more tightly and review the need for allowing all methods/headers.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
