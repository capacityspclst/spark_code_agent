const { scryptSync } = require('crypto');

function scrypt(passphrase, salt, opts) {
  const dkLen = (opts && opts.dkLen) ? opts.dkLen : 32;
  const derived = scryptSync(Buffer.from(passphrase), Buffer.from(salt), dkLen);
  return new Uint8Array(derived);
}

module.exports = { scrypt };
