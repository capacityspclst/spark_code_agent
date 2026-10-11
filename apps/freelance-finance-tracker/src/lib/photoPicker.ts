// Pick a receipt photo from the library (or take one with the camera) with the current expo-image-picker API.
import * as ImagePicker from 'expo-image-picker';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MiB: plenty for a receipt, keeps backups and storage reasonable

export type PhotoSource = 'library' | 'camera';

/** The picked photo's temporary URI, or undefined if the user cancels, declines access or the photo is too large. */
export async function pickImageAsync(source: PhotoSource = 'library'): Promise<string | undefined> {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return undefined;
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return undefined;
  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > MAX_BYTES) return undefined;
  return asset.uri;
}
