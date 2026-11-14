import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Services page displays sections with ids, items, typical engagement line and sets document title', async () => {
  render(<App />);

  // Navigate to Services page
  const servicesLink = screen.getByRole('link', { name: /services/i });
  await userEvent.click(servicesLink);

  // Title
  await waitFor(() => {
    expect(document.title).toBe('Services | The Bayes Group');
  });

  // Exactly one H1
  const h1s = screen.getAllByRole('heading', { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent('Services');

  // Sections with expected ids
  const sectionIds = ['enablement', 'training', 'custom-development'];
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    expect(section).toBeInTheDocument();
  });

  // Verify a sample item from each section is present
  const sampleItems = [
    /ai readiness assessment/i,
    /executive ai briefings/i,
    /llm and retrieval-augmented/i,
  ];
  sampleItems.forEach((regex) => {
    expect(screen.getByText(regex)).toBeInTheDocument();
  });

  // Each section ends with a “Typical engagement” line (colon is optional)
  const typicalLines = screen.getAllByText(/typical engagement/i);
  expect(typicalLines).toHaveLength(3);
});
