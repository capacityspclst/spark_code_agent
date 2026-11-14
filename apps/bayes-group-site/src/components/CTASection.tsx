import React from 'react';

type Props = {
  children?: React.ReactNode;
};

const CTASection: React.FC<Props> = ({ children }) => (
  <section className="cta-section" style={{ background: 'var(--color-surface)', textAlign: 'center', padding: 'var(--space-6)' }}>
    {children}
  </section>
);

export default CTASection;