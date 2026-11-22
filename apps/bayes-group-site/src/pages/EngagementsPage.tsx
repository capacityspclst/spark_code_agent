import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { ENGAGEMENTS_INTRO, TIERS, NOT_SURE } from '../content/engagements';
import { CheckIcon, ClockIcon, IconTile } from '../components/Icons';
import type { IconName } from '../components/Icons';
import Photo from '../components/Photo';
import { DataGridMotif } from '../components/Motifs';

const TIER_ICONS: Record<string, IconName> = {
  jumpstart: 'rocket',
  build: 'wrench',
  partner: 'handshake',
  enterprise: 'building',
};

export default function EngagementsPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  const business = TIERS.filter((t) => !t.premium);
  const premium = TIERS.filter((t) => t.premium);

  const renderTier = (t: (typeof TIERS)[number]) => (
    <article key={t.id} id={t.id} className={`tier-card${t.premium ? ' premium' : ''}`}>
      {t.id === 'enterprise' && (
        <Photo
          name="enterprise-atrium"
          alt="Spacious corporate atrium with modern glass architecture"
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="tier-photo"
        />
      )}
      <div className="tier-body">
        <div className="tier-head">
          <IconTile name={TIER_ICONS[t.id]} />
          {t.premium && <span className="premium-label">Premium</span>}
        </div>
        <h2>{t.name}</h2>
        <p className="audience">{t.audience}</p>
        <p className="timeline"><ClockIcon /> <span>{t.timeline}</span></p>
        <h3>What's included</h3>
        <ul className="check-list">
          {t.included.map((item) => (
            <li key={item}>
              <CheckIcon size={20} /> <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link to={t.cta.to} className={`btn ${t.premium ? 'btn-on-dark' : 'btn-primary'}`}>{t.cta.label}</Link>
      </div>
    </article>
  );

  return (
    <div className="engagements-page">
      {/* Header */}
      <section className="page-hero hero band-navy" aria-labelledby="engagements-hero">
        <DataGridMotif className="band-motif" />
        <div className="container band-content">
          <p className="eyebrow">Work with us</p>
          <h1 id="engagements-hero">Engagements</h1>
          <p className="lead">{ENGAGEMENTS_INTRO}</p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="section section-surface tiers">
        <div className="container">
          <div className="tier-grid">{business.map(renderTier)}</div>
          <div className="tier-premium">{premium.map(renderTier)}</div>
        </div>
      </section>

      {/* Not sure line */}
      <section className="not-sure">
        <div className="container">
          <p>{NOT_SURE.text} <Link to={NOT_SURE.link.to}>{NOT_SURE.link.label}</Link></p>
        </div>
      </section>
    </div>
  );
}
