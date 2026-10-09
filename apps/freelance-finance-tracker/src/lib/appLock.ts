import * as LocalAuthentication from 'expo-local-authentication';

/** Wrapper for biometric authentication.
 * Returns true if authentication succeeded, false otherwise.
 */
export async function authenticate(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock app',
    cancelLabel: 'Cancel',
    disableDeviceFallback: true,
  });
  return result.success;
}
