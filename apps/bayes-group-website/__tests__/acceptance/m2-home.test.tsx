import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';

test('Home page renders hero, pillar cards, sections, CTA and sets document title', async () => {
  render(<App />);

  // Document title
  await waitFor(() => {
    expect(document.title).toBe('The Bayes Group | Evidence-driven AI');
  });

  // Exactly one H1
  const h1s = screen.getAllByRole('heading', { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent('Evidence-driven AI, built for your business.');

  // Hero buttons
  const bookBtn = screen.getByRole('link', { name: /book a consultation/i });
  expect(bookBtn).toHaveAttribute('href', '/contact');
  const exploreBtn = screen.getByRole('link', { name: /explore services/i });
  expect(exploreBtn).toHaveAttribute('href', '/services');

  // Pillar cards – check titles and “Learn more” links
  const pillarTitles = ['AI Enablement', 'Training', 'Custom Development'];
  pillarTitles.forEach((title) => {
    const heading = screen.getByRole('heading', { name: title });
    expect(heading).toBeInTheDocument();
  });
  const learnLinks = screen.getAllByRole('link', { name: /learn more/i });
  expect(learnLinks).toHaveLength(3);
  const expectedHrefs = [
    '/services#enablement',
    '/services#training',
    '/services#custom-development',
  ];
  const actualHrefs = learnLinks.map((l) => l.getAttribute('href')).sort();
  expect(actualHrefs).toEqual(expectedHrefs.sort());

  // “How we work” numbered steps
  const steps = ['Assess', 'Design', 'Build', 'Enable'];
  steps.forEach((step) => {
    const el = screen.getByText(new RegExp(`\\b${step}\\b`, 'i'));
    expect(el).toBeInTheDocument();
  });

  // “Why The Bayes Group” bullet points (keywords)
  const whyKeywords = [
    'credentialed data scientists',
    'hands‑on builders',
    'vendor‑neutral advice',
    'knowledge transfer',
  ];
  whyKeywords.forEach((kw) => {
    expect(screen.getByText(new RegExp(kw, 'i'))).toBeInTheDocument();
  });

  // CTA band
  expect(screen.getByText(/ready to put ai to work\?/i)).toBeInTheDocument();
  const ctaBtn = screen.getByRole('link', { name: /book a consultation/i });
  expect(ctaBtn).toHaveAttribute('href', '/contact');
});
