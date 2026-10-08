import { decrypt, decryptText, deriveKey, encrypt, encryptText, fromBase64, KEY_BYTES, randomBytes, toBase64, utf8 } from '../../src/lib/crypto';

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
});
