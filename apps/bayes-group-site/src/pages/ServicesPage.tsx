import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { SERVICE_SECTIONS } from '../content/services';
import { ClockIcon, IconTile, ArrowIcon } from '../components/Icons';
import type { IconName } from '../components/Icons';
import Photo from '../components/Photo';
import { DataGridMotif } from '../components/Motifs';

const ITEM_ICONS: Record<string, IconName[]> = {
  enablement: ['gauge', 'target', 'compass', 'scale'],
  training: ['users', 'book', 'code', 'doc'],
  'custom-development': ['database', 'agent', 'chart', 'layers', 'network', 'flow'],
};

const SECTION_EYEBROWS: Record<string, string> = {
  enablement: 'Strategy and roadmap',
  training: 'Capability building',
  'custom-development': 'Engineering and delivery',
};

const PHOTO_ALTS: Record<string, string> = {
  enablement: 'Colleagues in a strategy session around a table with documents and laptops',
  training: 'A facilitator leading a team workshop at a whiteboard',
  'custom-development': 'Two monitors showing code and a network diagram on a developer desk',
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
      <section className="page-hero hero band-navy">
        <DataGridMotif className="band-motif" />
        <div className="container band-content">
          <p className="eyebrow">What we do</p>
          <h1>Services</h1>
          <p className="services-intro lead">Three ways we help, from first strategy to production systems.</p>
        </div>
      </section>
      {SERVICE_SECTIONS.map((section, idx) => (
        <section
          key={section.id}
          id={section.id}
          className={`section service-section${idx % 2 === 1 ? ' section-surface' : ''}`}
        >
          <div className="container">
            <div className="service-layout">
              <Photo
                name={section.photo || section.id}
                alt={PHOTO_ALTS[section.id]}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="service-photo"
              />
              <div className="service-head">
                <p className="eyebrow">{SECTION_EYEBROWS[section.id] ?? 'Services'}</p>
                <h2>{section.title}</h2>
                {section.intro && <p>{section.intro}</p>}
                <p className="engagement">
                  <ClockIcon />
                  <span>Typical engagement: {section.typicalEngagement}</span>
                </p>
              </div>
            </div>
            <div className="service-items">
              {section.items.map((item, i) => (
                <div key={item.name} className="card service-item">
                  <IconTile name={ITEM_ICONS[section.id][i % ITEM_ICONS[section.id].length]} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    {item.link && (
                      <Link to={item.link.to} className="text-link">
                        {item.link.label} <ArrowIcon />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
