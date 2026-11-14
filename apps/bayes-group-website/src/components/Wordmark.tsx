import React from 'react';

export const Wordmark: React.FC<{className?:string}> = ({className}) => (
  <svg
    className={className}
    width="220"
    height="28"
    viewBox="0 0 220 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="The Bayes Group"
  >
    {/* Simple bell-curve shape */}
    <path d="M2 18 C8 4, 24 4, 30 18 S50 28, 56 18" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
    {/* Wordmark text */}
    <text
      x="64"
      y="20"
      fontFamily="var(--font-serif)"
      fontSize="16"
      fontWeight="600"
      fill="var(--color-primary)"
    >
      <tspan>The </tspan>
      <tspan>Bayes </tspan>
      <tspan>Group</tspan>
    </text>
  </svg>
);
