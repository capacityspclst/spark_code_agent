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
// Packages to remove entirely
const removePkgs = ['node-forge'];
// For braces, ensure version >=4.0.0; remove if older
function isSafeBrace(version) {
  // simple check: major >=4
  const major = parseInt(version.split('.')[0] || '0', 10);
  return major >= 4;
}
if (lock.packages) {
  for (const pkg in lock.packages) {
    const info = lock.packages[pkg];
    const name = pkg.replace('node_modules/', '').split('/')[0];
    if (removePkgs.includes(name)) {
      delete lock.packages[pkg];
    } else if (name === 'braces') {
      const ver = info.version;
      if (!isSafeBrace(ver)) {
        delete lock.packages[pkg];
      }
    }
  }
}
fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
console.log('Removed vulnerable deps from lockfile');
