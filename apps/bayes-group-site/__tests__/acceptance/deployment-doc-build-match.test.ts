import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..', '..');
const md = fs.readFileSync(path.join(ROOT, 'DEPLOYMENT.md'), 'utf8');

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function section(title: string): string {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${escRe(title)}\\s*$`).test(l.trim()));
  if (start === -1) throw new Error(`DEPLOYMENT.md has no "## ${title}" section`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

let tmp = '';
let builtHtml: string[] = [];
let buildError: Error | null = null;

beforeAll(() => {
  // Build in an isolated copy so this does not race other tests that build into ROOT/dist.
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bayes-docmatch-'));
  const skip = new Set(['node_modules', 'dist', '.git', 'coverage']);
  for (const entry of fs.readdirSync(ROOT)) {
    if (skip.has(entry)) continue;
    (fs as any).cpSync(path.join(ROOT, entry), path.join(tmp, entry), { recursive: true });
  }
  fs.symlinkSync(
    path.join(ROOT, 'node_modules'),
    path.join(tmp, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  try {
    execSync('npm run build', { cwd: tmp, stdio: 'pipe', timeout: 540000 });
    const dist = path.join(tmp, 'dist');
    builtHtml = listFiles(dist)
      .filter((f) => f.endsWith('.html'))
      .map((f) => 'dist/' + path.relative(dist, f).split(path.sep).join('/'))
      .sort();
  } catch (e: any) {
    buildError = new Error(
      `npm run build failed:\n${String(e && e.stdout ? e.stdout : '')}\n${String(e && e.stderr ? e.stderr : e)}`,
    );
  }
}, 600000);

afterAll(() => {
  try {
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  } catch (e) {
    /* ignore cleanup errors */
  }
});

describe('DEPLOYMENT.md prerendered file list matches npm run build', () => {
  test('build writes dist/systems/index.html and dist/engagements/index.html', () => {
    if (buildError) throw buildError;
    const dist = path.join(tmp, 'dist');
    const s = section('Static deployment');
    const expected: Array<[string, RegExp]> = [
      ['systems/index.html', /<h1[^>]*>\s*Systems engineering\s*<\/h1>/],
      ['engagements/index.html', /<h1[^>]*>\s*Engagements\s*<\/h1>/],
    ];
    for (const [rel, h1] of expected) {
      const p = path.join(dist, rel);
      if (!fs.existsSync(p)) throw new Error(`Expected npm run build to write dist/${rel}`);
      const html = fs.readFileSync(p, 'utf8');
      expect(html).toMatch(/<main/);
      expect(html).toMatch(h1);
      const file = `dist/${rel}`;
      if (!new RegExp(`(^|[^\\w/])${escRe(file)}(?![\\w/-])`).test(s)) {
        throw new Error(`"## Static deployment" in DEPLOYMENT.md does not name ${file}, which the build writes. Section:\n${s}`);
      }
    }
  });

  test('the HTML files named under Static deployment are exactly the HTML files the build writes', () => {
    if (buildError) throw buildError;
    const s = section('Static deployment');
    const documented = Array.from(new Set(s.match(/dist\/[\w./-]*?\.html/g) || [])).sort();
    if (JSON.stringify(documented) !== JSON.stringify(builtHtml)) {
      throw new Error(
        `Documented files ${JSON.stringify(documented)} do not match built HTML files ${JSON.stringify(builtHtml)}`,
      );
    }
    expect(documented).toEqual([
      'dist/404.html',
      'dist/about/index.html',
      'dist/contact/index.html',
      'dist/engagements/index.html',
      'dist/index.html',
      'dist/services/index.html',
      'dist/systems/index.html',
      'dist/training/index.html',
    ]);
  });
});
