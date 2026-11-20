import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { ENGAGEMENTS_INTRO, ENGAGEMENT_TIERS } from '../content/engagements';
import Photo from '../components/Photo';

import Photo from '../components/Photo';
export default function EngagementsPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="engagements-page">
      <section className="container page-head">
        <h1>Engagements</h1>
        <p className="lead">{ENGAGEMENTS_INTRO}</p>
      </section>
      {/* Photo banner */}
      <Photo name="enterprise-atrium" />
      <section className="container">
        <div className="engagement-grid">
          {ENGAGEMENT_TIERS.map((tier) => (
            <article key={tier.id} id={tier.id} className={`card engagement-card ${tier.premium ? 'premium' : ''}`}> 
              <h2>{tier.name}</h2>
              <p>{tier.audience}</p>
              <p>{tier.timeline}</p>
              {tier.premium && <span className="premium-label">Premium</span>}
              <h3>What&#39;s included</h3>
              <ul>
                {tier.included.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
              <Link to={tier.cta.to} className="btn btn-primary">{tier.cta.label}</Link>
            </article>
          ))}
        </div>
        <p className="not-sure">
          Not sure which fits? <Link to="/contact">Tell us about your business</Link>
        </p>
      </section>
    </div>
  );
}
