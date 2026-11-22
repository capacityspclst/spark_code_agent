import * as React from 'react';

/** Simple background motif components (inline SVG) */

// Bell curve motif – subtle background pattern
export function BellCurveMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 100"
      aria-hidden="true"
      focusable="false"
    >
      {/* Two overlapping bell curves */}
      <path
        d="M0 80 C30 30, 70 30, 100 80 S170 130, 200 80"
        fill="none"
        stroke="var(--color-accent-light)"
        strokeWidth="8"
        opacity="0.12"
      />
      <path
        d="M0 85 C40 35, 80 35, 120 85 S180 135, 200 85"
        fill="none"
        stroke="var(--color-accent-light)"
        strokeWidth="5"
        opacity="0.08"
      />
    </svg>
  );
}

// Data-grid motif – fine grid pattern
export function DataGridMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0 L0 0 0 10" fill="none" stroke="var(--color-accent-light)" strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

// Small bell-curve illustration for the 404 page
export function BellCurveIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 150"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 120 C50 20, 100 20, 150 120 S250 220, 300 120"
        fill="none"
        stroke="var(--color-accent-light)"
        strokeWidth="6"
        opacity="0.15"
      />
    </svg>
  );
}

export default { BellCurveMotif, DataGridMotif, BellCurveIllustration };
