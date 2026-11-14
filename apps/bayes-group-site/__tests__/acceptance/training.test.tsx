import React from 'react';
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../../src/App';
import { trainingCourses } from '../../src/data/trainingCourses';

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

/**
 * Helper that returns the list of currently visible course titles.
 */
function visibleCourseTitles(): string[] {
  // Assuming each course title is rendered as an h3 heading.
  const headings = screen.queryAllByRole('heading', { level: 3 });
  return headings.map((h) => h.textContent?.trim() ?? '');
}

describe('Training page (/training)', () => {
  beforeEach(() => {
    renderAt('/training');
  });

  test('sets correct document title and contains a single h1', async () => {
    await waitFor(() => {
      expect(document.title).toBe('Training | The Bayes Group');
    });
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Training');
  });

  test('filter buttons exist, All is selected by default, and have correct aria-pressed values', () => {
    const filters = ['All', 'Executives', 'Managers', 'Technical teams'];
    filters.forEach((label) => {
      const btn = screen.getByRole('button', { name: new RegExp(`^${label}$`, 'i') });
      expect(btn).toBeInTheDocument();
      if (label === 'All') {
        expect(btn).toHaveAttribute('aria-pressed', 'true');
      } else {
        expect(btn).toHaveAttribute('aria-pressed', 'false');
      }
    });
  });

  test('All filter shows every training course', () => {
    const titles = visibleCourseTitles();
    const expected = trainingCourses.map((c) => c.title);
    expect(titles.sort()).toEqual(expected.sort());
  });

  test('Audience filter works: only courses for the selected audience are displayed', () => {
    const audiences = ['Executives', 'Managers', 'Technical teams'] as const;

    audiences.forEach((aud) => {
      const btn = screen.getByRole('button', { name: new RegExp(`^${aud}$`, 'i') });
      fireEvent.click(btn);

      // Verify aria-pressed states
      audiences.concat('All').forEach((lbl) => {
        const b = screen.getByRole('button', {
          name: new RegExp(`^${lbl}$`, 'i'),
        });
        if (lbl === aud) {
          expect(b).toHaveAttribute('aria-pressed', 'true');
        } else {
          expect(b).toHaveAttribute('aria-pressed', 'false');
        }
      });

      // Expected titles for this audience
      const expectedTitles = trainingCourses
        .filter((c) => c.audience === aud)
        .map((c) => c.title);

      const visibleTitles = visibleCourseTitles();

      // The visible titles should match exactly the expected ones
      expect(visibleTitles.sort()).toEqual(expectedTitles.sort());

      // Ensure that a course from a different audience is not rendered
      const hiddenTitles = trainingCourses
        .filter((c) => c.audience !== aud)
        .map((c) => c.title);
      hiddenTitles.forEach((t) => {
        expect(screen.queryByText(t)).not.toBeInTheDocument();
      });
    });
  });

  test('Each displayed course card shows audience, format, duration, and three “You will learn” items', () => {
    // Use the default “All” filter to display all courses
    const cards = screen.getAllByTestId('training-course-card');
    expect(cards).toHaveLength(trainingCourses.length);

    cards.forEach((card) => {
      // Title (h3)
      const titleEl = within(card).getByRole('heading', { level: 3 });
      const title = titleEl.textContent?.trim() ?? '';

      const course = trainingCourses.find((c) => c.title === title);
      expect(course).toBeDefined();

      // Audience
      expect(
        within(card).getByText(new RegExp(`^${course!.audience}$`, 'i'))
      ).toBeInTheDocument();

      // Format
      expect(
        within(card).getByText(new RegExp(`^${course!.format}$`, 'i'))
      ).toBeInTheDocument();

      // Duration
      expect(
        within(card).getByText(new RegExp(`^${course!.duration}$`, 'i'))
      ).toBeInTheDocument();

      // “You will learn” list
      const learnItems = within(card).getAllByRole('listitem');
      expect(learnItems).toHaveLength(3);
      const learnTexts = learnItems.map((li) => li.textContent?.trim() ?? '');
      expect(learnTexts.sort()).toEqual(course!.learn.slice().sort());
    });
  });
});
