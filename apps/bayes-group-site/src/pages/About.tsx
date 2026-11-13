import React, { useEffect } from 'react';
import './About.css'; // optional

const About: React.FC = () => {
  useEffect(() => {
    document.title = 'About | The Bayes Group';
  }, []);

  return (
    <section>
      <h1>About</h1>
      <p>
        Our mission is to democratize AI by delivering evidence-driven solutions that create measurable business value. The mission is at the core of everything we do.
      </p>
      <p>
        We apply Bayesian reasoning—updating beliefs as evidence arrives—to every engagement, ensuring decisions stay data‑grounded.
      </p>
      <div className="founders" style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="founder-card" style={{ flex: '1 1 250px' }}>
          <h2>Founder Name</h2>
          <p>Co‑founder &amp; Principal Data Scientist</p>
          <p>Credentials: [placeholder]</p>
          <p>Bio: [placeholder]</p>
        </div>
        <div className="founder-card" style={{ flex: '1 1 250px' }}>
          <h2>Founder Name</h2>
          <p>Co‑founder &amp; Principal Data Scientist</p>
          <p>Credentials: [placeholder]</p>
          <p>Bio: [placeholder]</p>
        </div>
      </div>
      <ul>
        <li>Evidence over hype</li>
        <li>Build to transfer</li>
        <li>Vendor‑neutral</li>
        <li>Responsible by design</li>
      </ul>
    </section>
  );
};

export default About;
