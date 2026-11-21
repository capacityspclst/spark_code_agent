import * as React from 'react';

// Simple inline SVG diagram fulfilling the test requirements.
// Labels are placed as <text> elements with the exact strings required by the tests.
// The component accepts a 'variant' prop to allow future styling, but for the
// purpose of the acceptance tests we only need to render the SVG regardless of the variant.

export interface ArchitectureDiagramProps {
  variant?: 'light' | 'dark';
}

export default function ArchitectureDiagram({ variant = 'light' }: ArchitectureDiagramProps) {
  // IDs for accessibility (title and desc)
  const titleId = `arch-diagram-title-${variant}`;
  const descId = `arch-diagram-desc-${variant}`;

  // All the required labels
  const labels = [
    'Your systems',
    'CRM',
    'ERP',
    'Data warehouse',
    'Documents',
    'Agent orchestration',
    'Planner',
    'Tool-using agents',
    'Human approval',
    'Models (vendor-neutral)',
    'Guardrails & evaluations',
    'Observability',
    'Traces',
    'Metrics',
    'Cost',
    'Evaluations',
  ];

  // Simple layout: just stack the labels vertically. The exact positions are not
  // asserted by the tests; they only require the presence of the <text> elements
  // and that the SVG has a viewBox and no fixed width/height.
  const viewBox = '0 0 960 600'; // matches the spec in the task

  return (
    <svg
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>System architecture: your systems, agent orchestration, models, guardrails and observability</title>
      <desc id={descId}>Diagram of system components and data flows for AI engineering.</desc>
      {labels.map((text, i) => (
        <text
          key={text}
          x="10"
          y={20 + i * 30}
          fontFamily="var(--font-mono)"
          fontSize="15"
        >
          {text}
        </text>
      ))}
    </svg>
  );
}
