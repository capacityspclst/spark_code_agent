export const HERO = {
  title: 'Evidence-driven AI, built for your business.',
  valueProp: 'We design, build and run AI systems for small and medium-sized businesses, from single agents to multi-system architectures, with enterprise-grade rigor and senior data scientists on every engagement.',
  primary: { label: 'Book a consultation', to: '/contact' },
  secondary: { label: 'See how we build', to: '/systems' },
};

export const PILLARS = [
  {
    title: 'AI Enablement',
    description: 'We assess your data readiness, discover high-impact use cases, and create a clear AI roadmap. Our experts guide implementation and governance.',
    href: '/services#enablement',
  },
  {
    title: 'Training',
    description: 'Hands-on workshops and executive briefings teach your team the fundamentals and advanced techniques. Build internal AI capability sustainably.',
    href: '/services#training',
  },
  {
    title: 'Custom Development',
    description: 'We design and deliver production-grade AI solutions, from LLM-powered tools to predictive pipelines, integrated with your existing stack. Our team ensures seamless integration and knowledge transfer.',
    href: '/services#custom-development',
  },
];

export const STEPS = [
  { title: 'Assess', description: 'We map your data, processes and goals to find where AI pays off.' },
  { title: 'Design', description: 'We define the solution, success metrics and a realistic plan.' },
  { title: 'Build', description: 'We develop, test and deploy working AI alongside your team.' },
  { title: 'Enable', description: 'We train your people so they own and extend what we built.' },
];

export const WHY_POINTS = [
  { title: 'Credentialed data scientists', description: 'Our founders hold advanced degrees and industry certifications.' },
  { title: 'Hands-on builders', description: 'We roll up our sleeves to deliver working models, not just strategy.' },
  { title: 'Vendor-neutral advice', description: 'We recommend tools and platforms that best fit your goals.' },
  { title: 'Your team owns the result', description: 'We ensure knowledge transfer so you can maintain and extend solutions.' },
];

export const CTA_BAND = {
  heading: 'Ready to put AI to work?',
  button: { label: 'Book a consultation', to: '/contact' },
};

// New content additions for redesign
export const CREDIBILITY_POINTS = [
  'Credentialed data scientists',
  'Vendor-neutral advice',
  'Built for small and medium-sized businesses',
  'Enterprise-grade governance',
];

export const AUDIENCE_PANELS = [
  {
    id: 'smb',
    title: 'Small and medium-sized businesses',
    text: 'Practical, right-sized AI with fast results. We build it with your team so your team owns it afterwards.',
    link: { label: 'See engagements', to: '/engagements' },
    photo: 'smb-owner',
    premium: false,
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    text: 'A dedicated senior team for multi-system programs and governance. Senior experts ensure security and responsible AI.',
    link: { label: 'Enterprise engagements', to: '/engagements#enterprise' },
    photo: 'enterprise-atrium',
    premium: true,
  },
];

export const SYSTEMS_BAND = {
  eyebrow: 'WHAT WE BUILD',
  heading: 'Systems built to be observed and sustained',
  link: { label: 'How we build systems', to: '/systems' },
};

export const CAPABILITIES = [
  {
    title: 'Agentic development',
    description: 'Agents that plan, use your tools and hand off to people for approval.',
  },
  {
    title: 'Multi-system architecture',
    description: 'AI that connects your CRM, ERP, data and documents instead of adding another silo.',
  },
  {
    title: 'Observable by design',
    description: 'Tracing, metrics, cost and evaluation dashboards from day one.',
  },
  {
    title: 'Sustainable to run',
    description: 'Runbooks, cost budgets, model-agnostic design and a team trained to own it.',
  },
];

export const OPERATE_STEP = {
  title: 'Operate & improve',
  description: 'We monitor, evaluate and improve what we built, or hand it to your team with runbooks.',
};

export const EXAMPLES_SECTION = {
  eyebrow: 'EXAMPLE ENGAGEMENTS',
  heading: 'The kinds of systems we build',
  tag: 'Illustrative example',
  note: 'Illustrative example of an engagement type, not a client case study.',
};

export const EXAMPLES = [
  {
    industry: 'Professional services',
    name: 'Agentic document intake',
    challenge: 'Client documents arrive by email in many formats and are keyed in by hand.',
    system: 'Agents classify and extract each document into the practice-management system, with a person approving anything uncertain.',
    sustained: 'Every document is traced end to end, with an accuracy evaluation set and a weekly review queue.',
  },
  {
    industry: 'Manufacturing',
    name: 'Connected maintenance forecasting',
    challenge: 'Machine sensor data, the maintenance system and the ERP never talk to each other.',
    system: 'A forecasting pipeline that joins all three and schedules maintenance work orders.',
    sustained: 'Data-quality and drift monitors, model retraining runbooks and an owner on the client\'s team.',
  },
  {
    industry: 'Retail',
    name: 'Customer service copilot',
    challenge: 'Support staff search several systems to answer each question.',
    system: 'A retrieval-augmented assistant over the product catalog, order system and policies that drafts answers for staff.',
    sustained: 'Answer-quality evaluations, cost per conversation tracked, and guardrails reviewed monthly.',
  },
];

export const TESTIMONIAL = {
  quote: 'Placeholder quote for testimonial.',
  attribution: 'Client name, Title, Company',
  placeholderNote: 'Placeholder testimonial: replace with a real client quote before launch.',
};
