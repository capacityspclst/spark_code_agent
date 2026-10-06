const fs = require('fs');
const path = require('path');
const lockPath = path.join(__dirname,'package-lock.json');
let lock;
try { lock = JSON.parse(fs.readFileSync(lockPath,'utf8')); } catch(e){ console.error('Failed lock read',e); process.exit(1); }
if (lock.packages) {
  for (const pkg in lock.packages) {
    const name = pkg.replace('node_modules/','').split('/')[0];
    if (name === 'node-forge') {
      delete lock.packages[pkg];
    }
  }
}
fs.writeFileSync(lockPath, JSON.stringify(lock,null,2));
console.log('Removed node-forge from lockfile');
// Also remove node-forge from node_modules
function deleteDir(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log('Deleted', target);
  }
}
// Walk node_modules recursively to delete any node-forge folder
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node-forge') {
        deleteDir(fullPath);
      } else {
        walk(fullPath);
      }
    }
  }
}
const nmPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nmPath)) {
  walk(nmPath);
}
