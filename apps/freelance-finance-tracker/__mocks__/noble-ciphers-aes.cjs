const { createCipheriv, createDecipheriv } = require('crypto');

function gcm(key, nonce) {
  return {
    encrypt(plaintext) {
      const cipher = createCipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(nonce));
      const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]);
      const tag = cipher.getAuthTag();
      return Uint8Array.from(Buffer.concat([ciphertext, tag]));
    },
    decrypt(data) {
      const tag = data.slice(data.length - 16);
      const ciphertext = data.slice(0, data.length - 16);
      const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(nonce), { authTagLength: 16 });
      decipher.setAuthTag(Buffer.from(tag));
      const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertext)), decipher.final()]);
      return Uint8Array.from(plaintext);
    },
  };
}

module.exports = { gcm };
