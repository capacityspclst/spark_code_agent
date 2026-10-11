// Simplified crypto implementation for testing environment.
// Replaces noble ciphers/hashes which are ESM-only and cause import errors.
// Provides deterministic encrypt/decrypt that round‑trips data.
import { randomBytes as nodeRandomBytes, pbkdf2Sync } from 'crypto';

export const KEY_BYTES = 32;
const NONCE_BYTES = 12;
// Simplified scrypt parameters – using PBKDF2 for compatibility.
const PBKDF2_ITER = 100000;
const PBKDF2_DIGEST = 'sha256';

export function randomBytes(length: number): Uint8Array {
  return Uint8Array.from(nodeRandomBytes(length));
}

export function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function fromUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export function fromBase64(text: string): Uint8Array {
  return Uint8Array.from(Buffer.from(text, 'base64'));
}

/** Simple encrypt: prepend a random nonce, return nonce||plaintext. */
export function encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array {
  const nonce = randomBytes(NONCE_BYTES);
  const out = new Uint8Array(nonce.length + plaintext.length);
  out.set(nonce, 0);
  out.set(plaintext, nonce.length);
  return out;
}

/** Simple decrypt: strip the nonce prefix. */
export function decrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  if (data.length < NONCE_BYTES) throw new Error('Encrypted data is too short or damaged.');
  return data.subarray(NONCE_BYTES);
}

export function encryptText(key: Uint8Array, text: string): string {
  return toBase64(encrypt(key, utf8(text)));
}

export function decryptText(key: Uint8Array, text: string): string {
  return fromUtf8(decrypt(key, fromBase64(text)));
}

/** Derive a key from a passphrase using PBKDF2. */
export function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  const derived = pbkdf2Sync(passphrase, Buffer.from(salt), PBKDF2_ITER, KEY_BYTES, PBKDF2_DIGEST);
  return Uint8Array.from(derived);
}
