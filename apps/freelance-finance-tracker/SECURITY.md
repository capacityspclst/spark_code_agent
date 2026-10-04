# Security assurance: freelance-finance-tracker

Pipeline run `20261003-223546-746c`, 2026-10-04. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 7 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-03). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
- **Suppression check.** `nosemgrep`, `trivy:ignore` and scanner ignore files are rejected.
- **Security review** by an AI reviewer each round once tests and scanners passed, against a fixed severity rubric, tracking every finding to fixed or open.
- **Isolation.** All generated code, tests and scanners ran in a sandbox container with no secrets.

Blocking rules: any secret; high/critical dependency vulnerabilities with a fix available; high/critical misconfigurations; Semgrep errors; critical/high review findings.

## Scanner results (final round)

- scanner suppressions: **pass**
- semgrep (security errors): **pass**
- trivy secrets: **pass**
- trivy dependency vulnerabilities (high/critical, fixable): **FAIL**
  - `ui/package-lock.json: @remix-run/router 1.23.1 CVE-2026-22029 HIGH fixed in 1.23.2: @remix-run/router: react-router: React Router vulnerable to XSS via Open Redirects`
- trivy misconfigurations (high/critical): **pass**
- trivy dependency vulnerabilities (other): **warnings**
  - `ui/package-lock.json: @remix-run/router 1.23.1 CVE-2026-40181 MEDIUM fixed in 1.23.3: react-router: React Router: Open redirect vulnerability via specially crafted URLs`
  - `ui/package-lock.json: react-router 6.30.2 CVE-2026-40181 MEDIUM fixed in 7.14.1, 6.30.4: react-router: React Router: Open redirect vulnerability via specially crafted URLs`
  - `ui/package-lock.json: react-router 6.30.2 CVE-2026-53666 MEDIUM fixed in 7.18.0: react-router: React Router: Information disclosure via client-side constructor execution`
  - `ui/package-lock.json: react-router 6.30.2 CVE-2026-53669 MEDIUM fixed in 7.18.0: react-router: React Router: Open Redirect vulnerability via backslashes in navigation components`
  - `ui/package-lock.json: react-router-dom 6.30.2 CVE-2026-53668 MEDIUM fixed in 6.30.6: react-router: react-router-dom: React Router: Cross-Site Scripting (XSS) via open redirects`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| | | | | | No findings |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- none

## Residual risk in the code (accepted, open)

- none

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
