import React from 'react';

export const Wordmark: React.FC<{className?:string}> = ({className}) => (
  <svg
    className={className}
    width="120"
    height="24"
    viewBox="0 0 120 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="The Bayes Group logo"
  >
    {/* Simple bell‑curve shape */}
    <path d="M2 12 C10 0, 30 0, 38 12 S66 24, 74 12" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
    <text x="80" y="18" fill="var(--color-primary)" fontFamily="var(--font-sans)" fontSize="14" fontWeight="600">The Bayes Group</text>
  </svg>
);
