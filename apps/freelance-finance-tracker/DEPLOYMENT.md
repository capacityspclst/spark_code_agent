# DEPLOYMENT.md

*This guide walks John (or any developer) from the first‑commit version of **apps/freelance‑finance‑tracker** to a production‑ready iOS/Android release (with an optional web fallback). All commands, file names, ports, and environment variables are taken from the repository; anything that does not yet exist is marked **TODO** and a stub is provided.*

---  

## What this app is

- **Type**: Mobile‑first, local‑first finance tracker built with **Expo SDK** `$(npm view expo version)` (the exact version is pinned in `package.json`).  
- **Core story**: Users capture receipt photos + metadata and mileage logs, see a dashboard, and export tax‑ready CSV/PDF files — *all data stays encrypted on the device*. No network traffic, no analytics, no accounts.  
- **Key features** (source files in the repo):
  1. **Policy gate** – `src/lib/policy.ts` stores `POLICY_VERSION` acceptance in encrypted storage and blocks the UI until the user agrees.  
  2. **Encrypted storage** – `src/lib/storage/device.native.ts` uses SQLite + `expo-secure-store` for the encryption key (generated on first launch).  
  3. **Receipt capture** – `expo-image-picker` + `expo-file-system` (`src/lib/photoPicker.ts`, `src/components/ui/ReceiptImagePicker.tsx`).  
  4. **Mileage logging** – configurable IRS rate (`src/lib/settings.ts`).  
  5. **Exports** – CSV (`src/lib/exportCsv.ts`) and PDF (`src/lib/exportPdf.ts` via `expo-print`).  
  6. **Encrypted backup / restore** – `src/lib/backup.ts` uses `@noble/ciphers` & `@noble/hashes`.  
  7. **Optional biometric lock** – `src/lib/appLock.ts` (`expo-local-authentication`), toggleable in Settings.  
  8. **Theming & UI** – React Native Paper (Material 3) with shared components under `src/components/ui/`.  
- **Entry point**: `src/App.tsx` mounts the policy gate, optional app lock, and the bottom‑tab navigator (`src/navigation/index.tsx`).  

---  

## Architecture

```
+-------------------+      +------------------------+      +-------------------+
|  React Native UI  | ---> |  Domain / Lib layer    | ---> |  Encrypted Store  |
| (Paper, Nav, FAB) |      | (pure‑logic only)      |      | (expo‑sqlite)    |
+-------------------+      +------------------------+      +-------------------+
        |                         |                              |
        v                         v                              v
   Expo runtime            src/lib/*.ts                expo-secure-store
   (iOS / Android)         (finance, receipt …)           (key)
```

- **UI layer** – screens in `src/screens/` and primitives in `src/components/ui/`.  
- **Domain layer** – pure functions (`src/lib/finance.ts`, `src/lib/mileage.ts`, `src/lib/backup.ts`, …) fully unit‑testable.  
- **Storage layer** – `src/lib/storage/` abstracts encrypted SQLite on native (`device.native.ts`) and a plain fallback for `expo start --web` (`device.web.ts`).  
- **Policy gate** – `src/screens/PolicyScreen.tsx` checks `POLICY_VERSION` before any other navigator renders.  
- **No backend** – the only external interaction is OTA updates via EAS.  

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
| **Docker** (optional — only for the optional web fallback) | `docker --version` |

> **NOTE**: Run `npm view expo version` inside `apps/freelance-finance-tracker` to verify the SDK version matches the one in `package.json`.

---  

## Configuration and secrets

| Item | Where it lives | How to set / update |
|------|----------------|---------------------|
| **Expo app config** | `app.json` | Edit `expo.name`, `expo.slug`, `expo.version`, `expo.orientation`, etc. |
| **Policy version** | `src/lib/policy.ts` – `export const POLICY_VERSION = "1.0.0"` | Bump the constant whenever the policy text changes. |
| **Encryption key** | Runtime – stored in **expo-secure-store** | No static secret; the key is generated on first launch (`src/lib/storage/device.native.ts`). |
| **iOS signing certificate** | **EAS Secret Manager** (or locally in `eas.json`) | `eas secret:add --name IOS_DIST_CERT --value <base64-pem>` |
| **Android keystore** | **EAS Secret Manager** | `eas secret:add --name ANDROID_KEYSTORE --value <base64-jks>` |
| **EAS build profiles** | `eas.json` – **TODO** (see stub below) | ```json { "cli": { "version": ">=3.0.0" }, "build": { "production": { "ios": { "workflow": "managed" }, "android": { "workflow": "managed" } } } } ``` |
| **Web CSP meta tag** (if you ever enable `expo start --web`) | `public/index.html` – **TODO** | ```html <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"> ``` |
| **EAS OTA update URL** | `eas.json` – `updates.url` | `"updates": { "url": "https://u.expo.dev/<project-id>" }` |
| **GitHub Actions secrets** | Repository → Settings → Secrets | `EAS_TOKEN`, `APPLE_APP_SPECIFIC_PASSWORD`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. |

