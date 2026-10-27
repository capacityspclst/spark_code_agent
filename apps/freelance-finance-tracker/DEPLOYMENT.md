# DEPLOYMENT.md

*This guide takes John (or any developer) from the current commit of **apps/freelance‑finance‑tracker** to a production‑ready iOS/Android release (with an optional static‑web fallback). All commands, file names, ports, and environment variables are taken from the repository; anything that does not yet exist is marked **TODO** and a stub is provided.*

---  

## What this app is

- **Type**: Mobile‑first, local‑first finance tracker built with **Expo SDK** (version pinned in `package.json`).
- **Core story**: Users capture receipt photos + metadata, log mileage, view a dashboard, and export tax‑ready CSV/PDF files. All data stays encrypted on‑device; there is no backend, analytics, or user accounts.
- **Key capabilities** (v2.0):
  1. On‑device OCR receipt scanning – `expo-text-extractor@^2.0.0`.
  2. Calendar date picker – `react-native-paper-dates@^0.24.1`.
  3. Category management – default + custom categories stored encrypted via `src/lib/categories.ts` and included in backups.
- **Important recent fixes** (visible in the codebase):
  - `renameCategory` now also updates every receipt whose `category` matches the old name (case‑insensitive).  
  - Mileage entry now accepts a decimal value (e.g. `12.5`) – validation in `src/lib/validation.ts` and UI in `src/screens/MileageEntryScreen.tsx`.
- **Entry point**: `src/App.tsx` mounts the policy gate, optional app lock, and the bottom‑tab navigator (`src/navigation/index.tsx`).

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

- **UI layer** – screens under `src/screens/` and shared components under `src/components/ui/`.
- **Domain layer** – pure functions (`src/lib/ocr.ts`, `src/lib/categories.ts`, `src/lib/validation.ts`, `src/lib/mileage.ts`, …) fully unit‑testable.
- **Storage layer** – `src/lib/storage/` abstracts encrypted SQLite on native (`device.native.ts`) and a plain fallback for `expo start --web` (`device.web.ts`). All data is encrypted with the key stored in `expo-secure-store`.
- **Policy gate** – `src/screens/PolicyScreen.tsx` blocks the UI until `POLICY_VERSION` is accepted.
- **No backend** – OTA updates are delivered via Expo Application Services (EAS).

---  

## Prerequisites

| Tool | Version / Install command |
|------|---------------------------|
| **Node.js** | `>=20`  `node -v` |
| **npm** | `>=10`  `npm -v` |
| **Expo CLI** | `npm i -g expo-cli` |
| **EAS CLI** (Expo Application Services) | `npm i -g eas-cli` |
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
| **Encryption key** | Runtime – stored in **expo‑secure‑store** (`src/lib/storage/device.native.ts`) | No static secret; generated on first launch. |
| **iOS signing certificate** | **EAS Secret Manager** (or locally in `eas.json`) | `eas secret:add --name IOS_DIST_CERT --value <base64‑pem>` |
| **Android keystore** | **EAS Secret Manager** | `eas secret:add --name ANDROID_KEYSTORE --value <base64‑jks>` |
| **EAS build profiles** | `eas.json` – **TODO** (see stub below) | ```json { "cli": { "version": ">=3.0.0" }, "build": { "production": { "ios": { "workflow": "managed" }, "android": { "workflow": "managed" } } } } ``` |
| **EAS OTA update URL** | `eas.json` – `updates.url` | `"updates": { "url": "https://u.expo.dev/<project-id>" }` |
| **GitHub Actions secrets** | Repo → Settings → Secrets | `EAS_TOKEN`, `APPLE_APP_SPECIFIC_PASSWORD`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. |
| **Web CSP meta tag** (if you ever enable `expo start --web`) | `public/index.html` – **TODO** | ```html <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"> ``` |
| **Runtime dependencies (new)** | `package.json` | Add `expo-text-extractor@^2.0.0` and `react-native-paper-dates@^0.24.1` (run `npm i expo-text-extractor@^2.0.0 react-native-paper-dates@^0.24.1`). |
| **CSV library** (required by security fix) | `package.json` | `npm i csv-stringify@^6.2.0` (adds proper CSV escaping). |
| **Crypto replacement** (node‑forge issue) | `package.json` – **TODO** | If `node-forge` is only a build‑time dependency, remove it. Otherwise replace with `@noble/ciphers` (`npm i @noble/ciphers@^1.0.0`). |

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
npm test                # runs all __tests__/*.test.ts, including the new category‑rename and decimal‑mileage tests

