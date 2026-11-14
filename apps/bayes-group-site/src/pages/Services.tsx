import React, { useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';

const Services: React.FC = () => {
  useEffect(() => {
    document.title = 'Services | The Bayes Group';
  }, []);

  return (
    <section>
      <h1>Services</h1>
      <section id="enablement">
        <h2>AI Enablement</h2>
        <h2>AI Enablement</h2>
        <ServiceCard
          title="AI readiness assessment"
          description="Identify data gaps, talent needs, and quick‑win opportunities."
        />
        <ServiceCard
          title="Use case discovery and prioritization"
          description="Map business problems to feasible AI solutions."
        />
        <ServiceCard
          title="AI strategy and roadmap"
          description="Define a phased plan with measurable milestones."
        />
        <ServiceCard
          title="AI governance and responsible AI policy"
          description="Establish ethics, compliance, and risk controls."
        />
              <p className="typical-engagement">Typical engagement: 2 to 6 weeks</p>
      </section>
      <section id="training">
        <h2>Training</h2>
        <ServiceCard
          title="Executive AI briefings"
          description="Convey impact and feasibility to leadership in under an hour."
        />
        <ServiceCard
          title="Hands-on team workshops"
          description="Build end-to-end pipelines with your engineers in a day."
        />
        <ServiceCard
          title="Deep-learning bootcamps for technical teams"
          description="Intensive training covering fundamentals to production."
        />
        <ServiceCard
          title="Custom curricula"
          description="Tailored instruction aligned with your tech stack and goals."
        />
        <p className="typical-engagement">Typical engagement: 2 to 6 weeks</p>
      </section>
      <section id="custom-development">
        <h2>Custom Development</h2>
        <ServiceCard
          title="LLM and retrieval-augmented (RAG) applications"
          description="Deploy advanced language models with contextual retrieval."
        />
        <ServiceCard
          title="AI agents and workflow automation"
          description="Create autonomous agents to streamline business processes."
        />
        <ServiceCard
          title="Predictive models and ML pipelines"
          description="Build, train, and deploy robust predictive systems."
        />
        <ServiceCard
          title="Deep-learning solutions"
          description="Design and implement custom neural network architectures."
        />
        <ServiceCard
          title="Integration with existing systems"
          description="Seamlessly embed AI into your current technology stack."
        />
        <p className="typical-engagement">Typical engagement: 2 to 6 weeks</p>
      </section>
    </section>
  );
};

export default Services;
