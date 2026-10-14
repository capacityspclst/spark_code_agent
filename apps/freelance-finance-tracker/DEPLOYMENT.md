# DEPLOYMENT.md

*This guide walks John (or any developer) from the current commit of **apps/freelance-finance-tracker** to a production‑ready iOS/Android release (with an optional static‑web fallback). All commands, file names, ports, and environment variables are taken from the repository; anything that does not yet exist is marked **TODO** and a stub is provided.*

---  

## What this app is

- **Type**: Mobile‑first, local‑first finance tracker built with **Expo SDK** (version taken from `package.json` via `npm view expo version`).  
- **Core story**: Users capture receipt photos, log mileage, view a dashboard and export tax‑ready CSV/PDF files. All data stays encrypted on‑device; there is no backend.  
- **New capabilities (v2.0)**  
  1. **Tamper‑evident ledger** – every create / edit / delete of a receipt or mileage entry appends an immutable, SHA‑256‑hashed ledger entry (`src/lib/ledger.ts`).  
  2. **History view** – a “History” screen shows the original entry and every correction, newest last.  
  3. **Export verification** – CSV/PDF exports end with a verification line and a ledger entry (`export.created`). Settings can verify an exported file.  
  4. **Backup hardening** – backups now include the ledger; restores run `verifyLedger` and abort on failure.  
- **Key files**  
  - Ledger core: `src/lib/ledger.ts` (defines `LedgerEntry`, `addEntry`, `verifyLedger`, import‑on‑first‑launch).  
  - Store extension: `src/lib/storage/store.ts` (new `appendLedgerEntry`).  
  - Receipt & mileage stores: `src/lib/receiptStore.ts`, `src/lib/mileageStore.ts` (call ledger on every mutation).  
  - UI components: `src/components/ui/HistoryList.tsx`, `src/screens/ReceiptDetailScreen.tsx`, `src/screens/MileageDetailScreen.tsx`, `src/screens/SettingsScreen.tsx`.  
  - Flow definition: `ui_flow.json` (updated with History navigation).  

---  

## Architecture

```
+-------------------+      +------------------------+      +-------------------+
|  React Native UI  | ---> |  Domain / Lib layer    | ---> |  Encrypted Store  |
| (Paper, Nav, FAB) |      | (pure‑logic only)      |      | (expo‑sqlite)     |
+-------------------+      +------------------------+      +-------------------+
        |                         |                              |
        v                         v                              v
   Expo runtime            src/lib/*.ts                expo-secure-store
   (iOS / Android)         (finance, receipt …)           (key)
```

- **UI layer** – screens in `src/screens/`, shared components in `src/components/ui/`.  
- **Domain layer** – pure functions (`src/lib/ledger.ts`, `src/lib/ocr.ts`, `src/lib/backup.ts`, …) fully unit‑testable.  
- **Storage layer** – `src/lib/storage/` abstracts encrypted SQLite (native) and a fallback for web (`device.web.ts`). Ledger entries are stored **append‑only** via `appendLedgerEntry`.  
- **Policy gate** – `src/screens/PolicyScreen.tsx` blocks all UI until `POLICY_VERSION` is accepted.  
- **No backend** – OTA updates via Expo Application Services (EAS).  

---  

## Prerequisites

| Tool | Version / Install command |
|------|---------------------------|
| **Node.js** | `>=20` `node -v` |
| **npm** | `>=10` `npm -v` |
| **Expo CLI** | `npm i -g expo-cli` |
| **EAS CLI** | `npm i -g eas-cli` |
| **Apple Developer account** | Required for iOS signing |
| **Google Play Console account** | Required for Android signing |
| **Java JDK 11+** (Android builds) | `brew install openjdk@11` (macOS) |
| **Xcode 15+** (iOS builds) | Required on macOS |
| **Git** | `git --version` |
| **Docker** (optional – only for optional web fallback) | `docker --version` |

> **NOTE**: Run all commands from the repository root (`apps/freelance-finance-tracker`).

---  

## Configuration and secrets

