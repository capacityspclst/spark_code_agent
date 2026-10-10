# DEPLOYMENT.md

*This guide walks John (or any developer) from the first‑commit version of **apps/freelance-finance-tracker** to a production‑ready iOS/Android release (with an optional web fallback). All commands, file names, ports, and environment variables are taken from the repository; anything that does not yet exist is marked **TODO** and a stub is provided.*

---  

## What this app is

- **Type**: Mobile‑first, local‑first finance tracker built with **Expo SDK** `$(npm view expo version)` (the exact version is pinned in `package.json`).  
- **Core story**: Users capture receipt photos + metadata and mileage logs, see a summary dashboard, and export tax‑ready CSV/PDF files — *all data stays encrypted on the device*. No network traffic, no analytics, no accounts.  
- **Implemented features** (source files in the repo):  
  1. **Policy gate** – `src/lib/policy.ts` stores `POLICY_VERSION` acceptance in encrypted storage and blocks the UI until the user agrees.  
  2. **Encrypted storage** – `src/lib/storage/device.native.ts` uses SQLite + `expo-secure-store` for the encryption key.  
  3. **Receipt capture** – `expo-image-picker` + `expo-file-system` (`src/lib/photoPicker.ts`, `src/components/ui/ReceiptImagePicker.tsx`).  
  4. **Mileage logging** – configurable IRS rate (`src/lib/settings.ts`).  
  5. **Exports** – CSV (`src/lib/exportCsv.ts`) and PDF (`src/lib/exportPdf.ts` via `expo-print`).  
  6. **Encrypted backup/restore** – `src/lib/backup.ts` uses `@noble/ciphers` & `@noble/hashes`.  
  7. **Optional biometric lock** – `src/lib/appLock.ts` (`expo-local-authentication`), toggleable in Settings.  
  8. **Theming & UI** – React Native Paper (Material 3) with shared components under `src/components/ui/`.  

---  

## Architecture

```
+-------------------+      +------------------------+      +-------------------+
|  React Native UI  | ---> |  Domain / Lib layer    | ---> |  Encrypted Store  |
|  (Paper, Nav)    |      |  (pure‑logic only)     |      |  (expo‑sqlite)    |
+-------------------+      +------------------------+      +-------------------+
        |                         |                              |
        v                         v                              v
   Expo runtime            src/lib/*.ts               expo-secure-store
   (iOS / Android)           (finance, receipt…)            (key)
```

- **UI layer** – screens in `src/screens/` and visual primitives in `src/components/ui/`.  
- **Domain layer** – pure functions (`src/lib/finance.ts`, `src/lib/mileage.ts`, …) fully unit‑testable.  
- **Storage layer** – `src/lib/storage/` abstracts encrypted SQLite on native and a plain fallback for `expo start --web`.  
- **Policy gate** – `src/screens/PolicyScreen.tsx` checks the stored version before rendering any other navigation.  
- **No backend** – all data stays on the device; the only external interaction is OTA updates via EAS.

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
| **Docker** (optional – only if you later host a web export) | `docker --version` |

> **NOTE**: Run `npm view expo version` inside `apps/freelance-finance-tracker` to verify the SDK version matches the one in `package.json`.

---  

## Configuration and secrets

| Item | Where it lives | How to set / update |
|------|----------------|---------------------|
| **Expo app config** | `app.json` (already present) | Edit `expo.name`, `expo.slug`, `expo.version`, `expo.orientation`, etc. |
| **Policy version** | `src/lib/policy.ts` – `export const POLICY_VERSION = "1.0.0"` | Bump the constant whenever the policy text changes. |
| **Encryption key** | Runtime – stored in **expo‑secure‑store** | No static secret; the key is generated on first launch and persisted automatically. |
| **iOS signing certificate** | **EAS Secret Manager** (or locally in `eas.json`) | `eas secret:add --name IOS_DIST_CERT --value <base64‑pem>` |
| **Android keystore** | **EAS Secret Manager** | `eas secret:add --name ANDROID_KEYSTORE --value <base64‑jks>` |
| **EAS build profiles** | `eas.json` – **TODO** (see stub below) | ```json { "cli": { "version": ">=3.0.0" }, "build": { "production": { "ios": { "workflow": "managed" }, "android": { "workflow": "managed" } } } } ``` |
| **Web CSP meta tag** (if you ever enable `expo start --web`) | `public/index.html` – **TODO** | ```html <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"> ``` |
| **EAS OTA update URL** | `eas.json` – `updates.url` | `"updates": { "url": "https://u.expo.dev/<project-id>" }` |

