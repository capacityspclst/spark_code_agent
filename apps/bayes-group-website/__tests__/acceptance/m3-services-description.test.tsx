import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Services page items display a name and a one-sentence description', async () => {
  render(<App />);

  // Navigate to Services page via header navigation link
  const header = screen.getByRole('banner');
  const servicesLink = within(header).getByRole('link', { name: /services/i });
  await userEvent.click(servicesLink);

  // Wait for page title to update
  await waitFor(() => {
    expect(document.title).toBe('Services | The Bayes Group');
  });

  // List of all service item names (as per specification)
  const serviceNames = [
    // Enablement
    'AI readiness assessment',
    'Use-case discovery and prioritization',
    'AI strategy and roadmap',
    'AI governance and responsible-AI policy',
    // Training
    'Executive AI briefings',
    'Hands-on team workshops',
    'Deep-learning bootcamps for technical teams',
    'Custom curricula',
    // Custom Development
    'LLM and retrieval-augmented (RAG) applications',
    'AI agents and workflow automation',
    'Predictive models and ML pipelines',
    'Deep-learning solutions',
    'Integration with existing systems',
  ];

  serviceNames.forEach((name) => {
    // Locate the element that contains the exact name (case‑insensitive)
    const nameEl = screen.getByText(new RegExp(`^${name}$`, 'i'));

    // Find the closest container that should also hold the description.
    // Typical markup uses a <li> for each item; fall back to the parent element.
    const container = nameEl.closest('li') ?? nameEl.parentElement;
    expect(container).toBeInTheDocument();

    const containerText = (container as HTMLElement).textContent?.trim() ?? '';
    // Remove the name itself from the container text to isolate the description.
    const description = containerText.replace(new RegExp(name, 'i'), '').trim();

    // The description must be present and non‑empty.
    expect(description).not.toBe('');
    // A one‑sentence description should contain at least one period.
    expect(description).toMatch(/\./);
  });
});
