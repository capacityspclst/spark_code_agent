import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Training page displays filter buttons with correct aria‑pressed handling', async () => {
  render(<App />);

  // Navigate to Training page via header navigation link
  const header = screen.getByRole('banner');
  const trainingLink = within(header).getByRole('link', { name: /training/i });
  await userEvent.click(trainingLink);

  // Title contains the brand name
  await waitFor(() => {
    expect(document.title).toContain('Training');
    expect(document.title).toContain('The Bayes Group');
  });

  // H1
  const h1 = screen.getByRole('heading', { level: 1 });
  expect(h1).toHaveTextContent('Training');

  // Filter buttons
  const filters = ['All', 'Executives', 'Managers', 'Technical teams'];
  filters.forEach((label) => {
    const btn = screen.getByRole('button', { name: label });
    expect(btn).toBeInTheDocument();
  });

  // “All” is selected initially
  const allBtn = screen.getByRole('button', { name: 'All' });
  expect(allBtn).toHaveAttribute('aria-pressed', 'true');

  // Click each audience filter and verify aria‑pressed toggles
  const clickAndCheck = async (selected: string) => {
    const btn = screen.getByRole('button', { name: selected });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    // the previously selected button should now be false
    filters
      .filter((l) => l !== selected)
      .forEach((other) => {
        const otherBtn = screen.getByRole('button', { name: other });
        expect(otherBtn).toHaveAttribute('aria-pressed', 'false');
      });
    // At least one course card should be visible (any heading beyond page H1)
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(1);
  };

  await clickAndCheck('Executives');
  await clickAndCheck('Managers');
  await clickAndCheck('Technical teams');

  // Return to “All” and ensure it becomes active again
  await clickAndCheck('All');
});
