import { SITE_URL, SITE_NAME, PAGES, NOT_FOUND_PAGE, getPageMeta } from '../../src/seo';

function sentenceCount(s: string): number {
  const m = s.trim().match(/[.!?](?=\s+[A-Z0-9"']|\s*$)/g);
  return m ? m.length : 0;
}

const EXPECTED_PAGES: Array<[string, string]> = [
  ['/', 'The Bayes Group | Evidence-driven AI'],
  ['/services', 'Services | The Bayes Group'],
  ['/training', 'Training | The Bayes Group'],
  ['/about', 'About | The Bayes Group'],
  ['/contact', 'Contact | The Bayes Group'],
];

describe('seo metadata (src/seo.ts)', () => {
  test('site constants', () => {
    expect(SITE_URL).toBe('https://thebayesgroup.com');
    expect(SITE_NAME).toBe('The Bayes Group');
  });

  test('PAGES lists the five pages in order with their titles', () => {
    const actual = (PAGES as any[]).map((p) => [p.path, p.title]);
    expect(actual).toEqual(EXPECTED_PAGES);
  });

  test('NOT_FOUND_PAGE', () => {
    expect((NOT_FOUND_PAGE as any).path).toBe('/404');
    expect((NOT_FOUND_PAGE as any).title).toBe('Page not found | The Bayes Group');
  });

  test('every description is one unique sentence ending with a period', () => {
    const all = [...(PAGES as any[]), NOT_FOUND_PAGE as any];
    const descs = all.map((p) => p.description as string);
    for (let i = 0; i < all.length; i++) {
      const d = descs[i];
      if (typeof d !== 'string' || d.trim().length < 20) {
        throw new Error(`Description for ${all[i].path} is missing or too short: ${JSON.stringify(d)}`);
      }
      if (!d.trim().endsWith('.')) {
        throw new Error(`Description for ${all[i].path} must end with a period: ${JSON.stringify(d)}`);
      }
      if (sentenceCount(d) !== 1) {
        throw new Error(`Description for ${all[i].path} must be exactly one sentence: ${JSON.stringify(d)}`);
      }
    }
    expect(new Set(descs).size).toBe(descs.length);
  });

  test.each([
    ['/', '/'],
    ['/services', '/services'],
    ['/services/', '/services'],
    ['/services#training', '/services'],
    ['/training?x=1', '/training'],
    ['/about', '/about'],
    ['/contact', '/contact'],
  ])('getPageMeta(%s) returns the %s page', (input, expectedPath) => {
    const meta: any = getPageMeta(input);
    const page = (PAGES as any[]).find((p) => p.path === expectedPath);
    expect(meta).toEqual(page);
  });

  test.each(['/does-not-exist', '/services/extra', '/404'])('getPageMeta(%s) returns NOT_FOUND_PAGE', (input) => {
    expect(getPageMeta(input)).toEqual(NOT_FOUND_PAGE);
  });
});
