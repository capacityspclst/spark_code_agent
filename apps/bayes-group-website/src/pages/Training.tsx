import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Course {
  title: string;
  audience: 'Executives' | 'Managers' | 'Technical teams';
  format: string;
  duration: string;
  learn: string[];
}

const courses: Course[] = [
  {
    title: 'AI for Executives',
    audience: 'Executives',
    format: 'Half‑day briefing',
    duration: '4 hours',
    learn: [
      'What AI can do for business',
      'Key risks and governance',
      'Strategic roadmap basics',
    ],
  },
  {
    title: 'Data‑Driven Decision‑Making for Managers',
    audience: 'Managers',
    format: '1‑day workshop',
    duration: '8 hours',
    learn: [
      'Identifying AI opportunities',
      'Evaluating data quality',
      'Communicating AI value to leadership',
    ],
  },
  {
    title: 'Deep‑Learning Foundations',
    audience: 'Technical teams',
    format: 'Multi‑week bootcamp',
    duration: '4 weeks',
    learn: [
      'Neural network fundamentals',
      'Model training and evaluation',
      'Deploying models at scale',
    ],
  },
  {
    title: 'AI Product Management',
    audience: 'Executives',
    format: 'Half‑day briefing',
    duration: '4 hours',
    learn: [
      'Defining AI product vision',
      'Prioritizing features with data',
      'Measuring impact and ROI',
    ],
  },
  {
    title: 'AI Ethics and Governance',
    audience: 'Managers',
    format: '1‑day workshop',
    duration: '8 hours',
    learn: [
      'Ethical frameworks for AI',
      'Regulatory considerations',
      'Building responsible AI processes',
    ],
  },
  {
    title: 'Advanced Model Ops',
    audience: 'Technical teams',
    format: 'Multi‑week bootcamp',
    duration: '3 weeks',
    learn: [
      'CI/CD for ML models',
      'Monitoring and drift detection',
      'Scaling inference services',
    ],
  },
];

const audiences: ('All' | Course['audience'])[] = ['All', 'Executives', 'Managers', 'Technical teams'];

const Training: React.FC = () => {
  const [selected, setSelected] = useState<'All' | Course['audience']>('All');
  const filtered = selected === 'All' ? courses : courses.filter(c => c.audience === selected);

  return (
    <div>
      <h1>Training</h1>
      <div className="filter-group" role="group" aria-label="Audience filter">
        {audiences.map(aud => (
          <button
            key={aud}
            aria-pressed={selected === aud}
            onClick={() => setSelected(aud)}
            className="button-secondary"
          >
            {aud}
          </button>
        ))}
      </div>
      <div className="cards" style={{ display: 'grid', gap: 'var(--space-8)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 'var(--space-8)' }}>
        {filtered.map((c, idx) => (
          <div key={idx} className="card">
            <h3>{c.title}</h3>
            <p><strong>Audience:</strong> {c.audience}</p>
            <p><strong>Format:</strong> {c.format}</p>
            <p><strong>Duration:</strong> {c.duration}</p>
            <ul>
              {c.learn.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <Link to="#" className="button-secondary">Read more</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Training;