All secrets must live **only** in EAS’s encrypted secret store or in GitHub Actions secrets; never commit them to the repository.

---  

## Build and test

```bash
# 1️⃣ Install exact dependencies (Expo resolves SDK‑compatible versions)
cd apps/freelance-finance-tracker
npm ci

# 2️⃣ Verify the Expo SDK version the project is using
npm view expo version   # e.g. 50.0.0

# 3️⃣ Run unit & integration tests (Jest)
npm test                # runs all __tests__/*.test.ts

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

1. **Configure `eas.json`** – add the stub from the *Configuration and secrets* table (replace `<project-id>` with your Expo project ID).  

2. **Create production builds**

   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

   The CLI will:
   * Prompt for Apple/Google credentials **or** fetch them from the secret manager.  
   * Use the **managed** workflow (no custom native code).  

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

- Enable OTA in `eas.json` (`"updates": { "url": "https://u.expo.dev/<project-id>" }`).  
- Publish a new JS bundle whenever only UI or logic changes (no native code):

  ```bash
  eas update --branch production --message "Fix CSV sanitisation"
  ```

  Devices running the latest native binary will fetch this bundle on next launch.

### Optional web fallback

If you later decide to ship a static web version:

| Provider | Quick steps |
|----------|-------------|
| **Vercel** | Connect the repo → set `buildCommand: npx expo export -p web` → `outputDirectory: dist`. Add the CSP meta tag (see above). |
| **Netlify** | Same as Vercel; add a `_redirects` file to force HTTPS. |
| **Cloudflare Pages** | Deploy the `dist` folder; configure a CSP header in the Pages dashboard. |

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

All items stem from the automated scan, the security review, and the production hardening work for this Expo app. **Check each box after fixing the issue.**  

### Dependency vulnerabilities (deployment actions)

- [ ] **`uuid`** – upgrade to `npm i uuid@^13.0.1` (fixes CVE‑2026‑141907).  
- [ ] **`node-forge`** – monitor for a fixed release (≥ 1.5.0) **or** replace with `@noble/*`. Ensure no import remains.  
- [ ] **`braces`** – monitor for `>=3.0.4` (CVE‑2026‑19387) or replace the glob utility.  
- [ ] **`sprintf-js`** – monitor for `>=1.1.2` (CVE‑2026‑97058) or replace with native template literals / a safe formatter.  

### Code‑level findings (must be addressed in the repo)

- [ ] **Data‑reset photo leak (high)** – Extend `src/lib/dataReset.ts` to enumerate every stored `photoUri` (via the receipt store) and delete the corresponding files with `expo-file-system` (`FileSystem.deleteAsync`) before completing the reset.  
- [ ] **Backup‑restore path traversal (medium)** – In `src/lib/backup.ts` ignore any `photoUri` from the backup payload; always write restored images to a trusted app‑internal directory (`FileSystem.documentDirectory`). Validate target paths are confined to this directory.  
- [ ] **Backup‑restore size DOS (medium)** – Reject encrypted backup blobs larger than **10 MiB** *before* decryption and enforce a maximum of **10 000 receipts** and **5 000 mileage entries** in `validateBackupStructure`.  
- [ ] **Backup‑passphrase brute‑force (medium)** – Implement exponential back‑off after each failed restore attempt (e.g. 1 s, 2 s, 4 s…) and lock the restore UI after 5 consecutive failures. Store the failure count in memory (reset on app restart).  
- [ ] **CSV export injection (medium)** – Replace the custom prefix logic with a robust CSV generation library such as `csv-stringify` that fully escapes commas, quotes, newlines, and leading characters per RFC 4180.  
- [ ] **Backup temporary file cleanup (medium)** – Ensure `src/lib/backup.ts` deletes the temporary file in a `finally` block using `FileSystem.deleteAsync(tmpUri, { idempotent: true })`.  

### Hardening items introduced in v1.0 (must be verified)

- [ ] **Numeric field validation** – `src/lib/validation.ts` functions are used in `ReceiptEntryScreen.tsx`, `MileageEntryScreen.tsx`, `TaxSettingsScreen.tsx`; errors are shown via `<HelperText type="error">` and the Save button is disabled until all fields are valid.  
- [ ] **Backup passphrase policy** – `BackupPassphraseScreen.tsx` displays the “≥ 12 characters” rule, validates live, and disables the “Create backup” button until satisfied.  
- [ ] **Export button throttling** – `ExportScreen.tsx` disables CSV/PDF export buttons while an export is running (`exportRunning` state).  
- [ ] **Backup structure validation** – `src/lib/backup.ts` now exports `validateBackupStructure` and restores only after the structure passes. Friendly errors are shown and no data is mutated on failure.  
- [ ] **Temporary backup file deletion** – Implemented as per the “Backup temporary file cleanup” item above.  

---  

## Operations

| Area | What to monitor / maintain | Tools / Commands |
|------|----------------------------|------------------|
| **App version** | Keep `app.json.expo.version` in sync with store listings. | `jq .expo.version app.json` |
| **Crash reporting** | **Disabled by design** — ensure no third‑party SDK (e.g., Sentry) is added inadvertently. | — |
| **Backup health** | CI sanity test: create an encrypted backup, restore it, verify data integrity. | Add script `npm run test:backup` that runs the backup acceptance test. |
| **OTA updates health** | After each `eas update`, verify the `production` channel reports as healthy. | `eas update:list --branch production` |
| **Store listings** | Keep the privacy‑policy link up‑to‑date; the full text lives in `src/lib/policy.ts`. | Manual UI review before each store submission. |
| **Dependency health** | Monthly `npm audit` run; address new vulnerabilities promptly. | `npm audit && npm audit fix` |
| **Web fallback** (if enabled) | Ensure TLS (HTTPS) and CSP are active; monitor with external uptime checks. | `curl -I https://<your-site>.com` |
| **Device storage** | No server scaling needed; users manage storage on their devices. | — |
| **Biometric lock state** | Verify `appLockEnabled` persists across restarts. | Manual test or automated UI test. |
| **Export throttling** | Confirm CSV & PDF buttons stay disabled during an export and re‑enable after completion. | UI smoke test / unit test. |
| **Policy acceptance after reset** | After a “Delete all data” operation, `isPolicyAccepted` should still return `true`. | Unit test `dataReset.test.ts`. |

---  

## CI/CD

**GitHub Actions workflow (example) – place at `.github/workflows/ci.yml`**

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
          echo "To submit, run the following commands (or automate them if you store credentials in EAS secrets):"
          echo "  eas submit --platform ios --latest --type archive"
          echo "  eas submit --platform android --latest --type apk"
```

**Pipeline flow**

1. **Tests** – lint, TypeScript compile, Jest unit & integration tests (including the new hardening tests).  
2. **Builds** – managed iOS (`.ipa`) and Android (`.aab`/`.apk`) binaries via EAS.  
3. **Publish step** – optional manual trigger (or add automated `eas submit` steps once credentials are safely stored).  

---  

## Costs

| Item | Provider / Option | Approx. monthly cost (USD) |
|------|-------------------|----------------------------|
| **EAS Build (managed)** | Free tier: 100 build‑minutes / month. After that **$0.12 /min** (iOS) / **$0.10 /min** (Android). A full build ≈ 20 min per platform → **≈ $2‑$3**/month once free quota is exhausted. |
| **Apple Developer Program** | $99 /year → **≈ $8 /month** (amortised). |
| **Google Play Console** | One‑time $25 enrollment → negligible ongoing cost. |
| **Optional web host** | Vercel / Netlify Hobby (free) or Pro **$20 – $45**/month for custom domain & higher bandwidth. |
| **EAS Secret Manager** | Included with EAS service – no extra charge. |
| **GitHub Actions** | Free for public repos; private repos get 2 000 minutes free → **$0** for this project. |