All secrets must be stored **only** in EAS’s encrypted secret store or in GitHub Actions secrets; never commit them to the repository.

---  

## Build and test

```bash
# 1️⃣ Install exact dependencies (Expo will resolve SDK‑compatible versions)
cd apps/freelance-finance-tracker
npm ci

# 2️⃣ Verify the Expo SDK version the project is using
npm view expo version   # e.g. 50.0.0

# 3️⃣ Run unit & integration tests (Jest)
npm test                # runs all __tests__/*.test.ts

# 4️⃣ Lint & TypeScript type‑check (highly recommended)
npx eslint .            # uses repo‑wide ESLint config
npx tsc --noEmit       # ensure the TS compile succeeds

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
   * Use the managed workflow (no custom native code).

3. **Submit the binaries**

   ```bash
   # iOS – upload to TestFlight first
   eas submit --platform ios --latest --type archive

   # Android – internal testing track
   eas submit --platform android --latest --type apk
   ```

   After TestFlight / Play Console approval, promote the build to production.

4. **Release to the public stores**  
   * **App Store Connect** → *Ready for Sale*.  
   * **Google Play Console** → *Production* rollout.

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
|----------|--------------|
| **Vercel** | Connect the repo → set `buildCommand: npx expo export -p web` → `outputDirectory: dist`. Add the CSP meta tag (see above). |
| **Netlify** | Same as Vercel; add a `_redirects` file to force HTTPS. |
| **Cloudflare Pages** | Deploy the `dist` folder; configure a CSP header in the Pages dashboard. |

> **TODO – Production Dockerfile for web** (currently missing). Add a stub at the repo root as `Dockerfile`:

```dockerfile
# TODO: production Dockerfile for web export
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npx expo export -p web   # ensure script "expo export -p web" exists in package.json

