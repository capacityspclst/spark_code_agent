import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { HERO, PILLARS, STEPS, WHY_POINTS, CTA_BAND } from '../content/home';

export default function HomePage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero" style={{ backgroundColor: 'var(--color-navy)', color: 'var(--color-white)' }}>
        <h1>{HERO.title}</h1>
        <p>{HERO.valueProp}</p>
        <div className="hero-buttons">
          <a href={HERO.primary.to}>{HERO.primary.label}</a>
          <a href={HERO.secondary.to}>{HERO.secondary.label}</a>
        </div>
      </section>

      {/* Pillars */}
      <section className="pillars">
        {PILLARS.map((p) => (
          <div key={p.title} className="pillar-card">
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <a href={p.href}>Learn more</a>
          </div>
        ))}
      </section>

      {/* How we work */}
      <section className="how-we-work">
        <h2>How we work</h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Why */}
      <section className="why">
        <h2>Why The Bayes Group</h2>
        {WHY_POINTS.map((w) => (
          <div key={w.title} className="why-point">
            <h3>{w.title}</h3>
            <p>{w.description}</p>
          </div>
        ))}
      </section>

      {/* CTA band */}
      <section className="cta-band" style={{ backgroundColor: 'var(--color-navy)', color: 'var(--color-white)' }}>
        <h2>{CTA_BAND.heading}</h2>
        <a href={CTA_BAND.button.to} className="primary-button">{CTA_BAND.button.label}</a>
      </section>
    </div>
  );
}
