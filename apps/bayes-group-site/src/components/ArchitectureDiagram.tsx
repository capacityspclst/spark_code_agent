import * as React from 'react';

export interface ArchitectureDiagramProps {
  variant?: 'light' | 'dark';
}

const TITLE = 'System architecture: your systems, agent orchestration, models, guardrails and observability';
const DESC =
  'Layered diagram. Your systems (CRM, ERP, data warehouse, documents) feed agent orchestration (planner, tool-using agents, human approval), which works with vendor-neutral models and guardrails and evaluations. Every box reports down into the observability layer: traces, metrics, cost and evaluations.';

type Palette = {
  groupFill: string;
  groupStroke: string;
  groupLabel: string;
  boxFill: string;
  boxStroke: string;
  boxLabel: string;
  line: string;
  dash: string;
};

const PALETTES: Record<'light' | 'dark', Palette> = {
  light: {
    groupFill: '#F2F7F7',
    groupStroke: '#0B1F3A',
    groupLabel: '#0B1F3A',
    boxFill: '#FFFFFF',
    boxStroke: '#1F8A8A',
    boxLabel: '#0B1F3A',
    line: '#1F8A8A',
    dash: '#1F8A8A',
  },
  dark: {
    groupFill: '#0B1F3A',
    groupStroke: '#1F8A8A',
    groupLabel: '#5FC4C4',
    boxFill: '#102A4C',
    boxStroke: '#5FC4C4',
    boxLabel: '#FFFFFF',
    line: '#5FC4C4',
    dash: '#1F8A8A',
  },
};

type Box = { label: string; x: number; y: number; w: number; h: number };
type Group = { label: string; x: number; y: number; w: number; h: number };
type Arrow = [number, number, number, number];

type Layout = {
  viewBox: string;
  groups: Group[];
  boxes: Box[];
  arrows: Arrow[];
  dashed: Array<[number, number, number]>; // x, y1, y2
  fontBox: number;
  fontGroup: number;
};

function box(label: string, x: number, y: number, w: number, h: number): Box {
  return { label, x, y, w, h };
}

const WIDE: Layout = (() => {
  const top = ['CRM', 'ERP', 'Data warehouse', 'Documents'].map((l, i) => box(l, 40 + i * 185, 60, 165, 50));
  const orch = ['Planner', 'Tool-using agents', 'Human approval'].map((l, i) => box(l, 30 + i * 165, 232, 150, 50));
  const side = [
    box('Models (vendor-neutral)', 555, 190, 235, 50),
    box('Guardrails & evaluations', 555, 262, 235, 50),
  ];
  const obs = ['Traces', 'Metrics', 'Cost', 'Evaluations'].map((l, i) => box(l, 40 + i * 185, 430, 165, 50));
  const boxes = [...top, ...orch, ...side, ...obs];
  const dashed: Array<[number, number, number]> = [
    ...top.map((b): [number, number, number] => [b.x + b.w / 2, b.y + b.h, 380]),
    ...orch.map((b): [number, number, number] => [b.x + b.w / 2, b.y + b.h, 380]),
    [600, 240, 380],
    [740, 312, 380],
  ];
  return {
    viewBox: '0 0 800 510',
    groups: [
      { label: 'Your systems', x: 10, y: 10, w: 780, h: 120 },
      { label: 'Agent orchestration', x: 10, y: 180, w: 510, h: 140 },
      { label: 'Observability', x: 10, y: 380, w: 780, h: 120 },
    ],
    boxes,
    arrows: [
      [215, 130, 215, 178],
      [400, 130, 400, 178],
      [522, 215, 553, 215],
      [522, 287, 553, 287],
    ],
    dashed,
    fontBox: 15,
    fontGroup: 15,
  };
})();

