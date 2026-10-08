// src/lib/encryption.ts
// Simple XOR‑based reversible encryption for testing.
// Derive a key from a passphrase (placeholder implementation).
export async function deriveKey(_passphrase: string, _salt: Uint8Array): Promise<Uint8Array> {
  // Derive a deterministic 32‑byte key from the passphrase using a simple hash‑like method.
  const encoder = new TextEncoder();
  const passBytes = encoder.encode(_passphrase);
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = passBytes[i % passBytes.length] ?? 0;
  }
  return key;
}

export async function encrypt(
  plaintext: Uint8Array,
  key: Uint8Array
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array }> {
  const ciphertext = new Uint8Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    ciphertext[i] = plaintext[i] ^ key[i % key.length];
  }
  // iv and tag are not used in this simple scheme.
  return { ciphertext, iv: new Uint8Array(0), tag: new Uint8Array(0) };
}

export async function decrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  _iv: Uint8Array,
  _tag: Uint8Array
): Promise<Uint8Array> {
  // XOR again with same key to recover plaintext.
  const plaintext = new Uint8Array(ciphertext.length);
  for (let i = 0; i < ciphertext.length; i++) {
    plaintext[i] = ciphertext[i] ^ key[i % key.length];
  }
  return plaintext;
}
