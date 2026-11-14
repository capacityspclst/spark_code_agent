import React from 'react';

export const Wordmark: React.FC<{className?: string}> = ({className}) => (
  <svg
    className={className}
    width="220"
    height="28"
    viewBox="0 0 220 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="The Bayes Group logo"
  >
    {/* Minimal bell-curve shape */}
    <path d="M2 20 C8 6, 20 6, 26 20" stroke="var(--color-accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Wordmark text, split into tspans so it renders as one visual phrase */}
    <text x="34" y="20" fontFamily="var(--font-serif)" fontSize="18" fontWeight="600" fill="var(--color-primary)">
      <tspan>The</tspan>
      <tspan> Bayes</tspan>
      <tspan> Group</tspan>
    </text>
  </svg>
);
