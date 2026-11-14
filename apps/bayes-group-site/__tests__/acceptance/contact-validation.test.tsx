import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
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

describe('Contact page validation and network behavior', () => {
  beforeEach(() => {
    renderAt('/contact');
  });

  test('email field accepts syntactically valid email address without showing an error', async () => {
    // Fill out the form with completely valid data, using a complex but valid email
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const companyInput = screen.getByLabelText(/Company/i) as HTMLInputElement;
    const requestSelect = screen.getByLabelText(
      /What can we help with\?/i
    ) as HTMLSelectElement;
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'Alice Example' } });
    fireEvent.change(emailInput, {
      target: { value: 'alice+test@sub.example.co.uk' },
    });
    fireEvent.change(companyInput, { target: { value: 'Example Corp' } });
    fireEvent.change(requestSelect, { target: { value: 'Training' } });
    fireEvent.change(messageInput, {
      target: { value: 'Please get in touch.' },
    });

    // Submit the form
    const submitBtn = screen.getByRole('button', {
      name: /Send message/i,
    });
    fireEvent.click(submitBtn);

    // Wait for the success message (implies no validation errors)
    await waitFor(() => {
      expect(
        screen.getByText(
          /Thanks, we'll be in touch within one business day\./i
        )
      ).toBeInTheDocument();
    });

    // Ensure the email‑validation error is not shown
    expect(
      screen.queryByText('Please enter a valid email address.')
    ).not.toBeInTheDocument();
  });

  test('invalid submit (missing required fields) does not trigger a network request', async () => {
    // Spy on the global fetch function
    const fetchSpy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response())
    );

    // Click submit without entering any data
    const submitBtn = screen.getByRole('button', {
      name: /Send message/i,
    });
    fireEvent.click(submitBtn);

    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
      expect(
        screen.getByText('Please enter a valid email address.')
      ).toBeInTheDocument();
      expect(screen.getByText('Please enter a message.')).toBeInTheDocument();
    });

    // No network request should have been made
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
