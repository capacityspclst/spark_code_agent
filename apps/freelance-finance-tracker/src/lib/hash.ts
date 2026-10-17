import { createHash } from 'crypto';

export function sha256(data: Uint8Array): Uint8Array {
  return Uint8Array.from(createHash('sha256').update(Buffer.from(data)).digest());
}

export function utf8ToBytes(str: string): Uint8Array {
  return Uint8Array.from(Buffer.from(str, 'utf8'));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}
