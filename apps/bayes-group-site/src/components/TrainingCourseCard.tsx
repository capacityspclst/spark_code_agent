import React from 'react';
import { trainingCourses } from '../data/trainingCourses';

type Course = typeof trainingCourses[number];

type Props = {
  course: Course;
};

const TrainingCourseCard: React.FC<Props> = ({ course }) => {
  return (
    <div className="card card--course" data-testid="training-course-card">
      <h3>{course.title}</h3>
      <p>{course.audience}</p>
      <p>{course.format}</p>
      <p>{course.duration}</p>
      <ul>
        {course.learn.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default TrainingCourseCard;
