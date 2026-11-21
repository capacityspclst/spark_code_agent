export const SYSTEMS_LEAD = 'We design AI systems the way mature engineering teams build software: specific to your business, connected to the systems you already run, observable from day one and built to be maintained.';

export const SYSTEMS_SECTIONS = [
  {
    id: 'agentic',
    eyebrow: 'AGENTIC',
    title: 'Agentic development',
    intro: 'Planning and tool-using agents; human approval steps for consequential actions; evaluation suites before anything ships; clear limits on what each agent may do.',
    items: [
      'Planning and tool-using agents',
      'Human approval steps for consequential actions',
      'Evaluation suites before anything ships',
      'Clear limits on what each agent may do',
    ],
  },
  {
    id: 'architecture',
    eyebrow: 'ARCHITECTURE',
    title: 'Multi-system architecture',
    intro: 'Integration with CRM, ERP, data warehouses and document stores; event-driven and API-based designs; data contracts between systems; security reviews and least-privilege access.',
    items: [
      'Integration with CRM, ERP, data warehouses and document stores',
      'Event-driven and API-based designs',
      'Data contracts between systems',
      'Security reviews and least-privilege access',
    ],
  },
  {
    id: 'observability',
    eyebrow: 'OBSERVABILITY',
    title: 'Observable by design',
    intro: 'End-to-end tracing of every request and agent step; metrics and dashboards for quality, latency and cost; alerts when quality or data drifts; evaluation results tracked over time.',
    items: [
      'End-to-end tracing of every request and agent step',
      'Metrics and dashboards for quality, latency and cost',
      'Alerts when quality or data drifts',
      'Evaluation results tracked over time',
    ],
  },
  {
    id: 'sustainability',
    eyebrow: 'SUSTAINABILITY',
    title: 'Built to be sustained',
    intro: 'Runbooks and on-call guides; cost budgets and usage limits; model-agnostic design so models can be swapped; architecture decision records and handover training.',
    items: [
      'Runbooks and on-call guides',
      'Cost budgets and usage limits',
      'Model-agnostic design so models can be swapped',
      'Architecture decision records and handover training',
    ],
  },
];

export const DELIVERABLES_HEADING = 'What every system ships with';

export const DELIVERABLES = [
  'Architecture diagram & decision records',
  'Evaluation suite',
  'Tracing & dashboards',
  'Runbooks',
  'Cost & usage budgets',
  'Handover training',
];

export const SYSTEMS_CTA = {
  heading: 'Have a system in mind?',
  button: { label: 'Book a consultation', to: '/contact' },
};
