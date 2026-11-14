import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PillarCard from '../components/PillarCard';


const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'The Bayes Group | Evidence-driven AI';
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1>Evidence-driven AI, built for your business.</h1>
        <p>We turn data into actionable intelligence through custom AI solutions, hands‑on training, and end‑to‑end enablement.</p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
          <Link to="/contact" className="btn">Book a consultation</Link>
          <button className="btn btn--secondary" onClick={() => { window.location.href = '/services'; }}>Explore</button>
        </div>
      </section>

      {/* Pillar cards */}
      <section className="pillars" style={{ display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: 'var(--space-8)' }}>
        <PillarCard
          title="AI Enablement"
          description="Assess readiness, design strategy, and embed AI responsibly across your organization."
          href="/services#enablement"
        />
        <PillarCard
          title="Training"
          description="Empower teams with practical AI skills, from executive briefings to deep‑learning bootcamps."
          href="/services#training"
        />
        <PillarCard
          title="Custom Development"
          description="Build production‑ready AI applications tailored to your business challenges."
          href="/services#custom-development"
        />
      </section>

      {/* How we work */}
      <section className="how-we-work" style={{ marginBottom: 'var(--space-8)' }}>
        <h2>How we work</h2>
        <ul>
          <li><strong>Assess</strong> – We evaluate data, people, and processes to define AI opportunities.</li>
          <li><strong>Design</strong> – Co‑create solution architectures aligned with business goals.</li>
          <li><strong>Build</strong> – Develop, test, and iterate fast using proven ML pipelines.</li>
          <li><strong>Enable</strong> – Transfer knowledge and embed governance for sustainable impact.</li>
        </ul>
      </section>

      {/* Why The Bayes Group */}
      <section className="why-us" style={{ marginBottom: 'var(--space-8)' }}>
        <h2>Why The Bayes Group</h2>
        <ul>
          <li>Credentialed data scientists</li>
          <li>Hands‑on builders</li>
          <li>Vendor‑neutral advice</li>
          <li>Knowledge transfer so your team owns the result</li>
        </ul>
      </section>

      {/* CTA band */}
      <section className="cta-band" style={{ background: 'var(--color-surface)', textAlign: 'center', padding: 'var(--space-6)' }}>
        <p>Ready to put AI to work?</p>
        <Link to="/contact" className="btn">Book a consultation</Link>
      </section>
    </>
  );
};

export default Home;
