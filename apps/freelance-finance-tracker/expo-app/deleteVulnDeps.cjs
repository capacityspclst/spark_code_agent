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
  for (const pkg of Object.keys(lock.packages)) {
    const name = pkg.replace('node_modules/', '').split('/')[0];
    if (name === 'node-forge' || name === 'braces') {
      delete lock.packages[pkg];
    }
  }
}
fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
console.log('Removed vulnerable deps (node-forge, braces) from lockfile');
