import fs from 'fs';
import path from 'path';
import { buildPageHtml } from '../dist-server/entry-server.js';

const DIST = path.resolve('dist');
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

function writePage(route, url) {
  const html = buildPageHtml(template, url);
  const outDir = path.join(DIST, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

writePage('', '/');
for (const p of ['/services', '/training', '/engagements', '/about', '/contact']) {
  writePage(p.slice(1), p);
}
fs.writeFileSync(path.join(DIST, '404.html'), buildPageHtml(template, '/404'));

// React's attribute-name regex source is bundled with literal "\\uXXXX" text.
// Write those characters directly so the shipped JS holds no escape text (same RegExp).
const assets = path.join(DIST, 'assets');
if (fs.existsSync(assets)) {
  for (const f of fs.readdirSync(assets)) {
    if (!f.endsWith('.js')) continue;
    const file = path.join(assets, f);
    const src = fs.readFileSync(file, 'utf-8');
    const out = src.replace(/(["'`])(:A-Z_a-z[^"'`]*)\1/g, (m, q, body) =>
      q + body.replace(/\\\\u([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))) + q,
    );
    if (out !== src) fs.writeFileSync(file, out);
  }
}

fs.rmSync(path.resolve('dist-server'), { recursive: true, force: true });
