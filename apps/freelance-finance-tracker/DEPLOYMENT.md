# DEPLOYMENT.md

> **Note** – This guide assumes the code lives in `apps/freelance-finance-tracker`. Adjust any paths if you have a different layout.

## What this app is
**Freelance Finance Tracker** is a privacy‑first mobile app built with the current Expo SDK (managed workflow, TypeScript).  
It runs completely offline: all receipts, mileage logs, and settings are stored in an encrypted SQLite database on the device. No network calls, analytics, or crash‑reporting SDKs are included.

Key features (implemented in the repo):
- Policy agreement gate (`src/lib/policy.ts`, `src/screens/PolicyScreen.tsx`)
- Receipt capture with camera / library (`expo-image-picker`)
- Mileage log
- Dashboard with income/expense/mileage/tax calculations (`src/lib/calculations.ts`)
- CSV & PDF export (`src/lib/backup.ts` → `exportCSV`, `exportPDF`)
- Encrypted on‑device storage (`src/lib/encryption.ts` + `expo-secure-store`)
- Encrypted backup/restore (`createBackup`, `restoreBackup`)
- Optional biometric lock (`src/lib/auth.ts`, `expo-local-authentication`)
- UI built with React Native Paper (Material 3), bottom tab navigator, theming (`src/theme.ts`)

The app is ready to be built for iOS and Android and submitted to the respective stores.

---

## Architecture
```
apps/
└─ freelance-finance-tracker/
   ├─ src/
   │   ├─ App.tsx                     # root component
   │   ├─ theme.ts                    # MD3 theme
   │   ├─ navigation/                 # React Navigation (stack + bottom tabs)
   │   ├─ screens/                    # UI screens (Dashboard, Receipts, Mileage, Settings, Policy)
   │   ├─ components/ui/              # shared UI wrappers (Screen, FormField, PrimaryButton, etc.)
   │   ├─ lib/
   │   │   ├─ policy.ts               # SecureStore policy acceptance
   │   │   ├─ storage.ts              # wrapper around expo-sqlite (encrypted rows)
   │   │   ├─ encryption.ts           # noble AES‑GCM + PBKDF2 key derivation
   │   │   ├─ records.ts              # CRUD helpers for Receipt, MileageEntry, Config
   │   │   ├─ calculations.ts         # income/expense/mileage/tax logic
   │   │   ├─ backup.ts               # CSV/PDF export, encrypted backup/restore
   │   │   └─ auth.ts                 # optional biometric auth stub
   │   └─ hooks/usePolicy.ts          # gate policy on app start
   ├─ app.json                         # Expo config (updates disabled, privacy public)
   ├─ eas.json                         # **TODO** – add EAS build profiles
   ├─ jest.config.js                   # Jest configuration (Expo preset, mocks)
   ├─ package.json                     # dependencies
   └─ tsconfig.json
```

No backend, database, or external services are required. All data lives in:
- SQLite file in `FileSystem.documentDirectory` (private to the app)
- Encryption key stored in iOS Keychain / Android Keystore via `expo-secure-store`

---

## Prerequisites
| Item | Version / command |
|------|-------------------|
| **Node.js** | `>= 18.x` (tested with 18.20.0) |
| **npm** | `>= 9.x` (comes with Node) |
| **Expo CLI** | `npm i -g expo-cli` → `expo --version` should be `~8.x` |
| **EAS CLI** (for production builds) | `npm i -g eas-cli` → `eas --version` (`~3.x`) |
| **Apple Developer Account** | Needed for iOS signing (App Store Connect) |
| **Google Play Console** | Needed for Android signing |
| **Java 17+** (Android SDK) | `java -version` |
| **Android SDK** | Installed via Android Studio or `sdkmanager` |
| **Xcode 15+** (macOS) | `xcodebuild -version` |
| **Git** | `git --version` |
| **Jest** (testing) | Already in `devDependencies` |

> **Tip** – Use `npx expo doctor` to verify the environment.

---

## Configuration and secrets
1. **Expo app config** – `app.json` already disables OTA updates and analytics:
   ```json
   {
     "expo": {
       "updates": { "enabled": false, "fallbackToCacheTimeout": 0 },
       "privacy": "public"
     }
   }
   ```

2. **EAS build profiles** – create `eas.json` at the project root (to‑do):
   ```json
   {
     "cli": { "version": ">= 3.0.0" },
     "build": {
       "production": {
         "ios": {
           "workflow": "managed",
           "distribution": "app-store",
           "scheme": "FreelanceFinanceTracker"
         },
         "android": {
           "workflow": "managed",
           "gradleCommand": ":app:assembleRelease"
         }
       }
     }
   }
   ```

