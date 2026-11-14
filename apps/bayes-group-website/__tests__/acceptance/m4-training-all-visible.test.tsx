import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Training page “All” filter shows all course cards', async () => {
  render(<App />);

  // Navigate to Training page
  const trainingLink = screen.getByRole('link', { name: /training/i });
  await userEvent.click(trainingLink);

  // Wait for title to contain “Training”
  await waitFor(() => {
    expect(document.title).toContain('Training');
    expect(document.title).toContain('The Bayes Group');
  });

  // Ensure the “All” filter button is selected
  const allBtn = screen.getByRole('button', { name: /all/i });
  expect(allBtn).toHaveAttribute('aria-pressed', 'true');

  // The page H1
  const h1 = screen.getByRole('heading', { level: 1 });

  // All remaining headings (presumed course titles) should be visible.
  const allHeadings = screen
    .getAllByRole('heading')
    .filter((h) => h !== h1);

  // The spec requires at least six course cards.
  expect(allHeadings.length).toBeGreaterThanOrEqual(6);
  allHeadings.forEach((heading) => {
    expect(heading).toBeVisible();
  });
});
