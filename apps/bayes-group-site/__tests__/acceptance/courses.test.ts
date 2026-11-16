import {
  AUDIENCES,
  FORMATS,
  COURSE_FILTERS,
  COURSES,
  filterCourses,
} from '../../src/content/courses';

describe('course catalog', () => {
  test('constants', () => {
    expect([...AUDIENCES]).toEqual(['Executives', 'Managers', 'Technical teams']);
    expect([...FORMATS]).toEqual(['Half-day briefing', '1-day workshop', 'Multi-week bootcamp']);
    expect([...COURSE_FILTERS]).toEqual(['All', 'Executives', 'Managers', 'Technical teams']);
  });

  test('at least six well-formed courses', () => {
    expect(COURSES.length).toBeGreaterThanOrEqual(6);
    const ids = COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of COURSES) {
      expect(c.title.trim().length).toBeGreaterThan(0);
      expect(AUDIENCES as readonly string[]).toContain(c.audience);
      expect(FORMATS as readonly string[]).toContain(c.format);
      expect(c.duration.trim().length).toBeGreaterThan(0);
      expect(c.learn).toHaveLength(3);
      for (const l of c.learn) expect(l.trim().length).toBeGreaterThan(0);
    }
  });

  test('every audience has at least one course', () => {
    for (const a of AUDIENCES) {
      expect(COURSES.some((c) => c.audience === a)).toBe(true);
    }
  });
});

describe('filterCourses', () => {
  test('All returns every course as a new array', () => {
    const result = filterCourses(COURSES, 'All');
    expect(result).toHaveLength(COURSES.length);
    expect(result).not.toBe(COURSES);
    expect(result.map((c) => c.id)).toEqual(COURSES.map((c) => c.id));
  });

  test.each(['Executives', 'Managers', 'Technical teams'] as const)(
    'filter %s returns only that audience',
    (aud) => {
      const result = filterCourses(COURSES, aud);
      const expected = COURSES.filter((c) => c.audience === aud).map((c) => c.id);
      expect(result.map((c) => c.id)).toEqual(expected);
      expect(result.length).toBeGreaterThan(0);
      for (const c of result) expect(c.audience).toBe(aud);
    },
  );

  test('does not mutate input', () => {
    const snapshot = JSON.parse(JSON.stringify(COURSES));
    const ids = COURSES.map((c) => c.id);
    filterCourses(COURSES, 'Managers');
    filterCourses(COURSES, 'All');
    expect(COURSES.map((c) => c.id)).toEqual(ids);
    expect(JSON.parse(JSON.stringify(COURSES))).toEqual(snapshot);
  });
});
