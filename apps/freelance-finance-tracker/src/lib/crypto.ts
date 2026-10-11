// Crypto utilities compatible with both Node (tests) and React Native (Expo).
// Implements simple XOR encryption with a deterministic checksum/MAC.

export const KEY_BYTES = 32;
const NONCE_BYTES = 12;

/** Random bytes – uses Expo's Crypto if available. */
export function randomBytes(length: number): Uint8Array {
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

/** Base64 helpers – use Buffer when available, else fallback. */
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

/** Compute a simple 4‑byte MAC/checksum based on key and data. */
function computeMac(key: Uint8Array, data: Uint8Array): Uint8Array {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + (data[i] ^ key[i % key.length])) >>> 0;
  }
  const out = new Uint8Array(4);
  out[0] = (sum >>> 24) & 0xff;
  out[1] = (sum >>> 16) & 0xff;
  out[2] = (sum >>> 8) & 0xff;
  out[3] = sum & 0xff;
  return out;
}

/** Encrypt: nonce || ciphertext || MAC. */
export function encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array {
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = new Uint8Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    cipher[i] = plaintext[i] ^ key[i % key.length];
  }
  const mac = computeMac(key, cipher);
  const out = new Uint8Array(nonce.length + cipher.length + mac.length);
  out.set(nonce, 0);
  out.set(cipher, nonce.length);
  out.set(mac, nonce.length + cipher.length);
  return out;
}

/** Decrypt verifies MAC and reverses XOR. */
export function decrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  const macSize = 4;
  if (data.length < NONCE_BYTES + macSize) {
    throw new Error('Encrypted data is too short or damaged.');
  }
  const cipher = data.subarray(NONCE_BYTES, data.length - macSize);
  const providedMac = data.subarray(data.length - macSize);
  const expectedMac = computeMac(key, cipher);
  const equal = providedMac.length === expectedMac.length && providedMac.every((v, i) => v === expectedMac[i]);
  if (!equal) {
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

/** Derive a key from a passphrase – simple deterministic fallback. */
export function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  const passBytes = utf8(passphrase);
  const combined = new Uint8Array(passBytes.length + salt.length);
  combined.set(passBytes);
  combined.set(salt, passBytes.length);
  const out = new Uint8Array(KEY_BYTES);
  for (let i = 0; i < KEY_BYTES; i++) {
    out[i] = combined[i % combined.length] ^ (i & 0xff);
  }
  return out;
}
