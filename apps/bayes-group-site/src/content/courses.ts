export const AUDIENCES = ['Executives','Managers','Technical teams'] as const;
export const FORMATS = ['Half-day briefing','1-day workshop','Multi-week bootcamp'] as const;
export const COURSE_FILTERS = ['All','Executives','Managers','Technical teams'] as const;

export type Course = {
  id: string;
  title: string;
  audience: typeof AUDIENCES[number];
  format: typeof FORMATS[number];
  duration: string;
  learn: string[];
};

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Intro to AI for Executives',
    audience: 'Executives',
    format: 'Half-day briefing',
    duration: '4 hours',
    learn: ['AI fundamentals', 'Strategic opportunities', 'Risks and governance'],
  },
  {
    id: 'c2',
    title: 'AI Strategy Workshop',
    audience: 'Executives',
    format: '1-day workshop',
    duration: '8 hours',
    learn: ['Roadmapping', 'Prioritization', 'Stakeholder alignment'],
  },
  {
    id: 'c3',
    title: 'Data Science Foundations',
    audience: 'Managers',
    format: '1-day workshop',
    duration: '8 hours',
    learn: ['Data pipelines', 'Model evaluation', 'Project planning'],
  },
  {
    id: 'c4',
    title: 'AI Ethics and Governance',
    audience: 'Managers',
    format: 'Half-day briefing',
    duration: '4 hours',
    learn: ['Bias detection', 'Compliance', 'Responsible deployment'],
  },
  {
    id: 'c5',
    title: 'Deep Learning Bootcamp',
    audience: 'Technical teams',
    format: 'Multi-week bootcamp',
    duration: '4 weeks',
    learn: ['Neural networks', 'Training techniques', 'Deploying models'],
  },
  {
    id: 'c6',
    title: 'AI Ops and MLOps',
    audience: 'Technical teams',
    format: '1-day workshop',
    duration: '1 day',
    learn: ['Model monitoring', 'CI/CD for ML', 'Scalable infrastructure'],
  },
];

export function filterCourses(courses: Course[], filter: typeof COURSE_FILTERS[number]): Course[] {
  if (filter === 'All') return [...courses];
  return courses.filter((c) => c.audience === filter);
}
