import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { MISSION, WHY_BAYES, FOUNDERS, VALUES } from '../content/about';
import Photo from '../components/Photo';
import { IconTile } from '../components/Icons';
import type { IconName } from '../components/Icons';
import { DataGridMotif } from '../components/Motifs';

const VALUE_ICONS: IconName[] = ['chart', 'handshake', 'compass', 'shield'];

function Avatar() {
  return (
    <svg
      className="avatar"
      viewBox="0 0 96 96"
      role="img"
      aria-label="Photo placeholder"
      focusable="false"
    >
      <rect width="96" height="96" rx="48" fill="#E6EBF1" />
      <circle cx="48" cy="38" r="16" fill="#556275" opacity="0.55" />
      <path d="M16 82c3-18 17-26 32-26s29 8 32 26a48 48 0 01-64 0z" fill="#556275" opacity="0.55" />
    </svg>
  );
}

export default function AboutPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="about-page">
      <section className="page-hero hero band-navy">
        <DataGridMotif className="band-motif" />
        <div className="container band-content">
          <p className="eyebrow">Who we are</p>
          <h1>About</h1>
        </div>
      </section>
      <section className="section mission">
        <div className="container split">
          <Photo name="about-office" alt="Bright, modern office interior with desks and large windows" sizes="(min-width: 1024px) 40vw, 100vw" className="split-photo" />
          <div className="split-text">
            <p className="eyebrow">Mission</p>
            <h2>Our mission</h2>
            <p className="lead">{MISSION}</p>
            <h3>Why Bayes</h3>
            <p>{WHY_BAYES}</p>
          </div>
        </div>
      </section>
      <section className="section section-surface">
        <div className="container">
          <p className="eyebrow">The team</p>
          <h2>Founders</h2>
          <div className="about-grid founders">
            {FOUNDERS.map((f, idx) => (
              <div key={idx} className="card founder-card">
                <div className="founder-top">
                  <Avatar />
                  <div>
                    <span className="placeholder-tag">Placeholder</span>
                    <p className="avatar-caption">Photo placeholder</p>
                  </div>
                </div>
                <h3>{f.name}</h3>
                <p className="founder-role">{f.role}</p>
                <ul>
                  {f.credentials.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <p>{f.bio}</p>
                <p className="placeholder-note">Placeholder: replace with founder credentials and bio.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p className="eyebrow">What guides us</p>
          <h2>Our values</h2>
          <div className="about-grid values">
            {VALUES.map((v, i) => (
              <div key={i} className="card value-card">
                <IconTile name={VALUE_ICONS[i % VALUE_ICONS.length]} />
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
