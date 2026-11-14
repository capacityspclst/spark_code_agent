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

describe('About page (/about)', () => {
  beforeEach(() => {
    renderAt('/about');
  });

  test('sets correct document title and contains a single h1', async () => {
    await waitFor(() => {
      expect(document.title).toBe('About | The Bayes Group');
    });
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('About');
  });

  test('mission and “Why Bayes” paragraphs are present', () => {
    // The exact wording of the mission paragraph is not prescribed,
    // but we can check that there is at least one paragraph element
    // containing the word “mission”.
    const missionPara = screen.getByText(/mission/i, { selector: 'p' });
    expect(missionPara).toBeInTheDocument();

    // “Why Bayes” paragraph should contain “Bayesian reasoning”
    const bayesPara = screen.getByText(/Bayesian reasoning/i, {
      selector: 'p',
    });
    expect(bayesPara).toBeInTheDocument();
  });

  test('displays two placeholder founder cards with correct placeholder texts', () => {
    const placeholders = screen.getAllByText('Founder Name');
    expect(placeholders).toHaveLength(2);
    const rolePlaceholders = screen.getAllByText(
      /Co‑founder & Principal Data Scientist/i
    );
    expect(rolePlaceholders).toHaveLength(2);
  });

  test('company values list contains the four expected statements', () => {
    const values = [
      /Evidence over hype/i,
      /Build to transfer/i,
      /Vendor[-\s]neutral/i,
      /Responsible by design/i,
    ];
    values.forEach((regex) => {
      const el = screen.getByText(regex);
      expect(el).toBeInTheDocument();
    });
  });
});
