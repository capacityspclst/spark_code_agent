# DEPLOYMENT.md

*This guide walks John (or any developer) from the first‑commit version of **apps/freelance-finance-tracker** to a production‑ready iOS/Android release (with an optional web fallback). All commands, file names, ports, and environment variables are taken from the repository; anything that does not yet exist is marked **TODO** and a stub is provided.*  

---  

## What this app is

- **Type**: Mobile‑first, local‑first finance tracker built with **Expo SDK **`$(npm view expo version)` (current SDK version is pinned in `package.json`).  
- **Core story**: Users capture receipt photos + metadata and mileage logs, view a summary dashboard, and export tax‑ready CSV/PDF files—all stored **encrypted on‑device**. No network traffic, no analytics, no accounts.  
- **Key features** (implemented in the repo):
  1. **Policy gate** – `src/lib/policy.ts` stores `POLICY_VERSION` acceptance in encrypted storage and blocks the UI until the user agrees.
  2. **Encrypted storage** – `src/lib/storage/device.native.ts` uses SQLite + `expo-secure-store` for the encryption key.
  3. **Receipt capture** – `expo-image-picker` + `expo-file-system` (`src/lib/photoPicker.ts`, `src/components/ui/ReceiptImagePicker.tsx`).
  4. **Mileage logging** – configurable IRS rate (`src/lib/settings.ts`).
  5. **Exports** – CSV (`src/lib/exportCsv.ts`) and PDF (`src/lib/exportPdf.ts` via `expo-print`).
  6. **Encrypted backup/restore** – `src/lib/backup.ts` uses `@noble/ciphers` & `@noble/hashes`.
  7. **Optional biometric lock** – `src/lib/appLock.ts` (`expo-local-authentication`), toggleable in Settings.
  8. **Theming & UI** – React Native Paper (Material 3) with shared components under `src/components/ui/`.

---  

## Architecture

```
+-------------------+      +------------------------+      +-------------------+
|  React Native UI  | ---> |  Domain / Lib layer    | ---> |  Encrypted Store  |
|  (Paper, Nav)    |      |  (pure‑logic only)     |      |  (expo-sqlite)    |
+-------------------+      +------------------------+      +-------------------+
        |                         |                              |
        v                         v                              v
   Expo runtime            src/lib/*.ts               expo-secure-store
   (iOS / Android)           (finance, receipt…)            (key)
```

- **UI layer** – screens in `src/screens/` and visual components in `src/components/ui/`.  
- **Domain layer** – pure functions (`src/lib/finance.ts`, `src/lib/mileage.ts`, etc.) – fully unit‑testable.  
- **Storage layer** – `src/lib/storage/` abstracts encrypted SQLite on native and a plain fallback for `expo start --web`.  
- **Policy gate** – `src/screens/PolicyScreen.tsx` checks the version stored via the store before rendering any other navigation.  
- **No backend** – all data stays on the device; the only external interaction is OTA updates via EAS.

---  

## Prerequisites

| Tool | Version / Install command |
|------|---------------------------|
| **Node.js** | `>= 20` `node -v` |
| **npm** | `>= 10` `npm -v` |
| **Expo CLI** | `npm i -g expo-cli` |
| **EAS CLI** (Expo Application Services) | `npm i -g eas-cli` |
| **Apple Developer account** | Needed for iOS signing |
| **Google Play Console account** | Needed for Android signing |
| **Java JDK 11+** (Android builds) | `brew install openjdk@11` (macOS) |
| **Xcode 15+** (iOS builds) | Required on macOS |
| **Git** | `git --version` |
| **Docker** (optional – only if you later host a web export) | `docker --version` |

> **NOTE**: Run `npm view expo version` inside the project root to verify the SDK version matches the one in `package.json`.

---  

## Configuration and secrets

| Item | Where it lives | How to set / update |
|------|----------------|---------------------|
| **Expo app config** | `app.json` (already present) | Edit `expo.name`, `expo.slug`, `expo.version`, `expo.orientation`, etc. |
| **Policy version** | `src/lib/policy.ts` – `export const POLICY_VERSION = "1.0.0"` | Bump the constant whenever the policy text changes. |
| **Encryption key** | Runtime – stored in **expo‑secure‑store** | No static secret; the key is generated on first launch and persisted automatically. |
| **iOS signing certificate** | **EAS Secret Manager** (or locally in `eas.json`) | `eas secret:add --name IOS_DIST_CERT --value <base64‑pem>` |
| **Android keystore** | **EAS Secret Manager** | `eas secret:add --name ANDROID_KEYSTORE --value <base64‑jks>` |
| **EAS build profiles** | `eas.json` – **TODO** (see stub below) | ```json\n{\n  \"cli\": { \"version\": \">= 3.0.0\" },\n  \"build\": {\n    \"production\": {\n      \"ios\": { \"workflow\": \"managed\" },\n      \"android\": { \"workflow\": \"managed\" }\n    }\n  }\n}\n``` |
| **Web CSP meta tag** (if you ever enable `expo start --web`) | `public/index.html` – **TODO** | ```html\n<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;\">\n``` |
| **EAS update URL** | `eas.json` – `updates.url` | `"updates": { "url": "https://u.expo.dev/<project-id>" }` |

