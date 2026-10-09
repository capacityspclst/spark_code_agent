# DEPLOYMENT.md

*This guide walks John (or any developer) from the first‑commit version of **apps/freelance-finance-tracker** to a production‑ready iOS/Android release, with optional web fallback. All commands, file names and values are taken from the repository; anything that does not yet exist is marked **TODO**.*

---

## What this app is

- **Type**: Mobile‑first, local‑first finance tracker built with **Expo SDK ?** (the exact SDK version can be obtained with `npm view expo version`).  
- **Core user story**: Users capture receipts (photo + metadata) and mileage logs, see a summary dashboard, and export tax‑ready CSV/PDF files—all stored encrypted on‑device. No network traffic, no analytics, no user accounts.  
- **Key features**:  
  1. Policy‑gate on first launch or when `POLICY_VERSION` changes (`src/lib/policy.ts`).  
  2. Encrypted SQLite store (`src/lib/storage/device.native.ts`) with the key kept in **expo‑secure‑store**.  
  3. Receipt capture (`expo-image-picker`, `expo-file-system`).  
  4. Mileage logging with configurable IRS rate (`src/lib/settings.ts`).  
  5. CSV & PDF export (`src/lib/exportCsv.ts`, `src/lib/exportPdf.ts`).  
  6. Encrypted backup/restore (`src/lib/backup.ts`, `src/lib/crypto.ts`).  
  7. Optional biometric lock (`src/lib/appLock.ts`).  

---

## Architecture

```
+-------------------+      +---------------------+      +-------------------+
|  React Native UI  | ---> |  Lib (finance, …)   | ---> |  Encrypted Store  |
|  (Paper, Nav)    |      |  (pure‑logic only) |      |  (expo‑sqlite)    |
+-------------------+      +---------------------+      +-------------------+
        |                          |                               |
        v                          v                               v
   Expo runtime            Domain layer                     Secure‑Store
   (iOS/Android)            (src/lib/*.ts)            (expo-secure-store)
```

- **UI layer** lives in `src/screens/` and `src/components/ui/`.  
- **Domain layer** (`src/lib/finance.ts`, `src/lib/mileage.ts`, etc.) contains pure functions – fully unit‑testable.  
- **Storage layer** (`src/lib/storage/`) abstracts encrypted SQLite on native and a plain fallback on web (`src/lib/storage/device.web.ts`).  
- **Policy gate** (`src/screens/PolicyScreen.tsx`) checks `POLICY_VERSION` stored via the store.  
- **No backend** – all data never leaves the device.

---

## Prerequisites

| Tool | Version / Install command |
|------|---------------------------|
| **Node.js** | `>= 20` (`node -v`) |
| **npm** | `>= 10` (`npm -v`) |
| **Expo CLI** | `npm i -g expo-cli` |
| **EAS CLI** (Expo Application Services) | `npm i -g eas-cli` |
| **Apple Developer account** | Needed for iOS signing |
| **Google Play Console account** | Needed for Android signing |
| **Java JDK 11+** (for Android builds) | `brew install openjdk@11` (macOS) |
| **Xcode 15+** (macOS) | Required for iOS builds |
| **Git** | `git --version` |
| **Docker** (optional – for web build container) | `docker --version` |

> **NOTE**: The exact Expo SDK version can be queried with `npm view expo version` and should match the version used in `package.json` (the template pins it via `expo install`).

---

## Configuration and secrets

| Item | Where it lives | How to set |
|------|----------------|------------|
| **Expo app config** | `app.json` (already present) | Edit `expo.name`, `expo.slug`, version, etc. |
| **Policy version** | `src/lib/policy.ts` (`export const POLICY_VERSION = "1.0.0"` ) | Bump the constant when the policy text changes. |
| **Encryption key** | `expo-secure-store` (runtime) | No static secret – generated on first launch and persisted by the store. |
| **iOS signing credentials** | **EAS Secret Manager** (or local `eas.json` profile) | `eas secret:add --name IOS_DIST_CERT --value <base64‑pem>` |
| **Android signing keystore** | **EAS Secret Manager** | `eas secret:add --name ANDROID_KEYSTORE --value <base64‑jks>` |
| **Web CSP (if you ever enable `expo start --web`)** | `public/index.html` meta tag **TODO** | ```html\n<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">\n``` |
| **EAS build profiles** | `eas.json` **TODO** | Example: ```json\n{\n  \"cli\": { \"version\": \">= 3.0.0\" },\n  \"build\": {\n    \"production\": {\n      \"ios\": { \"workflow\": \"managed\" },\n      \"android\": { \"workflow\": \"managed\" }\n    }\n  }\n}\n``` |

