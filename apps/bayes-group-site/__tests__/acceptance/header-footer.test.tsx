import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Header and Footer shared UI', () => {
  test('Header contains logo, navigation links and Book a consultation button', async () => {
    renderAt('/');

    // Header element
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();

    // Logo link (should point to home)
    const logoLink = header?.querySelector('a[href="/"]');
    expect(logoLink).toBeInTheDocument();

    // Navigation links
    const navLinks = [
      { name: /Services/i, href: '/services' },
      { name: /Training/i, href: '/training' },
      { name: /About/i, href: '/about' },
      { name: /Contact/i, href: '/contact' },
    ];

    navLinks.forEach(({ name, href }) => {
      const link = screen.getByRole('link', { name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });

    // Book a consultation button (or link) in header
    const bookBtn = screen.getByRole('link', { name: /Book a consultation/i });
    expect(bookBtn).toBeInTheDocument();
    expect(bookBtn).toHaveAttribute('href', '/contact');

    // Mobile menu button should be present (labelled “Menu”)
    const menuBtn = screen.getByRole('button', { name: /Menu/i });
    expect(menuBtn).toBeInTheDocument();
  });

  test('Clicking a header navigation link updates the page and document title', async () => {
    renderAt('/');

    const servicesLink = screen.getByRole('link', { name: /Services/i });
    fireEvent.click(servicesLink);

    // Wait for navigation to finish
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Services/i })).toBeInTheDocument();
    });

    expect(document.title).toBe('Services | The Bayes Group');
  });

  test('Footer contains logo, tagline, nav links and copyright', () => {
    renderAt('/');

    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();

    // Footer logo link
    const footerLogo = footer?.querySelector('a[href="/"]');
    expect(footerLogo).toBeInTheDocument();

    // Tagline
    expect(footer).toHaveTextContent(
      'AI enablement, training and custom development.'
    );

    // Footer navigation links (same set as header)
    const footerNavLinks = [
      { name: /Services/i, href: '/services' },
      { name: /Training/i, href: '/training' },
      { name: /About/i, href: '/about' },
      { name: /Contact/i, href: '/contact' },
    ];

    footerNavLinks.forEach(({ name, href }) => {
      const link = within(footer as HTMLElement).getByRole('link', { name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });

    // Copyright
    expect(footer).toHaveTextContent('© 2026 The Bayes Group');
  });
});
