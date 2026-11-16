import fs from 'fs';
import path from 'path';
import { buildPageHtml } from '../dist-server/entry-server.js';

const DIST = path.resolve('dist');
const TEMPLATE_PATH = path.join(DIST, 'index.html');
const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

function writePage(route, url) {
  const html = buildPageHtml(template, url);
  const outDir = path.join(DIST, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

// Home page
writePage('', '/');
// Other pages
['/services', '/training', '/about', '/contact'].forEach((p) => {
  const route = p.slice(1); // remove leading slash
  writePage(route, p);
});
// 404 page
const notFoundHtml = buildPageHtml(template, '/404');
fs.writeFileSync(path.join(DIST, '404.html'), notFoundHtml);

// Clean up SSR bundle
const SSR_DIR = path.resolve('dist-server');
if (fs.existsSync(SSR_DIR)) {
  fs.rmSync(SSR_DIR, { recursive: true, force: true });
}
