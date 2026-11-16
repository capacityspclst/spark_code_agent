import { SERVICE_SECTIONS } from '../../src/content/services';

const lc = (xs: string[]) => xs.map((x) => x.toLowerCase());

describe('services content', () => {
  test('sections in order', () => {
    expect(SERVICE_SECTIONS.map((s) => s.id)).toEqual([
      'enablement',
      'training',
      'custom-development',
    ]);
  });

  test('enablement items', () => {
    const s = SERVICE_SECTIONS.find((x) => x.id === 'enablement')!;
    expect(lc(s.items.map((i) => i.name))).toEqual(
      lc([
        'AI readiness assessment',
        'Use-case discovery and prioritization',
        'AI strategy and roadmap',
        'AI governance and responsible-AI policy',
      ]),
    );
  });

  test('training items', () => {
    const s = SERVICE_SECTIONS.find((x) => x.id === 'training')!;
    expect(lc(s.items.map((i) => i.name))).toEqual(
      lc([
        'Executive AI briefings',
        'Hands-on team workshops',
        'Deep-learning bootcamps for technical teams',
        'Custom curricula',
      ]),
    );
  });

  test('custom development items', () => {
    const s = SERVICE_SECTIONS.find((x) => x.id === 'custom-development')!;
    expect(lc(s.items.map((i) => i.name))).toEqual(
      lc([
        'LLM and retrieval-augmented (RAG) applications',
        'AI agents and workflow automation',
        'Predictive models and ML pipelines',
        'Deep-learning solutions',
        'Integration with existing systems',
      ]),
    );
  });

  test('every item has a description and every section a typical engagement', () => {
    for (const s of SERVICE_SECTIONS) {
      expect(s.title.trim().length).toBeGreaterThan(0);
      expect(typeof s.typicalEngagement).toBe('string');
      expect(s.typicalEngagement.trim().length).toBeGreaterThan(0);
      for (const item of s.items) {
        expect(item.description.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
