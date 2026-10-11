// Simplified crypto implementation for testing environment.
// Provides deterministic encrypt/decrypt with integrity check using HMAC.
// Uses Node's crypto for random bytes, PBKDF2 key derivation, and HMAC.
import { randomBytes as nodeRandomBytes, pbkdf2Sync, createHmac, timingSafeEqual } from 'crypto';

export const KEY_BYTES = 32;
const NONCE_BYTES = 12;
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

/** Encrypt: nonce || ciphertext || hmac.
 * Ciphertext is plaintext XOR-ed with key (repeating).
 * HMAC is SHA-256 over ciphertext using key.
 */
export function encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array {
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = new Uint8Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    cipher[i] = plaintext[i] ^ key[i % key.length];
  }
  const hmac = createHmac('sha256', Buffer.from(key)).update(Buffer.from(cipher)).digest();
  const out = new Uint8Array(nonce.length + cipher.length + hmac.length);
  out.set(nonce, 0);
  out.set(cipher, nonce.length);
  out.set(hmac, nonce.length + cipher.length);
  return out;
}

/** Decrypt verifies HMAC and reverses XOR.
 * Throws on HMAC mismatch, short data, or other errors.
 */
export function decrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  const hmacSize = 32; // SHA-256 output length
  if (data.length < NONCE_BYTES + hmacSize) {
    throw new Error('Encrypted data is too short or damaged.');
  }
  const nonce = data.subarray(0, NONCE_BYTES); // unused but kept for format consistency
  const cipher = data.subarray(NONCE_BYTES, data.length - hmacSize);
  const providedHmac = data.subarray(data.length - hmacSize);
  const expectedHmac = createHmac('sha256', Buffer.from(key)).update(Buffer.from(cipher)).digest();
  if (!timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac))) {
    throw new Error('Data integrity check failed.');
  }
  const plaintext = new Uint8Array(cipher.length);
  for (let i = 0; i < cipher.length; i++) {
    plaintext[i] = cipher[i] ^ key[i % key.length];
  }
  return plaintext;
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
