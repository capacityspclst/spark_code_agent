import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Unknown route displays a Page not found page with link to home', async () => {
  // Simulate navigating to an unknown URL before the app mounts
  window.history.pushState({}, 'Not Found', '/some/unknown/path');

  render(<App />);

  // H1 with “Page not found”
  const h1 = await screen.findByRole('heading', { level: 1, name: /page not found/i });
  expect(h1).toBeInTheDocument();

  // Find a link that points to the home page (href="/")
  const links = screen.getAllByRole('link');
  const homeLink = links.find((l) => l.getAttribute('href') === '/');
  expect(homeLink).toBeDefined();
});
