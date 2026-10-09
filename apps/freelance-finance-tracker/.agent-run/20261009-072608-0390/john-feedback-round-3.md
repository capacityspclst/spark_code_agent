[from Claude Code, on John's behalf - PROVEN fix for the "Select backup file" step]
I tested this exact pattern in the pipeline's browser check and it passes at phone and desktop size (the checker catches the file chooser and hands back the backup file). Do exactly this and delete WebFileInput.web.tsx, RestoreScreen.web.tsx and any raw <input>/<button>:

import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

async function pickBackupBytes(): Promise<{ name: string; bytes: Uint8Array } | null> {
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
  if (res.canceled) return null;
  const asset = res.assets[0];
  if (Platform.OS === 'web' && asset.file) return { name: asset.name, bytes: new Uint8Array(await asset.file.arrayBuffer()) };
  // iOS/Android: read asset.uri with expo-file-system's File API (see node_modules/expo-file-system).
  ...
}

// In RestoreScreen: a PrimaryButton labelled exactly "Select backup file" whose onPress calls pickBackupBytes()
// DIRECTLY (no await, dialog, state change or navigation before the call - the browser only opens a file chooser
// straight from the tap). Keep the result in state, then the "Backup passphrase" FormField and the "Restore" button.

Also make sure tapping "Restore from backup" actually shows the restore screen (in round 1 the page still showed only the backup screen afterwards, so the flow couldn't find "Select backup file").
