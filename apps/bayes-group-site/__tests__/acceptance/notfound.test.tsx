import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('404 Not Found page', () => {
  test('unknown route displays “Page not found” heading and link back to home', async () => {
    renderAt('/some/unknown/route');

    await waitFor(() => {
      const h1 = screen.getByRole('heading', {
        level: 1,
        name: /Page not found/i,
      });
      expect(h1).toBeInTheDocument();
    });

    // Link back to home page
    const homeLink = document.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveTextContent(/home/i);
  });
});