# 4️⃣ Lint & TypeScript type‑check (highly recommended)
npx eslint .            # uses repo‑wide ESLint config
npx tsc --noEmit       # ensures the TS compile succeeds

# 5️⃣ Build the optional web fallback (useful for internal QA or documentation)
expo start --web --no-dev --minify
# → Served at http://localhost:19006

# 6️⃣ Production builds for iOS & Android (via EAS)
eas build --platform ios --profile production
eas build --platform android --profile production
```

> **All tests must pass before any binary is uploaded.** The CI pipeline repeats the same commands automatically.

---  

## Deploy

### iOS & Android (App Store / Play Store)

1. **Configure `eas.json`** – replace the **TODO** stub with your real `projectId` and, if you use a custom build profile, add `distribution: "store"` and any required environment variables.

2. **Create production builds**

   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

   The CLI will:
   - Prompt for Apple/Google credentials **or** fetch them from the secret manager.
   - Use the **managed** workflow (no custom native code, so `expo-text-extractor` and `react-native-paper-dates` work out‑of‑the‑box).

3. **Submit the binaries**

   ```bash
   # iOS – upload to TestFlight first
   eas submit --platform ios --latest --type archive

   # Android – internal testing track
   eas submit --platform android --latest --type apk
   ```

   After TestFlight / Play Console approval, promote the build to production.

4. **Release to the public stores**  
   - **App Store Connect** → *Ready for Sale*  
   - **Google Play Console** → *Production* rollout

### Over‑the‑Air (OTA) updates

- Ensure OTA is enabled in `eas.json` (`"updates": { "url": "https://u.expo.dev/<project-id>" }`).  
- Publish a new JavaScript bundle whenever only UI or logic changes (no native code):

  ```bash
  eas update --branch production --message "Fix category rename, add decimal mileage, harden backup"
  ```

  Devices running the latest native binary will fetch this bundle on next launch.

### Optional web fallback

If you later decide to ship a static web version, choose one of the following CDN hosts:

| Provider | Quick steps | Notes |
|----------|-------------|-------|
| **Vercel** | Connect the repo → set `buildCommand: npm run export:web` → `outputDirectory: web-build` → add CSP meta tag (see above). | Free Hobby tier is sufficient for low traffic. |
| **Netlify** | Same as Vercel; add a `_redirects` file (`/* /index.html 200`) to force SPA routing. | Free tier includes HTTPS. |
| **Cloudflare Pages** | Deploy the `web-build` folder → configure a CSP header in the Pages dashboard. | Good for global low‑latency delivery. |

> **TODO – Production Dockerfile for web** (currently missing). Add a stub at the repo root as `Dockerfile`:

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

All items stem from the automated scan, the security review, and production hardening for this Expo app. **Check each box after fixing the issue.**  

### Dependency vulnerabilities (deployment actions)

- [ ] **`node-forge`** – CVE‑2026‑85393 (signature forgery). No fixed release yet.  
  - **Action**: Replace with `@noble/ciphers` (see *Configuration and secrets*); if only a build‑time dependency, remove it entirely.  
- [ ] **`uuid`** – upgrade to `npm i uuid@^13.0.1` (fixes CVE‑2026‑141907).  
- [ ] **`braces`** – monitor for `>=3.0.4` (CVE‑2026‑19387) or replace the glob utility.  
- [ ] **`sprintf-js`** – monitor for `>=1.1.2` (CVE‑2026‑97058) or replace with native template literals.

### Code‑level findings (must be addressed in the repo)

- [ ] **Data‑reset photo leak (high)** – `src/lib/dataReset.ts` must enumerate every stored `photoUri` (via receipt store) and delete the corresponding files with `expo-file-system` (`FileSystem.deleteAsync`) before completing the reset.  
- [ ] **Backup‑restore path traversal (medium)** – In `src/lib/backup.ts`, ignore any `photoUri` from the backup payload; always write restored images to a trusted internal directory (`FileSystem.documentDirectory`). Verify the resolved path stays within this directory.  
- [ ] **Backup‑restore size DOS (medium)** – Reject encrypted backup blobs larger than **10 MiB** *before* decryption and enforce caps of **≤ 10 000 receipts** and **≤ 5 000 mileage entries** in `validateBackupStructure`. Abort early if limits are exceeded.  
- [ ] **Backup‑passphrase brute‑force (medium)** – Implement exponential back‑off after each failed restore attempt (1 s, 2 s, 4 s, …) and lock the restore UI after **5** consecutive failures. Store the failure count in memory and reset on app restart.  
- [ ] **CSV export injection (medium)** – Replace the manual CSV builder in `src/lib/exportCsv.ts` with `csv-stringify` (already added as a dependency) to ensure proper escaping per RFC 4180.  
- [ ] **Backup temporary file cleanup (medium)** – Ensure `src/lib/backup.ts` deletes the temporary file in a `finally` block using `FileSystem.deleteAsync(tmpUri, { idempotent: true })`.  

### Production hardening (must be verified)

- [ ] **Numeric field validation** – `src/lib/validation.ts` functions are used in all entry screens; errors are displayed via `<HelperText type="error">` and the Save button is disabled until all fields are valid.  
- [ ] **Backup passphrase policy** – `BackupPassphraseScreen.tsx` displays the “≥ 12 characters” rule, validates live, and disables the “Create backup” button until satisfied.  
- [ ] **Export button throttling** – `ExportScreen.tsx` disables CSV/PDF export buttons while an export is running (`exportRunning` state).  
- [ ] **Backup structure validation** – `src/lib/backup.ts` now exports `validateBackupStructure` and restores only after the structure passes; friendly errors are shown and no data is mutated on failure.  
- [ ] **Temporary backup file deletion** – Implemented via the `finally` block in `src/lib/backup.ts`.  

---  

## Operations

| Area | What to monitor / maintain | Tools / Commands |
|------|----------------------------|------------------|
| **App version** | Keep `app.json.expo.version` in sync with store listings. | `jq .expo.version app.json` |
| **Crash reporting** | Disabled by design – ensure no third‑party SDK (e.g., Sentry) is added inadvertently. | — |
| **Backup health** | CI sanity test: create an encrypted backup, restore it, verify data integrity. | Add script `npm run test:backup` that runs the backup acceptance test (`__tests__/acceptance/m4.test.ts`). |
| **OTA updates health** | After each `eas update`, verify the `production` channel reports as healthy. | `eas update:list --branch production` |
| **Store listings** | Keep the privacy‑policy link up‑to‑date; the full text lives in `src/lib/policy.ts`. | Manual UI review before each store submission. |
| **Dependency health** | Monthly `npm audit` run; address new vulnerabilities promptly. | `npm audit && npm audit fix` |
| **Web fallback (if enabled)** | Ensure TLS (HTTPS) and CSP are active; monitor with external uptime checks. | `curl -I https://<your‑site>.com` |
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
      - run: npm test

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
      - name: Manual store submission trigger
        run: |
          echo "To submit, run the following commands (or automate them if credentials are stored in EAS secrets):"
          echo "  eas submit --platform ios --latest --type archive"
          echo "  eas submit --platform android --latest --type apk"
```

**Pipeline flow**

1. **Tests** – lint, TypeScript compilation, Jest unit & integration tests (including the new category‑rename and decimal‑mileage acceptance tests).  
2. **Builds** – managed iOS (`.ipa`) and Android (`.aab`/`.apk`) binaries via EAS.  
3. **Publish** – optional manual step; can be fully automated once signing credentials are stored in EAS Secret Manager.

---  

## Costs

| Item | Provider / Option | Approx. monthly cost (USD) |
|------|-------------------|----------------------------|
| **EAS Build (managed)** | Free tier: 100 build‑minutes/month. After that **$0.12 /min** (iOS) / **$0.10 /min** (Android). A full build ≈ 20 min per platform → **≈ $2 – $3**/month once the free quota is exhausted. | |
| **Apple Developer Program** | $99 / year → **≈ $8**/month (amortised). | |
| **Google Play Console** | One‑time $25 enrollment → negligible ongoing cost. | |
| **Optional web host** | Vercel / Netlify Hobby (free) or Pro **$20 – $45**/month for custom domain & higher bandwidth. | |
| **EAS Secret Manager** | Included with EAS service – no extra charge. | |
| **GitHub Actions** | Free for public repos; private repos get 2 000 minutes free → **$0** for this project. | |

