export type ServiceItem = {
  name: string;
  description: string;
  link?: { label: string; to: string };
};

export type ServiceSection = {
  id: string;
  title: string;
  intro?: string;
  items: ServiceItem[];
  typicalEngagement: string;
};

export const SERVICE_SECTIONS: ServiceSection[] = [
  {
    id: 'enablement',
    title: 'AI Enablement',
    items: [
      {
        name: 'AI readiness assessment',
        description: 'We evaluate your data, processes and infrastructure to determine AI readiness.',
      },
      {
        name: 'Use-case discovery and prioritization',
        description: 'We work with stakeholders to uncover high-value AI use cases and rank them.',
      },
      {
        name: 'AI strategy and roadmap',
        description: 'We craft a strategic plan with milestones, resources, and governance.',
      },
      {
        name: 'AI governance and responsible-AI policy',
        description: 'We help you establish policies for ethical, compliant AI deployment.',
      },
    ],
    typicalEngagement: '2 to 6 weeks',
  },
  {
    id: 'training',
    title: 'Training',
    items: [
      { name: 'Executive AI briefings', description: 'Short sessions for leaders to understand AI impact and strategy.' },
      { name: 'Hands-on team workshops', description: 'Practical workshops to build AI skills within your teams.' },
      { name: 'Deep-learning bootcamps for technical teams', description: 'Intensive training on deep learning techniques and tooling.' },
      { name: 'Custom curricula', description: 'Tailored courses designed around your specific challenges.' },
    ],
    typicalEngagement: '2 to 6 weeks',
  },
  {
    id: 'custom-development',
    title: 'Custom Development',
    items: [
      { name: 'LLM and retrieval-augmented (RAG) applications', description: 'We build large language model solutions with context retrieval.' },
      { name: 'AI agents and workflow automation', description: 'Design and implement AI-driven agents to automate processes.' },
      { name: 'Predictive models and ML pipelines', description: 'End-to-end pipelines for forecasting and classification tasks.' },
      { name: 'Deep-learning solutions', description: 'Custom neural network models for vision, NLP, and more.' },
      { name: 'Integration with existing systems', description: 'Seamless integration of AI components into your tech stack.' },
      { name: 'Agentic systems and multi-system integration', description: 'We build agentic AI that connects across your enterprise systems.', link: { label: 'See how we build', to: '/systems' } },
    ],
    typicalEngagement: '2 to 6 weeks',
  },
];
