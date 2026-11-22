import * as React from 'react';

/** Background motif components (inline SVG, decorative). */

// Overlapping bell curves, stroked in light teal at low opacity.
export function BellCurveMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="#5FC4C4"
      strokeWidth="2"
    >
      <path d="M-50 380 C150 380 250 60 450 60 S750 380 950 380" opacity="0.12" />
      <path d="M100 380 C300 380 400 100 600 100 S900 380 1100 380" opacity="0.12" />
      <path d="M300 380 C500 380 600 20 800 20 S1100 380 1300 380" opacity="0.12" />
      <path d="M-200 380 C0 380 100 140 300 140 S600 380 800 380" opacity="0.12" />
      <path d="M0 380H1200" opacity="0.12" />
    </svg>
  );
}

// Fine data-grid pattern.
export function DataGridMotif({ className }: { className?: string }) {
  const id = `grid-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="#5FC4C4" strokeWidth="1" opacity="0.12" />
          <circle cx="0" cy="0" r="1.5" fill="#5FC4C4" opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
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
      fill="none"
      strokeLinecap="round"
    >
      <path d="M10 130H290" stroke="#B8C4D6" strokeWidth="2" />
      <path d="M10 130 C70 130 100 20 150 20 S230 130 290 130" stroke="#1F8A8A" strokeWidth="4" />
      <path d="M40 130 C90 130 120 55 165 55 S240 130 280 130" stroke="#5FC4C4" strokeWidth="3" />
      <path d="M150 20V130" stroke="#1F8A8A" strokeWidth="2" strokeDasharray="4 6" />
    </svg>
  );
}

export default { BellCurveMotif, DataGridMotif, BellCurveIllustration };
