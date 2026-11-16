import { MISSION, WHY_BAYES, FOUNDERS, VALUES } from '../../src/content/about';

describe('about content', () => {
  test('mission and why bayes', () => {
    expect(MISSION.trim().length).toBeGreaterThan(0);
    expect(WHY_BAYES).toMatch(/bayes/i);
    expect(WHY_BAYES).toMatch(/evidence/i);
    expect(WHY_BAYES).toMatch(/belief/i);
  });

  test('two placeholder founders', () => {
    expect(FOUNDERS).toHaveLength(2);
    for (const f of FOUNDERS) {
      expect(f.name).toBe('Founder Name');
      expect(f.role).toBe('Co-founder & Principal Data Scientist');
      expect(Array.isArray(f.credentials)).toBe(true);
      expect(f.credentials.length).toBeGreaterThan(0);
      expect(f.bio.trim().length).toBeGreaterThan(0);
      expect(f.placeholder).toBe(true);
    }
  });

  test('four values', () => {
    expect(VALUES.map((v) => v.title)).toEqual([
      'Evidence over hype',
      'Build to transfer',
      'Vendor-neutral',
      'Responsible by design',
    ]);
  });
});
