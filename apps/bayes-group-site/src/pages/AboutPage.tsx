import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { MISSION, WHY_BAYES, FOUNDERS, VALUES } from '../content/about';
import Photo from '../components/Photo';

export default function AboutPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="about-page">
      <div className="container page-head">
        <h1>About</h1>
      </div>
      <section className="container mission" style={{ paddingBottom: 'var(--space-6)' }}>
        <p className="eyebrow">Mission</p>
        <p className="lead">{MISSION}</p>
        <Photo name="about-office" alt="Office interior photo" />
      </section>
      <section className="section section-surface why-bayes">
        <div className="container">
          <h2>Why Bayes</h2>
          <p className="lead" style={{ maxWidth: 720 }}>{WHY_BAYES}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Founders</h2>
          <div className="about-grid founders">
            {FOUNDERS.map((f, idx) => (
              <div key={idx} className="card founder-card">
                <span className="placeholder-tag">Placeholder</span>
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
      <section className="section section-surface">
        <div className="container">
          <h2>Our values</h2>
          <div className="about-grid values">
            {VALUES.map((v, i) => (
              <div key={i} className="card value-card">
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
