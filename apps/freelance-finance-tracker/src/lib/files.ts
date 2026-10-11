// Saving and picking files on every platform.
// iOS/Android: a file is written to the app's cache, handed to the share sheet, then deleted; picked files are
// read from their local copy (current expo-file-system File API). Web: saving downloads the file and picking uses
// the browser's file chooser, so the UI flow check can save a backup and hand the same file back to restore it.
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** Save bytes as a file the user keeps: the share sheet on phones (temporary copy deleted after), a download on the web. */
export async function saveAndShare(fileName: string, bytes: Uint8Array, mimeType = 'application/octet-stream'): Promise<void> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: mimeType }));
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
  try {
    file.create({ overwrite: true });
    file.write(bytes);
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: fileName });
  } finally {
    if (file.exists) file.delete(); // the user's copy is wherever they shared it; nothing stays behind in the cache
  }
}

/** Let the user pick one file; null if they cancel. Call it straight from a button press: browsers only open a
 * file chooser from the tap itself (no awaits, dialogs or navigation before the call). */
export async function pickFile(): Promise<{ name: string; bytes: Uint8Array } | null> {
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.length) return null;
  const asset = res.assets[0];
  if (Platform.OS === 'web' && asset.file) return { name: asset.name, bytes: new Uint8Array(await asset.file.arrayBuffer()) };
  const copy = new File(asset.uri);
  try {
    return { name: asset.name, bytes: await copy.bytes() };
  } finally {
    if (copy.exists) copy.delete();
  }
}

/** Read a local file's bytes (current expo-file-system File API). */
export async function readFileBytes(uri: string): Promise<Uint8Array> {
  return new File(uri).bytes();
}

/** Write bytes to a local file, replacing it (current expo-file-system File API). */
export async function writeFileBytes(uri: string, data: Uint8Array): Promise<void> {
  const file = new File(uri);
  if (file.exists) file.delete();
  file.create();
  file.write(data);
}
