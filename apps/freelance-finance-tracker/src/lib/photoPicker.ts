/** Simple wrapper to pick an image from library or camera using expo-image-picker if available.
 * Dynamically imports the module to avoid static bundler resolution issues in environments
 * where expo-image-picker is not available (e.g., web builds without native support).
 * Enforces a maximum file size of 5 MiB to avoid exhausting device storage.
 */
import * as FileSystem from 'expo-file-system';

export async function pickImageAsync(): Promise<string | undefined> {
  try {
    // Dynamically import to keep TypeScript happy without requiring type declarations.
    const ImagePicker: any = await import('expo-image-picker');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return undefined;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.cancelled) {
      // Check file size; reject large images (>5 MiB).
      const info = await FileSystem.getInfoAsync(result.uri);
      const maxBytes = 5 * 1024 * 1024; // 5 MiB
      // Cast to any because FileInfo type may lack size in typings.
      if ((info as any).size && (info as any).size > maxBytes) {
        // Too large – could show a toast or simply ignore.
        console.warn('Selected image exceeds size limit of 5 MiB');
        return undefined;
      }
      return result.uri;
    }
  } catch (e) {
    // If the module cannot be loaded or any error occurs, just return undefined.
  }
  return undefined;
}
