import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import {
  SYSTEMS_LEAD,
  SYSTEMS_SECTIONS,
  DELIVERABLES_HEADING,
  DELIVERABLES,
  SYSTEMS_CTA,
} from '../content/systems';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import { Icon, IconTile } from '../components/Icons';
import type { IconName } from '../components/Icons';
import { BellCurveMotif, DataGridMotif } from '../components/Motifs';

const ITEM_ICONS: Record<string, IconName[]> = {
  agentic: ['agent', 'users', 'target', 'lock'],
  architecture: ['network', 'flow', 'doc', 'shield'],
  observability: ['eye', 'gauge', 'bell', 'chart'],
  sustainability: ['book', 'scale', 'refresh', 'graduation'],
};

const DELIVERABLE_ICONS: IconName[] = ['layers', 'target', 'gauge', 'book', 'scale', 'graduation'];

/** Small supporting illustrations, one per section (decorative). */
function SectionIllustration({ id }: { id: string }) {
  const common = {
    className: 'section-illustration',
    viewBox: '0 0 320 220',
    'aria-hidden': true as const,
    focusable: 'false' as const,
    fill: 'none',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const teal = '#1F8A8A';
  const navy = '#0B1F3A';
  if (id === 'agentic') {
    return (
      <svg {...common}>
        <rect x="20" y="80" width="80" height="60" rx="10" stroke={navy} />
        <rect x="120" y="30" width="80" height="50" rx="10" stroke={teal} />
        <rect x="120" y="140" width="80" height="50" rx="10" stroke={teal} />
        <rect x="230" y="80" width="70" height="60" rx="10" stroke={navy} strokeDasharray="5 5" />
        <path d="M100 100L120 60M100 120L120 160M200 55L230 95M200 165L230 125" stroke={teal} />
        <circle cx="265" cy="110" r="10" stroke={teal} />
        <path d="M260 110l4 4 7-8" stroke={teal} />
      </svg>
    );
  }
  if (id === 'architecture') {
    return (
      <svg {...common}>
        <circle cx="160" cy="110" r="30" stroke={teal} />
        <rect x="140" y="95" width="40" height="30" rx="5" stroke={navy} />
        {[
          [50, 40],
          [270, 40],
          [50, 180],
          [270, 180],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x - 25} y={y - 18} width="50" height="36" rx="7" stroke={navy} />
            <path d={`M${x} ${y}L160 110`} stroke={teal} strokeDasharray="5 5" />
          </g>
        ))}
      </svg>
    );
  }
  if (id === 'observability') {
    return (
      <svg {...common}>
        <rect x="20" y="20" width="280" height="180" rx="12" stroke={navy} />
        <path d="M20 60H300" stroke={navy} />
        <path d="M44 170V130M84 170V110M124 170V140M164 170V90" stroke={teal} strokeWidth="6" />
        <path d="M190 150L220 120L245 135L282 85" stroke={teal} />
        <circle cx="282" cy="85" r="5" stroke={teal} />
        <circle cx="40" cy="40" r="4" stroke={navy} />
        <circle cx="56" cy="40" r="4" stroke={navy} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M30 170H290" stroke={navy} />
      <rect x="50" y="110" width="50" height="60" rx="6" stroke={navy} />
      <rect x="135" y="80" width="50" height="90" rx="6" stroke={teal} />
      <rect x="220" y="50" width="50" height="120" rx="6" stroke={navy} />
      <path d="M60 80C100 40 190 40 250 25" stroke={teal} strokeDasharray="5 5" />
      <path d="M240 18l12 6-8 10" stroke={teal} />
    </svg>
  );
}

export default function SystemsPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="systems-page">
      {/* Hero */}
      <section className="hero page-hero band-navy" aria-labelledby="systems-hero">
        <DataGridMotif className="band-motif" />
        <div className="container band-content systems-hero__grid">
          <div className="systems-hero__text">
            <p className="eyebrow">How we build</p>
            <h1 id="systems-hero">Systems engineering</h1>
            <p className="lead">{SYSTEMS_LEAD}</p>
          </div>
          <div className="systems-hero__diagram">
            <ArchitectureDiagram variant="dark" />
          </div>
        </div>
      </section>

      {/* Sections */}
      {SYSTEMS_SECTIONS.map((sec, idx) => (
        <section
          key={sec.id}
          id={sec.id}
          className={`section system-section ${idx % 2 === 0 ? '' : 'section-surface'} ${idx % 2 === 1 ? 'flip' : ''}`}
        >
          <div className="container system-layout">
            <div className="system-text">
              <p className="eyebrow">{sec.eyebrow}</p>
              <h2>{sec.title}</h2>
              <p>{sec.intro}</p>
              <ul className="icon-list">
                {sec.items.map((it, i) => (
                  <li key={it}>
                    <span className="icon-bullet"><Icon name={ITEM_ICONS[sec.id][i]} size={22} /></span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="system-art">
              <SectionIllustration id={sec.id} />
            </div>
          </div>
        </section>
      ))}

      {/* Deliverables */}
      <section className="deliverables section band-navy" aria-label="Deliverables">
        <BellCurveMotif className="band-motif" />
        <div className="container band-content">
          <p className="eyebrow">Deliverables</p>
          <h2>{DELIVERABLES_HEADING}</h2>
          <div className="deliverable-grid">
            {DELIVERABLES.map((name, i) => (
              <div key={name} className="deliverable-card">
                <IconTile name={DELIVERABLE_ICONS[i]} />
                <span className="monospace deliverable-name">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band cta-light">
        <div className="container">
          <p className="eyebrow">Next step</p>
          <h2>{SYSTEMS_CTA.heading}</h2>
          <Link to={SYSTEMS_CTA.button.to} className="btn btn-primary">{SYSTEMS_CTA.button.label}</Link>
        </div>
      </section>
    </div>
  );
}
