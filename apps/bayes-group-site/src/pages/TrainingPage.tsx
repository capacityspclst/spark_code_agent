import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { COURSES, filterCourses, COURSE_FILTERS, AUDIENCES } from '../content/courses';

export default function TrainingPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);
  const [filter, setFilter] = React.useState<'All' | typeof AUDIENCES[number]>('All');

  const filtered = React.useMemo(() => filterCourses(COURSES, filter), [filter]);

  return (
    <div className="training-page">
      <h1>Training</h1>
      <div className="filter-bar" role="toolbar" aria-label="Filter courses by audience">
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
          ? `Showing ${filtered.length} courses`
          : `Showing ${filtered.length} courses for ${filter}`}
      </div>
      <div className="course-grid">
        {filtered.map((c) => (
          <div key={c.id} className="course-card">
            <div className="course-header">
              <span className="audience-chip" aria-label={c.audience}>{c.audience}</span>
              <span className="format">{c.format}</span>
            </div>
            <h3>{c.title}</h3>
            <div className="meta">
              <span className="duration">{c.duration}</span>
            </div>
            <hr />
            <div className="learn-section">
              <p>You will learn</p>
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
  );
}
