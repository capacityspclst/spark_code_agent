import React from 'react';

type Props = {
  title: string;
  description: string;
};

const ValueCard: React.FC<Props> = ({ title, description }) => (
  <div className="card card--value" aria-label={title}>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export default ValueCard;
