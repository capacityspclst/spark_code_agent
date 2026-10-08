// src/lib/encryption.ts
// Simple XOR‑based reversible encryption for testing.
// Derive a key from a passphrase (placeholder implementation).

// Polyfill TextEncoder/TextDecoder for Node environment
let TextEncoderClass:any = (global as any).TextEncoder;
let TextDecoderClass:any = (global as any).TextDecoder;
if (!TextEncoderClass || !TextDecoderClass) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TextEncoder, TextDecoder } = require('util');
  TextEncoderClass = TextEncoder;
  TextDecoderClass = TextDecoder;
}

export async function deriveKey(_passphrase: string, _salt: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoderClass();
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
  return { ciphertext, iv: new Uint8Array(0), tag: new Uint8Array(0) };
}

export async function decrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  _iv: Uint8Array,
  _tag: Uint8Array
): Promise<Uint8Array> {
  const plaintext = new Uint8Array(ciphertext.length);
  for (let i = 0; i < ciphertext.length; i++) {
    plaintext[i] = ciphertext[i] ^ key[i % key.length];
  }
  return plaintext;
}

// Export a randomBytes helper that works in both Node and browser environments.
export function randomBytes(length: number): Uint8Array {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return arr;
  }
  // Fallback for Node.js
  const cryptoNode = require('crypto');
  return new Uint8Array(cryptoNode.randomBytes(length));
}
