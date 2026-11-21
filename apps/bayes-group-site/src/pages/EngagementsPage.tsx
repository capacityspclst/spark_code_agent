import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { ENGAGEMENTS_INTRO, ENGAGEMENT_TIERS } from '../content/engagements';
import Photo from '../components/Photo';
import { CheckIcon, ClockIcon, TierIcon } from '../components/Icons';
import { DataGridPattern } from '../components/Illustrations';

export default function EngagementsPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="engagements-page">
      <div className="page-band">
        <DataGridPattern />
        <div className="container page-head">
          <h1>Engagements</h1>
          <p className="lead">{ENGAGEMENTS_INTRO}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="engagement-grid">
            {ENGAGEMENT_TIERS.map((tier) => (
              <article
                key={tier.id}
                id={tier.premium ? 'enterprise' : tier.id}
                className={tier.premium ? 'card engagement-card premium fade-in' : 'card engagement-card fade-in'}
              >
                {tier.premium && <Photo name="enterprise-atrium" className="tier-photo" />}
                <div className="tier-body">
                  <div className="tier-top">
                    <TierIcon id={tier.id} />
                    {tier.premium && <span className="premium-label">Premium</span>}
                  </div>
                  <h2>{tier.name}</h2>
                  <p className="tier-audience">{tier.audience}</p>
                  <p className="tier-timeline">
                    <ClockIcon />
                    <span>{tier.timeline}</span>
                  </p>
                  <h3>What&apos;s included</h3>
                  <ul className="check-list">
                    {tier.included.map((it) => (
                      <li key={it}>
                        <CheckIcon size={20} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.cta.to} className={tier.premium ? 'btn btn-on-dark' : 'btn btn-primary'}>
                    {tier.cta.label}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="not-sure">
            Not sure which fits? <Link to="/contact">Tell us about your business</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
