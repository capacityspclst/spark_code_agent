import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

// Helper to change window width and dispatch a resize event
function setWindowWidth(width: number) {
  (window.innerWidth as number) = width;
  window.dispatchEvent(new Event('resize'));
}

test('Header navigation collapses into a “Menu” button on small screens and expands on click', () => {
  // ------- Large screen (desktop) ---------------------------------
  setWindowWidth(1440);
  const { unmount } = render(<App />);

  // Header (semantic <header> has role="banner")
  const header = screen.getByRole('banner');

  // Nav links should be visible, no menu button
  const navLinks = ['Services', 'Training', 'About', 'Contact'];
  navLinks.forEach((label) => {
    const link = within(header).getByRole('link', { name: label });
    expect(link).toBeVisible();
  });
  expect(screen.queryByRole('button', { name: /menu/i })).not.toBeInTheDocument();

  // Cleanup before testing the small‑screen layout
  unmount();

  // ------- Small screen (mobile) -----------------------------------
  setWindowWidth(380);
  render(<App />);

  // Header (semantic <header> has role="banner")
  const smallHeader = screen.getByRole('banner');

  // “Menu” button should appear
  const menuBtn = screen.getByRole('button', { name: /menu/i });
  expect(menuBtn).toBeVisible();

  // Nav links should be hidden (either not in the DOM or not visible)
  navLinks.forEach((label) => {
    const link = within(smallHeader).queryByRole('link', { name: label });
    if (link) {
      expect(link).not.toBeVisible();
    }
  });

  // Open the menu
  userEvent.click(menuBtn);
  navLinks.forEach((label) => {
    const link = within(smallHeader).getByRole('link', { name: label });
    expect(link).toBeVisible();
  });

  // Close the menu again
  userEvent.click(menuBtn);
  navLinks.forEach((label) => {
    const link = within(smallHeader).queryByRole('link', { name: label });
    if (link) {
      expect(link).not.toBeVisible();
    }
  });
});
