import * as fs from 'fs';
import * as path from 'path';
import {
  HERO,
  CREDIBILITY_POINTS,
  WHO_WE_SERVE,
  CASE_STUDIES,
  CASE_STUDY_NOTE,
  TESTIMONIAL,
} from '../../src/content/home';
import { ENGAGEMENTS_INTRO, ENGAGEMENT_TIERS } from '../../src/content/engagements';
import { PHOTOS } from '../../src/content/images';

const ROOT = path.resolve(__dirname, '..', '..');

function readRootFile(rel: string): string {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) throw new Error(`Expected file ${rel} to exist at ${p}`);
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

function allCss(): string {
  return listFiles(path.join(ROOT, 'src'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

function sentenceCount(s: string): number {
  const m = s.trim().match(/[.!?](?=\s+[A-Z0-9"']|\s*$)/g);
  return m ? m.length : 0;
}

function splitReduce(css: string): { inside: string; outside: string } {
  const re = /@media[^{]*prefers-reduced-motion\s*:\s*reduce[^{]*\{/g;
  const inside: string[] = [];
  let outside = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    const start = i;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    inside.push(css.slice(start, i - 1));
    outside += css.slice(last, m.index);
    last = i;
    re.lastIndex = i;
  }
  outside += css.slice(last);
  return { inside: inside.join('\n'), outside };
}

type Rule = { selector: string; body: string };

function cssRules(css: string): Rule[] {
  const out: Rule[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hasClass(selector: string, cls: string): boolean {
  return new RegExp(`\\.${escRe(cls)}(?![\\w-])`).test(selector);
}

function subjectClasses(part: string, marker?: RegExp): string[] {
  const tokens = part.trim().split(/[\s>+~]+/).filter(Boolean);
  const tok = marker ? tokens.find((t) => marker.test(t)) : tokens[tokens.length - 1];
  if (!tok) return [];
  const out: string[] = [];
  const re = /\.([\w-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tok))) out.push(m[1]);
  return out;
}

const PHOTO_NAMES = [
  'hero-boardroom',
  'smb-owner',
  'team-workshop',
  'enterprise-atrium',
  'custom-development',
  'strategy-session',
  'about-office',
  'contact-meeting',
];

describe('home content (src/content/home.ts)', () => {
  test('hero value proposition', () => {
    expect(HERO.title).toBe('Evidence-driven AI, built for your business.');
    expect(HERO.valueProp).toBe(
      'We help small and medium-sized businesses put AI to work, with enterprise-grade rigor and senior data scientists on every engagement.',
    );
  });

  test('credibility points', () => {
    expect((CREDIBILITY_POINTS as any[]).map((p) => p.title)).toEqual([
      'Credentialed data scientists',
      'Vendor-neutral advice',
      'Built for small and medium-sized businesses',
      'Enterprise-grade governance',
    ]);
    for (const p of CREDIBILITY_POINTS as any[]) {
      expect(JSON.stringify(p)).not.toMatch(/\d/);
    }
  });

  test('who we serve panels', () => {
    const w: any = WHO_WE_SERVE;
    expect(w.smb.title).toBe('Small and medium-sized businesses');
    expect(w.smb.link).toEqual({ label: 'See engagements', to: '/engagements' });
    expect(sentenceCount(w.smb.text)).toBe(2);
    expect(w.enterprise.title).toBe('Enterprise');
    expect(w.enterprise.label).toBe('Premium');
    expect(w.enterprise.link).toEqual({ label: 'Enterprise engagements', to: '/engagements#enterprise' });
    expect(sentenceCount(w.enterprise.text)).toBe(2);
  });

  test('three placeholder case studies without numbers', () => {
    const cs = CASE_STUDIES as any[];
    expect(cs.map((c) => c.industry)).toEqual(['Manufacturing', 'Professional services', 'Retail']);
    for (const c of cs) {
      expect(c.result).toBe('Result: to be added from a real engagement.');
      for (const key of ['challenge', 'approach']) {
        expect(typeof c[key]).toBe('string');
        expect(c[key].trim().length).toBeGreaterThan(0);
      }
      for (const key of ['industry', 'challenge', 'approach', 'result']) {
        if (/\d/.test(c[key])) throw new Error(`Case study ${c.industry} ${key} must not contain numbers: ${JSON.stringify(c[key])}`);
      }
    }
    expect(CASE_STUDY_NOTE).toBe('Placeholder case study: replace with a real client engagement before launch.');
  });

  test('placeholder testimonial', () => {
    const t: any = TESTIMONIAL;
    expect(t.attribution).toBe('Client name, Title, Company');
    expect(t.note).toBe('Placeholder testimonial: replace with a real client quote before launch.');
    expect(typeof t.quote).toBe('string');
    expect(t.quote.trim().length).toBeGreaterThan(0);
    expect(t.quote).not.toMatch(/\d/);
  });
});

describe('engagements content (src/content/engagements.ts)', () => {
  test('intro', () => {
    expect(ENGAGEMENTS_INTRO).toBe(
      'Right-sized engagements for small and medium-sized businesses, and a premium tier for enterprise.',
    );
  });

  test('four tiers in order', () => {
    const tiers = ENGAGEMENT_TIERS as any[];
    expect(tiers.map((t) => [t.id, t.name, t.timeline, t.premium])).toEqual([
      ['jumpstart', 'Jumpstart', '2 to 4 weeks', false],
      ['build', 'Build', '6 to 12 weeks', false],
      ['partner', 'Partner', 'Ongoing, monthly', false],
      ['enterprise', 'Enterprise', 'Custom scope', true],
    ]);
  });

  test('included lists', () => {
    const by = (id: string) => (ENGAGEMENT_TIERS as any[]).find((t) => t.id === id);
    expect(by('jumpstart').included).toEqual([
      'AI readiness assessment',
      'Top three use cases prioritized',
      'One quick-win prototype',
      'A 90-day roadmap',
    ]);
    expect(by('build').included).toEqual([
      'One custom AI solution designed, built and deployed',
      'Integration with your existing systems',
      'Team training',
      'Handover documentation',
    ]);
    expect(by('partner').included).toEqual([
      'A senior data scientist on call',
      'Monthly improvement sprints',
      'Model monitoring and updates',
      'Quarterly roadmap reviews',
    ]);
    expect(by('enterprise').included).toEqual([
      'A dedicated senior team',
      'Multi-team programs and centers of excellence',
      'AI governance and responsible-AI policy',
      'Security and compliance reviews',
      'Priority support',
    ]);
  });

  test('audiences and buttons', () => {
    const tiers = ENGAGEMENT_TIERS as any[];
    for (const t of tiers.slice(0, 3)) {
      expect(t.audience).toBe('For small and medium-sized businesses');
      expect(t.cta).toEqual({ label: 'Book a consultation', to: '/contact' });
    }
    expect(typeof tiers[3].audience).toBe('string');
    expect(tiers[3].audience.trim().length).toBeGreaterThan(0);
    expect(tiers[3].cta).toEqual({ label: 'Talk to us about enterprise', to: '/contact' });
  });

  test('no prices', () => {
    const text = JSON.stringify(ENGAGEMENT_TIERS) + ENGAGEMENTS_INTRO;
    expect(text).not.toMatch(/[$€£¥]|\bprice|\bUSD\b|\bEUR\b|per month|\/mo\b/i);
  });
});

describe('photos (src/content/images.ts)', () => {
  test('eight photos with descriptive alt text', () => {
    expect(Object.keys(PHOTOS).sort()).toEqual([...PHOTO_NAMES].sort());
    for (const name of PHOTO_NAMES) {
      const alt: string = (PHOTOS as any)[name].alt;
      if (typeof alt !== 'string' || alt.trim().length < 10) {
        throw new Error(`PHOTOS['${name}'].alt must be descriptive, got ${JSON.stringify(alt)}`);
      }
      if (/\bour\b/i.test(alt)) throw new Error(`PHOTOS['${name}'].alt must not present the scene as the firm's own: ${alt}`);
    }
  });

  test('photo files exist in public/images', () => {
    for (const name of PHOTO_NAMES) {
      for (const file of [`${name}.jpg`, `${name}-768.jpg`]) {
        if (!fs.existsSync(path.join(ROOT, 'public', 'images', file))) {
          throw new Error(`Missing public/images/${file}`);
        }
      }
    }
  });
});

describe('styles and docs', () => {
  test('motion is turned off under prefers-reduced-motion', () => {
    const { inside, outside } = splitReduce(allCss());
    if (!inside.trim()) throw new Error('No @media (prefers-reduced-motion: reduce) block');
    if (!/transform\s*:\s*none/i.test(inside)) {
      throw new Error('The prefers-reduced-motion: reduce block does not set transform: none');
    }
    const reduceRules = cssRules(inside);
    const isUniversal = (sel: string) => sel.split(',').some((p) => /^\s*\*/.test(p) || /\s\*(\s|$|::?)/.test(p));
    const covers = (cls: string, prop: RegExp) =>
      reduceRules.some((r) => (hasClass(r.selector, cls) || isUniversal(r.selector)) && prop.test(r.body));
    const ANIM_OFF = /animation(-name)?\s*:\s*none|animation-duration\s*:/i;
    const TRANS_OFF = /transition(-property)?\s*:\s*none|transition-duration\s*:/i;
    const TRANSFORM_OFF = /transform\s*:\s*none/i;

    const rules = cssRules(outside);
    const liftClasses = new Set<string>();
    const animClasses = new Set<string>();
    for (const r of rules) {
      const parts = r.selector.split(',');
      if (/transform\s*:\s*(?!none\b)[^;]*translate/i.test(r.body)) {
        for (const p of parts) {
          if (/:hover/.test(p)) for (const c of subjectClasses(p, /:hover/)) liftClasses.add(c);
        }
      }
      if (/animation(-name)?\s*:\s*(?!none\b)[^;]+/i.test(r.body)) {
        for (const p of parts) for (const c of subjectClasses(p)) animClasses.add(c);
      }
    }
    if (liftClasses.size === 0) {
      throw new Error('No hover-lift rule (a :hover rule with transform: translate...) found in the CSS');
    }
    for (const c of Array.from(liftClasses)) {
      if (!covers(c, TRANSFORM_OFF)) {
        throw new Error(`Hover-lift class .${c} keeps its transform under prefers-reduced-motion: reduce`);
      }
      if (!covers(c, TRANS_OFF)) {
        throw new Error(`Hover-lift class .${c} keeps its transition under prefers-reduced-motion: reduce`);
      }
    }
    for (const c of Array.from(animClasses)) {
      if (!covers(c, ANIM_OFF)) {
        throw new Error(`Animated class .${c} keeps its animation under prefers-reduced-motion: reduce`);
      }
    }
  });

  test('theme has a display size token and brand colors', () => {
    const css = readRootFile('src/styles/theme.css');
    expect(css).toMatch(/--text-display\s*:/);
    expect(css).toMatch(/--color-navy\s*:\s*#0B1F3A/i);
    expect(css).toMatch(/--color-accent\s*:\s*#1F8A8A/i);
  });

  test('no external URLs or web fonts in CSS', () => {
    const css = allCss();
    expect(css).not.toMatch(/url\(\s*['"]?(https?:)?\/\//i);
    expect(css).not.toMatch(/@import[^;]*(https?:)?\/\//i);
    expect(css).not.toMatch(/@font-face/i);
  });

  test('no image files imported into src (photos come from /images)', () => {
    const src = listFiles(path.join(ROOT, 'src'))
      .filter((f) => /\.(ts|tsx)$/.test(f))
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n');
    expect(src).not.toMatch(/import[^;]*\.(jpe?g|png|webp)['"]/i);
    expect(src).not.toMatch(/https?:\/\/(?!thebayesgroup\.com|www\.w3\.org|www\.sitemaps\.org)[a-z0-9.-]+\//i);
  });

  test('DEPLOYMENT.md covers the engagements page and images', () => {
    const md = readRootFile('DEPLOYMENT.md');
    expect(md).toContain('dist/engagements/index.html');
    expect(md).toMatch(/dist\/images/);
    expect(md).toContain('404.html');
  });
});
