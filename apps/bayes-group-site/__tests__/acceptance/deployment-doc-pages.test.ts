import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const md = fs.readFileSync(path.join(ROOT, 'DEPLOYMENT.md'), 'utf8');
const flatAll = md.replace(/\s+/g, ' ');

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

function section(title: string): string {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${escRe(title)}\\s*$`).test(l.trim()));
  if (start === -1) {
    throw new Error(`DEPLOYMENT.md has no "## ${title}" section. Headings: ${JSON.stringify(lines.filter((l) => /^#/.test(l)))}`);
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

describe('DEPLOYMENT.md: Static deployment lists every prerendered page', () => {
  const FILES = [
    'dist/index.html',
    'dist/services/index.html',
    'dist/systems/index.html',
    'dist/training/index.html',
    'dist/engagements/index.html',
    'dist/about/index.html',
    'dist/contact/index.html',
    'dist/404.html',
  ];

  test.each(FILES)('Static deployment names %s', (file) => {
    const s = section('Static deployment');
    if (!new RegExp(`(^|[^\\w/])${escRe(file)}(?![\\w/-])`).test(s)) {
      throw new Error(`"## Static deployment" does not name ${file}. Section:\n${s}`);
    }
  });

  test('dist/index.html is marked as the / page', () => {
    const s = section('Static deployment');
    expect(s).toMatch(/dist\/index\.html`?\s*\(\s*\/\s*\)/);
  });
});

describe('DEPLOYMENT.md: SEO files', () => {
  test('sitemap.xml lists the seven pages at https://thebayesgroup.com', () => {
    const s = norm(section('SEO files'));
    expect(s).toContain('sitemap.xml');
    expect(s).toContain('https://thebayesgroup.com');
    if (!/\b(seven|7)\b[^.]{0,20}pages/i.test(s)) {
      throw new Error(`"## SEO files" should say the sitemap lists the seven pages. Section: ${s}`);
    }
    expect(s).not.toMatch(/\bfive pages\b/i);
  });

  test.each(['/services', '/systems', '/training', '/engagements', '/about', '/contact'])(
    'SEO files names the %s page',
    (p) => {
      const s = section('SEO files');
      if (!new RegExp(`(^|[^\\w/])${escRe(p)}(?![\\w/-])`).test(s)) {
        throw new Error(`"## SEO files" does not list ${p}. Section:\n${s}`);
      }
    },
  );

  test('SEO files names the home page /', () => {
    const s = section('SEO files').replace(/https?:\/\/\S+/g, ' ');
    if (!/(^|[\s(`,])\/(?=[\s)`,]|$)/m.test(s)) {
      throw new Error(`"## SEO files" does not list the home page "/". Section:\n${section('SEO files')}`);
    }
  });

  test('mentions dist/images/ holding the photos, copied from public/', () => {
    const s = norm(section('SEO files'));
    expect(s).toMatch(/dist\/images\/?/);
    expect(s).toMatch(/photo/i);
    expect(s).toMatch(/public\//);
  });
});

describe('DEPLOYMENT.md: other statements kept', () => {
  test('upload dist/ as it is to any static host, no backend', () => {
    const s = norm(section('Static deployment'));
    expect(s).toMatch(/upload/i);
    expect(s).toMatch(/as it is/i);
    expect(s).toMatch(/static host/i);
    expect(s).toMatch(/no backend/i);
  });

  test('no SPA rewrite rule or fallback, every page its own file', () => {
    const s = norm(section('Static deployment'));
    expect(s).toMatch(/no SPA rewrite rule or fallback/i);
    expect(s).toMatch(/its own file/i);
  });

  test('unknown addresses get 404.html with the nginx example', () => {
    const s = section('Static deployment');
    expect(norm(s)).toMatch(/Unknown addresses get `?404\.html`?/);
    expect(s).toMatch(/try_files \$uri \$uri\/ =404;/);
    expect(s).toMatch(/error_page 404 \/404\.html;/);
    expect(s).not.toMatch(/try_files[^;\n]*\/index\.html/);
  });

  test('deployment check of /services and /no-such-page', () => {
    const s = norm(section('Static deployment'));
    expect(s).toContain('/services');
    expect(s).toContain('/no-such-page');
    expect(s).toContain('Page not found');
    expect(s).toMatch(/404/);
  });

  test('Security headers section is unchanged', () => {
    const expected = [
      'Set these headers on the host:',
      "- `Content-Security-Policy: default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; frame-ancestors 'none'`",
      '- `X-Content-Type-Options: nosniff`',
      '- `Referrer-Policy: strict-origin-when-cross-origin`',
      '- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS only)',
      '- Serve everything over HTTPS and cache `assets/` (hashed file names) for a long time.',
    ].join('\n');
    expect(norm(section('Security headers'))).toBe(norm(expected));
  });

  test('no Dockerfiles or CI files added', () => {
    for (const f of ['Dockerfile', 'docker-compose.yml', '.gitlab-ci.yml', path.join('.github', 'workflows')]) {
      if (fs.existsSync(path.join(ROOT, f))) throw new Error(`Unexpected file added to the app: ${f}`);
    }
    expect(flatAll).not.toMatch(/^FROM\s+\S+/m);
  });
});
