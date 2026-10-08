/** Simple wrapper to pick an image from library or camera using expo-image-picker if available.
 * Dynamically imports the module to avoid static bundler resolution issues in environments
 * where expo-image-picker is not available (e.g., web builds without native support).
 */
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
      return result.uri;
    }
  } catch (e) {
    // If the module cannot be loaded or any error occurs, just return undefined.
  }
  return undefined;
}
