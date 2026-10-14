# Security assurance: freelance-finance-tracker

Pipeline run `20261013-160700-0e32`, 2026-10-13. Generated from the run's recorded results.

## Verdict

**Not cleared:** critical/high findings or blocking scanner checks remain; see below.
The run was not approved after 11 round(s).

## What was checked

- **Semgrep** (1.178.0, 1409 vendored rules: security-audit, OWASP Top 10, secrets, injection, XSS, JWT, insecure transport, language packs). Static analysis of the code.
- **Trivy** (Version: 0.74.0, vulnerability DB 2026-10-13). Known-vulnerable dependencies in lockfiles, committed secrets, and Terraform/Docker/Kubernetes misconfigurations.
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

## Review findings

| ID | Severity | Fixed in | Status | Found in round | File | Issue |
|---|---|---|---|---|---|---|
| node-forge-vuln | high | deployment | open | 5 | `package-lock.json` | `node-forge` version 1.4.0 contains a signature forgery vulnerability (CVE‑2026‑85393). The library is present in the dependency tree. |
| braces-vuln | high | deployment | open | 5 | `package-lock.json` | `braces` 3.0.3 is vulnerable to denial‑of‑service via stack overflow from deeply nested patterns (CVE‑2026‑93687). |
| ledger-size-limit-dos | high | code | open | 7 | `src/lib/ledger.ts` | addLedgerEntry throws an exception when the ledger reaches MAX_LEDGER_ENTRIES (5000). The calling code (e.g., receiptStore, mileageStore, export logic) does not catch this exception, leading to an unhandled error that ca |
| ledger-append-only | medium | code | open | 4 | `src/lib/ledger.ts` | The ledger is stored as a single encrypted JSON array in the Store, and the appendLedgerEntry method reads the whole array, pushes a new entry, and writes it back. This could allow a maliciously‑crafted Store implementat |
| ledger-entry-size | medium | deployment | open | 4 | `src/lib/ledger.ts` | There is no explicit limit on the size of a ledger entry's data field. Very large receipt images or OCR data could cause the encrypted ledger blob to grow without bound, leading to storage exhaustion on the device or DoS |
| ledger-missing-mod-log | medium | code | open | 5 | `src/lib/receiptStore.ts` | Only creation of receipts is logged in the ledger. There are no ledger entries for edits (receipt.corrected) or deletions (receipt.deleted), breaking the tamper‑evident guarantee for modifications. |
| ledger-missing-mod-log-mileage | medium | code | open | 5 | `src/lib/mileageStore.ts` | Only mileage creation is logged. Edits and deletions are not recorded, leaving a gap in the audit trail. |
| backup-ledger-size-bypass | medium | code | open | 6 | `src/lib/backup.ts` | Backup restore writes the ledger payload directly without enforcing the ledger entry‑count or data‑size limits, allowing a crafted backup to bypass MAX_LEDGER_ENTRIES and cause unbounded storage growth or denial‑of‑servi |
| backup-restore-ordered-data | medium | code | open | 9 | `src/lib/backup.ts` | restoreBackup writes receipts, mileage and categories to the store before the ledger (if present) is verified. When ledger verification fails the function throws an error after the other data has already been persisted,  |
| missing-csp-web | low | deployment | open | 4 | `public/index.html` | The web fallback does not include a Content‑Security‑Policy meta tag, leaving the web build potentially vulnerable to script injection if a malicious component is added in the future. |
| photo-uri-path-traversal | medium | code | fixed | 4 | `src/lib/backup.ts` | During backup restore the code copies receipt.photoUri values from the backup payload directly to the file system without validation. If a malicious backup contains a crafted photoUri with absolute paths or "../" sequenc |
| backup-unbounded-size | medium | code | fixed | 5 | `src/lib/backup.ts` | createBackup can generate arbitrarily large encrypted blobs and restoreBackup will load them fully into memory. A crafted large backup can cause memory exhaustion or long processing times. |
| backup-unknown-fields | medium | code | fixed | 5 | `src/lib/backup.ts` | validateBackupStructure only checks a whitelist of receipt/mileage fields. Unknown fields (e.g., a malicious photoUri with "../" paths) are accepted and persisted, potentially enabling path‑traversal or other unsafe oper |
| export-verification-code-leak | low | code | fixed | 4 | `src/lib/exportCsv.ts` | The CSV export appends a verification line that contains the ledger head hash and a short code derived from the file content. If the exported file is shared, the head hash is exposed, which could aid an attacker attempti |
| ledger-unbounded-growth | low | code | fixed | 5 | `src/lib/ledger.ts` | The ledger is stored as a single encrypted JSON array that grows indefinitely. Over time this can exhaust device storage and cause performance or denial‑of‑service issues. |

