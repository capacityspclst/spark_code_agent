// src/lib/encryption.ts
// Simple reversible encryption for test purposes.
// Derive a key from a passphrase (placeholder implementation).
export async function deriveKey(_passphrase: string, _salt: Uint8Array): Promise<Uint8Array> {
  // Return a fixed-length dummy key.
  return new Uint8Array(32);
}

export async function encrypt(
  plaintext: Uint8Array,
  _key: Uint8Array
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array }> {
  // For testing, just return plaintext as ciphertext, empty iv/tag.
  return { ciphertext: plaintext, iv: new Uint8Array(0), tag: new Uint8Array(0) };
}

export async function decrypt(
  ciphertext: Uint8Array,
  _key: Uint8Array,
  _iv: Uint8Array,
  _tag: Uint8Array
): Promise<Uint8Array> {
  // Return ciphertext directly.
  return ciphertext;
}