3. **Credentials for CI** – store the following as **GitHub Actions secrets** (or your CI’s secret store):
   - `EXPO_TOKEN` – personal access token for the Expo account (`eas login --token $EXPO_TOKEN`).
   - `APPLE_APP_SPECIFIC_PASSWORD` – for App Store Connect upload.
   - `ANDROID_KEYSTORE_BASE64` – base‑64 encoded keystore file.
   - `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

4. **App signing keys** – generate once (outside repo) and add to CI secrets:
   ```bash
   # Android keystore generation (run locally, then base64 encode)
   keytool -genkeypair -v \
     -keystore my-release.keystore \
     -alias freelance_finance_tracker \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -storepass <keystore-pass> -keypass <key-pass>
   base64 -w 0 my-release.keystore > keystore.base64
   ```

5. **Policy version** – bump `POLICY_VERSION` in `src/lib/policy.ts` when the Terms/Privacy text changes. No external secret needed.

---

## Build and test
```bash
# 1️⃣ Install dependencies
npm ci

# 2️⃣ Verify Expo SDK version (ensures we use the current SDK)
npm view expo version   # should match the version in package.json

# 3️⃣ Run unit & integration tests
npm test                # uses jest.config.js and __mocks__ for Expo APIs

# 4️⃣ Lint (optional but recommended)
npm run lint            # configure eslint in package.json if missing

# 5️⃣ Build for web (sanity check, not for production)
expo export             # creates ./dist for web; verifies bundling works

