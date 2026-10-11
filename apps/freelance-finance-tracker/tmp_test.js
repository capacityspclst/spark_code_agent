const {randomBytes, encrypt, decrypt, KEY_BYTES}=require('./src/lib/crypto');
const key = randomBytes(KEY_BYTES);
const sealed = encrypt(key, new TextEncoder().encode('secret'));
console.log('sealed length', sealed.length);
try{decrypt(randomBytes(KEY_BYTES), sealed); console.log('no throw');}catch(e){console.log('threw wrong key', e.message);}
const tampered = Uint8Array.from(sealed);
tampered[tampered.length-1] ^= 1;
try{decrypt(key, tampered); console.log('no throw tampered');}catch(e){console.log('threw tampered', e.message);}
