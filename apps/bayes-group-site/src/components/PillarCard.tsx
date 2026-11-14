import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  title: string;
  description: string;
  href: string;
};

const PillarCard: React.FC<Props> = ({ title, description, href }) => (
  <section className="card card--pillar" aria-label={title}>
    <h2>{title}</h2>
    <p>{description}</p>
    <Link to={href}>Learn more</Link>
  </section>
);

export default PillarCard;
