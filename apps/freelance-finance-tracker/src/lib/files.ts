// Saving and picking files on every platform.
// iOS/Android: files are written to the app's cache and handed to the share sheet; picked files are read from
// their local copy. Web: saving downloads the file and picking uses the browser's file chooser (both via the same
// expo APIs, so the UI flow check can save a backup and hand the same file back to restore it).
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/** Save bytes as a file the user can keep: the share sheet on phones, a download on the web. */
export async function saveAndShare(fileName: string, bytes: Uint8Array, mimeType = 'application/octet-stream'): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([bytes as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(bytes);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: fileName });
  }
  // Clean up the temporary file after sharing (or if sharing not available)
  try {
    await FileSystem.deleteAsync(file.uri, { idempotent: true });
  } catch {}
}

/** Let the user pick one file; null if they cancel. Call this directly from a button press: browsers only open a
 * file chooser straight from the tap (no awaits, dialogs or navigation before it). */
export async function pickFile(): Promise<{ name: string; bytes: Uint8Array } | null> {
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.length) return null;
  const asset = res.assets[0];
  if (Platform.OS === 'web' && asset.file) {
    return { name: asset.name, bytes: new Uint8Array(await asset.file.arrayBuffer()) };
  }
  return { name: asset.name, bytes: await new File(asset.uri).bytes() };
}
