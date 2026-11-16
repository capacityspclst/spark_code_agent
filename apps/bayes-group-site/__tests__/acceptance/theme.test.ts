import * as fs from 'fs';
import * as path from 'path';
import { THEME } from '../../src/theme/tokens';
import { contrastRatio } from '../../src/lib/contrast';

const ROOT = path.resolve(__dirname, '..', '..');

function readRootFile(rel: string): string {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    throw new Error(`Expected file ${rel} to exist at ${p}`);
  }
  return fs.readFileSync(p, 'utf8');
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

function allSourceText(): string {
  return listFiles(path.join(ROOT, 'src'))
    .filter((f) => /\.(ts|tsx|css)$/.test(f))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
}

describe('contrastRatio', () => {
  test('black on white is 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });
  test('same color is 1', () => {
    expect(contrastRatio('#1F8A8A', '#1F8A8A')).toBeCloseTo(1, 5);
  });
  test('symmetric and case-insensitive', () => {
    expect(contrastRatio('#0b1f3a', '#ffffff')).toBeCloseTo(contrastRatio('#FFFFFF', '#0B1F3A'), 5);
  });
  test('known value: #777777 on white ~ 4.48', () => {
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 1);
  });
});

describe('theme tokens', () => {
  test('brand colors', () => {
    expect(THEME.navy.toUpperCase()).toBe('#0B1F3A');
    expect(THEME.accent.toUpperCase()).toBe('#1F8A8A');
    expect(THEME.white.toUpperCase()).toBe('#FFFFFF');
  });

  test('text colors meet WCAG AA on white', () => {
    for (const key of ['text', 'mutedText', 'accentText'] as const) {
      const c = (THEME as any)[key] as string;
      if (typeof c !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(c)) {
        throw new Error(`THEME.${key} must be a 6-digit hex color, got ${JSON.stringify(c)}`);
      }
      const ratio = contrastRatio(c, '#FFFFFF');
      if (ratio < 4.5) throw new Error(`THEME.${key} ${c} contrast on white is ${ratio}, need >= 4.5`);
    }
  });

  test('white on navy meets AA', () => {
    expect(contrastRatio('#FFFFFF', THEME.navy)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('static files', () => {
  test('theme.css defines tokens', () => {
    const css = readRootFile('src/styles/theme.css');
    expect(css).toMatch(/:root/);
    expect(css).toMatch(/--color-navy\s*:\s*#0B1F3A/i);
    expect(css).toMatch(/--color-accent\s*:\s*#1F8A8A/i);
    expect(css).toMatch(/--font-serif\s*:[^;]*\bserif\b/);
    expect(css).toMatch(/--font-sans\s*:[^;]*sans-serif/);
    expect(css).not.toMatch(/@import[^;]*https?:/i);
  });

  test('index.html loads no external resources', () => {
    const html = readRootFile('index.html');
    expect(html).toMatch(/<html[^>]*lang="en"/i);
    expect(html).toMatch(/name="viewport"/i);
    expect(html).toContain('The Bayes Group | Evidence-driven AI');
    expect(html).not.toMatch(/<script[^>]+src=["']https?:/i);
    expect(html).not.toMatch(/<script[^>]+src=["']\/\//i);
    expect(html).not.toMatch(/<link[^>]+href=["'](https?:)?\/\//i);
  });

  test('no font CDNs or analytics in sources', () => {
    const src = allSourceText();
    expect(src).not.toMatch(/fonts\.googleapis|fonts\.gstatic|googletagmanager|google-analytics/i);
  });

  test('package.json build script and no install hooks', () => {
    const pkg = JSON.parse(readRootFile('package.json'));
    expect(pkg.scripts && pkg.scripts.build).toMatch(/vite build/);
    for (const hook of ['preinstall', 'postinstall', 'prepare']) {
      if (pkg.scripts[hook] !== undefined) {
        throw new Error(`package.json must not define a "${hook}" script, found: ${pkg.scripts[hook]}`);
      }
    }
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    expect(deps).toHaveProperty('react');
    expect(deps).toHaveProperty('react-router-dom');
  });

  test('UI sources contain key interactive pieces', () => {
    const src = allSourceText();
    for (const s of ['Menu', 'aria-expanded', 'aria-pressed', 'Send message', 'What can we help with?', 'Page not found', 'noValidate']) {
      if (!src.includes(s)) throw new Error(`Expected src/ to contain "${s}"`);
    }
  });
});
