export const ENGAGEMENTS_INTRO = 'Right-sized engagements for small and medium-sized businesses, and a premium tier for enterprise.';

export const TIERS = [
  {
    id: 'jumpstart',
    name: 'Jumpstart',
    audience: 'For small and medium-sized businesses',
    timeline: '2 to 4 weeks',
    included: [
      'AI readiness assessment',
      'Top three use cases prioritized',
      'One quick-win prototype',
      'A 90-day roadmap',
    ],
    cta: { label: 'Book a consultation', to: '/contact' },
    premium: false,
  },
  {
    id: 'build',
    name: 'Build',
    audience: 'For small and medium-sized businesses',
    timeline: '6 to 12 weeks',
    included: [
      'One custom AI system designed, built and deployed',
      'Integration with your existing systems',
      'Tracing and dashboards from day one',
      'Team training and runbooks',
    ],
    cta: { label: 'Book a consultation', to: '/contact' },
    premium: false,
  },
  {
    id: 'partner',
    name: 'Partner',
    audience: 'For small and medium-sized businesses',
    timeline: 'Ongoing, monthly',
    included: [
      'A senior data scientist on call',
      'Monthly improvement sprints',
      'Monitoring, evaluations and model updates',
      'Quarterly roadmap reviews',
    ],
    cta: { label: 'Book a consultation', to: '/contact' },
    premium: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    audience: 'For small and medium-sized businesses',
    timeline: 'Custom scope',
    included: [
      'A dedicated senior team',
      'Multi-system and agentic programs',
      'AI governance and responsible-AI policy',
      'Security and compliance reviews',
      'Priority support',
    ],
    cta: { label: 'Talk to us about enterprise', to: '/contact' },
    premium: true,
  },
];

export const NOT_SURE = {
  text: 'Not sure which fits?',
  link: { label: 'Talk to us', to: '/contact' },
};
