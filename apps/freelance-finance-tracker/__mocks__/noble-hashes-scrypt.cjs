const { scryptSync } = require('crypto');

/** Simple mock for @noble/hashes/scrypt.js */
function scrypt(passphrase, salt, opts) {
  // opts may contain N, r, p, dkLen etc. We'll use dkLen.
  const dkLen = opts?.dkLen || 32;
  const derived = scryptSync(Buffer.from(passphrase), Buffer.from(salt), dkLen);
  return new Uint8Array(derived);
}

module.exports = { scrypt };
