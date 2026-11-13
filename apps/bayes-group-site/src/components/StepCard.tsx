import React from 'react';

type Props = {
  number: number;
  title: string;
  description: string;
};

const StepCard: React.FC<Props> = ({ number, title, description }) => (
  <div className="card card--step" aria-label={`Step ${number}`}>
    <div style={{
      background: 'var(--color-accent-darker)',
      color: 'var(--color-on-primary)',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 'var(--space-2)',
    }}>{number}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export default StepCard;
