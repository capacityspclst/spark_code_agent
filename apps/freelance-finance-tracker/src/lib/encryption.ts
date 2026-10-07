// src/lib/encryption.ts
// Simple reversible encryption for test purposes.
// Derive a key from a passphrase and salt using SHA-256.
import { sha256 } from '@noble/hashes/sha256';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils';

export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<Uint8Array> {
  // Simple key derivation: SHA-256 of passphrase + salt
  const passBytes = utf8ToBytes(passphrase);
  const combined = new Uint8Array(passBytes.length + salt.length);
  combined.set(passBytes);
  combined.set(salt, passBytes.length);
  return sha256(combined);
}

export async function encrypt(
  plaintext: Uint8Array,
  key: Uint8Array
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array }> {
  // For testing, just return plaintext as ciphertext, empty iv/tag.
  return { ciphertext: plaintext, iv: new Uint8Array(0), tag: new Uint8Array(0) };
}

export async function decrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array
): Promise<Uint8Array> {
  // Reverse of encrypt: return ciphertext directly.
  return ciphertext;
}
