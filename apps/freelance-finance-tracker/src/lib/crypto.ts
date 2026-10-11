// Crypto utilities using AES-256-GCM for strong authenticated encryption.
// Works in Node (tests) via @noble/ciphers and in Expo via the same library (bundled).

import { getRandomBytes } from 'expo-crypto';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';
import * as aes from '@noble/ciphers/aes.js'; // AES implementation with GCM mode
import { sha256 } from '@noble/hashes/sha256';

export const KEY_BYTES = 32;
const NONCE_BYTES = 12; // 96-bit nonce for GCM

/** Random bytes – uses Expo's Crypto on native/web and fallback to Node's crypto for tests. */
export function randomBytes(length: number): Uint8Array {
  if (process.env.NODE_ENV === 'test' || Platform.OS === 'web') {
    const { randomBytes } = require('crypto'); // Node built‑in
    return Uint8Array.from(randomBytes(length));
  }
  // Expo Crypto provides getRandomBytes on native platforms.
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
  return UintArray.from ? UintArray.from(getBuffer().from(text, 'base64')) : Uint8Array.from(getBuffer().from(text, 'base64'));
}

/** Encrypt using AES‑256‑GCM. Output format: nonce || ciphertext || authTag */
export function encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array {
  const nonce = randomBytes(NONCE_BYTES);
  const { encrypt } = aes.gcm(key, nonce);
  const encrypted = encrypt(plaintext); // ciphertext || authTag
  const out = new Uint8Array(nonce.length + encrypted.length);
  out.set(nonce, 0);
  out.set(encrypted, nonce.length);
  return out;
}

/** Decrypt verifies the GCM tag and returns plaintext. */
export function decrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  const authTagSize = 16; // GCM tag length
  if (data.length < NONCE_BYTES + authTagSize) {
    throw new Error('Encrypted data is too short or damaged.');
  }
  const nonce = data.subarray(0, NONCE_BYTES);
  const ciphertext = data.subarray(NONCE_BYTES);
  const { decrypt } = aes.gcm(key, nonce);
  return decrypt(ciphertext);
}

export function encryptText(key: Uint8Array, text: string): string {
  return toBase64(encrypt(key, utf8(text)));
}

export function decryptText(key: Uint8Array, text: string): string {
  return fromUtf8(decrypt(key, fromBase64(text)));
}

/** Derive a key from a passphrase using a simple iterative SHA‑256 KDF. */
export function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  // Combine passphrase and salt.
  let keyMaterial = new Uint8Array([...utf8(passphrase), ...salt]);
  // Perform 1000 iterations of SHA‑256 – sufficient for offline derivation in this context.
  for (let i = 0; i < 1000; i++) {
    keyMaterial = sha256(keyMaterial);
  }
  // Truncate or pad to KEY_BYTES.
  if (keyMaterial.length > KEY_BYTES) {
    return keyMaterial.subarray(0, KEY_BYTES);
  }
  const out = new Uint8Array(KEY_BYTES);
  out.set(keyMaterial);
  return out;
}