**Bottom line:** Expect **≈ $10 – $15**/month total (dominated by the Apple Developer fee) once the app is live.

---  

## Before production

1. **Patch high‑severity dependency vulnerabilities** – replace `node-forge` (CVE‑2026‑85393) with a maintained crypto library (`@noble/ciphers`) or remove it if unused.  
2. **Fix data‑reset photo leak** – ensure `src/lib/dataReset.ts` deletes every `photoUri` file before clearing the store.  
3. **Enforce backup passphrase length** – add explicit check (`if (passphrase.length < 12) throw new Error("Passphrase must be at least 12 characters")`) in `createBackup` (and optionally `restoreBackup`).  
4. **Replace CSV generation with a safe library** – install `csv-stringify` and refactor `src/lib/exportCsv.ts` to use it.  
5. **Add robust CSV escaping** – the library handles commas, quotes, newlines, and leading characters automatically.  
6. **Implement backup size & entry‑count limits** – reject blobs > 10 MiB before decryption and enforce receipt/mileage caps in `validateBackupStructure`.  
7. **Add exponential back‑off & lockout for failed restore attempts** – store a module‑level failure counter, double the delay after each failure, and lock the UI after 5 attempts.  
8. **Delete temporary backup files after sharing** – already done via `finally` block; verify on iOS, Android, and web.  
9. **Remove any leftover insecure persistence** – ensure `src/lib/storage/device.web.ts` does **not** keep the encryption key in plain `localStorage`.  
10. **Add CSP meta tag / HTTP header for any future web deployment** (see *Configuration and secrets*).  
11. **Add production Dockerfile for web export** – replace the **TODO** stub with a real Dockerfile when the static web fallback is needed.  
12. **Finalize `eas.json`** – include correct `projectId`, `updates.url`, and any custom build‑profile settings (e.g., `distribution: "store"`).  
13. **Run a full regression suite on fresh devices** (iOS 15+ & Android 13+), covering: policy gate, biometric lock, receipt capture (including OCR flow), mileage entry (decimal miles), dashboard totals, CSV/PDF export, encrypted backup create & restore, and the “Delete all data” flow.  
14. **Update store listings** – verify the privacy‑policy link points to the latest text in `src/lib/policy.ts`; refresh screenshots to reflect the new UI (OCR button, calendar picker, category dropdown).  
15. **Run final security audit** – execute `npm audit`, `npx semgrep --config=p/ci`, and `trivy fs .` in CI; ensure the **Security checklist** is **100 %** checked.  

When **all** items above are verified and the CI pipeline passes without failures, the app is ready for production submission. 🚀
