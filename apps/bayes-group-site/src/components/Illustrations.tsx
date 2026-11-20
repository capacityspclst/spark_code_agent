import * as React from 'react';

// Inline SVG illustrations in the brand colors. All are decorative,
// aria-hidden and not focusable.

export const BellCurveMotif = () => (
  <svg
    viewBox="0 0 600 300"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="bell-curve-motif"
    preserveAspectRatio="xMaxYMid meet"
  >
    <path d="M20 280 C140 280 170 40 290 40 C410 40 440 280 560 280" stroke="#5FC4C4" strokeWidth="2" strokeLinecap="round" />
    <path d="M-40 280 C60 280 90 110 180 110 C270 110 300 280 400 280" stroke="#1F8A8A" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 280 C300 280 330 90 420 90 C510 90 540 280 640 280" stroke="#1F8A8A" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <path d="M110 280 C190 280 220 150 290 150 C360 150 390 280 470 280" stroke="#5FC4C4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M0 282H600" stroke="#B8C4D6" strokeWidth="1" opacity="0.5" />
  </svg>
);

export const DataGridPattern = () => (
  <svg
    width="100%"
    height="100%"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="data-grid-pattern"
  >
    <defs>
      <pattern id="data-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" stroke="#1F8A8A" strokeWidth="1" opacity="0.35" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#data-grid)" />
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
    <circle cx="32" cy="32" r="32" fill="#E6F2F2" />
    <circle cx="32" cy="25" r="11" fill="#7A8699" />
    <path d="M10 56c2-11 11-17 22-17s20 6 22 17a32 32 0 0 1-44 0z" fill="#7A8699" />
  </svg>
);

export const NotFoundIllustration = () => (
  <svg
    viewBox="0 0 160 80"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="not-found-illustration"
  >
    <path d="M8 72C44 72 54 10 80 10s36 62 72 62" stroke="#1F8A8A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M32 72C56 72 64 36 84 36s28 36 48 36" stroke="#5FC4C4" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <path d="M4 74H156" stroke="#7A8699" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default {
  BellCurveMotif,
  DataGridPattern,
  AvatarSilhouette,
  NotFoundIllustration,
};