All secrets must be stored **only** in EAS’s encrypted secret store or in GitHub Actions secrets; never commit them.

---  

## Build and test

```bash
# 1️⃣  Install exact dependencies (Expo will resolve SDK‑compatible versions)
cd apps/freelance-finance-tracker
npm ci

# 2️⃣  Verify the Expo SDK version the project is using
npm view expo version   # e.g. 50.0.0

# 3️⃣  Run unit & integration tests (Jest)
npm test                # runs all __tests__/*.test.ts

# 4️⃣  Lint & TypeScript type‑check (optional but recommended)
npx eslint .            # uses repo‑wide ESLint config
npx tsc --noEmit       # ensure the TS compile succeeds

# 5️⃣  Build the optional web fallback (useful for internal QA or docs)
expo start --web --no-dev --minify
#    → Served at http://localhost:19006

# 6️⃣  Production builds for iOS & Android (via EAS)
eas build --platform ios --profile production
eas build --platform android --profile production
```

> **All tests must pass before any build is uploaded.** The CI pipeline (see later) runs the same commands automatically.

---  

## Deploy

### iOS & Android (App Store / Play Store)

1. **Configure `eas.json`** – add the stub from the *Configuration and secrets* table (replace `<project-id>` with your Expo project ID).  
2. **Create a production build**  

   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

   The CLI will:
   * Prompt for Apple/Google credentials **or** fetch them from the secret manager.
   * Use the native managed workflow (no custom native code).

3. **Submit the binaries**  

   ```bash
   # iOS – upload to TestFlight first
   eas submit --platform ios --latest --type archive

   # Android – internal testing track
   eas submit --platform android --latest --type apk
   ```

   After approval in TestFlight / Play Console, promote the build to production.

4. **Release to the public stores**  
   * App Store Connect → “Ready for Sale”.  
   * Google Play Console → “Production” rollout.

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
| **Vercel** | Connect repository → set `buildCommand: npx expo export -p web` → `outputDirectory: dist`. Add the CSP meta tag (see above). |
| **Netlify** | Same as Vercel; add a `_redirects` file to force HTTPS. |
| **Cloudflare Pages** | Deploy the `dist` folder; configure a CSP header in the Pages dashboard. |

> **TODO – Production Dockerfile for web** (currently missing). Add a stub to the repo root as `Dockerfile`:

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

All items stem from the automated scan, the security review, and best‑practice hardening for a local‑first Expo app.

- [ ] **Upgrade vulnerable dependencies**  
  - `uuid` → `npm i uuid@^13.0.1` (fixes out‑of‑bounds write).  
  - `node-forge` → monitor for `>=1.5.0`.  
  - `braces` → monitor for `>=3.0.4`.  
  - `sprintf-js` → monitor for `>=1.1.2`.  

- [ ] **Add robust input validation**  
  - `src/screens/ReceiptEntryScreen.tsx`: `amount` must be numeric > 0, max 9 digits.  
  - `src/screens/MileageEntryScreen.tsx`: `miles` and `rate` must be numeric ≥ 0.  

- [ ] **Sanitise CSV export** (prevent formula injection) – escape leading `= + - @`, wrap every field in double quotes, double‑escape internal quotes (use `csv-stringify` or custom logic).  

- [ ] **Escape user text in PDF HTML** – ensure `src/lib/exportPdf.ts` HTML‑escapes all interpolated strings.  

- [ ] **Enforce backup passphrase policy** – require ≥ 8 characters and at least three character classes before enabling “Create backup”.  

- [ ] **Delete temporary backup files** – after `expo-sharing` succeeds, call `FileSystem.deleteAsync(tmpPath)` in `src/lib/backup.ts`.  

- [ ] **Web fallback key storage** – do **not** persist the encryption key in `localStorage`; either disable web export for production or derive the key from a user‑entered passphrase at runtime.  

- [ ] **Add Content‑Security‑Policy** header / meta tag for any web host (see *Configuration and secrets*).  

- [ ] **Health‑check for containerised web service** – if you add the Dockerfile, include `HEALTHCHECK CMD curl -f http://localhost/ || exit 1`.  

- [ ] **Disable React Native Paper debug flags** – in `app.json` ensure `"updates": { "enabled": true, "checkAutomatically": "ON_LOAD" }` and no `dangerouslyGetPalette` usage in production.  

- [ ] **Run security audits before each release** – `npm audit`, `npx semgrep --config=p/ci`, `trivy fs .` (add to CI).  

- [ ] **Verify policy gate** – `src/lib/policy.ts` must store both version **and** accept date; test with `npm test __tests__/template/policy.test.ts`.  

