import * as React from 'react';

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
  focusable: 'false' as const,
});

export function CheckIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

export function ClockIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function AlertIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v6M12 16.5v.5" />
    </svg>
  );
}

export function ArrowIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function MenuIcon({ size = 22, open = false }: IconProps & { open?: boolean }) {
  return (
    <svg {...base(size)}>
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

// One consistent line-icon set: 24px grid, 1.5px strokes, round caps.
const ICON_PATHS: Record<string, React.ReactNode> = {
  // service items
  readiness: <><path d="M9 4h6M9 4a2 2 0 0 0-2 2v0H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1v0a2 2 0 0 0-2-2" /><path d="M8.5 14l2.5 2.5 4.5-5" /></>,
  discovery: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5M11 8.5v5M8.5 11h5" /></>,
  roadmap: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" /></>,
  governance: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
  briefing: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4M7 12l3-3 3 2 4-4" /></>,
  workshop: <><circle cx="8" cy="8" r="2.5" /><circle cx="16.5" cy="9" r="2" /><path d="M3.5 19c0-3 2-5 4.5-5s4.5 2 4.5 5M14 15.2c.8-.5 1.5-.7 2.5-.7 2 0 3.5 1.6 3.5 4.5" /></>,
  bootcamp: <><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M7 11.5V16c0 1.5 2.3 3 5 3s5-1.5 5-3v-4.5M21 9v6" /></>,
  curricula: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" /><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6" /></>,
  llm: <><path d="M4 5h16v11H11l-4 4v-4H4V5z" /><path d="M8 9h8M8 12h5" /></>,
  agents: <><rect x="5" y="8" width="14" height="10" rx="2" /><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16h5M3 12v3M21 12v3" /></>,
  predictive: <><path d="M4 20V4M4 20h16" /><path d="M7 15l4-4 3 3 5-6" /><path d="M16 8h3v3" /></>,
  deeplearning: <><circle cx="5" cy="7" r="1.8" /><circle cx="5" cy="17" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="7" r="1.8" /><circle cx="19" cy="17" r="1.8" /><path d="M6.7 7.8l3.8 3.4M6.7 16.2l3.8-3.4M13.6 11l3.8-3M13.6 13l3.8 3" /></>,
  integration: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="13" width="7" height="7" rx="1.5" /><path d="M10 7.5h4a3 3 0 0 1 3 3V13M14 16.5h-4a3 3 0 0 1-3-3V11" /></>,
  // training formats
  'half-day': <><path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 6v2.5M4.8 9.8l1.7 1.7M19.2 9.8l-1.7 1.7M8 21h8" /></>,
  'one-day': <><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M4 10h16M8 3v4M16 3v4M12 13v4" /></>,
  'multi-week': <><rect x="3" y="5" width="18" height="15" rx="1.5" /><path d="M3 10h18M7 14h3M12 14h3M7 17h3M3 7V4M21 7V4" /></>,
  // engagement tiers
  jumpstart: <><path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" /></>,
  build: <><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5z" /></>,
  partner: <><path d="M3 12l4-4 4 2 3-2 4 3" /><path d="M3 12l5 6 3-1 2 2 4-3 4-4-4-4" /></>,
  enterprise: <><path d="M4 21V8l8-5 8 5v13M4 21h16" /><path d="M9 21v-5h6v5M9 11h.01M15 11h.01M12 8h.01" /></>,
  // values
  evidence: <><path d="M4 20V4M4 20h16" /><rect x="7" y="12" width="3" height="5" /><rect x="12" y="8" width="3" height="9" /><rect x="17" y="5" width="3" height="12" /></>,
  transfer: <><path d="M4 8h13l-3-3M20 16H7l3 3" /></>,
  neutral: <><path d="M12 4v16M5 20h14M12 7H5l-2 6a3 3 0 0 0 6 0l-2-6M12 7h7l2 6a3 3 0 0 1-6 0l2-6" /></>,
  responsible: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /><path d="M8.5 12.5l2 2" /></>,
  // credibility
  credentialed: <><circle cx="12" cy="9" r="5" /><path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5L15 13.5" /></>,
  vendorneutral: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.3 11l7.4-3.8M8.3 13l7.4 3.8" /></>,
  smb: <><path d="M4 10l1.5-5h13L20 10M4 10v10h16V10M4 10c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3" /><path d="M10 20v-4h4v4" /></>,
  secure: <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2" /></>,
};

export type LineIconName = string;

export function LineIcon({ name, size = 32, className }: { name: LineIconName; size?: number; className?: string }) {
  return (
    <svg {...base(size)} strokeWidth={1.5} className={className ? `line-icon ${className}` : 'line-icon'}>
      {ICON_PATHS[name] ?? ICON_PATHS.readiness}
    </svg>
  );
}

const SERVICE_ITEM_ICONS: Record<string, string> = {
  'AI readiness assessment': 'readiness',
  'Use-case discovery and prioritization': 'discovery',
  'AI strategy and roadmap': 'roadmap',
  'AI governance and responsible-AI policy': 'governance',
  'Executive AI briefings': 'briefing',
  'Hands-on team workshops': 'workshop',
  'Deep-learning bootcamps for technical teams': 'bootcamp',
  'Custom curricula': 'curricula',
  'LLM and retrieval-augmented (RAG) applications': 'llm',
  'AI agents and workflow automation': 'agents',
  'Predictive models and ML pipelines': 'predictive',
  'Deep-learning solutions': 'deeplearning',
  'Integration with existing systems': 'integration',
};
const FORMAT_ICONS: Record<string, string> = {
  'Half-day briefing': 'half-day',
  '1-day workshop': 'one-day',
  'Multi-week bootcamp': 'multi-week',
};
const VALUE_ICONS: Record<string, string> = {
  'Evidence over hype': 'evidence',
  'Build to transfer': 'transfer',
  'Vendor-neutral': 'neutral',
  'Responsible by design': 'responsible',
};
const CRED_ICONS = ['credentialed', 'vendorneutral', 'smb', 'secure'];

export const ServiceItemIcon = ({ name }: { name: string }) => <LineIcon name={SERVICE_ITEM_ICONS[name] ?? 'readiness'} />;
export const FormatIcon = ({ format }: { format: string }) => <LineIcon name={FORMAT_ICONS[format] ?? 'one-day'} size={28} />;
export const ValueIcon = ({ title }: { title: string }) => <LineIcon name={VALUE_ICONS[title] ?? 'evidence'} />;
export const CredibilityIcon = ({ index }: { index: number }) => <LineIcon name={CRED_ICONS[index % CRED_ICONS.length]} size={32} />;
export const TierIcon = ({ id }: { id: string }) => <LineIcon name={id in ICON_PATHS ? id : 'build'} size={32} />;

export function PillarIcon({ kind, size = 40 }: { kind: number; size?: number }) {
  const paths = [
    <path key="a" d="M4 19V9M10 19V5M16 19v-8M22 19H2" />,
    <path key="b" d="M3 9l9-5 9 5-9 5-9-5zM7 11.5V16c0 1.5 2.5 3 5 3s5-1.5 5-3v-4.5" />,
    <path key="c" d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />,
  ];
  return (
    <svg {...base(size)} strokeWidth={1.6} className="pillar-icon">
      {paths[kind % paths.length]}
    </svg>
  );
}
