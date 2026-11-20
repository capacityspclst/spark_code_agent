import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { HERO, PILLARS, STEPS, WHY_POINTS, CTA_BAND, CREDIBILITY_POINTS, WHO_WE_SERVE, CASE_STUDIES, CASE_STUDY_NOTE, TESTIMONIAL } from '../content/home';
import { ArrowIcon, CheckIcon, PillarIcon } from '../components/Icons';
import Photo from '../components/Photo';

function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 400 260"
      fill="none"
      aria-hidden="true"
      focusable="false"
      width="400"
      height="260"
    >
      <path d="M10 240 C110 240, 140 30, 200 30 C260 30, 290 240, 390 240" stroke="#5FC4C4" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 240 C90 240, 110 90, 160 90 C210 90, 240 240, 330 240" stroke="#1F8A8A" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M70 240 C150 240, 190 70, 240 70 C290 70, 320 240, 390 240" stroke="#1F8A8A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M10 245H390" stroke="#B8C4D6" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export default function HomePage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div>
            <h1 id="hero-title">{HERO.title}</h1>
            <p className="lead">{HERO.valueProp}</p>
            <div className="hero-buttons">
              <Link to={HERO.primary.to} className="btn btn-on-dark">{HERO.primary.label}</Link>
              <Link to={HERO.secondary.to} className="btn btn-on-dark-secondary">{HERO.secondary.label}</Link>
            </div>
          </div>
          {/* Use Photo component for hero image */}
          <Photo name="hero-boardroom" priority />
        </div>
      </section>

      {/* Credibility strip */}
      <section className="credibility-strip" aria-label="Credibility">
        <div className="container">
          <ul className="cred-list">
            {CREDIBILITY_POINTS.map((p) => (
              <li key={p.title} className="cred-item">
                {/* placeholder for icon */}<span>{p.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who we serve */}
      <section className="who-we-serve" aria-label="Who we serve">
        <div className="container">
          <h2>Who we serve</h2>
          <div className="serve-panels">
            {/* SMB panel */}
            <div className="panel smb-panel">
              <h3>{WHO_WE_SERVE.smb.title}</h3>
              <p>{WHO_WE_SERVE.smb.text}</p>
              <Link to={WHO_WE_SERVE.smb.link.to}>{WHO_WE_SERVE.smb.link.label}</Link>
            </div>
            {/* Enterprise panel */}
            <div className="panel enterprise-panel">
              <h3>{WHO_WE_SERVE.enterprise.title}</h3>
              <span className="premium-label">{WHO_WE_SERVE.enterprise.label}</span>
              <p>{WHO_WE_SERVE.enterprise.text}</p>
              <Link to={WHO_WE_SERVE.enterprise.link.to}>{WHO_WE_SERVE.enterprise.link.label}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section" aria-label="What we do">
        <div className="container pillars">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="card pillar-card">
              <PillarIcon kind={i} />
              <h2 className="pillar-title" style={{ fontSize: 'var(--text-h3)' }}>{p.title}</h2>
              <p>{p.description}</p>
              <Link to={p.href} className="text-link">
                Learn more <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className="section section-surface how-we-work">
        <div className="container">
          <p className="eyebrow">Our process</p>
          <h2>How we work</h2>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <div className="step-num" aria-hidden="true">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Client results */}
      <section className="client-results" aria-label="Client results">
        <div className="container">
          <h2>Client results</h2>
          <div className="case-grid">
            {CASE_STUDIES.map((c) => (
              <article key={c.industry} className="case-card">
                <h3>{c.industry}</h3>
                <span className="placeholder-tag">Placeholder</span>
                <p>{c.challenge}</p>
                <p>{c.approach}</p>
                <p>{c.result}</p>
                <p className="note">{CASE_STUDY_NOTE}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial" aria-label="Testimonial">
        <div className="container">
          <blockquote>
            <p>{TESTIMONIAL.quote}</p>
            <cite>{TESTIMONIAL.attribution}</cite>
          </blockquote>
          <p className="note">{TESTIMONIAL.note}</p>
        </div>
      </section>

      {/* Why */}
      <section className="section why">
        <div className="container why-layout">
          <div>
            <p className="eyebrow">Why us</p>
            <h2>Why The Bayes Group</h2>
          </div>
          {/* Photo */}
          <Photo name="about-office" />
          <div className="why-list">
            {WHY_POINTS.map((w) => (
              <div key={w.title} className="why-point">
                <CheckIcon />
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>{CTA_BAND.heading}</h2>
          <Link to={CTA_BAND.button.to} className="btn btn-on-dark">{CTA_BAND.button.label}</Link>
        </div>
      </section>
    </div>
  );
}
