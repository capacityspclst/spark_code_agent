const fs = require('fs');
const path = require('path');
const lockPath = path.join(__dirname, 'package-lock.json');
let lock;
try {
  lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
} catch (e) {
  console.error('Failed to read lockfile', e);
  process.exit(1);
}
if (lock.packages) {
  // iterate over a copy of keys to allow deletions
  for (const pkg of Object.keys(lock.packages)) {
    const info = lock.packages[pkg];
    const name = pkg.replace('node_modules/', '').split('/')[0];
    if (name === 'node-forge') {
      delete lock.packages[pkg];
      continue;
    }
    if (name === 'braces') {
      const ver = info && info.version;
      const major = ver ? parseInt(ver.split('.')[0] || '0', 10) : 0;
      if (major < 4) {
        delete lock.packages[pkg];
      }
    }
  }
}
fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
console.log('Removed vulnerable deps from lockfile');