## Required before go-live (hosting and infrastructure)

These can't be fixed in the app's code; configure them where the app is deployed. DEPLOYMENT.md shows how for the recommended hosts.

- [ ] **high** node-forge-vuln: `node-forge` version 1.4.0 contains a signature forgery vulnerability (CVE‑2026‑85393). The library is present in the dependency tree. How: Upgrade to `node-forge` >= 1.5.0 or replace with a safe alternative (e.g., `@noble/*` crypto primitives).
- [ ] **high** braces-vuln: `braces` 3.0.3 is vulnerable to denial‑of‑service via stack overflow from deeply nested patterns (CVE‑2026‑93687). How: Upgrade to `braces` >= 3.0.4 or replace the library with a non‑vulnerable alternative.
- [ ] **medium** ledger-entry-size: There is no explicit limit on the size of a ledger entry's data field. Very large receipt images or OCR data could cause the encrypted ledger blob to grow without bound, leading to storage exhaustion on the device or DoS during backup/restore. How: Enforce a reasonable maximum size for the data payload (e.g., reject entries > 256 KB) before calling addEntry, and document the limit. The backup routine should also cap total ledger size (e.g., 5 MiB) and abort with a user‑friendly error if exceeded.
- [ ] **low** missing-csp-web: The web fallback does not include a Content‑Security‑Policy meta tag, leaving the web build potentially vulnerable to script injection if a malicious component is added in the future. How: Add a CSP meta tag in public/index.html (e.g., "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;") as a deployment hardening step.

## Residual risk in the code (accepted, open)

- **high** ledger-size-limit-dos: addLedgerEntry throws an exception when the ledger reaches MAX_LEDGER_ENTRIES (5000). The calling code (e.g., receiptStore, mileageStore, export logic) does not catch this exception, leading to an unhandled error that can crash the app, providing a denial‑of‑service vector. Recommended fix: Catch the ‘Ledger size limit exceeded’ error in all callers and present a user‑friendly message. Consider increasing the limit, rotating/archiving old entries, or providing a graceful fallback instead of crashing.
- **medium** ledger-append-only: The ledger is stored as a single encrypted JSON array in the Store, and the appendLedgerEntry method reads the whole array, pushes a new entry, and writes it back. This could allow a maliciously‑crafted Store implementation (or a corrupted on‑device storage) to replace prior entries, breaking the append‑only guarantee. The code relies on the Store's internal security but does not enforce immutability at the ledger level. Recommended fix: Make the ledger truly append‑only by storing each entry under its own key (e.g. "ledger:{seq}") and never reading‑modifying previous entries. Alternatively, keep the array but verify its integrity (hash chain) before each append and reject if the previous hash does not match the stored head.
- **medium** ledger-missing-mod-log: Only creation of receipts is logged in the ledger. There are no ledger entries for edits (receipt.corrected) or deletions (receipt.deleted), breaking the tamper‑evident guarantee for modifications. Recommended fix: Implement editReceipt and deleteReceipt functions that call addLedgerEntry with kinds 'receipt.corrected' and 'receipt.deleted', respectively, and ensure all mutation paths go through these wrappers.
- **medium** ledger-missing-mod-log-mileage: Only mileage creation is logged. Edits and deletions are not recorded, leaving a gap in the audit trail. Recommended fix: Add editMileageEntry and deleteMileageEntry functions that record 'mileage.corrected' and 'mileage.deleted' ledger entries.
- **medium** backup-ledger-size-bypass: Backup restore writes the ledger payload directly without enforcing the ledger entry‑count or data‑size limits, allowing a crafted backup to bypass MAX_LEDGER_ENTRIES and cause unbounded storage growth or denial‑of‑service. Recommended fix: Validate the incoming ledger array before writing it – enforce MAX_LEDGER_ENTRIES, and optionally check total byte size of each entry. Reject or truncate oversized ledgers.
- **medium** backup-restore-ordered-data: restoreBackup writes receipts, mileage and categories to the store before the ledger (if present) is verified. When ledger verification fails the function throws an error after the other data has already been persisted, leaving a partially restored and potentially inconsistent state. Recommended fix: Validate the entire backup payload, verify the ledger (including size limits) first, and only then persist receipts, mileage, categories and the ledger atomically. On any verification failure abort without mutating the store or roll back changes (e.g., call store.clearAll() before re‑throwing).

## Limits of this assurance

Automated scanning and AI review find many common flaws but are not a penetration test or a formal audit. Nothing here tests the deployed environment (TLS, network exposure, secrets management, authentication provider setup), and business-logic flaws can be missed. Before handling real user data or money, have a person review the code and the deployment, and work through the Security checklist in DEPLOYMENT.md.
