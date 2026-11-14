import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Contact form submission with valid data shows success message, clears fields, and performs no network request', async () => {
  // Preserve any existing fetch implementation
  const originalFetch = (global as any).fetch;
  const fetchMock = jest.fn().mockResolvedValue({ ok: true });
  // @ts-ignore
  global.fetch = fetchMock;

  render(<App />);

  // Navigate to Contact page via header navigation link
  const header = screen.getByRole('banner');
  const contactLink = within(header).getByRole('link', { name: /contact/i });
  await userEvent.click(contactLink);

  await waitFor(() => {
    expect(document.title).toContain('Contact');
  });

  // Form fields
  const nameInput = screen.getByLabelText(/name/i);
  const emailInput = screen.getByLabelText(/^email$/i);
  const messageTextarea = screen.getByLabelText(/message/i);
  const sendButton = screen.getByRole('button', { name: /send message/i });

  // Fill all required fields with valid data
  await userEvent.type(nameInput, 'Jane Doe');
  await userEvent.type(emailInput, 'jane.doe@example.com');
  await userEvent.type(messageTextarea, 'I am interested in a consultation.');

  // Submit the form
  await userEvent.click(sendButton);

  // Ensure no fetch/network request was made
  expect(fetchMock).not.toHaveBeenCalled();

  // Success message should appear
  await waitFor(() => {
    expect(
      screen.getByText("Thanks, we'll be in touch within one business day.")
    ).toBeInTheDocument();
  });

  // Form fields should be cleared
  expect(nameInput).toHaveValue('');
  expect(emailInput).toHaveValue('');
  expect(messageTextarea).toHaveValue('');

  // Restore the original fetch implementation
  // @ts-ignore
  global.fetch = originalFetch;
});
