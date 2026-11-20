export const ENGAGEMENTS_INTRO = 'Right-sized engagements for small and medium-sized businesses, and a premium tier for enterprise.';

export const ENGAGEMENT_TIERS = [
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
    premium: false,
    cta: { label: 'Book a consultation', to: '/contact' },
  },
  {
    id: 'build',
    name: 'Build',
    audience: 'For small and medium-sized businesses',
    timeline: '6 to 12 weeks',
    included: [
      'One custom AI solution designed, built and deployed',
      'Integration with your existing systems',
      'Team training',
      'Handover documentation',
    ],
    premium: false,
    cta: { label: 'Book a consultation', to: '/contact' },
  },
  {
    id: 'partner',
    name: 'Partner',
    audience: 'For small and medium-sized businesses',
    timeline: 'Ongoing, monthly',
    included: [
      'A senior data scientist on call',
      'Monthly improvement sprints',
      'Model monitoring and updates',
      'Quarterly roadmap reviews',
    ],
    premium: false,
    cta: { label: 'Book a consultation', to: '/contact' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    audience: 'For larger organizations and enterprises',
    timeline: 'Custom scope',
    included: [
      'A dedicated senior team',
      'Multi-team programs and centers of excellence',
      'AI governance and responsible-AI policy',
      'Security and compliance reviews',
      'Priority support',
    ],
    premium: true,
    cta: { label: 'Talk to us about enterprise', to: '/contact' },
  },
];