| Item | Where it lives | How to set / update |
|------|----------------|---------------------|
| **Expo app config** | `app.json` | Edit `expo.name`, `expo.slug`, `expo.version`, `expo.orientation`, etc. |
| **Policy version** | `src/lib/policy.ts` – `export const POLICY_VERSION = "1.0.0"` | Bump the constant whenever the policy text changes. |
| **Encryption key** | Runtime – stored in **expo‑secure‑store** (`src/lib/storage/device.native.ts`) | Generated on first launch; never committed. |
| **iOS signing certificate** | **EAS Secret Manager** (or locally in `eas.json`) | `eas secret:add --name IOS_DIST_CERT --value <base64‑pem>` |
| **Android keystore** | **EAS Secret Manager** | `eas secret:add --name ANDROID_KEYSTORE --value <base64‑jks>` |
| **EAS build profiles** | `eas.json` – **TODO** (see stub below) | See “Deploy” section for the full stub. |
| **EAS OTA update URL** | `eas.json` – `updates.url` | `"updates": { "url": "https://u.expo.dev/<project-id>" }` |
| **GitHub Actions secrets** | Repo → Settings → Secrets | `EAS_TOKEN`, `APPLE_APP_SPECIFIC_PASSWORD`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. |
| **Web CSP meta tag** (if you ever enable `expo start --web`) | `public/index.html` – **TODO** | ```html\n<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">\n``` |
| **Runtime dependencies (new)** | `package.json` | Add `expo-text-extractor@^2.0.0` and `react-native-paper-dates@^0.24.1` (already present). No new dependency for the ledger – it uses `@noble/hashes`. |
| **Ledger verification flag (optional)** | `src/lib/ledger.ts` – none needed; status is computed at runtime. | – |

All secrets must live **only** in EAS’s encrypted secret store or in GitHub Actions secrets; never commit them.

---  

## Build and test

```bash
# 1️⃣ Install exact dependencies (Expo resolves SDK‑compatible versions)
cd apps/freelance-finance-tracker
npm ci

# 2️⃣ Verify the Expo SDK version the project is using
npm view expo version   # e.g. 50.0.0

# 3️⃣ Run unit & integration tests (Jest)
npm test                # runs all __tests__/*.test.ts, including new ledger tests

# 4️⃣ Lint & TypeScript type‑check (highly recommended)
npx eslint .            # uses repo‑wide ESLint config
npx tsc --noEmit       # ensures the TS compile succeeds

# 5️⃣ Build the optional web fallback (useful for internal QA or documentation)
expo start --web --no-dev --minify
#    → Served at http://localhost:19006

# 6️⃣ Production builds for iOS & Android (via EAS)
eas build --platform ios --profile production
eas build --platform android --profile production
```

> **All tests must pass before any binary is uploaded.** The CI pipeline (see later) runs the same commands automatically.

---  

## Deploy

### iOS & Android (App Store / Play Store)

1. **Configure `eas.json`** – replace the **TODO** stub with your real `projectId` and, if you use a custom build profile, set `distribution: "store"` etc.  

   ```json
   // eas.json
   {
     "cli": { "version": ">=3.0.0" },
     "build": {
       "production": {
         "ios": {
           "workflow": "managed",
           "distribution": "store"
         },
         "android": {
           "workflow": "managed",
           "distribution": "store"
         }
       }
     },
     "updates": {
       "url": "https://u.expo.dev/<project-id>"
     }
   }
   ```

2. **Create production builds**

   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

   The CLI will:
   * Prompt for Apple/Google credentials **or** fetch them from the secret manager.  
   * Use the **managed** workflow (no custom native code, so OCR and date‑picker libraries work out‑of‑the‑box).  

3. **Submit the binaries**

   ```bash
   # iOS – upload to TestFlight first
   eas submit --platform ios --latest --type archive

   # Android – internal testing track
   eas submit --platform android --latest --type apk
   ```

   After TestFlight / Play Console approval, promote the build to production.

4. **Release to the public stores**  
   * **App Store Connect** → *Ready for Sale*  
   * **Google Play Console** → *Production* rollout  

### Over‑the‑Air (OTA) updates

- Ensure OTA is enabled in `eas.json` (`"updates": { "url": "https://u.expo.dev/<project-id>" }`).  
- Publish a new JavaScript bundle whenever only UI or logic changes (no native code):

  ```bash
  eas update --branch production --message "Add ledger, history view, export verification"
  ```

  Devices running the latest native binary will fetch this bundle on next launch.

### Optional static‑web fallback

If you later decide to ship a static web version:

| Provider | Quick steps |
|----------|-------------|
| **Vercel** | Connect the repo → set `buildCommand: npx expo export -p web` → `outputDirectory: dist`. Add the CSP meta tag (see above). |
| **Netlify** | Same as Vercel; add a `_redirects` file to force HTTPS. |
| **Cloudflare Pages** | Deploy the `dist` folder; configure a CSP header in the Pages dashboard. |

> **TODO – Production Dockerfile for web** (currently missing). Add a stub at the repo root named `Dockerfile`:

```dockerfile
# TODO: production Dockerfile for web export
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
# Ensure a script `expo export -p web` exists in package.json (e.g. "export:web": "expo export -p web")
RUN npm ci && npm run export:web

FROM nginx:alpine
COPY --from=builder /app/web-build /usr/share/nginx/html
# TODO: add CSP header via nginx.conf
```

---  

## Security checklist

All items stem from the automated scan, the security review, and the production hardening work for this Expo app (including the new ledger). **Check each box after fixing the issue.**

