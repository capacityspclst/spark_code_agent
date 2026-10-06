# Security assurance: freelance-finance-tracker

Pipeline run `20261006-090519-f22a`, 2026-10-06. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 8 round(s).

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
- trivy dependency vulnerabilities (other): **warnings**
  - `expo-app/package-lock.json: decode-uri-component 0.2.2 CVE-2026-45822 MEDIUM fixed in 0.5.0: decode-uri-component: decode-uri-component: Denial of Service via crafted input`
  - `expo-app/package-lock.json: sprintf-js 1.0.3 CVE-2026-97058 MEDIUM (no fix yet): sprintf-js: sprintf-js: Denial of Service via unbounded precision specifiers`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| vulnerable-dependency-braces | high | code | open | 4 | `expo-app/package-lock.json` | braces 3.0.3 contains CVE‑2026‑93687 (Denial‑of‑Service via deep regex patterns) with no patched version available yet. |
| vulnerable-dependency-node-forge | high | code | open | 4 | `expo-app/package-lock.json` | node‑forge 1.4.0 is vulnerable to CVE‑2026‑85393 (RSA PKCS#1 v1.5 signature forgery) and has no current fix. |
| vulnerable-dependency-decode-uri-compone | medium | code | open | 4 | `expo-app/package-lock.json` | decode‑uri‑component 0.2.2 is vulnerable to CVE‑2026‑45822 (Denial‑of‑Service via crafted input). |
| vulnerable-dependency-uuid | medium | code | open | 4 | `expo-app/package-lock.json` | uuid 7.0.3 is vulnerable to CVE‑2026‑41907 (out‑of‑bounds write) affecting data integrity. |
| insecure-token-storage-web | medium | code | open | 7 | `expo-app/src/auth.ts` | On Expo web builds the JWT is stored in AsyncStorage / local storage, which is accessible to JavaScript and vulnerable to XSS token theft. |
| decompression-bomb-image-attack | medium | code | open | 8 | `backend/app/main.py` | Uploaded receipt images are verified with Pillow (Image.verify) without limiting image dimensions or pixel count, allowing a crafted decompression‑bomb image to consume excessive CPU/memory and cause denial‑of‑service. |
| media-endpoint-rate-limit-missing | medium | code | open | 8 | `backend/app/main.py` | `GET /media/{filename}` is authenticated but not protected by any rate‑limiting, enabling an attacker with a valid token to flood the endpoint and exhaust server resources. |
| vulnerable-dependency-sprintf-js | medium | code | open | 8 | `expo-app/package-lock.json` | `sprintf-js` 1.0.3 is vulnerable to CVE‑2026‑97058 (Denial‑of‑Service via unbounded precision specifiers) and no patched version currently exists. |
| openapi-json-exposed | low | code | open | 4 | `backend/app/main.py` | The OpenAPI schema remains publicly accessible at /openapi.json, leaking endpoint signatures and model definitions. |
| signup-email-enumeration | low | code | open | 7 | `backend/app/main.py` | The /auth/signup endpoint returns a distinct 400 error when an email is already registered, allowing an attacker to enumerate existing user accounts. |
| signup-token-issuance | critical | code | fixed | 4 | `backend/app/main.py` | The /auth/signup endpoint returns a valid JWT for an existing email without checking the password, allowing an attacker to obtain a token for any account simply by guessing its email address. |
| csv-injection | medium | code | fixed | 1 | `backend/app/main.py` | The CSV export endpoint writes raw user‑provided fields (e.g., category, notes) directly into the CSV without escaping. When the file is opened in spreadsheet software, specially crafted values (e.g., =CMD\|'/C calc'!A0) |
| export-rate-limiting-missing | medium | code | fixed | 1 | `backend/app/main.py` | The CSV and PDF export endpoints can be called repeatedly without any throttling. An attacker could generate a large number of export requests, causing high CPU and memory consumption and potentially exhausting the servi |
| export-rate-limiting-missing-2 | medium | code | fixed | 4 | `backend/app/main.py` | CSV and PDF export endpoints can be invoked without any throttling, enabling a user or attacker to generate a large number of heavy responses and exhaust CPU/memory. |
| missing-auth-rate-limiting | medium | code | fixed | 4 | `backend/app/main.py` | Authentication endpoints (/auth/login and /auth/signup) have no request‑rate controls, making credential‑stuffing and brute‑force attacks feasible. |
| missing-receipt-upload-validation | medium | code | fixed | 4 | `backend/app/main.py` | Receipt uploads are validated only by the client‑provided content‑type header and size; the actual file content is not verified, allowing crafted files that bypass these checks. |
| api-docs-exposed | low | code | fixed | 1 | `backend/app/main.py` | FastAPI automatically serves interactive documentation at /docs and /redoc without any authentication, exposing endpoint signatures, request/response models, and potentially internal details to unauthenticated users. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- none

## Residual risk in the code (accepted, open)

- **high** vulnerable-dependency-braces: braces 3.0.3 contains CVE‑2026‑93687 (Denial‑of‑Service via deep regex patterns) with no patched version available yet. Recommended fix: Upgrade to a version where the vulnerability is fixed when released, or replace the library with an alternative that does not use vulnerable regex processing.
- **high** vulnerable-dependency-node-forge: node‑forge 1.4.0 is vulnerable to CVE‑2026‑85393 (RSA PKCS#1 v1.5 signature forgery) and has no current fix. Recommended fix: Replace node‑forge with a maintained cryptography library (e.g., @stablelib or the Web Crypto API) for any cryptographic operations.
- **medium** vulnerable-dependency-decode-uri-compone: decode‑uri‑component 0.2.2 is vulnerable to CVE‑2026‑45822 (Denial‑of‑Service via crafted input). Recommended fix: Upgrade decode‑uri‑component to version 0.5.0 or later where the issue is fixed.
- **medium** vulnerable-dependency-uuid: uuid 7.0.3 is vulnerable to CVE‑2026‑41907 (out‑of‑bounds write) affecting data integrity. Recommended fix: Upgrade uuid to at least version 11.1.1 (or the latest stable release) which contains the fix.
- **medium** insecure-token-storage-web: On Expo web builds the JWT is stored in AsyncStorage / local storage, which is accessible to JavaScript and vulnerable to XSS token theft. Recommended fix: For web, store the JWT in an httpOnly, Secure cookie or use a web‑compatible secure storage mechanism; avoid persisting the token in plain client‑side storage.
- **medium** decompression-bomb-image-attack: Uploaded receipt images are verified with Pillow (Image.verify) without limiting image dimensions or pixel count, allowing a crafted decompression‑bomb image to consume excessive CPU/memory and cause denial‑of‑service. Recommended fix: Set Pillow's Image.MAX_IMAGE_PIXELS limit or explicitly check image width/height before verification; reject images that exceed safe thresholds and consider scanning uploads with an antivirus.
- **medium** media-endpoint-rate-limit-missing: `GET /media/{filename}` is authenticated but not protected by any rate‑limiting, enabling an attacker with a valid token to flood the endpoint and exhaust server resources. Recommended fix: Add a SlowAPI `@limiter.limit` decorator (e.g., "10/minute") to the media endpoint or enforce rate limits at the edge/proxy.
- **medium** vulnerable-dependency-sprintf-js: `sprintf-js` 1.0.3 is vulnerable to CVE‑2026‑97058 (Denial‑of‑Service via unbounded precision specifiers) and no patched version currently exists. Recommended fix: Replace `sprintf-js` with native template literals or a maintained library; if a patched version becomes available, upgrade immediately.
- **low** openapi-json-exposed: The OpenAPI schema remains publicly accessible at /openapi.json, leaking endpoint signatures and model definitions. Recommended fix: Set openapi_url=None in FastAPI configuration or protect the endpoint with authentication / IP‑based restrictions.
- **low** signup-email-enumeration: The /auth/signup endpoint returns a distinct 400 error when an email is already registered, allowing an attacker to enumerate existing user accounts. Recommended fix: Return a generic response regardless of email existence (e.g., always send a success message and perform email verification), or unify error messages to avoid revealing account existence.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
