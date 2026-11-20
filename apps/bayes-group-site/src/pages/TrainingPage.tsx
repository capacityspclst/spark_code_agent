import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { COURSES, filterCourses, COURSE_FILTERS, AUDIENCES } from '../content/courses';
import Photo from '../components/Photo';

export default function TrainingPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);
  const [filter, setFilter] = React.useState<'All' | typeof AUDIENCES[number]>('All');

  const filtered = React.useMemo(() => filterCourses(COURSES, filter), [filter]);
  const noun = filtered.length === 1 ? 'course' : 'courses';

  return (
    <div className="training-page">
      <div className="container page-head">
        <h1>Training</h1>
        <p className="lead">Practical courses that build lasting AI capability, from the boardroom to the engineering team.</p>
      </div>
      {/* Photo banner */}
      <Photo name="team-workshop" />
      <div className="container section" style={{ paddingTop: 'var(--space-4)' }}>
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