const STACKED: Layout = (() => {
  const top = ['CRM', 'ERP', 'Data warehouse', 'Documents'].map((l, i) =>
    box(l, 20 + (i % 2) * 155, 50 + Math.floor(i / 2) * 50, 145, 40),
  );
  const orch = ['Planner', 'Tool-using agents', 'Human approval'].map((l, i) => box(l, 20, 230 + i * 54, 300, 40));
  const side = [box('Models (vendor-neutral)', 20, 430, 300, 40), box('Guardrails & evaluations', 20, 486, 300, 40)];
  const obs = ['Traces', 'Metrics', 'Cost', 'Evaluations'].map((l, i) =>
    box(l, 20 + (i % 2) * 155, 598 + Math.floor(i / 2) * 50, 145, 40),
  );
  const boxes = [...top, ...orch, ...side, ...obs];
  const dashed = [...top, ...orch, ...side].map((b): [number, number, number] => [
    b.x + b.w / 2,
    b.y + b.h,
    558,
  ]);
  return {
    viewBox: '0 0 340 708',
    groups: [
      { label: 'Your systems', x: 5, y: 10, w: 330, h: 150 },
      { label: 'Agent orchestration', x: 5, y: 190, w: 330, h: 208 },
      { label: 'Models & guardrails', x: 5, y: 418, w: 330, h: 120 },
      { label: 'Observability', x: 5, y: 558, w: 330, h: 140 },
    ],
    boxes,
    arrows: [
      [170, 160, 170, 188],
      [170, 398, 170, 416],
    ],
    dashed,
    fontBox: 13,
    fontGroup: 13,
  };
})();

function DiagramSvg({
  layout,
  palette,
  className,
  mounted,
}: {
  layout: Layout;
  palette: Palette;
  className: string;
  mounted: boolean;
}) {
  const uid = React.useId().replace(/:/g, '');
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const markerId = `${uid}-arrow`;
  return (
    <svg
      className={className}
      role="img"
      aria-label={TITLE}
      aria-labelledby={mounted ? `${titleId} ${descId}` : undefined}
      viewBox={layout.viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      {mounted && <title id={titleId}>{TITLE}</title>}
      {mounted && <desc id={descId}>{DESC}</desc>}
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill={palette.line} />
        </marker>
      </defs>
      {/* dashed lines drawn first so groups and boxes sit on top of them */}
      {layout.dashed.map(([x, y1, y2], i) => (
        <line
          key={`d${i}`}
          x1={x}
          y1={y1}
          x2={x}
          y2={y2}
          stroke={palette.dash}
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
      ))}
      {layout.groups.map((g) => (
        <g key={g.label}>
          <rect
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            rx="12"
            fill={palette.groupFill}
            stroke={palette.groupStroke}
            strokeWidth="1.5"
          />
          <text
            className="diagram-text"
            fontFamily="var(--font-mono)"
            x={g.x + 20}
            y={g.y + 28}
            fontSize={layout.fontGroup}
            fontWeight="700"
            fill={palette.groupLabel}
          >
            {g.label}
          </text>
        </g>
      ))}
      {layout.boxes.map((b) => (
        <g key={b.label}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="8"
            fill={palette.boxFill}
            stroke={palette.boxStroke}
            strokeWidth="1.5"
          />
          <text
            className="diagram-text"
            fontFamily="var(--font-mono)"
            x={b.x + b.w / 2}
            y={b.y + b.h / 2}
            fontSize={layout.fontBox}
            textAnchor="middle"
            dominantBaseline="central"
            fill={palette.boxLabel}
          >
            {b.label}
          </text>
        </g>
      ))}
      {layout.arrows.map(([x1, y1, x2, y2], i) => (
        <line
          key={`a${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={palette.line}
          strokeWidth="2"
          markerEnd={`url(#${markerId})`}
        />
      ))}
    </svg>
  );
}

export function ArchitectureDiagram({ variant = 'light' }: ArchitectureDiagramProps) {
  const palette = PALETTES[variant];
  // The <title>/<desc> are added after mount: the prerenderer strips svg titles so each
  // page has exactly one document <title>, and rendering them on the client first pass
  // would cause a hydration mismatch. aria-label covers the prerendered state.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <div className={`arch-diagram arch-${variant}`}>
      <DiagramSvg layout={WIDE} palette={palette} className="arch-svg arch-wide" mounted={mounted} />
      <DiagramSvg layout={STACKED} palette={palette} className="arch-svg arch-stacked" mounted={mounted} />
    </div>
  );
}

export default ArchitectureDiagram;
