/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');

const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

const FILES: Array<[string, string, string]> = [
  ['index.html', 'The Bayes Group | Evidence-driven AI', 'Evidence-driven AI, built for your business.'],
  ['services/index.html', 'Services | The Bayes Group', 'Services'],
  ['training/index.html', 'Training | The Bayes Group', 'Training'],
  ['engagements/index.html', 'Engagements | The Bayes Group', 'Engagements'],
  ['about/index.html', 'About | The Bayes Group', 'About'],
  ['contact/index.html', 'Contact | The Bayes Group', 'Book a consultation'],
  ['404.html', 'Page not found | The Bayes Group', 'Page not found'],
];

const PHOTOS = [
  'hero-boardroom',
  'smb-owner',
  'team-workshop',
  'enterprise-atrium',
  'custom-development',
  'strategy-session',
  'about-office',
  'contact-meeting',
];

let buildError: Error | null = null;

beforeAll(() => {
  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 540000 });
  } catch (e: any) {
    buildError = new Error(
      `npm run build failed:\n${String(e && e.stdout ? e.stdout : '')}\n${String(e && e.stderr ? e.stderr : e)}`,
    );
  }
}, 600000);

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('npm run build writes prerendered pages', () => {
  test.each(FILES)('dist/%s is a complete prerendered page', (rel, title, h1Text) => {
    if (buildError) throw buildError;
    const p = path.join(DIST, rel);
    if (!fs.existsSync(p)) throw new Error(`Expected npm run build to write dist/${rel}`);
    const doc = parse(fs.readFileSync(p, 'utf8'));
    const titles = doc.querySelectorAll('title');
    expect(titles).toHaveLength(1);
    expect(norm(titles[0].textContent)).toBe(title);
    const root = doc.getElementById('root');
    expect(root).not.toBeNull();
    expect(root!.querySelector('header')).not.toBeNull();
    expect(root!.querySelectorAll('main')).toHaveLength(1);
    expect(root!.querySelector('footer')).not.toBeNull();
    const h1s = root!.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(norm(h1s[0].textContent)).toBe(h1Text);
    expect(doc.querySelectorAll('script[type="module"]').length).toBeGreaterThan(0);
  });

  test('dist/images holds every photo in both sizes', () => {
    if (buildError) throw buildError;
    for (const name of PHOTOS) {
      for (const file of [`${name}.jpg`, `${name}-768.jpg`]) {
        const p = path.join(DIST, 'images', file);
        if (!fs.existsSync(p)) throw new Error(`Expected npm run build to copy dist/images/${file}`);
      }
    }
  });

  test('prerendered home page references the hero photo with srcset', () => {
    if (buildError) throw buildError;
    const doc = parse(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8'));
    const img = Array.from(doc.querySelectorAll('img')).find(
      (i) => i.getAttribute('src') === '/images/hero-boardroom.jpg',
    );
    if (!img) throw new Error('dist/index.html has no <img src="/images/hero-boardroom.jpg">');
    expect(img.getAttribute('srcset') || '').toContain('/images/hero-boardroom-768.jpg 768w');
  });
});
