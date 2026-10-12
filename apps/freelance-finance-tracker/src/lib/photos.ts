// Receipt photos live in the app's own document folder (not the OS cache, which the system may clear).
// On the web build (used for browser checks only) a photo stays as the browser's blob/data URI.
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { fromBase64, toBase64 } from './crypto';

const FOLDER = 'receipt-photos';

function folder(): Directory {
  const dir = new Directory(Paths.document, FOLDER);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Copy a just-picked photo into the app's photo folder; returns the photo's permanent URI. */
export async function persistPhoto(sourceUri: string, receiptId: string): Promise<string> {
  if (Platform.OS === 'web') return sourceUri;
  const dest = new File(folder(), `${receiptId}.jpg`);
  if (dest.exists) dest.delete();
  dest.create();
  dest.write(await new File(sourceUri).bytes());
  return dest.uri;
}

/** A stored photo's bytes as base64 (for backups); null if it's missing. */
export async function readPhotoBase64(uri: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return toBase64(new Uint8Array(await (await fetch(uri)).arrayBuffer()));
    const file = new File(uri);
    return file.exists ? toBase64(await file.bytes()) : null;
  } catch {
    return null;
  }
}

/** Write a restored photo (base64 from a backup) into the photo folder; returns its URI. */
export async function writePhotoBase64(receiptId: string, base64: string): Promise<string> {
  if (Platform.OS === 'web') return `data:image/jpeg;base64,${base64}`;
  const dest = new File(folder(), `${receiptId}.jpg`);
  if (dest.exists) dest.delete();
  dest.create();
  dest.write(fromBase64(base64));
  return dest.uri;
}

/** Remove every stored receipt photo ("delete all data", and before a restore). */
export async function deleteAllPhotos(): Promise<void> {
  if (Platform.OS === 'web') return;
  const dir = new Directory(Paths.document, FOLDER);
  if (dir.exists) dir.delete();
}
