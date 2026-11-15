import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { MISSION, WHY_BAYES, FOUNDERS, VALUES } from '../content/about';

export default function AboutPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="about-page">
      <h1>About</h1>
      <section className="mission">
        <p>{MISSION}</p>
      </section>
      <section className="why-bayes">
        <h2>Why Bayes</h2>
        <p>{WHY_BAYES}</p>
      </section>
      <section className="founders">
        {FOUNDERS.map((f, idx) => (
          <div key={idx} className="founder-card">
            <h3>{f.name}</h3>
            <p>{f.role}</p>
            <p>{f.bio}</p>
            <ul>
              {f.credentials.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <p className="placeholder-tag">Placeholder: replace with founder credentials and bio.</p>
          </div>
        ))}
      </section>
      <section className="values">
        {VALUES.map((v, i) => (
          <div key={i} className="value-card">
            <h3>{v.title}</h3>
            <p>{v.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
