import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { MISSION, WHY_BAYES, FOUNDERS, VALUES } from '../content/about';
import Photo from '../components/Photo';
import { AvatarSilhouette, DataGridPattern } from '../components/Illustrations';
import { ValueIcon } from '../components/Icons';

export default function AboutPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="about-page">
      <div className="page-band">
        <DataGridPattern />
        <div className="container page-head">
          <h1>About</h1>
        </div>
      </div>
      <section className="section mission">
        <div className="container split split-7-5">
          <div className="fade-in">
            <p className="eyebrow">Mission</p>
            <p className="lead">{MISSION}</p>
            <h2 className="why-heading">Why Bayes</h2>
            <p className="lead">{WHY_BAYES}</p>
          </div>
          <div className="photo-frame fade-in">
            <Photo name="about-office" />
          </div>
        </div>
      </section>
      <section className="section section-surface">
        <div className="container">
          <h2>Founders</h2>
          <div className="about-grid founders">
            {FOUNDERS.map((f, idx) => (
              <div key={idx} className="card founder-card">
                <div className="avatar-wrap">
                  <AvatarSilhouette />
                  <span className="avatar-caption">Photo placeholder</span>
                </div>
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
      <section className="section">
        <div className="container">
          <h2>Our values</h2>
          <div className="about-grid values">
            {VALUES.map((v, i) => (
              <div key={i} className="card value-card">
                <ValueIcon title={v.title} />
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
