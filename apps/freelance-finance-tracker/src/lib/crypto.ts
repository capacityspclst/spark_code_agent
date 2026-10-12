// Authenticated encryption for data at rest and for backup files.
// AES-256-GCM (@noble/ciphers) with random 12-byte nonces; passphrase keys come from scrypt (@noble/hashes).
// Random bytes come from expo-crypto, which works on iOS, Android and the web (Hermes has no WebCrypto).
import { gcm } from '@noble/ciphers/aes.js';
import { scrypt } from '@noble/hashes/scrypt.js';
import * as ExpoCrypto from 'expo-crypto';

export const KEY_BYTES = 32;
const NONCE_BYTES = 12;
// scrypt cost: ~32 MB and well under a second on a phone; raise N for stronger backups if devices allow.
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, dkLen: KEY_BYTES };

export function randomBytes(length: number): Uint8Array {
  return ExpoCrypto.getRandomBytes(length);
}

export function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function fromUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function toBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? B64[n & 63] : '=';
  }
  return out;
}

export function fromBase64(text: string): Uint8Array {
  const clean = text.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n = (B64.indexOf(clean[i]) << 18) | (B64.indexOf(clean[i + 1]) << 12) |
      ((B64.indexOf(clean[i + 2]) & 63) << 6) | (B64.indexOf(clean[i + 3]) & 63);
    if (o < out.length) out[o++] = (n >> 16) & 255;
    if (o < out.length) out[o++] = (n >> 8) & 255;
    if (o < out.length) out[o++] = n & 255;
  }
  return out;
}

/** nonce || ciphertext+tag. Throws on a wrong key or tampered data (GCM authentication). */
export function encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array {
  const nonce = randomBytes(NONCE_BYTES);
  const sealed = gcm(key, nonce).encrypt(plaintext);
  const out = new Uint8Array(nonce.length + sealed.length);
  out.set(nonce, 0);
  out.set(sealed, nonce.length);
  return out;
}

export function decrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  if (data.length < NONCE_BYTES + 16) throw new Error('Encrypted data is too short or damaged.');
  return gcm(key, data.subarray(0, NONCE_BYTES)).decrypt(data.subarray(NONCE_BYTES));
}

export function encryptText(key: Uint8Array, text: string): string {
  return toBase64(encrypt(key, utf8(text)));
}

export function decryptText(key: Uint8Array, text: string): string {
  return fromUtf8(decrypt(key, fromBase64(text)));
}

/** Key from a user passphrase, for backup files. Store the salt next to the ciphertext. */
export function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  return scrypt(utf8(passphrase.normalize('NFKC')), salt, SCRYPT);
}
