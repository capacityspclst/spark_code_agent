// Crypto utilities using AES-256-GCM for strong authenticated encryption.
// Works in Node (tests) via the built‑in crypto module. On native platforms the same module works via polyfills provided by Expo.

import { randomBytes as expoRandomBytes } from 'expo-crypto';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';

export const KEY_BYTES = 32;
const NONCE_BYTES = 12; // 96‑bit nonce for GCM

/** Random bytes – uses Expo's Crypto on native, fallback to Node's crypto for tests. */
export function randomBytes(length: number): Uint8Array {
  if (Platform.OS === 'web' || process.env.NODE_ENV === 'test') {
    // Node's crypto provides secure random bytes.
    const { randomBytes } = require('crypto');
    return Uint8Array.from(randomBytes(length));
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getRandomBytes } = require('expo-crypto');
  return Uint8Array.from(getRandomBytes(length));
}

export function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function fromUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/** Base64 helpers – use Buffer when available. */
function getBuffer(): any {
  if (typeof Buffer !== 'undefined') return Buffer;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('buffer').Buffer;
}

export function toBase64(bytes: Uint8Array): string {
  return getBuffer().from(bytes).toString('base64');
}

export function fromBase64(text: string): Uint8Array {
  return Uint8Array.from(getBuffer().from(text, 'base64'));
}

/** Encrypt using AES‑256‑GCM. Output: nonce || ciphertext || authTag */
export function encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array {
  const nonce = randomBytes(NONCE_BYTES);
  const crypto = require('crypto');
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(nonce));
  const encrypted = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const out = new Uint8Array(nonce.length + encrypted.length + authTag.length);
  out.set(nonce, 0);
  out.set(encrypted, nonce.length);
  out.set(authTag, nonce.length + encrypted.length);
  return out;
}

/** Decrypt verifies the GCM tag and returns plaintext. */
export function decrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  const authTagSize = 16; // GCM tag length
  if (data.length < NONCE_BYTES + authTagSize) {
    throw new Error('Encrypted data is too short or damaged.');
  }
  const nonce = data.subarray(0, NONCE_BYTES);
  const authTag = data.subarray(data.length - authTagSize);
  const ciphertext = data.subarray(NONCE_BYTES, data.length - authTagSize);
  const crypto = require('crypto');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(nonce));
  decipher.setAuthTag(Buffer.from(authTag));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext)), decipher.final()]);
  return new Uint8Array(decrypted);
}

export function encryptText(key: Uint8Array, text: string): string {
  return toBase64(encrypt(key, utf8(text)));
}

export function decryptText(key: Uint8Array, text: string): string {
  return fromUtf8(decrypt(key, fromBase64(text)));
}

/** Derive a key from a passphrase – use PBKDF2 with a random salt (provided by caller). */
export function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  const crypto = require('crypto');
  // 100,000 iterations of SHA‑256 – adequate for offline derivation.
  const key = crypto.pbkdf2Sync(passphrase, Buffer.from(salt), 100000, KEY_BYTES, 'sha256');
  return new Uint8Array(key);
}
