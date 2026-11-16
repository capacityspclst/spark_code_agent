import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..', '..');

function readRootFile(rel: string): string {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) throw new Error(`Expected file ${rel} to exist at ${p}`);
  return fs.readFileSync(p, 'utf8');
}

describe('public files', () => {
  test('favicon.svg is the teal bell-curve mark', () => {
    const svg = readRootFile('public/favicon.svg');
    expect(svg).toMatch(/<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toMatch(/viewBox=/);
    expect(svg).toMatch(/<path/);
    expect(svg.toLowerCase()).toContain('#1f8a8a');
  });

  test('robots.txt allows everything and points to the sitemap', () => {
    const txt = readRootFile('public/robots.txt');
    const lines = txt.split(/\r?\n/).map((l) => l.trim());
    expect(lines).toContain('User-agent: *');
    expect(lines.some((l) => l === 'Allow: /' || l === 'Disallow:')).toBe(true);
    expect(lines.some((l) => /^Disallow:\s*\S/.test(l))).toBe(false);
    expect(lines).toContain('Sitemap: https://thebayesgroup.com/sitemap.xml');
  });

  test('sitemap.xml lists the five pages', () => {
    const xml = readRootFile('public/sitemap.xml');
    expect(xml).toMatch(/<urlset[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
    const locs: string[] = [];
    const re = /<loc>\s*([^<]+?)\s*<\/loc>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml))) locs.push(m[1]);
    expect(locs.sort()).toEqual(
      [
        'https://thebayesgroup.com/',
        'https://thebayesgroup.com/services',
        'https://thebayesgroup.com/training',
        'https://thebayesgroup.com/about',
        'https://thebayesgroup.com/contact',
      ].sort(),
    );
  });
});

describe('build setup', () => {
  test('build script runs vite build then the prerender script', () => {
    const pkg = JSON.parse(readRootFile('package.json'));
    const build: string = (pkg.scripts && pkg.scripts.build) || '';
    expect(build).toMatch(/vite build/);
    expect(build).toMatch(/node scripts\/prerender\.mjs/);
    expect(build.indexOf('vite build')).toBeLessThan(build.indexOf('prerender'));
  });

  test('prerender script writes every page and 404.html', () => {
    // Build in an isolated copy so this does not race other tests that build into ROOT/dist.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bayes-prerender-'));
    try {
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
      } catch (e: any) {
        throw new Error(
          `npm run build failed:\n${String(e && e.stdout ? e.stdout : '')}\n${String(e && e.stderr ? e.stderr : e)}`,
        );
      }
      const dist = path.join(tmp, 'dist');
      const expected: Array<[string, RegExp]> = [
        ['index.html', /Evidence-driven AI, built for your business\./],
        ['services/index.html', /<h1[^>]*>\s*Services\s*<\/h1>/],
        ['training/index.html', /<h1[^>]*>\s*Training\s*<\/h1>/],
        ['about/index.html', /<h1[^>]*>\s*About\s*<\/h1>/],
        ['contact/index.html', /<h1[^>]*>\s*Book a consultation\s*<\/h1>/],
        ['404.html', /<h1[^>]*>\s*Page not found\s*<\/h1>/],
      ];
      for (const [rel, h1] of expected) {
        const p = path.join(dist, rel);
        if (!fs.existsSync(p)) throw new Error(`Expected npm run build to write dist/${rel}`);
        const html = fs.readFileSync(p, 'utf8');
        expect(html).toMatch(/id=["']root["'][^>]*>\s*<\S/);
        expect(html).toMatch(/<main/);
        expect(html).toMatch(h1);
      }
    } finally {
      try {
        fs.rmSync(tmp, { recursive: true, force: true });
      } catch (e) {
        /* ignore cleanup errors */
      }
    }
  }, 600000);

  test('main.tsx hydrates the prerendered markup', () => {
    const src = readRootFile('src/main.tsx');
    expect(src).toContain('hydrateRoot');
  });

  test('entry-server uses renderToString with a StaticRouter', () => {
    const src = readRootFile('src/entry-server.tsx');
    expect(src).toContain('renderToString');
    expect(src).toContain('StaticRouter');
  });

  test('hash targets clear the sticky header', () => {
    const css = fs
      .readdirSync(path.join(ROOT, 'src', 'styles'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => fs.readFileSync(path.join(ROOT, 'src', 'styles', f), 'utf8'))
      .join('\n');
    expect(css).toMatch(/scroll-margin-top\s*:/);
  });
});

describe('DEPLOYMENT.md', () => {
  test('describes static hosting without an SPA rewrite', () => {
    const md = readRootFile('DEPLOYMENT.md');
    expect(md).toContain('404.html');
    expect(md).toContain('dist');
    expect(md).not.toMatch(/\/\*\s+\/index\.html\s+200/);
    expect(md).not.toMatch(/try_files[^;\n]*\/index\.html/);
  });
});