FROM nginx:alpine
COPY --from=builder /app/web-build /usr/share/nginx/html
# TODO: add CSP header via nginx.conf
```

---  

## Security checklist

All items stem from the automated scan, the security review, and best‑practice hardening for a local‑first Expo app. **Check each box after fixing the issue.**

- [ ] **Upgrade vulnerable dependencies**  
  - `uuid` → `npm i uuid@^13.0.1` (fixes out‑of‑bounds write).  
  - `node‑forge` → monitor for `>=1.5.0` **or** replace `expo-crypto` with `@noble/*`.  
  - `braces` → monitor for `>=3.0.4`.  
  - `sprintf‑js` → monitor for `>=1.1.2`.  

- [ ] **Add robust input validation** (`src/screens/ReceiptEntryScreen.tsx`, `src/screens/MileageEntryScreen.tsx`)  
  - `amount` must be numeric > 0, max 9 digits with two decimal places.  
  - `miles`, `rate`, `taxRate` must be numeric ≥ 0 and capped at 1,000,000.  

- [ ] **Sanitise CSV export** (`src/lib/exportCsv.ts`) – prefix a single quote (`'`) to any field starting with `= + - @` or wrap all fields in double quotes with proper escaping (e.g., using `csv-stringify`).  

- [ ] **Escape user text in PDF HTML** (`src/lib/exportPdf.ts`) – HTML‑escape every interpolated string (use `escape-html` or similar).  

- [ ] **Enforce backup passphrase policy** (`src/screens/BackupPassphraseScreen.tsx`) – require ≥ 8 characters and at least three of four character classes (upper, lower, digit, symbol); disable “Create backup” until satisfied.  

- [ ] **Delete temporary backup files** (`src/lib/backup.ts`) – after `expo-sharing` succeeds, call `FileSystem.deleteAsync(tmpPath, { idempotent: true })`. Optionally overwrite before deletion.  

- [ ] **Web fallback key storage** (`src/lib/storage/device.web.ts`) – **DO NOT** persist the raw encryption key in `localStorage`. Derive the key from the passphrase each session (or store encrypted in IndexedDB).  

- [ ] **Add Content‑Security‑Policy** header / meta tag for any web host (see *Configuration and secrets*).  

- [ ] **Health‑check for containerised web service** – if the Dockerfile is added, include `HEALTHCHECK CMD curl -f http://localhost/ || exit 1`.  

- [ ] **Disable React Native Paper debug flags** – in `app.json` ensure `"updates": { "enabled": true, "checkAutomatically": "ON_LOAD" }` and remove any `dangerouslyGetPalette` usage in production code.  

- [ ] **Run security audits before each release** – `npm audit`, `npx semgrep --config=p/ci`, `trivy fs .` (add to CI).  

- [ ] **Verify policy gate** – `src/lib/policy.ts` must store both version **and** acceptance date; test with `npm test __tests__/template/policy.test.ts`.  

- [ ] **Confirm biometric lock respects opt‑in** – `src/lib/appLock.ts` should only invoke `expo-local-authentication` when `appLockEnabled` is true (checked in `src/App.tsx`).  

- [ ] **Export throttling** – disable Export buttons while an export job is in progress and enforce a minimum 5 s interval between successive exports (`src/lib/exportCsv.ts` & `src/lib/exportPdf.ts`).  

- [ ] **Record‑count limits** – enforce caps in `src/lib/storage/store.ts` (e.g., max 10,000 receipts, max 5,000 mileage entries) and surface a friendly “limit reached” UI.  

- [ ] **Image‑size validation** (`src/lib/photoPicker.ts`) – limit `quality`, `maxWidth`/`maxHeight`; reject or downscale images > 5 MB (`FileSystem.getInfoAsync`).  

- [ ] **Delete encryption key on full data wipe** (`src/lib/dataReset.ts`) – call `SecureStore.deleteItemAsync(KEY_NAME)` when “Delete all data” is confirmed.  

- [ ] **Backup temporary file cleanup** – already covered above (temporary file deletion).  

---  

## Operations

| Area | What to monitor / maintain | Tools / Commands |
|------|----------------------------|------------------|
| **App version** | Keep `app.json.expo.version` in sync with store listings. | `jq .expo.version app.json` |
| **Crash reporting** | **Disabled by design** – ensure no third‑party SDK (e.g., Sentry) is added inadvertently. | – |
| **Backup health** | CI sanity test: create an encrypted backup, restore it, verify data integrity. | Add script `npm run test:backup` that runs the backup acceptance test. |
| **OTA updates health** | After each `eas update`, verify the `production` channel reports as healthy. | `eas update:list --branch production` |
| **Store listings** | Keep the privacy‑policy link up‑to‑date; the full text lives in `src/lib/policy.ts`. | Manual UI review before each store submission. |
| **Dependency health** | Monthly `npm audit` run; address new vulnerabilities promptly. | `npm audit && npm audit fix` |
| **Web fallback** (if enabled) | Ensure TLS (HTTPS) and CSP are active; monitor with external uptime checks. | `curl -I https://<your‑site>.com` |
| **Device storage** | No server scaling needed; users manage storage on their devices. | – |
| **Biometric lock state** | Verify `appLockEnabled` persists across app restarts. | Manual test or automated UI test. |

---  

## CI/CD

**GitHub Actions workflow (example)** – place at `.github/workflows/ci.yml`:

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
          echo "To submit, go to the EAS dashboard or trigger a manual workflow that runs:"
          echo "  eas submit --platform ios --latest --type archive"
          echo "  eas submit --platform android --latest --type apk"
```

The pipeline:

1. **Tests** – lint, TypeScript check, Jest unit & integration tests.  
2. **Builds** – managed iOS (`.ipa`) and Android (`.aab`/`.apk`) binaries via EAS.  
3. **Publish step** – echoes manual submission commands; replace with a fully‑automated `eas submit` step if you store credentials in EAS secrets.

---  

## Costs

| Item | Provider / Option | Approx. monthly cost (USD) |
|------|-------------------|----------------------------|
| **EAS Build (managed)** | Free tier: 100 build‑minutes / month. After that **$0.12 /min** for iOS, **$0.10 /min** for Android. A full build ≈ 20 min per platform → **≈ $2‑$3**/month once free quota is exhausted. |
| **Apple Developer Program** | $99 per year → **≈ $8 /month** (amortised). |
| **Google Play Console** | One‑time $25 enrollment → negligible ongoing cost. |
| **Optional web host** | Vercel / Netlify Hobby (free) or Pro plans **$20‑$45** / month for custom domain, analytics, higher bandwidth. |
| **Secret storage (EAS)** | Included with the EAS service – no extra charge. |
| **CI (GitHub Actions)** | Free for public repos; private repos get 2 000 minutes free – **$0** for this project. |