All secrets must be stored in **EAS’s encrypted secret store**; never commit them.

---

## Build and test

```bash
# 1️⃣ Install exact dependencies (Expo will resolve SDK‑compatible versions)
cd apps/freelance-finance-tracker
npm ci

# 2️⃣ Verify the Expo SDK version being used
npm view expo version   # → e.g. 50.0.0

# 3️⃣ Run unit & integration tests (Jest)
npm test                # runs all __tests__/*

# 4️⃣ Lint & type‑check (optional but recommended)
npx eslint .            # uses the repo’s ESLint config
npx tsc --noEmit       # TypeScript compilation check

# 5️⃣ Build the web fallback (useful for OTA docs or internal QA)
expo start --web --no-dev --minify
#   → Served at http://localhost:19006 (Metro dev server)

# 6️⃣ Production build for iOS & Android (EAS)
eas build --platform ios --profile production
eas build --platform android --profile production
```

All tests must pass before any build is uploaded. The CI pipeline (see later) runs the same commands automatically.

---

## Deploy

### iOS & Android (App Store / Play Store)

1. **Configure `eas.json`** (see *Configuration and secrets*).  
2. **Create a production build**:  

   ```bash
   # iOS
   eas build --platform ios --profile production
   # Android
   eas build --platform android --profile production
   ```

   The CLI will prompt for Apple/Google credentials or fetch them from the secret manager.

3. **Submit to stores**:

   ```bash
   # iOS (TestFlight first)
   eas submit --platform ios --latest --type archive

   # Android (internal testing)
   eas submit --platform android --latest --type apk
   ```

4. **Release to production** through App Store Connect and Google Play Console once the binaries pass review.

### Over‑the‑Air (OTA) Updates

- Enable **EAS Update** in `eas.json` (`"updates": { "url": "https://u.expo.dev/<project-id>" }`).  
- Publish a new JavaScript bundle:

  ```bash
  eas update --branch production --message "Fix CSV injection sanitization"
  ```

  Devices will fetch the update on next launch (provided the native binary version supports it).

### Web fallback (optional)

If you decide to ship a web version, you need a static host:

| Provider | Steps (high‑level) |
|----------|--------------------|
| **Vercel** | Connect the repo, set `buildCommand: npx expo export -p web`, `outputDirectory: dist`. Add the CSP meta tag (see above). |
| **Netlify** | Same as Vercel; add a `_redirects` file to force HTTPS. |
| **Cloudflare Pages** | Upload the `dist` folder; configure a CSP header in the Pages dashboard. |

> **TODO**: Add a production Dockerfile for a containerised web build if you prefer a self‑hosted solution. Example stub:

```dockerfile
# TODO: production Dockerfile for web export
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build:web   # `expo export -p web` should be added as a script

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# TODO: add CSP header via nginx.conf
```

---

## Security checklist

All items stem from **SECURITY.md** findings and from best‑practice hardening for a local‑first Expo app.

- [ ] **Upgrade vulnerable dependencies**  
  - `uuid` → `npm i uuid@^13.0.1` (fixes out‑of‑bounds write).  
  - `node-forge` → monitor; upgrade to `>=1.5.0` when available.  
  - `braces` → monitor; upgrade to `>=3.0.4` when available.  
  - `sprintf-js` → monitor; upgrade to `>=1.1.2` when available.  

- [ ] **Input validation**  
  - Add validation to `src/screens/ReceiptEntryScreen.tsx` for `amount` (numeric > 0, max 9 digits).  
  - Add validation to `src/screens/MileageEntryScreen.tsx` for `miles` and `rate` (numeric ≥ 0).  

- [ ] **CSV export sanitization** (fix CVE‑CSV‑Injection)  
  - Escape leading `= + - @` characters, wrap all fields in double quotes, double‑escape internal quotes. Prefer a library like `csv-stringify`.  

- [ ] **PDF export XSS hardening** (already fixed, keep) – ensure any user text is HTML‑escaped before building the HTML string in `src/lib/exportPdf.ts`.  

- [ ] **Backup passphrase enforcement** – require ≥ 8 characters and at least three character classes before enabling the “Create backup” button.  

- [ ] **Delete temporary backup files** – after `expo-sharing` succeeds, call `FileSystem.deleteAsync(tmpPath)` in `src/lib/backup.ts`.  

- [ ] **Web fallback key storage** – avoid persisting the encryption key in `localStorage`. Either disable web build for production or implement an in‑memory key derived from a user passphrase.  

