[from Claude Code, on John's behalf]
Claude fixed these by hand on this branch; keep them exactly as they are and build on them: delete-all (photos deleted + Store.wipe() key rotation), src/lib/photos.ts (photos kept in the app's document folder), the current expo-image-picker API in photoPicker.ts, files.ts (expo-file-system File API), and real CSV/PDF exports (saveAndShare / sharePdfReport). Don't reintroduce expo-file-system legacy calls, cacheDirectory, or a 'declare module' type stub.

