# Expo local-first app template

A verified starting point: it installs, its tests pass, TypeScript compiles, the web build renders, and it
passes every pipeline check (accessibility, theme, React Native components only, entry point, UI flow).
Build the app's features on top of it; don't rebuild what is here.

## What is already done (keep it, extend it)

| File | What it is |
|---|---|
| `index.ts` + `package.json` "main" | Entry point (`registerRootComponent`). Don't change. |
| `jest.config.js`, `babel.config.js`, `tsconfig.json` | jest-expo with ESM packages (@noble/*, Paper, React Navigation) transformed. Don't change unless a new ESM package needs adding to `transformIgnorePatterns`. |
| `src/theme.ts` | Design tokens (Paper MD3 theme, `space()`, `layout`). Put DESIGN.md's tokens here. Screens take every color/size from it. |
| `src/components/ui/` | Shared components: `Screen` (page frame + h1), `FormField` (labelled text input), `PrimaryButton`, `SummaryCard`, `EmptyState`, `ChoiceField` (2-5 options), `CheckboxField` (real checkbox), `SettingSwitch` (real switch). Use these in screens; add new shared components here. |
| `src/lib/crypto.ts` | AES-256-GCM `encrypt`/`decrypt`/`encryptText`/`decryptText`, `deriveKey(passphrase, salt)` (scrypt), `randomBytes`, `toBase64`/`fromBase64`, `utf8`/`fromUtf8`. Use for backups too. |
| `src/lib/storage/` | Encrypted storage. `getStore()` returns the app's `Store` (`get/set/remove` for settings, `list/put/delete` for records in collections, `clearAll`). On iOS/Android it is expo-sqlite (current async API) holding ciphertext, key in expo-secure-store; on the web, localStorage (for the browser checks only). Tests use `createStore(createMemoryRawStore(), createMemoryKeyProvider())` from `storage/memory.ts`. |
| `src/lib/policy.ts` + `src/screens/PolicyScreen.tsx` + `src/App.tsx` | The policy gate: nothing else renders until the current `POLICY_VERSION` is accepted. Replace `POLICY_SECTIONS` with the app's policy text; bump the version when it changes. |
| `src/navigation/index.tsx` | React Navigation 7: bottom tabs (decorative aria-hidden icons, labels) + a stack for pages pushed over the tabs. Add the app's tabs and pages here. |
| `src/screens/HomeScreen.tsx`, `SettingsScreen.tsx` | Examples to replace or extend (empty state pattern; a stored setting off by default). |
| `__tests__/template/` | The template's own tests: keep them passing. App tests go in `__tests__/` too. |
| `__mocks__/expo-crypto.ts` | Jest stand-in for expo-crypto. Add `__mocks__/<package>.ts` for other native modules tests need. |

## Rules that keep it working

- Data access only through `getStore()` (or a function taking a `Store`, so tests can pass a memory store).
- Every icon is decorative and hidden (PaperProvider `settings.icon` does this for Paper icons; pass `aria-hidden` to icons you render).
- Checkboxes: `CheckboxField`. On/off settings: `SettingSwitch`. Choices: `ChoiceField` (or a Paper Menu for long lists). Paper's Checkbox.Item and Switch are not used: on the web they have no accessible name/state.
- Text inputs: `FormField` (it sets `accessibilityLabel` = label, which is how the UI flow and screen readers find fields).
- No timers that navigate; no HTML elements; no hard-coded colors or font sizes in screens.
- Navigate immediately after an action succeeds and show confirmation on the destination screen.
- New Expo packages: use the versions in the SDK table you are given (`npx expo install` can't reach the Expo API here).

## UI flow vocabulary that works with these components

`goto`, `screen`, `fill` (FormField label), `check` (CheckboxField label), `click` with role `button` / `tab` /
`switch` / `link` and the visible name, `select` (ChoiceField label + option label), `expect` (visible text),
`upload` (a button that opens the image/document picker).
