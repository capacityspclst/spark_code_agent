import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { SERVICE_SECTIONS } from '../content/services';
import { ClockIcon, ServiceItemIcon } from '../components/Icons';
import { DataGridPattern } from '../components/Illustrations';
import Photo from '../components/Photo';
import type { PhotoName } from '../content/images';

const SECTION_PHOTOS: Record<string, PhotoName> = {
  enablement: 'strategy-session',
  training: 'team-workshop',
  'custom-development': 'custom-development',
};

export default function ServicesPage() {
  const { pathname, hash } = useLocation();
  useDocumentTitle(pathname);

  const firstRenderRef = React.useRef(true);
  React.useEffect(() => {
    if (firstRenderRef.current) {
      // skip on initial load
      firstRenderRef.current = false;
      return;
    }
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView();
  }, [hash]);

  return (
    <div className="services-page">
      <div className="page-band">
        <DataGridPattern />
        <div className="container page-head">
          <h1>Services</h1>
          <p className="services-intro lead">Three ways we help, from first strategy to production systems.</p>
        </div>
      </div>
      <div className="container">
        {SERVICE_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="service-section">
            <div className="service-header">
              <div className="service-head">
                <p className="eyebrow">{section.title}</p>
                <h2>{section.title}</h2>
                {section.intro && <p>{section.intro}</p>}
              </div>
              <div className="photo-frame">
                <Photo name={SECTION_PHOTOS[section.id] ?? 'strategy-session'} />
              </div>
            </div>
            <div className="service-items">
              {section.items.map((item) => (
                <div key={item.name} className="card service-item">
                  <ServiceItemIcon name={item.name} />
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <p className="engagement">
              <ClockIcon />
              <span>Typical engagement: {section.typicalEngagement}</span>
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