- [ ] **Confirm biometric lock respects user opt‑in** – `src/lib/appLock.ts` should only invoke `expo-local-authentication` when `appLockEnabled` is true (checked in `src/App.tsx`).  

---  

## Operations

| Area | What to monitor / maintain | Tools / Commands |
|------|----------------------------|------------------|
| **App version** | Keep `app.json.expo.version` in sync with store listings. | `jq .expo.version app.json` |
| **Crash reporting** | **Disabled by design** – ensure no third‑party SDK (e.g., Sentry) is added inadvertently. | — |
| **Backup health** | Run a sanity test on CI: create an encrypted backup, restore it, verify data integrity. | Add script `npm run test:backup` that executes `__tests__/acceptance/m4.test.ts` (or similar). |
| **OTA updates health** | After each `eas update`, verify the `production` channel reports as healthy. | `eas update:list --branch production` |
| **Store listings** | Keep the privacy‑policy link up‑to‑date; the full text lives in `src/lib/policy.ts`. | Manual UI review before each store submission. |
| **Dependency health** | Schedule a monthly `npm audit` run; address new vulnerabilities promptly. | `npm audit && npm audit fix` |
| **Web fallback** (if enabled) | Ensure TLS (HTTPS) and CSP are active; monitor with external uptime checks. | `curl -I https://<your‑site>.com` |
| **Device storage** | No server scaling needed; users manage storage on their devices. | — |
| **Biometric lock state** | Verify `appLockEnabled` flag persists correctly across app restarts. | Manual test or automated UI test. |

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

## Costs

| Item | Provider / Option | Approx. monthly cost (USD) |
|------|-------------------|----------------------------|
| **EAS Build (managed)** | Free tier: 100 build minutes / month. After that **$0.12 /min** for iOS builds and **$0.10 /min** for Android builds. A typical full build consumes ~20 minutes per platform, so expect **≈ $2–$3** per month once the free quota is exhausted. |
| **Apple Developer Program** | $99 per year → roughly **$8 /month** (amortised). |
| **Google Play Console** | One‑time $25 enrollment fee → negligible ongoing cost. |
| **Optional web host** | Vercel / Netlify Hobby (free) or Pro plans **$20–$45** per month for custom domains, analytics, and higher bandwidth. |
| **Secret storage (EAS)** | Included with the EAS service; no extra charge. |
| **CI (GitHub Actions)** | Free for public repositories; private repos receive 2 000 minutes free per month, which is more than enough for this project → **$0**. |

**Bottom line:** Expect **≈ $10–$15 per month** total (dominated by the Apple Developer fee) once the app is live.

---

## Before production

1. **Patch high‑severity dependency vulnerabilities** – monitor and upgrade `node-forge`, `braces`, and `sprintf-js` as soon as secure releases appear, or replace them with safer alternatives.  
2. **Upgrade `uuid`** to **≥ 13.0.1** (already listed in the security checklist).  
3. **Implement robust input validation** for all numeric fields (`amount`, `miles`, `rate`, tax rate, mileage rate) and enforce it both in UI components and in any pure‑logic helpers.  
4. **Sanitise CSV export** to prevent formula injection (escape leading `= + - @`, wrap fields in double quotes, double‑escape internal quotes; consider using `csv-stringify`).  
5. **Ensure all user‑generated text is HTML‑escaped** in `src/lib/exportPdf.ts` before feeding it to `expo-print`.  
6. **Enforce backup passphrase policy** – minimum 8 characters and at least three character classes; disable the “Create backup” button until the policy is satisfied.  
7. **Delete temporary backup files** after a successful share operation (`FileSystem.deleteAsync(tmpPath)` in `src/lib/backup.ts`).  
8. **Add a CSP meta tag or server header** for any web deployment (see *Configuration and secrets*).  
9. **Add the production Dockerfile** for the optional web export (currently marked **TODO**).  
10. **Finalize `eas.json`** – verify that build profiles reference the correct secret names, include the OTA `updates.url`, and set proper versioning.  
11. **Run full regression tests on fresh devices** (both iOS 15+ and Android 13+), covering:
    - Policy gate on first launch and after a version bump.  
    - Biometric lock toggle and authentication flow.  
    - Receipt capture (camera & photo‑library fallback) with photo storage.  
    - Mileage entry and deduction calculation.  
    - Dashboard totals and recent‑activity list.  
    - CSV & PDF export via the native share sheet.  
    - Encrypted backup creation, passphrase‑protected restore, and integrity checks.  
    - “Delete all data” confirmation flow.  
12. **Update store listings** – ensure the privacy‑policy link points to the latest text in `src/lib/policy.ts`; refresh screenshots to reflect the final UI and the “privacy‑first” messaging.  
13. **Run a final security audit** – execute `npm audit`, `npx semgrep --config=p/ci`, and `trivy fs .` in CI; verify that the **Security checklist** is 100 % completed.  

When all items above are verified and the CI pipeline passes without failures, the app is ready for production submission. Happy releasing! 🚀
