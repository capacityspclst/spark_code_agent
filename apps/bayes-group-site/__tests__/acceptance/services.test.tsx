import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../../src/App';

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('Services page (/services)', () => {
  beforeEach(() => {
    renderAt('/services');
  });

  test('sets correct document title and contains a single h1', async () => {
    await waitFor(() => {
      expect(document.title).toBe('Services | The Bayes Group');
    });
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Services');
  });

  test('has three sections with correct IDs', () => {
    const ids = ['enablement', 'training', 'custom-development'];
    ids.forEach((id) => {
      const section = document.getElementById(id);
      expect(section).toBeInTheDocument();
    });
  });

  test('Enablement section lists all four items', () => {
    const enablementItems = [
      /AI readiness assessment/i,
      /use[-\s]case discovery and prioritization/i,
      /AI strategy and roadmap/i,
      /AI governance and responsible[-\s]AI policy/i,
    ];
    const enablementSection = document.getElementById('enablement');
    expect(enablementSection).toBeInTheDocument();

    enablementItems.forEach((regex) => {
      const el = within(enablementSection as HTMLElement).getByText(regex);
      expect(el).toBeInTheDocument();
    });

    // Typical engagement line
    expect(
      within(enablementSection as HTMLElement).getByText(/Typical engagement/i)
    ).toBeInTheDocument();
  });

  test('Training section lists all four items and a typical engagement line', () => {
    const trainingItems = [
      /executive AI briefings/i,
      /hands[-\s]on team workshops/i,
      /deep[-\s]learning bootcamps for technical teams/i,
      /custom curricula/i,
    ];
    const trainingSection = document.getElementById('training');
    expect(trainingSection).toBeInTheDocument();

    trainingItems.forEach((regex) => {
      const el = within(trainingSection as HTMLElement).getByText(regex);
      expect(el).toBeInTheDocument();
    });

    expect(
      within(trainingSection as HTMLElement).getByText(/Typical engagement/i)
    ).toBeInTheDocument();
  });

  test('Custom Development section lists all five items and a typical engagement line', () => {
    const customItems = [
      /LLM and retrieval[-\s]augmented \(RAG\) applications/i,
      /AI agents and workflow automation/i,
      /predictive models and ML pipelines/i,
      /deep[-\s]learning solutions/i,
      /integration with existing systems/i,
    ];
    const customSection = document.getElementById('custom-development');
    expect(customSection).toBeInTheDocument();

    customItems.forEach((regex) => {
      const el = within(customSection as HTMLElement).getByText(regex);
      expect(el).toBeInTheDocument();
    });

    expect(
      within(customSection as HTMLElement).getByText(/Typical engagement/i)
    ).toBeInTheDocument();
  });
});
