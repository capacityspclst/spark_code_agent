[from Claude Code's review of run 20261008-144633, on John's behalf - only milestone 4 is left]
The backup/restore UI flow can work in the browser now: the checker keeps the file the app downloads and hands it back at the "Select backup file" upload step. To use that:
1. Saving a backup ("Create backup" -> "Backup ready to share"): on iOS/Android write the encrypted backup to a file (expo-file-system's current File/Paths API - check node_modules/expo-file-system) and open the share sheet (expo-sharing). On the web, trigger a download instead (no share sheet there):
   const blob = new Blob([bytes], { type: 'application/octet-stream' }); const url = URL.createObjectURL(blob);
   const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
   Put both in one helper (e.g. src/lib/files.ts saveAndShare(fileName, bytes)) with a Platform.OS === 'web' branch; then show "Backup ready to share".
2. Picking the backup ("Select backup file"): use expo-document-picker on every platform - no raw <input> (the React Native-only check rejects it):
   const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false }); if (res.canceled) return;
   const asset = res.assets[0]; const bytes = Platform.OS === 'web' ? new Uint8Array(await asset.file!.arrayBuffer()) : <read asset.uri with expo-file-system's File API>;
   The "Select backup file" control must be a button (PrimaryButton) that calls this directly when pressed.
3. Keep the passphrase fields as FormField with the exact labels "Backup passphrase" and "Confirm passphrase" (secureTextEntry), and the button names and messages exactly as in ui_flow.json: "Create encrypted backup", "Create backup", "Backup ready to share", "Restore from backup", "Select backup file", "Restore", "Data restored successfully.", "Delete all data", "Delete", "All data deleted.".
4. Restore must decrypt with the passphrase and replace the data; a wrong passphrase or damaged file shows a friendly error.
