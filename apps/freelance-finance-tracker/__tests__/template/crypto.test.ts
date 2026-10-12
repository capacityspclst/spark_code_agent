import { gcm } from '@noble/ciphers/aes.js';
import { scrypt } from '@noble/hashes/scrypt.js';
import { decrypt, decryptText, deriveKey, encrypt, encryptText, fromBase64, fromUtf8, KEY_BYTES, randomBytes, toBase64, utf8 } from '../../src/lib/crypto';

const hex = (h: string) => Uint8Array.from(h.match(/../g) ?? [], (b) => parseInt(b, 16));

describe('crypto', () => {
  const key = randomBytes(KEY_BYTES);

  it('round-trips text and binary data', () => {
    expect(decryptText(key, encryptText(key, 'receipt: $42.10 ✓'))).toBe('receipt: $42.10 ✓');
    const bytes = randomBytes(1000);
    expect(decrypt(key, encrypt(key, bytes))).toEqual(bytes);
  });

  it('uses a fresh nonce every time', () => {
    expect(encryptText(key, 'same')).not.toBe(encryptText(key, 'same'));
  });

  it('rejects a wrong key and tampered data', () => {
    const sealed = encrypt(key, utf8('secret'));
    expect(() => decrypt(randomBytes(KEY_BYTES), sealed)).toThrow();
    const tampered = sealed.slice();
    tampered[tampered.length - 1] ^= 1;
    expect(() => decrypt(key, tampered)).toThrow();
  });

  it('derives the same key from the same passphrase and salt only', () => {
    const salt = randomBytes(16);
    expect(deriveKey('correct horse', salt)).toEqual(deriveKey('correct horse', salt));
    expect(deriveKey('correct horse', salt)).not.toEqual(deriveKey('correct horse', randomBytes(16)));
    expect(deriveKey('correct horse', salt)).not.toEqual(deriveKey('wrong horse', salt));
  });

  it('base64 round-trips every length', () => {
    for (let n = 0; n < 40; n++) {
      const b = randomBytes(n);
      expect(fromBase64(toBase64(b))).toEqual(b);
    }
  });

  // Known-answer tests: only real AES-256-GCM and scrypt pass these. A home-made cipher passed the round-trip tests
  // above (run 20261010-183844 replaced this file with XOR), so this file and crypto.ts are locked by the pipeline.
  it('matches the NIST AES-256-GCM test vectors (nonce || ciphertext || tag)', () => {
    const zeroKey = new Uint8Array(32);
    // GCM spec test case 13: empty plaintext.
    expect(decrypt(zeroKey, hex('000000000000000000000000530f8afbc74536b9a963b4f1c4cb738b'))).toEqual(new Uint8Array(0));
    // Test case 14: 16 zero bytes.
    const sealed = hex('000000000000000000000000' + 'cea7403d4d606b6e074ec5d3baf39d18' + 'd0d1c8a799996bf0265b98b5d48ab919');
    expect(decrypt(zeroKey, sealed)).toEqual(new Uint8Array(16));
  });

  it('interoperates with the reference AES-GCM implementation both ways', () => {
    const k = randomBytes(KEY_BYTES);
    const mine = encrypt(k, utf8('mileage 12.4 mi'));
    expect(mine.length).toBe(12 + 'mileage 12.4 mi'.length + 16);
    expect(fromUtf8(gcm(k, mine.subarray(0, 12)).decrypt(mine.subarray(12)))).toBe('mileage 12.4 mi');
    const nonce = randomBytes(12);
    const theirs = gcm(k, nonce).encrypt(utf8('receipt'));
    const data = new Uint8Array(12 + theirs.length);
    data.set(nonce, 0);
    data.set(theirs, 12);
    expect(fromUtf8(decrypt(k, data))).toBe('receipt');
  });

  it('derives passphrase keys with scrypt (N=2^15, r=8, p=1)', () => {
    const salt = hex('00112233445566778899aabbccddeeff');
    expect(deriveKey('correct horse battery', salt)).toEqual(
      scrypt(utf8('correct horse battery'), salt, { N: 2 ** 15, r: 8, p: 1, dkLen: 32 }),
    );
  });
});
