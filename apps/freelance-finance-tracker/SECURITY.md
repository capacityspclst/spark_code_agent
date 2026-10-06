# Security assurance: freelance-finance-tracker

Pipeline run `20261005-213735-72b2`, 2026-10-06. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 7 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-05). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
  - `expo-app/package-lock.json: braces 3.0.3 CVE-2026-93687 HIGH (no fix yet): braces: braces: Denial of Service via Stack Overflow from Deeply Nested Patterns`
  - `expo-app/package-lock.json: decode-uri-component 0.2.2 CVE-2026-45822 MEDIUM fixed in 0.5.0: decode-uri-component: decode-uri-component: Denial of Service via crafted input`
  - `expo-app/package-lock.json: node-forge 1.4.0 CVE-2026-85393 HIGH (no fix yet): node-forge: node-forge: Signature forgery vulnerability in RSA PKCS#1 v1.5 verification`
  - `expo-app/package-lock.json: uuid 7.0.3 CVE-2026-41907 MEDIUM fixed in 11.1.1, 12.0.1, 13.0.1: uuid: uuid: Out-of-bounds write vulnerability impacts data integrity and confidentiality`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| media-path-traversal | critical | code | open | 7 | `backend/app/main.py` | GET /media/{filename} concatenates the supplied filename with MEDIA_ROOT without any sanitisation, allowing directory‑traversal (e.g., "../.." sequences) and the reading of arbitrary files on the server. Combined with th |
| unauthenticated-media-endpoint | high | code | open | 4 | `backend/app/main.py` | GET /media/{filename} serves receipt images without any authentication or ownership checks, exposing private user data to anyone who can guess a filename. |
| vulnerable-dependency-braces | high | code | open | 4 | `expo-app/package-lock.json` | braces 3.0.3 has CVE‑2026‑93687 (Denial‑of‑Service via deep regex patterns) and has no fix yet. |
| vulnerable-dependency-node-forge | high | code | open | 4 | `expo-app/package-lock.json` | node‑forge 1.4.0 contains a signature‑forgery flaw in RSA PKCS#1 v1.5 verification (CVE‑2026‑85393) with no fix available yet. |
| missing-receipt-upload-validation | medium | code | open | 4 | `backend/app/main.py` | Receipt uploads are saved without validating file size, MIME type, or scanning for malicious content, enabling potential DoS via oversized uploads or storage of dangerous files. |
| missing-auth-rate-limiting | medium | code | open | 4 | `backend/app/main.py` | Authentication endpoints (/auth/signup, /auth/login) have no rate limiting, allowing credential‑stuffing or brute‑force attacks. |
| insecure-token-storage-web | medium | code | open | 4 | `expo-app/src/auth.ts` | On web platforms the JWT is stored in AsyncStorage (local storage), which is vulnerable to XSS theft. |
| vulnerable-dependency-decode-uri-compone | medium | code | open | 4 | `expo-app/package-lock.json` | decode-uri-component 0.2.2 is vulnerable to DoS (CVE‑2026‑45822). |
| vulnerable-dependency-uuid | medium | code | open | 4 | `expo-app/package-lock.json` | uuid 7.0.3 is vulnerable (CVE‑2026‑41907) – out‑of‑bounds write affecting data integrity. |
| missing-security-headers | medium | deployment | open | 6 | `backend/app/main.py` | FastAPI does not emit common security HTTP headers (Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy), leaving the service vulnerable to clickjacking, MIME‑sniffing, and TLS‑dow |
| default-jwt-secret | critical | code | fixed | 4 | `backend/app/auth.py` | JWT secret falls back to the literal string "secret" when the JWT_SECRET_KEY environment variable is missing, allowing attackers to forge valid tokens and impersonate any user. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **medium** missing-security-headers: FastAPI does not emit common security HTTP headers (Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy), leaving the service vulnerable to clickjacking, MIME‑sniffing, and TLS‑downgrade attacks. How: Configure the hosting edge/proxy (e.g., Fly.io, Render, Cloud Run) to add these headers, or add a FastAPI middleware that injects them on every response.

## Residual risk in the code (accepted, open)

- **critical** media-path-traversal: GET /media/{filename} concatenates the supplied filename with MEDIA_ROOT without any sanitisation, allowing directory‑traversal (e.g., "../.." sequences) and the reading of arbitrary files on the server. Combined with the lack of authentication, this can expose source code, environment files, private keys, and other secrets. Recommended fix: Validate the filename to ensure it contains no path‑traversal characters (use pathlib's .resolve() and confirm the result is within MEDIA_ROOT), reject or normalise any ".." components, and ideally serve files via a dedicated static‑file handler that enforces these checks. Add authentication (reuse get_current_user) and an ownership check so users can only retrieve their own receipt images.
- **high** unauthenticated-media-endpoint: GET /media/{filename} serves receipt images without any authentication or ownership checks, exposing private user data to anyone who can guess a filename. Recommended fix: Protect the endpoint with authentication (e.g., Depends(get_current_user)) and verify the requested file belongs to the requesting user, or replace it with signed URLs from a secure object store.
- **high** vulnerable-dependency-braces: braces 3.0.3 has CVE‑2026‑93687 (Denial‑of‑Service via deep regex patterns) and has no fix yet. Recommended fix: Upgrade to a version where the vulnerability is patched when released; until then audit the codebase for regex usage that could trigger the issue and consider removing or replacing the library.
- **high** vulnerable-dependency-node-forge: node‑forge 1.4.0 contains a signature‑forgery flaw in RSA PKCS#1 v1.5 verification (CVE‑2026‑85393) with no fix available yet. Recommended fix: Replace node‑forge with a maintained cryptography library (e.g., @stablelib or the built‑in Web Crypto API) or wait for a patched release while auditing any code that may use node‑forge.
- **medium** missing-receipt-upload-validation: Receipt uploads are saved without validating file size, MIME type, or scanning for malicious content, enabling potential DoS via oversized uploads or storage of dangerous files. Recommended fix: Enforce a reasonable size limit (e.g., 5 MiB), validate that the uploaded file is an allowed image type (e.g., JPEG/PNG), and optionally scan uploads with an antivirus (ClamAV) before saving.
- **medium** missing-auth-rate-limiting: Authentication endpoints (/auth/signup, /auth/login) have no rate limiting, allowing credential‑stuffing or brute‑force attacks. Recommended fix: Integrate a rate‑limiting middleware such as slowapi or enforce limits at the edge/CDN (e.g., 5 requests per minute per IP) and implement exponential back‑off on repeated failures.
- **medium** insecure-token-storage-web: On web platforms the JWT is stored in AsyncStorage (local storage), which is vulnerable to XSS theft. Recommended fix: For web builds switch to http‑only, secure cookies or another browser‑secure storage mechanism; avoid storing JWTs in plain client‑side storage.
- **medium** vulnerable-dependency-decode-uri-compone: decode-uri-component 0.2.2 is vulnerable to DoS (CVE‑2026‑45822). Recommended fix: Update the package to version 0.5.0 or later where the vulnerability is fixed.
- **medium** vulnerable-dependency-uuid: uuid 7.0.3 is vulnerable (CVE‑2026‑41907) – out‑of‑bounds write affecting data integrity. Recommended fix: Upgrade uuid to at least 11.1.1 (or the latest stable version) to obtain the fix.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
