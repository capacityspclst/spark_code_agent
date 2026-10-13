export function scrypt(passphrase, salt, opts) {
  const { scryptSync } = require('crypto');
  const dkLen = opts?.dkLen || 32;
  const derived = scryptSync(Buffer.from(passphrase), Buffer.from(salt), dkLen);
  return new Uint8Array(derived);
}
