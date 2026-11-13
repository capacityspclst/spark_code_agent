import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
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

/**
 * Helper to fill the contact form fields.
 */
function fillForm({
  name = '',
  email = '',
  company = '',
  request = '',
  message = '',
}: {
  name?: string;
  email?: string;
  company?: string;
  request?: string;
  message?: string;
}) {
  const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
  const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
  const companyInput = screen.getByLabelText(/Company/i) as HTMLInputElement;
  const requestSelect = screen.getByLabelText(
    /What can we help with\?/i
  ) as HTMLSelectElement;
  const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;

  fireEvent.change(nameInput, { target: { value: name } });
  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(companyInput, { target: { value: company } });
  fireEvent.change(requestSelect, { target: { value: request } });
  fireEvent.change(messageInput, { target: { value: message } });
}

describe('Contact page (/contact)', () => {
  beforeEach(() => {
    renderAt('/contact');
  });

  test('sets correct document title and contains a single h1', async () => {
    await waitFor(() => {
      expect(document.title).toBe(
        'Book a consultation | The Bayes Group'
      );
    });
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Book a consultation');
  });

  test('displays contact email address', () => {
    expect(screen.getByText('hello@thebayesgroup.com')).toBeInTheDocument();
  });

  test('all form fields have associated labels', () => {
    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeInTheDocument();

    const companyInput = screen.getByLabelText(/Company/i);
    expect(companyInput).toBeInTheDocument();

    const requestSelect = screen.getByLabelText(
      /What can we help with\?/i
    );
    expect(requestSelect).toBeInTheDocument();

    const messageInput = screen.getByLabelText(/Message/i);
    expect(messageInput).toBeInTheDocument();
  });

  test('validation errors appear when required fields are missing or email is invalid', async () => {
    const submitBtn = screen.getByRole('button', {
      name: /Send message/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
      expect(
        screen.getByText('Please enter a valid email address.')
      ).toBeInTheDocument();
      expect(screen.getByText('Please enter a message.')).toBeInTheDocument();
    });

    // No thank‑you message should be shown
    expect(
      screen.queryByText(/Thanks, we'll be in touch within one business day\./i)
    ).not.toBeInTheDocument();
  });

  test('invalid email address shows only the email error', async () => {
    fillForm({
      name: 'Jane Doe',
      email: 'invalid-email',
      message: 'I need help.',
    });

    const submitBtn = screen.getByRole('button', {
      name: /Send message/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address.')
      ).toBeInTheDocument();
    });

    // Name and message errors should not appear
    expect(
      screen.queryByText('Please enter your name.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Please enter a message.')
    ).not.toBeInTheDocument();
  });

  test('successful submission shows thank‑you message, clears the form, and makes no network request', async () => {
    // Spy on global fetch (should not be called)
    const fetchSpy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response())
    );

    fillForm({
      name: 'John Doe',
      email: 'test.user@example.com',
      company: 'Acme Corp',
      request: 'AI Enablement',
      message: 'Please tell me more.',
    });

    const submitBtn = screen.getByRole('button', {
      name: /Send message/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Thanks, we'll be in touch within one business day\./i
        )
      ).toBeInTheDocument();
    });

    // Form fields should be cleared
    expect(
      (screen.getByLabelText(/Name/i) as HTMLInputElement).value
    ).toBe('');
    expect(
      (screen.getByLabelText(/Email/i) as HTMLInputElement).value
    ).toBe('');
    expect(
      (screen.getByLabelText(/Message/i) as HTMLTextAreaElement).value
    ).toBe('');

    // Ensure fetch was never called
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
