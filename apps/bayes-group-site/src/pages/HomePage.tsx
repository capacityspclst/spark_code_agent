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
import { ArrowIcon, Icon, IconTile, PillarIcon } from '../components/Icons';
import type { IconName } from '../components/Icons';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import Photo from '../components/Photo';
import { BellCurveMotif, DataGridMotif } from '../components/Motifs';

const CRED_ICONS: IconName[] = ['award', 'compass', 'building', 'shield'];
const CAP_ICONS: IconName[] = ['agent', 'network', 'eye', 'wrench'];
const WHY_ICONS: IconName[] = ['award', 'wrench', 'compass', 'handshake'];
const PILLAR_PHOTOS = ['strategy-session', 'team-workshop', 'custom-development'];
const PILLAR_ALTS = [
  'Colleagues in a strategy session around a table with documents and laptops',
  'A facilitator leading a team workshop at a whiteboard',
  'Two monitors showing code and a network diagram on a developer desk',
];
const PANEL_ALTS: Record<string, string> = {
  smb: 'A business professional working at a laptop with analytics on screen',
  enterprise: 'A large, bright corporate atrium with people walking through',
};

export default function HomePage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero hero-photo-section" aria-labelledby="hero-title">
        <Photo
          name="hero-boardroom"
          alt="Modern boardroom with a presentation screen and collaboration space"
          sizes="100vw"
          priority
          className="hero-photo"
        />
        <div className="hero-overlay" aria-hidden="true" />
        <BellCurveMotif className="hero-motif" />
        <div className="container hero-grid">
          <div className="hero-text">
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
      <section className="cred-strip" aria-label="Credibility">
        <div className="container">
          <ul className="cred-bar">
            {CREDIBILITY_POINTS.map((point, i) => (
              <li key={point} className="cred-item">
                <IconTile name={CRED_ICONS[i]} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who we serve panels */}
      <section className="section who-serve" aria-label="Who we serve">
        <div className="container">
          <p className="eyebrow">WHO WE SERVE</p>
          <div className="panel-grid">
            {AUDIENCE_PANELS.map((panel) => (
              <div key={panel.id} className={`panel${panel.premium ? ' premium' : ''}`} id={panel.id}>
                <Photo
                  name={panel.photo}
                  alt={PANEL_ALTS[panel.id]}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="panel-photo"
                />
                {panel.premium && <span className="premium-label">Premium</span>}
                <p className="eyebrow">{panel.premium ? 'For large organizations' : 'For growing teams'}</p>
                <h2>{panel.title}</h2>
                <p>{panel.text}</p>
                <Link to={panel.link.to} className="text-link">
                  {panel.link.label} <ArrowIcon />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems band */}
      <section className="systems-band band-navy" aria-label="Systems">
        <DataGridMotif className="band-motif" />
        <div className="container band-content">
          <p className="eyebrow">{SYSTEMS_BAND.eyebrow}</p>
          <h2>{SYSTEMS_BAND.heading}</h2>
          <div className="systems-content">
            <ArchitectureDiagram variant="dark" />
            <div className="capabilities">
              {CAPABILITIES.map((c, i) => (
                <div key={c.title} className="capability">
                  <IconTile name={CAP_ICONS[i]} />
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Link to={SYSTEMS_BAND.link.to} className="text-link">
            {SYSTEMS_BAND.link.label} <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="section section-surface" aria-label="What we do">
        <div className="container">
          <p className="eyebrow">What we do</p>
          <h2>Three ways we help</h2>
          <div className="pillars">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="card pillar-card">
                <Photo name={PILLAR_PHOTOS[i]} alt={PILLAR_ALTS[i]} sizes="(min-width: 1024px) 33vw, 100vw" className="strip-photo" />
                <div className="pillar-body">
                  <PillarIcon kind={i} />
                  <h3 className="pillar-title">{p.title}</h3>
                  <p>{p.description}</p>
                  <Link to={p.href} className="text-link">
                    Learn more <ArrowIcon />
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
          <div className="operate-step">
            <IconTile name="refresh" />
            <div>
              <h3>{OPERATE_STEP.title}</h3>
              <p>{OPERATE_STEP.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Example engagements */}
      <section className="section section-surface examples" aria-label="Examples">
        <div className="container">
          <p className="eyebrow">{EXAMPLES_SECTION.eyebrow}</p>
          <h2>{EXAMPLES_SECTION.heading}</h2>
          <div className="example-cards">
            {EXAMPLES.map((ex) => (
              <div key={ex.name} className="card example-card">
                <span className="tag">{EXAMPLES_SECTION.tag}</span>
                <p className="industry">{ex.industry}</p>
                <h3>{ex.name}</h3>
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
      <section className="testimonial band-navy" aria-label="Testimonial">
        <BellCurveMotif className="band-motif" />
        <div className="container band-content">
          <figure className="testimonial-figure">
            <p className="testimonial-note">{TESTIMONIAL.placeholderNote}</p>
            <blockquote>{TESTIMONIAL.quote}</blockquote>
            <figcaption>{TESTIMONIAL.attribution}</figcaption>
          </figure>
        </div>
      </section>

      {/* Why */}
      <section className="section why">
        <div className="container why-layout">
          <Photo name="about-office" alt="Bright, modern office interior with desks and large windows" sizes="(min-width: 1024px) 40vw, 100vw" className="why-photo" />
          <div className="why-text">
            <p className="eyebrow">Why us</p>
            <h2>Why The Bayes Group</h2>
            <div className="why-list">
              {WHY_POINTS.map((w, i) => (
                <div key={w.title} className="why-point">
                  <IconTile name={WHY_ICONS[i]} />
                  <div>
                    <h3>{w.title}</h3>
                    <p>{w.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band band-navy-deep">
        <BellCurveMotif className="band-motif" />
        <div className="container band-content">
          <p className="eyebrow">Next step</p>
          <h2>{CTA_BAND.heading}</h2>
          <Link to={CTA_BAND.button.to} className="btn btn-on-dark">{CTA_BAND.button.label}</Link>
        </div>
      </section>
    </div>
  );
}