**Bottom line:** Expect **≈ $10‑$15 / month** total (dominated by the Apple Developer fee) once the app is live.

---  

## Before production

1. **Patch high‑severity dependency vulnerabilities** – monitor and upgrade `node-forge`, `braces`, and `sprintf-js` as soon as secure releases appear, or replace them with audited alternatives (`@noble/*`).  
2. **Upgrade `uuid`** to **≥ 13.0.1** (already listed in the security checklist).  
3. **Implement robust input validation** for all numeric fields (`amount`, `miles`, `rate`, `taxRate`) and enforce upper bounds; disable the Save button until validation passes.  
4. **Sanitise CSV export** to prevent formula injection (escape leading `= + - @` or quote all fields).  
5. **HTML‑escape user text in PDF export** (`src/lib/exportPdf.ts`).  
6. **Enforce backup passphrase policy** (≥ 8 characters & three character classes).  
7. **Delete temporary backup files** after sharing (`FileSystem.deleteAsync`).  
8. **Remove `localStorage` key persistence** in the web fallback (`src/lib/storage/device.web.ts`).  
9. **Add CSP meta tag or server header** for any web deployment (see *Configuration and secrets*).  
10. **Add the production Dockerfile** for the optional web export (currently marked **TODO**).  
11. **Finalize `eas.json`** – ensure build profiles reference the correct secret names, include OTA `updates.url`, and set proper versioning.  
12. **Run full regression tests on fresh devices** (iOS 15+ & Android 13+), covering:
    - Policy gate on first launch and after a version bump.  
    - Biometric lock toggle & authentication flow.  
    - Receipt capture (camera & photo‑library fallback) with photo storage.  
    - Mileage entry & deduction calculation.  
    - Dashboard totals & recent‑activity list.  
    - CSV & PDF export via native share sheet.  
    - Encrypted backup creation, passphrase‑protected restore, integrity checks.  
    - “Delete all data” confirmation flow.  
13. **Update store listings** – ensure the privacy‑policy link points to the latest text in `src/lib/policy.ts`; refresh screenshots to reflect the final UI and the “privacy‑first” messaging.  
14. **Run a final security audit** – execute `npm audit`, `npx semgrep --config=p/ci`, and `trivy fs .` in CI; verify that the **Security checklist** is 100 % completed.

When all items above are verified and the CI pipeline passes without failures, the app is ready for production submission. 🚀