- [ ] **Content‑Security‑Policy header** for any web host – add a CSP meta tag or server header that only allows `self` sources.  

- [ ] **Health‑check for any containerised web service** – if you add the Dockerfile above, include `HEALTHCHECK CMD curl -f http://localhost/ || exit 1`.  

- [ ] **Enable React Native Paper’s `dangerouslyGetPallete` only for testing** – ensure no debug flags are shipped (`app.json` `updates.enabled: true`, `updates.checkAutomatically: "ON_LOAD"`).  

- [ ] **Run audits before every release** – `npm audit`, `npx semgrep --config=p/ci`, `trivy fs .` in CI.  

---

## Operations

| Area | What to monitor / maintain | Tools / Commands |
|------|----------------------------|------------------|
| **App version** | Keep `app.json.expo.version` in sync with store version. | `jq .expo.version app.json` |
| **Crash reporting** | **Disabled by design** – ensure no third‑party SDK is added inadvertently. |
| **Backup health** | Periodically run a sanity test on a CI runner: create a backup, restore it, verify data integrity. | `npm run test:backup` (add a script that runs `m4.test.ts`). |
| **OTA updates** | Verify that the OTA channel (`production`) is healthy after each `eas update`. | `eas update:list --branch production` |
| **Store listings** | Keep privacy policy link up‑to‑date; the policy text lives in `src/lib/policy.ts`. | Manual UI review before each store submission. |
| **Dependency health** | Schedule a monthly `npm audit` and address new vulnerabilities. | `npm audit && npm audit fix` |
| **Web fallback** (if used) | Ensure TLS (HTTPS) and CSP are active. Use an external monitor (e.g., Upptime). | `curl -I https://your-site.com` |
| **Device storage** | No server, so no scaling concerns. Users manage their own device storage. |

---

## CI/CD

**GitHub Actions workflow (example)** – create `.github/workflows/ci.yml`:

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
      EAS_BUILD_PLATFORM: ios
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
      - name: Submit to stores (manual trigger)
        run: echo "Use the EAS dashboard or a manual GitHub workflow dispatch to run `eas submit`."
```

- **Secrets required** in the repo settings: `EAS_TOKEN`, `IOS_DIST_CERT`, `ANDROID_KEYSTORE`, `APPLE_APP_SPECIFIC_PASSWORD`, etc.  
- The workflow runs lint, unit tests, then triggers production builds on the appropriate runners (macOS for iOS).  
- OTA updates can be published with a separate workflow that runs `eas update`.  

---

## Costs

| Item | Provider / Option | Approx. monthly cost (USD) |
|------|-------------------|---------------------------|
| **EAS Build (managed)** | Free tier: 100 build minutes / month, then **$0.12/min** (iOS) / **$0.10/min** (Android). Typical full app needs ~20 min per platform → **≈ $2–$3** after free quota. |
| **Apple Developer Program** | $99 (annual) → ≈ **$8/month** (amortized). |
| **Google Play Console** | $25 (one‑time) → negligible monthly. |
| **Optional web host** | Vercel/Netlify Hobby (free) or Pro **$20–$45** for custom domains & analytics. |
| **Secret storage (EAS)** | Included with EAS; no extra charge. |
| **CI (GitHub Actions)** | Free for public repos; private repos get 2000 minutes free → likely **$0** for this small project. |

> **Bottom line**: Expect **≈ $10‑$15/month** total (mostly Apple fees) once the app is live.

---

## Before production

1. **Fix all high‑severity dependency vulnerabilities** (node‑forge, braces) or remove the unused packages.  
2. **Upgrade `uuid` to ≥ 13.0.1** to eliminate the out‑of‑bounds write issue.  
3. **Implement robust input validation** for numeric fields (amount, miles, rates).  
4. **Sanitize CSV export** to prevent formula injection.  
5. **Escape all user‑generated strings in PDF HTML** (already fixed, but keep tests).  
6. **Enforce backup passphrase policy** (minimum length, strength).  
7. **Delete temporary backup files after sharing** to avoid lingering encrypted blobs.  
8. **Add CSP header / meta tag** for any web deployment to guard against XSS.  
9. **Add production Dockerfile** if you intend to serve the exported web build (currently missing).  
10. **Generate and review `eas.json` build profiles** and ensure correct secret references.  
11. **Perform a full regression test** on a fresh device (both iOS and Android) – especially the policy gate, biometric lock, and backup/restore flows.  
12. **Update store listings** (App Store, Play Store) with the latest privacy policy and screenshots reflecting the current UI.

Once the above items are completed and the CI pipeline passes, the app is ready for production submission. Happy releasing! 🚀