### Dependency vulnerabilities (deployment actions)

- [ ] **`uuid`** – upgrade to `npm i uuid@^13.0.1` (fixes CVE‑2026‑141907).  
- [ ] **`node-forge`** – monitor for a fixed release (`>=1.5.0`) **or** replace with `@noble/*`. Ensure no import remains.  
- [ ] **`braces`** – monitor for `>=3.0.4` (CVE‑2026‑19387) or replace the glob utility.  
- [ ] **`sprintf-js`** – monitor for `>=1.1.2` (CVE‑2026‑97058) or replace with native template literals.  

### Ledger‑related hardening (new code)

- [ ] **Append‑only storage** – verify that `src/lib/storage/store.ts::appendLedgerEntry` only ever pushes to the stored array and never rewrites or deletes entries (except a full data reset).  
- [ ] **First entry `prevHash`** – confirm it is 64 zeroes (`"0".repeat(64)`).  
- [ ] **Canonical JSON** – ensure `src/lib/ledger.ts` uses a deterministic field order (e.g. `Object.keys(...).sort()`) before hashing.  
- [ ] **Hash calculation** – verify import of `sha256`, `bytesToHex`, `utf8ToBytes` from `@noble/hashes` and that `hash = bytesToHex(sha256(utf8ToBytes(canonicalJson)))`.  
- [ ] **Import on first launch** – `initLedgerIfNeeded` must run only once (store a flag, e.g. `ledgerInitialized` in the encrypted store).  
- [ ] **Export verification line** – CSV/PDF export code must append `entries | headHash | code` where `code` is first 12 hex chars of `sha256(exportContentWithoutLine)`.  
- [ ] **Export ledger entry** – `kind: "export.created"` must contain `{format, code, entries, headHash}`.  
- [ ] **Backup verification** – `src/lib/backup.ts` must call `verifyLedger` on the restored payload **before** mutating any data; abort with a user‑friendly error if verification fails.  
- [ ] **Legacy backup handling** – older backups without a ledger are imported as `"imported"` entries (already implemented).  

### Existing code findings (must be addressed)

- [ ] **Data‑reset photo leak (high)** – `src/lib/dataReset.ts` must enumerate every stored `photoUri` and delete those files via `expo-file-system` before clearing the store.  
- [ ] **Backup‑restore path traversal (medium)** – `src/lib/backup.ts` must validate that any restored image paths stay inside `FileSystem.documentDirectory`.  
- [ ] **Backup‑restore size DOS (medium)** – reject encrypted backup blobs > 10 MiB **before** decryption and enforce max 10 000 receipts / 5 000 mileage entries in `validateBackupStructure`.  
- [ ] **Backup‑passphrase brute‑force (medium)** – add exponential back‑off and lockout after 5 consecutive failures (store count in memory).  
- [ ] **CSV export injection (medium)** – replace custom CSV builder with `csv-stringify` to guarantee proper escaping.  
- [ ] **Backup temporary file cleanup (medium)** – ensure `src/lib/backup.ts` deletes temp files in a `finally` block (`FileSystem.deleteAsync(tmpUri, { idempotent: true })`).  

### Hardening items introduced in v1.0 (must be verified)

- [ ] **Numeric field validation** – `src/lib/validation.ts` used everywhere; error messages appear via `<HelperText type="error">`.  
- [ ] **Backup passphrase policy** – UI enforces “≥ 12 characters” rule and disables the “Create backup” button until satisfied.  
- [ ] **Export button throttling** – CSV/PDF export buttons disabled while an export runs (`exportRunning` state).  
- [ ] **Backup structure validation** – `src/lib/backup.ts` exposes `validateBackupStructure`; restores only after passing.  
- [ ] **Temporary backup file deletion** – confirmed via `finally` block.  

---  

## Operations

| Area | What to monitor / maintain | Tools / Commands |
|------|----------------------------|------------------|
| **App version** | Keep `app.json.expo.version` in sync with store listings. | `jq .expo.version app.json` |
| **Crash reporting** | **Disabled by design** – ensure no third‑party SDK (e.g., Sentry) is added. | — |
| **Ledger health** | Run a daily CI sanity test that creates an encrypted backup, restores it, and asserts `verifyLedger` returns `{ok:true}`. | Add script `npm run test:ledger` that executes the ledger acceptance tests. |
| **Backup health** | CI test `npm run test:backup` (creates backup, restores, verifies ledger). | — |
| **OTA updates health** | After each `eas update`, verify the `production` channel reports healthy. | `eas update:list --branch production` |
| **Store listings** | Keep the privacy‑policy link up‑to‑date; the full text lives in `src/lib/policy.ts`. | Manual UI review before each store submission. |
| **Dependency health** | Monthly `npm audit` run; address new vulnerabilities promptly. | `npm audit && npm audit fix` |
| **Web fallback** (if enabled) | Ensure TLS (HTTPS) and CSP are active; monitor with external uptime checks. | `curl -I https://<your-site>.com` |
| **Device storage** | No server scaling needed; users manage storage on their own devices. | — |
| **Biometric lock state** | Verify `appLockEnabled` persists across restarts. | Manual test or automated UI test. |
| **Export throttling** | Confirm CSV & PDF buttons stay disabled during an export and re‑enable after completion. | UI smoke test / unit test. |
| **Policy acceptance after reset** | After a “Delete all data” operation, `isPolicyAccepted` should still return `true`. | Unit test `dataReset.test.ts`. |

