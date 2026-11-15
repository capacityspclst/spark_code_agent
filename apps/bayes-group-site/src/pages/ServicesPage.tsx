import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { SERVICE_SECTIONS } from '../content/services';

export default function ServicesPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  return (
    <div className="services-page">
      <h1>Services</h1>
      {SERVICE_SECTIONS.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.title}</h2>
          {section.items.map((item) => (
            <div key={item.name} className="service-item">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          ))}
          <p>Typical engagement: {section.typicalEngagement}</p>
        </section>
      ))}
    </div>
  );
}
