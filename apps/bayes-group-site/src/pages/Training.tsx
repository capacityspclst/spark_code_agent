import React, { useState, useEffect } from 'react';
import { trainingCourses } from '../data/trainingCourses';
import FilterButton from '../components/FilterButton';
import TrainingCourseCard from '../components/TrainingCourseCard';

const Training: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Training | The Bayes Group';
  }, []);
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All' ? trainingCourses : trainingCourses.filter(c => c.audience === filter);

  // Ensure exactly the same spelling as test expectations
  const audiences = ['All', 'Executives', 'Managers', 'Technical teams'];

  return (
    <section>
      <h1>Training</h1>
      <div role="toolbar" aria-label="Filter courses" style={{ marginBottom: 'var(--space-4)' }}>
        {audiences.map((aud) => (
          <FilterButton
            key={aud}
            label={aud}
            selected={filter === aud}
            onClick={() => setFilter(aud)}
          />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p aria-live="polite">No courses match the selected audience.</p>
      ) : (
        <div className="course-grid" style={{ display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {filtered.map((course) => (
            <TrainingCourseCard key={course.title} course={course} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Training;
