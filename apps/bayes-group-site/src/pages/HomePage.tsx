import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import {
  HERO,
  PILLARS,
  STEPS,
  WHY_POINTS,
  CTA_BAND,
  CREDIBILITY_POINTS,
  AUDIENCE_PANELS,
  SYSTEMS_BAND,
  CAPABILITIES,
  OPERATE_STEP,
  EXAMPLES_SECTION,
  EXAMPLES,
  TESTIMONIAL,
} from '../content/home';
import { ArrowIcon, CheckIcon, PillarIcon, ClockIcon } from '../components/Icons';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
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
          <div className="hero-text">
            <h1 id="hero-title">{HERO.title}</h1>
            <p className="lead">{HERO.valueProp}</p>
            <div className="hero-buttons">
              <Link to={HERO.primary.to} className="btn btn-on-dark">{HERO.primary.label}</Link>
              <Link to={HERO.secondary.to} className="btn btn-on-dark-secondary">{HERO.secondary.label}</Link>
            </div>
          </div>
          <Photo name="hero-boardroom" alt="Modern boardroom with a presentation screen and collaboration space" priority />
        </div>
      </section>

      {/* Credibility strip */}
      <section className="cred-strip" aria-label="Credibility">
        <div className="container">
          {CREDIBILITY_POINTS.map((point) => (
            <div key={point} className="cred-item">
              <svg width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" /></svg>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Who we serve panels */}
      <section className="who-serve" aria-label="Who we serve">
        <div className="container">
          <p className="eyebrow">WHO WE SERVE</p>
          {AUDIENCE_PANELS.map((panel) => (
            <div key={panel.id} className={`panel ${panel.premium ? 'premium' : ''}`} id={panel.id}>
              <Photo name={panel.photo} alt={`Photo representing ${panel.title.toLowerCase()}`} />
              <h2>{panel.title}</h2>
              <p>{panel.text}</p>
              {panel.premium && <span className="premium-label">Premium</span>}
              <Link to={panel.link.to}>{panel.link.label}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Systems band */}
      <section className="systems-band" aria-label="Systems">
        <div className="container">
          <p className="eyebrow">{SYSTEMS_BAND.eyebrow}</p>
          <h2>{SYSTEMS_BAND.heading}</h2>
          <div className="systems-content">
            <ArchitectureDiagram variant="dark" />
            <div className="capabilities">
              {CAPABILITIES.map((c) => (
                <div key={c.title} className="capability">
                  <svg width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" /></svg>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Link to={SYSTEMS_BAND.link.to}>{SYSTEMS_BAND.link.label}</Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="section" aria-label="What we do">
        <div className="container pillars">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="card pillar-card">
              <Photo name={['strategy-session','team-workshop','custom-development'][i]} alt={`${p.title} illustration`} />
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
          <div className="operate-step">
            <h3>{OPERATE_STEP.title}</h3>
            <p>{OPERATE_STEP.description}</p>
          </div>
        </div>
      </section>

      {/* Example engagements */}
      <section className="examples" aria-label="Examples">
        <div className="container">
          <p className="eyebrow">{EXAMPLES_SECTION.eyebrow}</p>
          <h2>{EXAMPLES_SECTION.heading}</h2>
          <div className="example-cards">
            {EXAMPLES.map((ex) => (
              <div key={ex.name} className="example-card">
                <span className="tag">{EXAMPLES_SECTION.tag}</span>
                <h3>{ex.name}</h3>
                <p className="industry">{ex.industry}</p>
                <dl>
                  <dt>Challenge</dt><dd>{ex.challenge}</dd>
                  <dt>System</dt><dd>{ex.system}</dd>
                  <dt>Observed and sustained</dt><dd>{ex.sustained}</dd>
                </dl>
                <p className="note">{EXAMPLES_SECTION.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial" aria-label="Testimonial">
        <div className="container">
          <p>{TESTIMONIAL.placeholderNote}</p>
          <blockquote>{TESTIMONIAL.quote}</blockquote>
          <cite>{TESTIMONIAL.attribution}</cite>
        </div>
      </section>

      {/* Why */}
      <section className="section why">
        <div className="container why-layout">
          <div>
            <p className="eyebrow">Why us</p>
            <h2>Why The Bayes Group</h2>
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
          <Photo name="about-office" alt="About office photo" />
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
