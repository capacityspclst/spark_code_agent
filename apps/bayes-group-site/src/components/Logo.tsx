import React from 'react';

const Logo: React.FC = () => (
  <svg
    width="120"
    height="32"
    viewBox="0 0 120 32"
    aria-label="The Bayes Group"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simple bell‑curve shape */}
    <path
      d="M10 20 C 20 5, 40 5, 50 20"
      stroke="var(--color-primary)"
      fill="none"
      strokeWidth="2"
    />
    <text
      x="60"
      y="22"
      fill="var(--color-primary)"
      fontFamily="var(--font-heading)"
      fontSize="16"
    >
      The Bayes Group
    </text>
  </svg>
);

export default Logo;
