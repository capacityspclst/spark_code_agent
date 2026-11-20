import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { SERVICE_SECTIONS } from '../content/services';
import { ClockIcon } from '../components/Icons';

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
      <div className="container page-head">
        <h1>Services</h1>
        <p className="services-intro lead">Three ways we help, from first strategy to production systems.</p>
      </div>
      <div className="container">
        {SERVICE_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="service-section">
            <div className="service-layout">
              <div className="service-head">
                <p className="eyebrow">{section.title}</p>
                <h2>{section.title}</h2>
                {section.intro && <p>{section.intro}</p>}
              </div>
              <div>
                <div className="service-items">
                  {section.items.map((item) => (
                    <div key={item.name} className="card service-item">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
                <p className="engagement">
                  <ClockIcon />
                  <span>Typical engagement: {section.typicalEngagement}</span>
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
