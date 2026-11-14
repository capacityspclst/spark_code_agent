import React from 'react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => (
  <div>
    <h1>Services</h1>
    {/* AI Enablement */}
    <section id="enablement">
      <h2>AI Enablement</h2>
      <ul>
        <li>
          <strong>AI readiness assessment</strong> – A structured review of data, talent, and infrastructure.
        </li>
        <li>
          <strong>Use‑case discovery and prioritization</strong> – Identify high‑impact AI opportunities.
        </li>
        <li>
          <strong>AI strategy and roadmap</strong> – A phased plan aligned with business goals.
        </li>
        <li>
          <strong>AI governance and responsible‑AI policy</strong> – Frameworks to manage risk and ethics.
        </li>
      </ul>
      <p>Typical engagement: 2 to 6 weeks</p>
    </section>
    {/* Training */}
    <section id="training">
      <h2>Training</h2>
      <ul>
        <li>
          <strong>Executive AI briefings</strong> – High‑level overviews for leadership.
        </li>
        <li>
          <strong>Hands‑on team workshops</strong> – Practical sessions for multi‑disciplinary teams.
        </li>
        <li>
          <strong>Deep‑learning bootcamps for technical teams</strong> – Intensive training on modern DL techniques.
        </li>
        <li>
          <strong>Custom curricula</strong> – Tailored learning paths for specific needs.
        </li>
      </ul>
      <p>Typical engagement: 2 to 6 weeks</p>
    </section>
    {/* Custom Development */}
    <section id="custom-development">
      <h2>Custom Development</h2>
      <ul>
        <li>
          <strong>LLM and retrieval‑augmented (RAG) applications</strong> – Build conversational agents with contextual grounding.
        </li>
        <li>
          <strong>AI agents and workflow automation</strong> – Automate processes with intelligent agents.
        </li>
        <li>
          <strong>Predictive models and ML pipelines</strong> – End‑to‑end pipelines for forecasting.
        </li>
        <li>
          <strong>Deep‑learning solutions</strong> – Custom neural network implementations.
        </li>
        <li>
          <strong>Integration with existing systems</strong> – Seamless AI embedding into your stack.
        </li>
      </ul>
      <p>Typical engagement: 4 to 12 weeks</p>
    </section>
  </div>
);

export default Services;
