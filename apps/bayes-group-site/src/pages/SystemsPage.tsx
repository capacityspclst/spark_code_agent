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

export default function SystemsPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="systems-page">
      {/* Hero */}
      <section className="hero" aria-labelledby="systems-hero">
        <div className="container">
          <h1 id="systems-hero">Systems engineering</h1>
          <p className="lead">{SYSTEMS_LEAD}</p>
          <ArchitectureDiagram variant="dark" />
        </div>
      </section>

      {/* Sections */}
      {SYSTEMS_SECTIONS.map((sec) => (
        <section key={sec.id} id={sec.id} className="system-section">
          <div className="container">
            <p className="eyebrow">{sec.eyebrow}</p>
            <h2>{sec.title}</h2>
            <p>{sec.intro}</p>
            <ul>
              {sec.items.map((it) => (
                <li key={it}>
                  {/* placeholder icon */}
                  <svg width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" /></svg>
                  {it}
                </li>
              ))}
            </ul>
            {/* illustration placeholder */}
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" /></svg>
          </div>
        </section>
      ))}

      {/* Deliverables */}
      <section className="deliverables" aria-label="Deliverables">
        <div className="container">
          <h2>{DELIVERABLES_HEADING}</h2>
          <div className="deliverable-grid">
            {DELIVERABLES.map((name) => (
              <div key={name} className="card deliverable-card">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" /></svg>
                <span className="monospace">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container">
          <h2>{SYSTEMS_CTA.heading}</h2>
          <Link to={SYSTEMS_CTA.button.to} className="btn btn-on-dark">{SYSTEMS_CTA.button.label}</Link>
        </div>
      </section>
    </div>
  );
}
