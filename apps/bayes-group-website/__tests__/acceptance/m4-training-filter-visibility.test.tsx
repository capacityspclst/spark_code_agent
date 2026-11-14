import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Training page filter buttons display only matching courses', async () => {
  render(<App />);

  // Navigate to Training page via header navigation link
  const header = screen.getByRole('banner');
  const trainingLink = within(header).getByRole('link', { name: /training/i });
  await userEvent.click(trainingLink);

  // Wait for the title
  await waitFor(() => {
    expect(document.title).toContain('Training');
  });

  const audiences = ['Executives', 'Managers', 'Technical teams'];

  for (const audience of audiences) {
    // Click the filter button for this audience
    const filterBtn = screen.getByRole('button', { name: audience });
    await userEvent.click(filterBtn);

    // Verify aria‑pressed state
    expect(filterBtn).toHaveAttribute('aria-pressed', 'true');
    audiences
      .filter((a) => a !== audience)
      .forEach((other) => {
        const otherBtn = screen.getByRole('button', { name: other });
        expect(otherBtn).toHaveAttribute('aria-pressed', 'false');
      });

    // Helper: elements that contain the audience text but are not the filter button itself
    const audienceMatches = (text: string) =>
      screen
        .queryAllByText(new RegExp(`\\b${text}\\b`, 'i'))
        .filter((el) => el.closest('button') == null);

    // All visible cards must contain the selected audience label
    const selectedEls = audienceMatches(audience);
    expect(selectedEls.length).toBeGreaterThan(0);
    selectedEls.forEach((el) => {
      expect(el).toBeVisible();
    });

    // Cards for other audiences must not be visible (if they exist)
    const otherAudiences = audiences.filter((a) => a !== audience);
    otherAudiences.forEach((other) => {
      const otherEls = audienceMatches(other);
      otherEls.forEach((el) => {
        expect(el).not.toBeVisible();
      });
    });
  }

  // Finally, return to “All” and verify reset
  const allBtn = screen.getByRole('button', { name: /all/i });
  await userEvent.click(allBtn);
  expect(allBtn).toHaveAttribute('aria-pressed', 'true');

  // After resetting, at least one course from each audience should be visible again
  audiences.forEach((aud) => {
    const els = screen
      .queryAllByText(new RegExp(`\\b${aud}\\b`, 'i'))
      .filter((el) => el.closest('button') == null);
    expect(els.length).toBeGreaterThan(0);
    els.forEach((el) => expect(el).toBeVisible());
  });
});
