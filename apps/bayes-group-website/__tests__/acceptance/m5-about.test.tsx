import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('About page renders with correct H1, title and placeholder founder cards', async () => {
  render(<App />);

  // Navigate to About page via header navigation link
  const header = screen.getByRole('banner');
  const aboutLink = within(header).getByRole('link', { name: /about/i });
  await userEvent.click(aboutLink);

  // Title should contain the brand name
  await waitFor(() => {
    expect(document.title).toContain('The Bayes Group');
    expect(document.title).toContain('About');
  });

  // H1
  const h1 = screen.getByRole('heading', { level: 1 });
  expect(h1).toHaveTextContent('About');

  // Exactly one H1
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

  // Placeholder founder cards – look for the placeholder name twice
  const founderNames = screen.getAllByText('Founder Name');
  expect(founderNames.length).toBeGreaterThanOrEqual(2);

  // Values list (keywords)
  const values = [
    /evidence over hype/i,
    /build to transfer/i,
    /vendor-neutral/i,
    /responsible by design/i,
  ];
  values.forEach((regex) => {
    expect(screen.getByText(regex)).toBeInTheDocument();
  });
});
