import * as React from 'react';

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
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

const ICON_PATHS = {
  chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  graduation: 'M2 9l10-5 10 5-10 5L2 9zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
  code: 'M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14',
  agent: 'M12 3v3M7 8h10a3 3 0 013 3v5a3 3 0 01-3 3H7a3 3 0 01-3-3v-5a3 3 0 013-3zM9 13v1M15 13v1M9.5 17h5',
  network: 'M12 4a2 2 0 100 .01M5 19a2 2 0 100 .01M19 19a2 2 0 100 .01M12 6v5M12 11l-6 6M12 11l6 6',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
  wrench: 'M14.5 6.5a4 4 0 005 5L21 13l-8 8-4-4 8-8 1.5-1.5zM8 8L4 4M4 8l4-4',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3.5 3-6 7-6s7 2.5 7 6M17 4.5a3.5 3.5 0 010 6.5M19 14c2 .7 3 2.5 3 5',
  building: 'M4 21V4h10v17M14 9h6v12M2 21h20M8 8h2M8 12h2M8 16h2M17 13h0M17 17h0',
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  doc: 'M6 3h9l4 4v14H6V3zM14 3v5h5M9 13h7M9 17h7',
  gauge: 'M4 18a9 9 0 1116 0M12 18l4-6M7 11h.01M12 8h.01M17 11h.01',
  bell: 'M6 16V11a6 6 0 0112 0v5l2 2H4l2-2zM10 21h4',
  book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13',
  calendar: 'M4 6h16v14H4V6zM4 10h16M8 3v4M16 3v4',
  rocket: 'M5 15c-1 1-2 4-2 6 2 0 5-1 6-2M14 4c3-1 6-1 7-1 0 1 0 4-1 7l-7 7-6-6 7-7zM15 9h.01',
  lock: 'M5 11h14v10H5V11zM8 11V7a4 4 0 018 0v4M12 15v2',
  refresh: 'M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3M18 3v4h-4M6 21v-4h4',
  database: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
  award: 'M12 14a6 6 0 100-12 6 6 0 000 12zM8.5 13l-1.5 8 5-3 5 3-1.5-8',
  handshake: 'M3 12l4-4 4 2 3-2 7 6-4 4-3-2-2 2-3-1-2 2-4-4 0-3zM3 12l-1 1M22 14l-1 1',
  briefcase: 'M3 8h18v12H3V8zM9 8V5h6v3M3 13h18',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  scale: 'M12 3v18M5 21h14M5 7h14M5 7l-3 7a3.5 3.5 0 006 0L5 7zM19 7l-3 7a3.5 3.5 0 006 0l-3-7z',
  leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7',
  flow: 'M4 6h6v4H4V6zM14 14h6v4h-6v-4zM10 8h4a2 2 0 012 2v4',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, size = 24, className }: IconProps & { name: IconName }) {
  return (
    <svg {...base(size)} className={className}>
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/** A 44px pale-teal rounded square holding a line icon. */
export function IconTile({ name, className }: { name: IconName; className?: string }) {
  return (
    <span className={`icon-tile${className ? ` ${className}` : ''}`}>
      <Icon name={name} size={24} />
    </span>
  );
}

const PILLAR_ICONS: IconName[] = ['compass', 'graduation', 'code'];

export function PillarIcon({ kind }: { kind: number; size?: number }) {
  return <IconTile name={PILLAR_ICONS[kind % PILLAR_ICONS.length]} />;
}
