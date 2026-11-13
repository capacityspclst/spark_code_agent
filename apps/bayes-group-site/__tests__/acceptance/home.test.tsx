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

describe('Home page (/)', () => {
  beforeEach(() => {
    renderAt('/');
  });

  test('sets correct document title and contains a single h1', async () => {
    await waitFor(() => {
      expect(document.title).toBe('The Bayes Group | Evidence-driven AI');
    });
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(
      'Evidence-driven AI, built for your business.'
    );
  });

  test('hero contains two CTA buttons linking to correct routes', () => {
    const bookBtn = screen.getByRole('link', {
      name: /Book a consultation/i,
    });
    expect(bookBtn).toBeInTheDocument();
    expect(bookBtn).toHaveAttribute('href', '/contact');

    const exploreBtn = screen.getByRole('link', {
      name: /Explore services/i,
    });
    expect(exploreBtn).toBeInTheDocument();
    expect(exploreBtn).toHaveAttribute('href', '/services');
  });

  test('renders three pillar cards with correct headings and Learn more links', () => {
    const expectedPillars = [
      {
        heading: /AI Enablement/i,
        linkHref: '/services#enablement',
      },
      {
        heading: /Training/i,
        linkHref: '/services#training',
      },
      {
        heading: /Custom Development/i,
        linkHref: '/services#custom-development',
      },
    ];

    expectedPillars.forEach(({ heading, linkHref }) => {
      const cardHeading = screen.getByRole('heading', {
        level: 2,
        name: heading,
      });
      expect(cardHeading).toBeInTheDocument();

      const card = cardHeading.closest('section') || cardHeading.parentElement;
      expect(card).toBeInTheDocument();

      const learnLink = within(card as HTMLElement).getByRole('link', {
        name: /Learn more/i,
      });
      expect(learnLink).toHaveAttribute('href', linkHref);
    });
  });

  test('“How we work” section contains the four numbered steps', () => {
    const steps = ['Assess', 'Design', 'Build', 'Enable'];
    steps.forEach((step) => {
      const stepElement = screen.getByText(step, { selector: 'p, li, div, span' });
      expect(stepElement).toBeInTheDocument();
    });
  });

  test('“Why The Bayes Group” section contains four expected points', () => {
    const points = [
      /credentialed data scientists/i,
      /hands-on builders/i,
      /vendor-neutral advice/i,
      /knowledge transfer so your team owns the result/i,
    ];
    points.forEach((regex) => {
      const el = screen.getByText(regex);
      expect(el).toBeInTheDocument();
    });
  });

  test('CTA band at the bottom contains the proper message and button', () => {
    const ctaText = screen.getByText(
      /Ready to put AI to work\?/i
    );
    expect(ctaText).toBeInTheDocument();

    const ctaBtn = screen.getByRole('link', {
      name: /Book a consultation/i,
    });
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn).toHaveAttribute('href', '/contact');
  });
});