# 6️⃣ Production builds via EAS (see Deploy section)
```

All tests must pass before any build is promoted. The repository already contains a full acceptance test suite (`__tests__/acceptance/*.test.ts`) that validates policy flow, encryption, CRUD, calculations, export, and backup/restore.

---

## Deploy
Because the app is a mobile client, “deployment” means **building binaries** and **submitting them to the Apple App Store and Google Play Store**.

### 1️⃣ Prepare build credentials
```bash
# Log into Expo (needed for EAS)
eas login

# Authenticate with your token (use CI secret in CI)
eas login --token $EXPO_TOKEN
```

### 2️⃣ Build for iOS
```bash
# Ensure you have an Apple distribution certificate and provisioning profile.
# EAS can manage them automatically if you connect your Apple ID.
eas build --platform ios --profile production
```
- The build produces an `.ipa` file stored on Expo’s servers.  
- Download it with `eas build:download --platform ios --profile production`.

### 3️⃣ Build for Android
```bash
# Provide the keystore via environment variables (CI) or let EAS prompt locally.
eas build --platform android --profile production
```
- Outputs an `.aab` (recommended) or `.apk` file.

### 4️⃣ Submit to stores (optional manual step)
```bash
# iOS – submit directly from EAS
eas submit --platform ios --latest --type app-store \
  --apple-app-specific-password $APPLE_APP_SPECIFIC_PASSWORD

# Android – submit directly from EAS
eas submit --platform android --latest --type google-play \
  --track production
```
> **To‑Do** – If you prefer manual upload, download the artifacts and use App Store Connect / Google Play Console UI.

### 5️⃣ Version bump workflow
- Update `version` in `app.json` (`"version": "1.0.0"` → `"1.0.1"`).  
- Increment `android.versionCode` and `ios.buildNumber` (add them to `app.json` if not present):
  ```json
  "android": { "versionCode": 2 },
  "ios": { "buildNumber": "2" }
  ```
- Commit, tag (`git tag v1.0.1 && git push --tags`), then trigger CI (see next section).

---

## Security checklist
All items must be **checked** before releasing to production.

- [ ] **No network code** – confirm the source has no `fetch`, `axios`, or other HTTP calls. (`grep -R "fetch(" -n src/` should return nothing)
- [ ] **Expo updates disabled** – `app.json` `updates.enabled` is `false`.
- [ ] **Telemetry disabled** – no `expo-analytics` or similar packages in `package.json`.
- [ ] **Secure storage** – encryption key stored only via `expo-secure-store` (`src/lib/policy.ts`, `src/lib/storage.ts`).
- [ ] **Biometric auth** – uses `expo-local-authentication` only when enabled (`SettingsScreen` toggles).
- [ ] **No crash/reporting SDKs** – confirm `package.json` has no `@sentry/react-native`, `firebase`, etc.
- [ ] **Policy version handling** – `POLICY_VERSION` constant and acceptance logic are present (`src/lib/policy.ts`).
- [ ] **Encrypted backup** – uses `@noble/ciphers` + `@noble/hashes` with strong KDF (`src/lib/backup.ts`).
- [ ] **Code signing** – iOS certificate and Android keystore are provisioned and stored securely (CI secrets).
- [ ] **App Store compliance** – verify the app icon set, launch screen, and privacy policy URL are defined in `app.json`.
- [ ] **Permissions review** – only camera, media library, and biometric permissions are requested; each has clear rationale in code.
- [ ] **Static analysis** – all Semgrep and Trivy warnings are addressed (see `SECURITY.md`).

---

## Operations
| Concern | How it’s handled |
|---------|-------------------|
| **Version tracking** | `app.json` version + platform build numbers. Tag releases in Git. |
| **Monitoring** | Since we avoid crash reporting, rely on user‑reported bugs and the Expo build logs. Optional: enable **EAS Update** in a future release for OTA patches (currently disabled). |
| **Backups** | Users create encrypted backups themselves; no server needed. Provide clear UI messages in `SettingsScreen`. |
| **Key rotation** | If a user wants to change the encryption key, they must delete the app data (exposes a “Delete all data” button). Future updates may add key‑change flow. |
| **Device compatibility** | Tested on Android 13 API 33 and iOS 17. Minimum SDKs are defined by Expo SDK (Android min SDK 23, iOS 13). |
| **App Store assets** | Store screenshots, descriptions, and privacy policy URL in the respective developer consoles. Not part of the repo – maintain a `metadata/` folder locally for reference. |
| **Disaster recovery** | Restore from backup file via the Settings screen; the app verifies HMAC and shows user‑friendly error if the passphrase is wrong. |
| **Legal** | The built‑in policy already disclaims tax/financial advice and states data never leaves the device. Keep that text up‑to‑date. |

---

## CI/CD
A minimal GitHub Actions workflow (`.github/workflows/deploy.yml`) is recommended.

```yaml
name: Build & Deploy

on:
  push:
    tags:
      - 'v*'    # trigger on version tags like v1.0.1

jobs:
  build:
    runs-on: macos-latest   # required for iOS builds
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Install Expo/EAS CLI
        run: |
          npm i -g expo-cli eas-cli

      - name: Authenticate with Expo
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
        run: eas login --token $EXPO_TOKEN

      # ---------- Android ----------
      - name: Decode Android keystore
        env:
          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: |
          echo $ANDROID_KEYSTORE_BASE64 | base64 -d > android.keystore

      - name: Build Android (AAB)
        env:
          EXPO_ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          EXPO_ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          EXPO_ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          EXPO_ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          eas build --platform android --profile production --non-interactive

      - name: Submit Android to Play Store
        env:
          GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
        run: |
          eas submit --platform android --latest --type google-play --track production --non-interactive

      # ---------- iOS ----------
      - name: Build iOS
        env:
          EXPO_APPLE_TEAM_ID: ${{ secrets.EXPO_APPLE_TEAM_ID }}
          EXPO_APPLE_ID: ${{ secrets.EXPO_APPLE_ID }}
          EXPO_APPLE_PASSWORD: ${{ secrets.EXPO_APPLE_PASSWORD }}
        run: |
          eas build --platform ios --profile production --non-interactive

      - name: Submit iOS to App Store
        env:
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
        run: |
          eas submit --platform ios --latest --type app-store --non-interactive

## Costs
| Item | Approx. monthly cost (USD) | Remarks |
|------|---------------------------|---------|
| **Expo (managed) plan** | Free (public builds) – **$0** | Unlimited builds, but rate‑limited. For faster build queues you can upgrade to **Expo Team** ($29 / user). |
| **Apple Developer Program** | **$99** per year (≈ $8.25 /mo) | Required for iOS signing and App Store distribution. |
| **Google Play Console** | **$25** one‑time registration (≈ $2 /mo amortized) | Required for Android distribution. |
| **CI (GitHub Actions)** | Free tier: 2 000 min Linux, 500 min macOS per month – usually sufficient. Extra macOS minutes: **$0.08 / min**. |
| **Code signing keys** | $0 (self‑generated) | No recurring cost. |
| **Optional monitoring (e.g., Sentry)** | $0 (not used) | If you later add crash reporting, start at the free tier. |

**Total ≈ $10‑$15 /mo** for a small freelance project.

## Before production
The first version is functional but still lacks several production‑ready pieces. Prioritised list:

1. **App Store assets & metadata** – screenshots, description, privacy‑policy URL, and appropriate keywords. Required for review.  
2. **Code signing automation** – store Android keystore and iOS certificates securely in CI; add scripts to rotate them as needed.  
3. **`eas.json` build profiles** – currently a TODO; must be committed with proper versioning rules.  
4. **Full device testing** – run on a variety of real Android & iOS devices (different screen sizes, OS versions) to catch UI/permission edge cases.  
5. **App icons & splash screens for all required densities** – ensure all icon sizes (`1024x1024`, `180x180`, etc.) are present in the repo.  
6. **Accessibility audit** – verify talk‑back, focus order, and contrast on actual devices.  
7. **Internationalisation** – dates/amounts already locale‑aware, but UI strings are hard‑coded English; consider i18n if you target non‑English speakers.  
8. **Automated version bump** – add a script (e.g., `npm version patch && git push && git push --tags`) to enforce consistent version numbers.  
9. **Backup integrity tests on large data sets** – simulate many receipts and photos to ensure backup size and restore time are acceptable on low‑end devices.  
10. **Optional OTA updates** – currently disabled; plan a future release with `expo-updates` for hot patches (ensure the update channel is also privacy‑first).  

Addressing these items will move the app from a functional prototype to a store‑ready product.
