import * as React from 'react';

// Simple inline SVG illustrations matching the DESIGN.md spec.
// All icons are decorative, aria-hidden and not focusable.

export const BellCurveMotif = () => (
  <svg
    viewBox="0 0 200 100"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="bell-curve-motif"
  >
    {/* Three overlapping bell curves */}
    <path d="M0 80 Q50 20 100 80 T200 80" stroke="#1F8A8A" strokeWidth="1.5" fill="none" />
    <path d="M0 85 Q50 25 100 85 T200 85" stroke="#1F8A8A" strokeWidth="1.5" fill="none" opacity="0.6" />
    <path d="M0 90 Q50 30 100 90 T200 90" stroke="#1F8A8A" strokeWidth="1.5" fill="none" opacity="0.3" />
  </svg>
);

export const DataGridPattern = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="data-grid-pattern"
  >
    {/* Simple grid of lines */}
    {[...Array(5)].map((_, i) => (
      <line
        key={`h${i}`}
        x1="0"
        y1={i * 4}
        x2="24"
        y2={i * 4}
        stroke="#1F8A8A"
        strokeWidth="0.3"
        opacity="0.15"
      />
    ))}
    {[...Array(5)].map((_, i) => (
      <line
        key={`v${i}`}
        x1={i * 4}
        y1="0"
        x2={i * 4}
        y2="24"
        stroke="#1F8A8A"
        strokeWidth="0.3"
        opacity="0.15"
      />
    ))}
  </svg>
);

export const AvatarSilhouette = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="avatar-silhouette"
  >
    {/* Simple head and shoulders silhouette */}
    <circle cx="32" cy="20" r="12" fill="#CCCCCC" />
    <path d="M12 58 C12 44, 52 44, 52 58" fill="#CCCCCC" />
  </svg>
);

export const NotFoundIllustration = () => (
  <svg
    viewBox="0 0 100 60"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="not-found-illustration"
  >
    {/* Small bell curve illustration */}
    <path d="M0 40 Q50 10 100 40" stroke="#1F8A8A" strokeWidth="1.5" fill="none" />
  </svg>
);

export default {
  BellCurveMotif,
  DataGridPattern,
  AvatarSilhouette,
  NotFoundIllustration,
};
