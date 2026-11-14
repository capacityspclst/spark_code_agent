import React from 'react';

const About: React.FC = () => (
  <div>
    <h1>About</h1>
    <p>Our mission is to empower businesses with evidence‑driven AI solutions that create measurable value.</p>
    <p>We apply Bayesian reasoning—updating beliefs as evidence arrives—to every engagement, ensuring decisions are always data‑backed.</p>
    <section style={{ display: 'grid', gap: 'var(--space-8)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 'var(--space-8)' }}>
      {/* Founder cards */}
      <div className="card">
        <h3>Founder Name</h3>
        <p>Co‑founder &amp; Principal Data Scientist</p>
        <p><strong>Credentials:</strong> Ph.D. in Statistics, 10+ years industry experience</p>
        <p><strong>Bio:</strong> [Short bio to be added]</p>
      </div>
      <div className="card">
        <h3>Founder Name</h3>
        <p>Co‑founder &amp; Principal Data Scientist</p>
        <p><strong>Credentials:</strong> Ph.D. in Statistics, 10+ years industry experience</p>
        <p><strong>Bio:</strong> [Short bio to be added]</p>
      </div>
    </section>
    <section style={{ marginTop: 'var(--space-8)' }}>
      <h2>Our values</h2>
      <ul>
        <li>Evidence over hype</li>
        <li>Build to transfer</li>
        <li>Vendor-neutral</li>
        <li>Responsible by design</li>
      </ul>
    </section>
  </div>
);

export default About;
