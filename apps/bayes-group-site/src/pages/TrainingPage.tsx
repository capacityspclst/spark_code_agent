import * as React from 'react';
import Photo from '../components/Photo';
import { IconTile } from '../components/Icons';
import type { IconName } from '../components/Icons';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { COURSES, filterCourses, COURSE_FILTERS, AUDIENCES } from '../content/courses';

const FORMAT_ICONS: Record<string, IconName> = {
  'Half-day briefing': 'briefcase',
  '1-day workshop': 'users',
  'Multi-week bootcamp': 'code',
};

export default function TrainingPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);
  const [filter, setFilter] = React.useState<'All' | typeof AUDIENCES[number]>('All');

  const filtered = React.useMemo(() => filterCourses(COURSES, filter), [filter]);
  const noun = filtered.length === 1 ? 'course' : 'courses';

  return (
    <div className="training-page">
      <section className="training-banner">
        <Photo name="team-workshop" alt="A facilitator leading a team workshop at a whiteboard" sizes="100vw" className="banner-photo" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="container banner-text">
          <p className="eyebrow">Courses</p>
          <h1>Training</h1>
          <p className="lead">Practical courses that build lasting AI capability, from the boardroom to the engineering team.</p>
        </div>
      </section>
      <div className="container section">
        <div className="filter-bar" role="group" aria-label="Filter courses by audience">
          {COURSE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f as any)}
              aria-pressed={filter === f ? 'true' : 'false'}
              className={filter === f ? 'filter-selected' : ''}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="course-count" role="status">
          {filter === 'All'
            ? `Showing ${filtered.length} ${noun}`
            : `Showing ${filtered.length} ${noun} for ${filter}`}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No courses for this audience yet.</p>
            <button type="button" className="btn btn-secondary" onClick={() => setFilter('All')}>
              Show all courses
            </button>
          </div>
        )}
        <div className="course-grid">
          {filtered.map((c) => (
            <div key={c.id} className="card course-card">
              <IconTile name={FORMAT_ICONS[c.format]} />
              <div className="course-header">
                <span className="audience-chip">{c.audience}</span>
                <span className="format">{c.format}</span>
              </div>
              <h3>{c.title}</h3>
              <div className="meta">
                <span className="duration">{c.duration}</span>
              </div>
              <hr />
              <div className="learn-section">
                <p className="learn-title">You will learn</p>
                <ul>
                  {c.learn.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
