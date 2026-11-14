import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => (
  <div>
    <section className="hero">
      <h1>Evidence-driven AI, built for your business.</h1>
      <p>We partner with organizations to turn data into actionable intelligence.</p>
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
        <Link to="/contact" className="button-primary">Book a consultation</Link>
        <Link to="/services" className="button-secondary">Explore services</Link>
      </div>
    </section>

    <section className="pillars" style={{ marginTop: 'var(--space-8)' }}>
      <div className="card">
        <h3>AI Enablement</h3>
        <p>Accelerate adoption with assessment, roadmap, and governance.</p>
        <p>We help you align AI with business goals and ensure responsible use.</p>
        <Link to="/services#enablement" className="button-secondary" role="link">Learn more</Link>
      </div>
      <div className="card">
        <h3>Training</h3>
        <p>Upskill executives, managers, and technical teams with tailored programs.</p>
        <p>Hands‑on workshops and bootcamps designed for impact.</p>
        <Link to="/services#training" className="button-secondary" role="link">Learn more</Link>
      </div>
      <div className="card">
        <h3>Custom Development</h3>
        <p>Build production‑ready AI solutions that integrate with your stack.</p>
        <p>From LLMs to predictive pipelines, we deliver end‑to‑end.</p>
        <Link to="/services#custom-development" className="button-secondary" role="link">Learn more</Link>
      </div>
    </section>

    <section style={{ marginTop: 'var(--space-8)' }}>
      <h2>How we work</h2>
      <ol>
        <li><strong>Assess</strong> – We evaluate data maturity and business goals.</li>
        <li><strong>Design</strong> – We co‑design a roadmap aligned with impact.</li>
        <li><strong>Build</strong> – We deliver production‑ready AI solutions.</li>
        <li><strong>Enable</strong> – We transfer knowledge and embed processes.</li>
      </ol>
    </section>

    <section style={{ marginTop: 'var(--space-8)' }}>
      <h2>Why The Bayes Group</h2>
      <ul>
        <li>Credentialed data scientists</li>
        <li>Hands‑on builders</li>
        <li>Vendor‑neutral advice</li>
        <li>Knowledge transfer so your team owns the result</li>
      </ul>
    </section>

    <section className="cta-band" style={{ marginTop: 'var(--space-8)' }}>
      <h2>Ready to put AI to work?</h2>
      <Link to="/contact" className="button-primary" role="button">Book a consultation</Link>
    </section>
  </div>
);

export default Home;
