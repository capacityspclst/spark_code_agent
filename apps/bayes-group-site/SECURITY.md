# Security assurance: bayes-group-site

Pipeline run `20261122-155629-34aa`, 2026-11-22. Generated from the run's recorded results.

## Verdict

No critical or high security findings remain open, and every blocking scanner check passed.
The run was approved after 4 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-11-22). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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
  - `package-lock.json: react-router 6.30.6 CVE-2026-53666 MEDIUM fixed in 7.18.0: react-router: React Router: Information disclosure via client-side constructor execution [no fixed release fits its users `
  - `package-lock.json: react-router 6.30.6 CVE-2026-53669 MEDIUM fixed in 7.18.0: react-router: React Router: Open Redirect vulnerability via backslashes in navigation components [no fixed release fits it`

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| react-router-v6-cve-medium | medium | code | open | 4 | `package.json` | react‑router‑dom 6.30.6 contains two known CVEs (information disclosure via client‑side constructor execution and open‑redirect via backslashes). The application only uses static internal routes, so the risk is low but t |
| missing-security-headers | medium | deployment | open | 4 | `DEPLOYMENT.md` | The static site does not emit essential HTTP security headers (Content‑Security‑Policy, X‑Frame‑Options, X‑Content‑Type‑Options, Referrer‑Policy, Strict‑Transport‑Security). Without them browsers may allow loading of une |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **medium** missing-security-headers: The static site does not emit essential HTTP security headers (Content‑Security‑Policy, X‑Frame‑Options, X‑Content‑Type‑Options, Referrer‑Policy, Strict‑Transport‑Security). Without them browsers may allow loading of unexpected resources or enable click‑jacking. How: Configure the hosting/web server or CDN to send appropriate security headers. Example values are already documented in DEPLOYMENT.md; ensure they are applied in production.

## Residual risk in the code (accepted, open)

- **medium** react-router-v6-cve-medium: react‑router‑dom 6.30.6 contains two known CVEs (information disclosure via client‑side constructor execution and open‑redirect via backslashes). The application only uses static internal routes, so the risk is low but the vulnerable version remains in the dependency tree. Recommended fix: Upgrade react‑router‑dom to a version where the CVEs are fixed (e.g., ^7.18.0) and update any API changes required by the newer major version.

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
