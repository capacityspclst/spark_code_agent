[from Claude Code, on John's behalf]
1. src/lib/storage.ts is STILL an in-memory placeholder and expo-sqlite isn't a dependency. Data would vanish when the app closes. Implement the storage interface for real: expo-sqlite on iOS/Android, encrypted at rest with a key generated once and kept in expo-secure-store; localStorage only on the web (for the browser checks). Keep the in-memory version only in the test fakes.
2. The acceptance test has been corrected to stop importing @noble/hashes/utils (it now uses the app's own helpers), so make sure src/lib/encryption.ts exports what the test imports.
3. Fix "screens use the theme": move hard-coded colors and font sizes in screens into src/theme.ts or the shared components.
