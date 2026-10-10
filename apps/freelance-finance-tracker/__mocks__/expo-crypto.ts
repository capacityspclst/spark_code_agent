// Jest: secure random bytes from the runtime's Web Crypto (expo-crypto's native module isn't available in tests).
export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  (globalThis as unknown as { crypto: { getRandomValues(b: Uint8Array): Uint8Array } }).crypto.getRandomValues(bytes);
  return bytes;
}