---  

## CI/CD

**GitHub Actions workflow (place at `.github/workflows/ci.yml`)**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test                 # all Jest tests, including ledger tests
      - run: npm run test:ledger      # optional extra sanity check
      - run: npm run test:backup

  build-ios:
    needs: test
    runs-on: macos-latest
    env:
      EAS_TOKEN: ${{ secrets.EAS_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: expo/github-action@v8
        with:
          expo-version: latest
      - run: npm ci
      - run: eas login --token ${{ secrets.EAS_TOKEN }}
      - run: eas build --platform ios --profile production --non-interactive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    env:
      EAS_TOKEN: ${{ secrets.EAS_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: expo/github-action@v8
        with:
          expo-version: latest
      - run: npm ci
      - run: eas login --token ${{ secrets.EAS_TOKEN }}
      - run: eas build --platform android --profile production --non-interactive

  publish:
    needs: [build-ios, build-android]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Manual store submission reminder
        run: |
          echo "🚀 To submit, run the following commands (or automate them if credentials are stored in EAS Secret Manager):"
          echo "  eas submit --platform ios --latest --type archive"
          echo "  eas submit --platform android --latest --type apk"
```

**Pipeline flow**

1. **Tests** – lint, TypeScript compile, Jest unit & integration tests (including new ledger, export verification, backup verification).  
2. **Builds** – managed iOS (`.ipa`) and Android (`.aab`/`.apk`) binaries via EAS.  
3. **Publish** – optional manual step; can be automated once signing credentials are in EAS Secret Manager.  

---  

## Costs

| Item | Provider / Option | Approx. monthly cost (USD) |
|------|-------------------|----------------------------|
| **EAS Build (managed)** | Free tier: 100 build‑minutes / month. After that **$0.12 /min** (iOS) / **$0.10 /min** (Android). A full build ≈ 20 min per platform → **≈ $2 – $3**/month once the free quota is exhausted. |
| **Apple Developer Program** | $99 / year → **≈ $8**/month (amortised). |
| **Google Play Console** | One‑time $25 enrollment → negligible ongoing cost. |
| **Optional web host** | Vercel / Netlify Hobby (free) or Pro **$20 – $45**/month for custom domain & higher bandwidth. |
| **EAS Secret Manager** | Included with EAS service – no extra charge. |
| **GitHub Actions** | Free for public repos; private repos get 2 000 minutes free → **$0** for this project. |

**Bottom line:** Expect **≈ $10 – $15**/month total (dominated by the Apple Developer fee) once the app is live.

---  

## Before production

1. **Finalize ledger import flag** – ensure `initLedgerIfNeeded` records a persistent `ledgerInitialized` flag; verify import runs only once on fresh install.  
2. **Add production Dockerfile for web fallback** (see the **TODO** stub).  
3. **Replace CSV generation with a safe library** (`csv-stringify`) and adjust `src/lib/exportCsv.ts` accordingly.  
4. **Implement exponential back‑off & lockout for failed backup restores** (store failure count in a module‑level variable).  
5. **Add CSP meta tag / HTTP header** for any future web deployment (update `public/index.html` and, if using Docker, the nginx config).  
6. **Complete data‑reset photo deletion** – enumerate `photoUri`s and delete the files before clearing the encrypted store.  
7. **Enforce backup size limits** – reject blobs > 10 MiB before decryption and enforce receipt/mileage caps in `validateBackupStructure`.  
8. **Run full regression suite on fresh devices** (iOS 15+ & Android 13+), covering policy gate, biometric lock, receipt capture (including OCR flow), mileage entry, dashboard totals, CSV/PDF export with verification line, encrypted backup create & restore, and the new “History” screens.  
9. **Update store listings** – verify the privacy‑policy link points to the latest text in `src/lib/policy.ts`; refresh screenshots to show the History view, Ledger status card, and Export verification UI.  
10. **Run final security audit** – `npm audit`, `npx semgrep --config=p/ci`, and `trivy fs .` in CI; ensure **Security checklist** is **100 %** checked.  

When **all** items above are verified and the CI pipeline passes without failures, the app is ready for production submission. 🚀