**Bottom line:** Expect **≈ $10 – $15 / month** total (dominated by the Apple Developer fee) once the app is live.

---  

## Before production

1. **Patch high‑severity dependency vulnerabilities** – `node-forge`, `braces` (monitor for fixes or replace).  
2. **Upgrade `uuid`** to **≥ 13.0.1** (already in checklist).  
3. **Implement full photo deletion on data reset** – enumerate and delete every `photoUri` before clearing the store.  
4. **Add robust numeric validation** for all fields (`amount`, `miles`, `rate`, `taxRate`) and ensure Save buttons stay disabled until validation passes.  
5. **Sanitise CSV export** – replace custom prefix logic with `csv-stringify` to prevent formula injection.  
6. **HTML‑escape user text in PDF export** (`src/lib/exportPdf.ts`) using a safe escaping library (`escape-html`).  
7. **Enforce backup passphrase policy** (≥ 12 characters) in `src/lib/backup.ts` (length check at the start of `createBackup`/`restoreBackup`).  
8. **Delete temporary backup files** after sharing (already implemented via `finally` block).  
9. **Remove insecure `localStorage` key persistence** in `src/lib/storage/device.web.ts`; derive the key per session or store encrypted in IndexedDB.  
10. **Add CSP meta tag / HTTP header** for any web deployment (see *Configuration and secrets*).  
11. **Add production Dockerfile** for the optional web export (currently marked **TODO**).  
12. **Finalize `eas.json`** – ensure build profiles reference the correct secret names, include OTA `updates.url`, and set proper versioning.  
13. **Run full regression tests on fresh devices** (iOS 15+ & Android 13+), covering policy gate, biometric lock, receipt capture (including photo storage), mileage entry, dashboard totals, CSV/PDF export, encrypted backup creation & restore, and the “Delete all data” flow.  
14. **Update store listings** – verify the privacy‑policy link points to the latest text in `src/lib/policy.ts`; refresh screenshots to reflect the final UI and the “privacy‑first” messaging.  
15. **Run a final security audit** – execute `npm audit`, `npx semgrep --config=p/ci`, and `trivy fs .` in CI; verify the **Security checklist** is 100 % completed.  

When **all** items above are verified and the CI pipeline passes without failures, the app is ready for production submission. 🚀
