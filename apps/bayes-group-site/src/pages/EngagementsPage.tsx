import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { ENGAGEMENTS_INTRO, TIERS, NOT_SURE } from '../content/engagements';
import { CheckIcon, ClockIcon } from '../components/Icons';
import Photo from '../components/Photo';

export default function EngagementsPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="engagements-page">
      {/* Header */}
      <section className="hero" aria-labelledby="engagements-hero">
        <div className="container">
          <h1 id="engagements-hero">Engagements</h1>
          <p className="lead">{ENGAGEMENTS_INTRO}</p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="tiers">
        <div className="container">
          {TIERS.map((t) => (
            <article key={t.id} id={t.id} className={`tier-card ${t.premium ? 'premium' : ''}`}>
              <ClockIcon className="icon-tile" />
              <h2>{t.name}</h2>
              <p className="audience">{t.audience}</p>
              <p className="timeline">{t.timeline}</p>
              <h3>What's included</h3>
              <ul>
                {t.included.map((item) => (
                  <li key={item}>
                    <CheckIcon /> {item}
                  </li>
                ))}
              </ul>
              <Link to={t.cta.to} className="btn btn-primary">{t.cta.label}</Link>
              {t.premium && (
                <div className="premium-label">Premium</div>
              )}
              {t.id === 'enterprise' && (
                <Photo name="enterprise-atrium" alt="Spacious atrium with modern office design" />
              )}
            </article>
          ))}
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
