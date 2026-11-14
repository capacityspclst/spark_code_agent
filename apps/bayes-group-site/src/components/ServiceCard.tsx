import React from 'react';

type Props = {
  title: string;
  description: string;
};

const ServiceCard: React.FC<Props> = ({ title, description }) => (
  <div className="card card--service" aria-label={title} role="region">
    <h3>{title}</h3>
    <p>{description}</p>
        <p className="typical-engagement">Typical engagement: 2 to 6 weeks</p>
      </div>
);

export default ServiceCard;
