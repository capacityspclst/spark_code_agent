import { HERO, PILLARS, STEPS, WHY_POINTS, CTA_BAND } from '../../src/content/home';

describe('home content', () => {
  test('hero', () => {
    expect(HERO.title).toBe('Evidence-driven AI, built for your business.');
    expect(typeof HERO.valueProp).toBe('string');
    expect(HERO.valueProp.trim().length).toBeGreaterThan(0);
    expect(HERO.primary).toEqual({ label: 'Book a consultation', to: '/contact' });
    expect(HERO.secondary).toEqual({ label: 'Explore services', to: '/services' });
  });

  test('three pillars link to service sections', () => {
    expect(PILLARS.map((p) => [p.title, p.href])).toEqual([
      ['AI Enablement', '/services#enablement'],
      ['Training', '/services#training'],
      ['Custom Development', '/services#custom-development'],
    ]);
    for (const p of PILLARS) {
      expect(p.description.trim().length).toBeGreaterThan(0);
    }
  });

  test('four steps in order', () => {
    expect(STEPS.map((s) => s.title)).toEqual(['Assess', 'Design', 'Build', 'Enable']);
    for (const s of STEPS) {
      expect(s.description.trim().length).toBeGreaterThan(0);
    }
  });

  test('why points cover the four themes', () => {
    expect(WHY_POINTS).toHaveLength(4);
    const text = WHY_POINTS.map((w) => `${w.title} ${w.description}`).join(' ').toLowerCase();
    expect(text).toContain('credentialed');
    expect(text).toMatch(/hands-on|builder/);
    expect(text).toContain('vendor');
    expect(text).toMatch(/transfer|own/);
  });

  test('cta band', () => {
    expect(CTA_BAND.heading).toBe('Ready to put AI to work?');
    expect(CTA_BAND.button).toEqual({ label: 'Book a consultation', to: '/contact' });
  });
});
