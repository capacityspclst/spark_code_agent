import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';

test('Header contains wordmark, navigation links, and booking button', () => {
  render(<App />);

  // Header (semantic <header> has role="banner")
  const header = screen.getByRole('banner');
  expect(header).toBeInTheDocument();

  // Wordmark link to home
  const wordmarkLink = screen.getByRole('link', { name: /the bayes group/i });
  expect(wordmarkLink).toHaveAttribute('href', '/');

  // Navigation links
  const expectedNav = [
    { name: /services/i, href: '/services' },
    { name: /training/i, href: '/training' },
    { name: /about/i, href: '/about' },
    { name: /contact/i, href: '/contact' },
  ];
  expectedNav.forEach(({ name, href }) => {
    const link = screen.getByRole('link', { name });
    expect(link).toHaveAttribute('href', href);
  });

  // "Book a consultation" button (styled as a button but rendered as a link)
  const bookBtn = screen.getByRole('button', { name: /book a consultation/i });
  const bookLink = bookBtn.closest('a');
  expect(bookLink).toHaveAttribute('href', '/contact');
});

test('Footer contains wordmark, tagline, navigation links and copyright', () => {
  render(<App />);

  // Footer (semantic <footer> has role="contentinfo")
  const footer = screen.getByRole('contentinfo');
  expect(footer).toBeInTheDocument();

  // Wordmark (non‑link) – we just look for the text inside the footer
  const wordmark = within(footer).getByText(/the bayes group/i);
  expect(wordmark.closest('a')).toBeNull();

  // Tagline line
  expect(footer).toHaveTextContent('AI enablement, training and custom development.');

  // Footer navigation links (same set as header)
  const footerNav = [
    { name: /services/i, href: '/services' },
    { name: /training/i, href: '/training' },
    { name: /about/i, href: '/about' },
    { name: /contact/i, href: '/contact' },
  ];
  footerNav.forEach(({ name, href }) => {
    const link = within(footer).getByRole('link', { name });
    expect(link).toHaveAttribute('href', href);
  });

  // Copyright
  expect(footer).toHaveTextContent('© 2026 The Bayes Group');
});
