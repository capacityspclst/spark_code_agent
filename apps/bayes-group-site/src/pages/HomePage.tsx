import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { HERO, PILLARS, STEPS, WHY_POINTS, CTA_BAND, CREDIBILITY_POINTS, WHO_WE_SERVE, CASE_STUDIES, CASE_STUDY_NOTE, TESTIMONIAL } from '../content/home';
import { ArrowIcon, CheckIcon, PillarIcon, CredibilityIcon } from '../components/Icons';
import { BellCurveMotif, DataGridPattern } from '../components/Illustrations';
import Photo from '../components/Photo';
import type { PhotoName } from '../content/images';

const PILLAR_PHOTOS: PhotoName[] = ['strategy-session', 'team-workshop', 'custom-development'];

export default function HomePage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <Photo name="hero-boardroom" priority className="hero-photo" sizes="100vw" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-grid-pattern" aria-hidden="true">
          <DataGridPattern id="data-grid-hero" />
        </div>
        <div className="hero-motif" aria-hidden="true">
          <BellCurveMotif />
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">{HERO.title}</h1>
            <p className="lead">{HERO.valueProp}</p>
            <div className="hero-buttons">
              <Link to={HERO.primary.to} className="btn btn-on-dark">{HERO.primary.label}</Link>
              <Link to={HERO.secondary.to} className="btn btn-on-dark-secondary">{HERO.secondary.label}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility strip */}
      <section className="credibility-strip" aria-label="Credibility">
        <div className="container">
          <ul className="cred-list">
            {CREDIBILITY_POINTS.map((p, i) => (
              <li key={p.title} className="cred-item">
                <CredibilityIcon index={i} />
                <span>{p.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who we serve */}
      <section className="section who-we-serve" aria-label="Who we serve">
        <div className="container">
          <h2>Who we serve</h2>
          <div className="serve-panels">
            <div className="panel smb-panel card fade-in">
              <Photo name="smb-owner" className="panel-photo" />
              <div className="panel-body">
                <h3>{WHO_WE_SERVE.smb.title}</h3>
                <p>{WHO_WE_SERVE.smb.text}</p>
                <Link to={WHO_WE_SERVE.smb.link.to} className="text-link">{WHO_WE_SERVE.smb.link.label}</Link>
              </div>
            </div>
            <div className="panel enterprise-panel fade-in">
              <Photo name="enterprise-atrium" className="panel-photo" />
              <div className="panel-body">
                <span className="premium-label">{WHO_WE_SERVE.enterprise.label}</span>
                <h3>{WHO_WE_SERVE.enterprise.title}</h3>
                <p>{WHO_WE_SERVE.enterprise.text}</p>
                <Link to={WHO_WE_SERVE.enterprise.link.to} className="text-link">{WHO_WE_SERVE.enterprise.link.label}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section section-surface" aria-label="What we do">
        <div className="container">
          <h2>What we do</h2>
          <p className="lead section-intro">We help your team find, build and own AI that delivers measurable results, guided by two credentialed data scientists.</p>
        </div>
        <div className="container pillars">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="card pillar-card fade-in">
              <Photo name={PILLAR_PHOTOS[i]} className="pillar-photo" />
              <div className="pillar-body">
                <PillarIcon kind={i} />
                <h2 className="pillar-title">{p.title}</h2>
                <p>{p.description}</p>
                <Link to={p.href} className="text-link">
                  Learn more <ArrowIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className="section how-we-work">
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
      <section className="section section-surface client-results" aria-label="Client results">
        <div className="container">
          <h2>Client results</h2>
          <div className="case-grid">
            {CASE_STUDIES.map((c) => (
              <article key={c.industry} className="card case-card fade-in">
                <span className="placeholder-tag">Placeholder</span>
                <h3>{c.industry}</h3>
                <p>{c.challenge}</p>
                <p>{c.approach}</p>
                <p className="case-result">{c.result}</p>
                <p className="placeholder-note">{CASE_STUDY_NOTE}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial on-dark" aria-label="Testimonial">
        <div className="container testimonial-inner">
          <blockquote>
            <p>{TESTIMONIAL.quote}</p>
            <cite>{TESTIMONIAL.attribution}</cite>
          </blockquote>
          <p className="testimonial-note">{TESTIMONIAL.note}</p>
        </div>
      </section>

      {/* Why */}
      <section className="section why">
        <div className="container why-layout">
          <div className="why-photo fade-in">
            <p className="eyebrow">Why us</p>
            <h2>Why The Bayes Group</h2>
            <Photo name="about-office" />
          </div>
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
      <section className="cta-band on-dark">
        <div className="cta-motif" aria-hidden="true">
          <BellCurveMotif />
        </div>
        <div className="container">
          <h2>{CTA_BAND.heading}</h2>
          <p className="lead cta-text">Tell us about your goals. We'll reply within one business day.</p>
          <Link to={CTA_BAND.button.to} className="btn btn-on-dark">{CTA_BAND.button.label}</Link>
        </div>
      </section>
    </div>
  );
}
